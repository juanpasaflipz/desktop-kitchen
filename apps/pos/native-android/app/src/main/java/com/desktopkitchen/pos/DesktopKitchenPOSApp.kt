package com.desktopkitchen.pos

import android.app.Application
import android.content.ComponentCallbacks2
import android.util.Log
import com.desktopkitchen.pos.ai.model.LlamaModel
import dagger.hilt.android.HiltAndroidApp
import javax.inject.Inject

@HiltAndroidApp
class DesktopKitchenPOSApp : Application() {

    @Inject
    lateinit var llamaModel: LlamaModel

    override fun onTrimMemory(level: Int) {
        super.onTrimMemory(level)
        if (level >= ComponentCallbacks2.TRIM_MEMORY_RUNNING_CRITICAL) {
            Log.w("DesktopKitchenPOS", "Memory pressure (level=$level), unloading AI model")
            llamaModel.unload()
        }
    }
}
