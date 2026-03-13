package com.desktopkitchen.pos.ai.model

sealed class ModelDownloadState {
    data object NotDownloaded : ModelDownloadState()
    data class Downloading(val progress: Float, val bytesDownloaded: Long, val totalBytes: Long) : ModelDownloadState()
    data object Verifying : ModelDownloadState()
    data object Ready : ModelDownloadState()
    data class Error(val message: String) : ModelDownloadState()

    val isReady: Boolean get() = this is Ready
}
