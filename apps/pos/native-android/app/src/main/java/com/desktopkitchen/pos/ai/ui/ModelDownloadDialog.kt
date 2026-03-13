package com.desktopkitchen.pos.ai.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.window.Dialog
import com.desktopkitchen.pos.ai.model.ModelDownloadManager
import com.desktopkitchen.pos.ai.model.ModelDownloadState
import com.desktopkitchen.pos.ui.theme.AppColors
import com.desktopkitchen.pos.ui.theme.Typography

@Composable
fun ModelDownloadDialog(
    downloadManager: ModelDownloadManager,
    onDownload: () -> Unit,
    onSkip: () -> Unit
) {
    val downloadState by downloadManager.state.collectAsState()

    Dialog(onDismissRequest = {
        if (downloadState !is ModelDownloadState.Downloading) onSkip()
    }) {
        Column(
            modifier = Modifier
                .clip(RoundedCornerShape(16.dp))
                .background(AppColors.card)
                .padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Icon(
                Icons.Default.AutoAwesome,
                contentDescription = null,
                tint = AppColors.accent,
                modifier = Modifier.size(40.dp)
            )
            Spacer(modifier = Modifier.height(12.dp))
            Text(
                "AI Suggestions",
                style = Typography.titleLarge,
                color = AppColors.textPrimary
            )
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                "Download the AI model to get smart upsell suggestions even without internet.",
                style = Typography.bodyMedium,
                color = AppColors.textSecondary,
                textAlign = TextAlign.Center
            )

            Spacer(modifier = Modifier.height(16.dp))

            when (val state = downloadState) {
                is ModelDownloadState.NotDownloaded -> {
                    if (!downloadManager.isOnWifi()) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clip(RoundedCornerShape(8.dp))
                                .background(AppColors.warning.copy(alpha = 0.15f))
                                .padding(10.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            Icon(
                                Icons.Default.Warning,
                                null,
                                tint = AppColors.warning,
                                modifier = Modifier.size(16.dp)
                            )
                            Text(
                                "Not on WiFi. Download is ~1.2 GB.",
                                style = Typography.bodySmall,
                                color = AppColors.warning
                            )
                        }
                        Spacer(modifier = Modifier.height(12.dp))
                    } else {
                        Text(
                            "Download size: ~1.2 GB",
                            style = Typography.bodySmall,
                            color = AppColors.textTertiary
                        )
                        Spacer(modifier = Modifier.height(12.dp))
                    }

                    Button(
                        onClick = onDownload,
                        modifier = Modifier.fillMaxWidth(),
                        colors = ButtonDefaults.buttonColors(containerColor = AppColors.accent),
                        shape = RoundedCornerShape(12.dp)
                    ) {
                        Text("Download", color = AppColors.textPrimary)
                    }
                    Spacer(modifier = Modifier.height(8.dp))
                    TextButton(onClick = onSkip) {
                        Text("Skip for now", color = AppColors.textTertiary)
                    }
                }

                is ModelDownloadState.Downloading -> {
                    LinearProgressIndicator(
                        progress = { state.progress },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(8.dp)
                            .clip(RoundedCornerShape(4.dp)),
                        color = AppColors.accent,
                        trackColor = AppColors.surface,
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text(
                            "${(state.progress * 100).toInt()}%",
                            style = Typography.bodySmall,
                            color = AppColors.textSecondary
                        )
                        Text(
                            formatBytes(state.bytesDownloaded) + " / " + formatBytes(state.totalBytes),
                            style = Typography.bodySmall,
                            color = AppColors.textTertiary
                        )
                    }
                }

                is ModelDownloadState.Verifying -> {
                    LinearProgressIndicator(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(8.dp)
                            .clip(RoundedCornerShape(4.dp)),
                        color = AppColors.accent,
                        trackColor = AppColors.surface,
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        "Verifying integrity...",
                        style = Typography.bodySmall,
                        color = AppColors.textSecondary
                    )
                }

                is ModelDownloadState.Ready -> {
                    Text(
                        "AI model ready!",
                        style = Typography.bodyMedium,
                        color = AppColors.success
                    )
                    Spacer(modifier = Modifier.height(12.dp))
                    Button(
                        onClick = onSkip,
                        modifier = Modifier.fillMaxWidth(),
                        colors = ButtonDefaults.buttonColors(containerColor = AppColors.accent),
                        shape = RoundedCornerShape(12.dp)
                    ) {
                        Text("Continue", color = AppColors.textPrimary)
                    }
                }

                is ModelDownloadState.Error -> {
                    Text(
                        state.message,
                        style = Typography.bodySmall,
                        color = AppColors.error,
                        textAlign = TextAlign.Center
                    )
                    Spacer(modifier = Modifier.height(12.dp))
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.Center
                    ) {
                        Button(
                            onClick = onDownload,
                            colors = ButtonDefaults.buttonColors(containerColor = AppColors.accent),
                            shape = RoundedCornerShape(12.dp)
                        ) {
                            Text("Retry", color = AppColors.textPrimary)
                        }
                        Spacer(modifier = Modifier.width(12.dp))
                        TextButton(onClick = onSkip) {
                            Text("Skip", color = AppColors.textTertiary)
                        }
                    }
                }
            }
        }
    }
}

private fun formatBytes(bytes: Long): String = when {
    bytes >= 1_073_741_824 -> "%.1f GB".format(bytes / 1_073_741_824.0)
    bytes >= 1_048_576 -> "%.0f MB".format(bytes / 1_048_576.0)
    bytes >= 1024 -> "%.0f KB".format(bytes / 1024.0)
    else -> "$bytes B"
}
