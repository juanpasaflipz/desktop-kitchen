package com.desktopkitchen.pos.ai.model

sealed class ModelState {
    data object Unloaded : ModelState()
    data object Loading : ModelState()
    data class Loaded(val contextId: Long) : ModelState()
    data class Error(val message: String) : ModelState()

    val isLoaded: Boolean get() = this is Loaded
}
