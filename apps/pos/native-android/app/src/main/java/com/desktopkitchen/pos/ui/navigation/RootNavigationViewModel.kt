package com.desktopkitchen.pos.ui.navigation

import androidx.lifecycle.ViewModel
import com.desktopkitchen.pos.ai.model.ModelDownloadManager
import com.desktopkitchen.pos.app.AppState
import com.desktopkitchen.pos.configuration.ServerConfig
import com.desktopkitchen.pos.services.BrandingService
import com.desktopkitchen.pos.ui.theme.AppColors
import dagger.hilt.android.lifecycle.HiltViewModel
import javax.inject.Inject

@HiltViewModel
class RootNavigationViewModel @Inject constructor(
    val appState: AppState,
    val serverConfig: ServerConfig,
    private val brandingService: BrandingService,
    val modelDownloadManager: ModelDownloadManager
) : ViewModel() {

    suspend fun loadBranding() {
        try {
            val branding = brandingService.getBranding()
            branding.primaryColor?.let { AppColors.applyBranding(it) }
        } catch (_: Exception) {
            // Branding is optional — use defaults
        }
    }
}
