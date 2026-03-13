package com.desktopkitchen.pos.ai.model

import android.content.Context
import android.net.ConnectivityManager
import android.net.NetworkCapabilities
import android.util.Log
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.withContext
import org.json.JSONObject
import java.io.File
import java.io.FileOutputStream
import java.net.HttpURLConnection
import java.net.URL
import java.security.MessageDigest
import java.util.concurrent.atomic.AtomicBoolean
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class ModelDownloadManager @Inject constructor(
    @ApplicationContext private val context: Context
) {
    companion object {
        private const val TAG = "ModelDownloadManager"
        private const val MODEL_DIR = "ai-models"
        private const val MODEL_FILENAME = "bitnet-b1.58-2B-4T-i2s.gguf"
        private const val META_FILENAME = "model_meta.json"
        private const val MODEL_URL =
            "https://huggingface.co/microsoft/bitnet-b1.58-2B-4T-gguf/resolve/main/ggml-model-i2_s.gguf"
        private const val MODEL_SHA256 =
            "4221b252fdd5fd25e15847adfeb5ee88886506ba50b8a34548374492884c2162"
        private const val MODEL_VERSION = "1.0.0"
        private const val BUFFER_SIZE = 8192
    }

    private val modelDir: File get() = File(context.filesDir, MODEL_DIR)
    val modelFile: File get() = File(modelDir, MODEL_FILENAME)
    private val metaFile: File get() = File(modelDir, META_FILENAME)

    private val _state = MutableStateFlow<ModelDownloadState>(ModelDownloadState.NotDownloaded)
    val state: StateFlow<ModelDownloadState> = _state.asStateFlow()
    private val downloading = AtomicBoolean(false)

    init {
        _state.value = if (modelFile.exists() && metaFile.exists()) {
            ModelDownloadState.Ready
        } else {
            ModelDownloadState.NotDownloaded
        }
    }

    val isModelReady: Boolean get() = modelFile.exists() && metaFile.exists()

    fun isOnWifi(): Boolean {
        val cm = context.getSystemService(Context.CONNECTIVITY_SERVICE) as ConnectivityManager
        val network = cm.activeNetwork ?: return false
        val caps = cm.getNetworkCapabilities(network) ?: return false
        return caps.hasTransport(NetworkCapabilities.TRANSPORT_WIFI)
    }

    val modelSizeBytes: Long get() = modelFile.length()

    suspend fun download(): Result<Unit> = withContext(Dispatchers.IO) {
        if (isModelReady) {
            _state.value = ModelDownloadState.Ready
            return@withContext Result.success(Unit)
        }

        // Prevent concurrent downloads
        if (!downloading.compareAndSet(false, true)) {
            Log.w(TAG, "Download already in progress, ignoring duplicate call")
            return@withContext Result.success(Unit)
        }

        // Re-check after acquiring the lock (first download may have finished)
        if (isModelReady) {
            downloading.set(false)
            _state.value = ModelDownloadState.Ready
            return@withContext Result.success(Unit)
        }

        modelDir.mkdirs()
        val tempFile = File(modelDir, "$MODEL_FILENAME.tmp")

        try {
            val startByte = if (tempFile.exists()) tempFile.length() else 0L

            val url = URL(MODEL_URL)
            val conn = url.openConnection() as HttpURLConnection
            conn.connectTimeout = 30_000
            conn.readTimeout = 30_000
            if (startByte > 0) {
                conn.setRequestProperty("Range", "bytes=$startByte-")
            }

            val responseCode = conn.responseCode
            if (responseCode != HttpURLConnection.HTTP_OK &&
                responseCode != HttpURLConnection.HTTP_PARTIAL
            ) {
                conn.disconnect()
                val msg = "Download failed: HTTP $responseCode"
                _state.value = ModelDownloadState.Error(msg)
                return@withContext Result.failure(Exception(msg))
            }

            val totalBytes = if (responseCode == HttpURLConnection.HTTP_PARTIAL) {
                val contentRange = conn.getHeaderField("Content-Range")
                contentRange?.substringAfter("/")?.toLongOrNull()
                    ?: (conn.contentLengthLong + startByte)
            } else {
                conn.contentLengthLong.let { if (it > 0) it else 0L }
            }

            val append = responseCode == HttpURLConnection.HTTP_PARTIAL
            var bytesDownloaded = if (append) startByte else 0L

            _state.value = ModelDownloadState.Downloading(
                progress = if (totalBytes > 0) bytesDownloaded.toFloat() / totalBytes else 0f,
                bytesDownloaded = bytesDownloaded,
                totalBytes = totalBytes
            )

            conn.inputStream.use { input ->
                FileOutputStream(tempFile, append).use { output ->
                    val buffer = ByteArray(BUFFER_SIZE)
                    var bytesRead: Int
                    while (input.read(buffer).also { bytesRead = it } != -1) {
                        output.write(buffer, 0, bytesRead)
                        bytesDownloaded += bytesRead
                        _state.value = ModelDownloadState.Downloading(
                            progress = if (totalBytes > 0) bytesDownloaded.toFloat() / totalBytes else 0f,
                            bytesDownloaded = bytesDownloaded,
                            totalBytes = totalBytes
                        )
                    }
                }
            }
            conn.disconnect()

            // Verify SHA-256
            _state.value = ModelDownloadState.Verifying
            val hash = sha256(tempFile)
            if (hash != MODEL_SHA256) {
                tempFile.delete()
                val msg = "SHA-256 verification failed"
                _state.value = ModelDownloadState.Error(msg)
                return@withContext Result.failure(Exception(msg))
            }

            // Move to final location
            tempFile.renameTo(modelFile)

            // Write metadata
            val meta = JSONObject().apply {
                put("version", MODEL_VERSION)
                put("sha256", MODEL_SHA256)
                put("downloaded_at", System.currentTimeMillis())
                put("size_bytes", modelFile.length())
            }
            metaFile.writeText(meta.toString())

            _state.value = ModelDownloadState.Ready
            downloading.set(false)
            Log.i(TAG, "Model downloaded and verified (${modelFile.length()} bytes)")
            Result.success(Unit)
        } catch (e: Exception) {
            val msg = "Download failed: ${e.message}"
            _state.value = ModelDownloadState.Error(msg)
            downloading.set(false)
            Log.e(TAG, msg, e)
            Result.failure(e)
        }
    }

    fun deleteModel() {
        modelFile.delete()
        metaFile.delete()
        File(modelDir, "$MODEL_FILENAME.tmp").delete()
        _state.value = ModelDownloadState.NotDownloaded
    }

    private fun sha256(file: File): String {
        val digest = MessageDigest.getInstance("SHA-256")
        file.inputStream().use { input ->
            val buffer = ByteArray(BUFFER_SIZE)
            var bytesRead: Int
            while (input.read(buffer).also { bytesRead = it } != -1) {
                digest.update(buffer, 0, bytesRead)
            }
        }
        return digest.digest().joinToString("") { "%02x".format(it) }
    }
}
