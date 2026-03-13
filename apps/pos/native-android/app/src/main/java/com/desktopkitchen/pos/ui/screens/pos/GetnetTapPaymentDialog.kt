package com.desktopkitchen.pos.ui.screens.pos

import androidx.compose.animation.core.LinearEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Error
import androidx.compose.material.icons.filled.Nfc
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.scale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import com.desktopkitchen.pos.ui.theme.AppColors
import com.desktopkitchen.pos.ui.theme.Typography
import com.desktopkitchen.pos.utilities.CurrencyFormatter
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

enum class TapState { READY, WAITING, PROCESSING, SUCCESS, ERROR }

@Composable
fun GetnetTapPaymentDialog(
    total: Double,
    onTapConfirmed: () -> Unit,
    onDismiss: () -> Unit,
    isProcessing: Boolean = false,
    isSuccess: Boolean = false,
    errorMessage: String? = null
) {
    val scope = rememberCoroutineScope()
    var tapState by remember { mutableStateOf(TapState.READY) }

    // Sync external state
    LaunchedEffect(isProcessing, isSuccess, errorMessage) {
        when {
            isSuccess -> {
                tapState = TapState.SUCCESS
                delay(1500)
                onDismiss()
            }
            errorMessage != null -> tapState = TapState.ERROR
            isProcessing -> tapState = TapState.PROCESSING
        }
    }

    // Pulse animation for waiting state
    val infiniteTransition = rememberInfiniteTransition(label = "pulse")
    val pulseScale by infiniteTransition.animateFloat(
        initialValue = 0.9f,
        targetValue = 1.1f,
        animationSpec = infiniteRepeatable(
            animation = tween(1000, easing = LinearEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "pulseScale"
    )
    val pulseAlpha by infiniteTransition.animateFloat(
        initialValue = 0.5f,
        targetValue = 1f,
        animationSpec = infiniteRepeatable(
            animation = tween(1000, easing = LinearEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "pulseAlpha"
    )

    Dialog(
        onDismissRequest = { if (tapState != TapState.PROCESSING) onDismiss() },
        properties = DialogProperties(usePlatformDefaultWidth = false)
    ) {
        Column(
            modifier = Modifier
                .width(380.dp)
                .background(AppColors.card, RoundedCornerShape(20.dp))
                .padding(32.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            // Amount
            Text(
                text = CurrencyFormatter.format(total),
                style = Typography.headlineLarge.copy(
                    fontWeight = FontWeight.Bold,
                    fontSize = 36.sp
                ),
                color = AppColors.accent
            )

            Spacer(modifier = Modifier.height(8.dp))

            Text(
                text = "Getnet Tap to Pay",
                style = Typography.titleMedium,
                color = AppColors.textSecondary
            )

            Spacer(modifier = Modifier.height(32.dp))

            // Center icon area
            when (tapState) {
                TapState.READY -> {
                    Box(
                        modifier = Modifier
                            .size(120.dp)
                            .background(AppColors.accent.copy(alpha = 0.1f), CircleShape),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = Icons.Default.Nfc,
                            contentDescription = "Tap to Pay",
                            tint = AppColors.accent,
                            modifier = Modifier.size(64.dp)
                        )
                    }
                    Spacer(modifier = Modifier.height(16.dp))
                    Text(
                        "Tap the card on the back of this device",
                        style = Typography.bodyLarge,
                        color = AppColors.textPrimary,
                        textAlign = TextAlign.Center
                    )
                }

                TapState.WAITING -> {
                    Box(
                        modifier = Modifier
                            .size(120.dp)
                            .scale(pulseScale)
                            .alpha(pulseAlpha)
                            .background(AppColors.accent.copy(alpha = 0.15f), CircleShape),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = Icons.Default.Nfc,
                            contentDescription = "Waiting for card",
                            tint = AppColors.accent,
                            modifier = Modifier.size(64.dp)
                        )
                    }
                    Spacer(modifier = Modifier.height(16.dp))
                    Text(
                        "Waiting for card...",
                        style = Typography.bodyLarge,
                        color = AppColors.accent,
                        textAlign = TextAlign.Center
                    )
                }

                TapState.PROCESSING -> {
                    CircularProgressIndicator(
                        color = AppColors.accent,
                        modifier = Modifier.size(80.dp),
                        strokeWidth = 6.dp
                    )
                    Spacer(modifier = Modifier.height(16.dp))
                    Text(
                        "Processing payment...",
                        style = Typography.bodyLarge,
                        color = AppColors.textPrimary,
                        textAlign = TextAlign.Center
                    )
                }

                TapState.SUCCESS -> {
                    Icon(
                        imageVector = Icons.Default.CheckCircle,
                        contentDescription = "Success",
                        tint = AppColors.success,
                        modifier = Modifier.size(80.dp)
                    )
                    Spacer(modifier = Modifier.height(16.dp))
                    Text(
                        "Payment approved",
                        style = Typography.titleLarge,
                        color = AppColors.success,
                        textAlign = TextAlign.Center
                    )
                }

                TapState.ERROR -> {
                    Icon(
                        imageVector = Icons.Default.Error,
                        contentDescription = "Error",
                        tint = AppColors.error,
                        modifier = Modifier.size(80.dp)
                    )
                    Spacer(modifier = Modifier.height(16.dp))
                    Text(
                        errorMessage ?: "Payment failed",
                        style = Typography.bodyLarge,
                        color = AppColors.error,
                        textAlign = TextAlign.Center
                    )
                }
            }

            Spacer(modifier = Modifier.height(32.dp))

            // Actions
            when (tapState) {
                TapState.READY -> {
                    Button(
                        onClick = {
                            tapState = TapState.WAITING
                            // Simulate NFC wait, then trigger payment
                            scope.launch {
                                delay(2000) // simulate card tap delay
                                onTapConfirmed()
                            }
                        },
                        modifier = Modifier.fillMaxWidth().height(56.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = AppColors.accent),
                        shape = RoundedCornerShape(14.dp)
                    ) {
                        Icon(Icons.Default.Nfc, null, modifier = Modifier.size(24.dp))
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            "Start Tap to Pay",
                            style = Typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                            color = AppColors.textPrimary
                        )
                    }
                    Spacer(modifier = Modifier.height(8.dp))
                    TextButton(onClick = onDismiss) {
                        Text("Cancel", color = AppColors.textSecondary)
                    }
                }

                TapState.WAITING, TapState.PROCESSING -> {
                    TextButton(
                        onClick = onDismiss,
                        enabled = tapState != TapState.PROCESSING
                    ) {
                        Text("Cancel", color = AppColors.textSecondary)
                    }
                }

                TapState.ERROR -> {
                    Button(
                        onClick = {
                            tapState = TapState.READY
                        },
                        modifier = Modifier.fillMaxWidth().height(48.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = AppColors.accent),
                        shape = RoundedCornerShape(12.dp)
                    ) {
                        Text("Try Again", color = AppColors.textPrimary)
                    }
                    Spacer(modifier = Modifier.height(8.dp))
                    TextButton(onClick = onDismiss) {
                        Text("Cancel", color = AppColors.textSecondary)
                    }
                }

                TapState.SUCCESS -> { /* auto-dismisses */ }
            }
        }
    }
}
