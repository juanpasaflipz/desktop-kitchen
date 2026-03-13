package com.desktopkitchen.pos.ai.model

import android.app.ActivityManager
import android.content.Context
import android.util.Log
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.withContext
import java.io.File
import javax.inject.Inject
import javax.inject.Singleton

/**
 * Wraps llama.cpp JNI for on-device GGUF inference.
 *
 * Uses the native llama.cpp Android library. The model is loaded from
 * [ModelDownloadManager.modelFile] and inference runs on a background thread.
 *
 * Memory guard: requires >= 3GB available RAM to load.
 */
@Singleton
class LlamaModel @Inject constructor(
    @ApplicationContext private val context: Context
) {
    companion object {
        private const val TAG = "LlamaModel"
        private const val MIN_RAM_MB = 3072L // 3 GB
        private const val CONTEXT_LENGTH = 2048
        private const val N_THREADS = 4
        private const val BATCH_SIZE = 512

        init {
            try {
                System.loadLibrary("llama-android")
            } catch (e: UnsatisfiedLinkError) {
                Log.e(TAG, "Failed to load llama-android native library", e)
            }
        }
    }

    private val _state = MutableStateFlow<ModelState>(ModelState.Unloaded)
    val state: StateFlow<ModelState> = _state.asStateFlow()

    private var nativeContext: Long = 0L

    // JNI methods — implemented in native C/C++ (llama.cpp android bridge)
    private external fun nativeLoadModel(
        modelPath: String,
        contextLength: Int,
        nThreads: Int,
        batchSize: Int
    ): Long

    private external fun nativeGenerate(
        context: Long,
        prompt: String,
        maxTokens: Int,
        temperature: Float,
        topP: Float
    ): String

    private external fun nativeUnload(context: Long)

    fun hasEnoughMemory(): Boolean {
        val activityManager = context.getSystemService(Context.ACTIVITY_SERVICE) as ActivityManager
        val memInfo = ActivityManager.MemoryInfo()
        activityManager.getMemoryInfo(memInfo)
        val availableMb = memInfo.availMem / (1024 * 1024)
        return availableMb >= MIN_RAM_MB
    }

    suspend fun load(modelPath: String): Result<Unit> = withContext(Dispatchers.IO) {
        if (_state.value is ModelState.Loaded) {
            return@withContext Result.success(Unit)
        }

        if (!hasEnoughMemory()) {
            val msg = "Insufficient memory to load AI model (need ${MIN_RAM_MB}MB free)"
            _state.value = ModelState.Error(msg)
            return@withContext Result.failure(IllegalStateException(msg))
        }

        val file = File(modelPath)
        if (!file.exists()) {
            val msg = "Model file not found: $modelPath"
            _state.value = ModelState.Error(msg)
            return@withContext Result.failure(IllegalStateException(msg))
        }

        _state.value = ModelState.Loading
        try {
            val ctx = nativeLoadModel(modelPath, CONTEXT_LENGTH, N_THREADS, BATCH_SIZE)
            if (ctx == 0L) {
                val msg = "Failed to load model (native returned null context)"
                _state.value = ModelState.Error(msg)
                return@withContext Result.failure(IllegalStateException(msg))
            }
            nativeContext = ctx
            _state.value = ModelState.Loaded(ctx)
            Log.i(TAG, "Model loaded successfully from $modelPath")
            Result.success(Unit)
        } catch (e: Exception) {
            val msg = "Failed to load model: ${e.message}"
            _state.value = ModelState.Error(msg)
            Log.e(TAG, msg, e)
            Result.failure(e)
        }
    }

    suspend fun generate(
        prompt: String,
        maxTokens: Int = 256,
        temperature: Float = 0.3f,
        topP: Float = 1.0f
    ): Result<String> = withContext(Dispatchers.IO) {
        val ctx = nativeContext
        if (ctx == 0L || _state.value !is ModelState.Loaded) {
            return@withContext Result.failure(IllegalStateException("Model not loaded"))
        }

        try {
            val output = nativeGenerate(ctx, prompt, maxTokens, temperature, topP)
            Result.success(output)
        } catch (e: Exception) {
            Log.e(TAG, "Inference failed: ${e.message}", e)
            Result.failure(e)
        }
    }

    fun unload() {
        val ctx = nativeContext
        if (ctx != 0L) {
            try {
                nativeUnload(ctx)
            } catch (e: Exception) {
                Log.e(TAG, "Error unloading model", e)
            }
            nativeContext = 0L
        }
        _state.value = ModelState.Unloaded
        Log.i(TAG, "Model unloaded")
    }
}
