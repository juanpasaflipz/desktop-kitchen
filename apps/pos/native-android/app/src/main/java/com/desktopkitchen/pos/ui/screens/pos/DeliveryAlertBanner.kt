package com.desktopkitchen.pos.ui.screens.pos

import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.LocalShipping
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableLongStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.desktopkitchen.pos.models.DeliveryOrder
import com.desktopkitchen.pos.utilities.CurrencyFormatter
import kotlinx.coroutines.delay
import java.time.Instant

private data class PlatformColors(val bg: Color, val border: Color, val accent: Color)

private val UBER_EATS = PlatformColors(
    bg = Color(0xFF052E16), border = Color(0xFF22C55E), accent = Color(0xFF4ADE80)
)
private val RAPPI = PlatformColors(
    bg = Color(0xFF431407), border = Color(0xFFF97316), accent = Color(0xFFFB923C)
)
private val DIDI_FOOD = PlatformColors(
    bg = Color(0xFF451A03), border = Color(0xFFF59E0B), accent = Color(0xFFFBBF24)
)
private val DEFAULT = PlatformColors(
    bg = Color(0xFF172554), border = Color(0xFF3B82F6), accent = Color(0xFF60A5FA)
)

private fun platformColors(name: String?): PlatformColors {
    val key = name?.lowercase()?.replace(Regex("[\\s-]+"), "_") ?: ""
    return when {
        key.contains("uber") -> UBER_EATS
        key.contains("rappi") -> RAPPI
        key.contains("didi") -> DIDI_FOOD
        else -> DEFAULT
    }
}

private fun formatElapsed(seconds: Long): String {
    val m = seconds / 60
    val s = seconds % 60
    return "$m:${s.toString().padStart(2, '0')}"
}

@Composable
fun DeliveryAlertBanner(
    alerts: List<DeliveryOrder>,
    onDismiss: (Int) -> Unit,
    modifier: Modifier = Modifier
) {
    if (alerts.isEmpty()) return

    var now by remember { mutableLongStateOf(System.currentTimeMillis()) }
    LaunchedEffect(Unit) {
        while (true) {
            delay(1000L)
            now = System.currentTimeMillis()
        }
    }

    Column(
        modifier = modifier
            .fillMaxWidth()
            .padding(horizontal = 12.dp),
        verticalArrangement = Arrangement.spacedBy(6.dp)
    ) {
        alerts.forEach { alert ->
            val colors = platformColors(alert.platform_name)
            val createdMs = try {
                Instant.parse(alert.created_at).toEpochMilli()
            } catch (_: Exception) { now }
            val elapsedSec = ((now - createdMs) / 1000).coerceAtLeast(0)
            val isUrgent = elapsedSec >= 600

            val alpha = if (isUrgent) {
                val transition = rememberInfiniteTransition(label = "pulse")
                val a by transition.animateFloat(
                    initialValue = 1f,
                    targetValue = 0.4f,
                    animationSpec = infiniteRepeatable(tween(600), RepeatMode.Reverse),
                    label = "pulseAlpha"
                )
                a
            } else 1f

            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(8.dp))
                    .background(colors.bg)
                    .border(1.dp, colors.border.copy(alpha = 0.5f), RoundedCornerShape(8.dp))
                    .padding(horizontal = 12.dp, vertical = 10.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                Icon(
                    imageVector = Icons.Default.LocalShipping,
                    contentDescription = null,
                    tint = colors.accent,
                    modifier = Modifier.size(20.dp)
                )

                Column(modifier = Modifier.weight(1f)) {
                    Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                        Text(
                            text = alert.platform_name ?: "Delivery",
                            color = colors.accent,
                            fontSize = 13.sp,
                            fontWeight = FontWeight.Bold
                        )
                        alert.order_number?.let {
                            Text(
                                text = "#$it",
                                color = Color(0xFFD4D4D4),
                                fontSize = 13.sp
                            )
                        }
                    }
                    alert.customer_name?.let { name ->
                        val totalStr = alert.total?.let { " — ${CurrencyFormatter.format(it)}" } ?: ""
                        Text(
                            text = "$name$totalStr",
                            color = Color(0xFFA3A3A3),
                            fontSize = 11.sp
                        )
                    }
                }

                Text(
                    text = formatElapsed(elapsedSec),
                    color = if (isUrgent) Color(0xFFF87171) else colors.accent,
                    fontSize = 13.sp,
                    fontWeight = FontWeight.Bold,
                    fontFamily = FontFamily.Monospace,
                    modifier = Modifier.alpha(alpha)
                )

                IconButton(
                    onClick = { onDismiss(alert.id) },
                    modifier = Modifier.size(28.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.Close,
                        contentDescription = "Dismiss",
                        tint = Color(0xFF737373),
                        modifier = Modifier.size(16.dp)
                    )
                }
            }
        }
    }
}
