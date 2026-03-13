package com.desktopkitchen.pos.ui.screens.pos

import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
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
import androidx.compose.material.icons.filled.Tune
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.scale
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.desktopkitchen.pos.models.MenuItem
import com.desktopkitchen.pos.ui.components.CachedAsyncImage
import com.desktopkitchen.pos.ui.theme.AppColors
import com.desktopkitchen.pos.ui.theme.Typography
import com.desktopkitchen.pos.utilities.CurrencyFormatter

@Composable
fun MenuItemCard(
    item: MenuItem,
    onClick: () -> Unit,
    hasModifiers: Boolean = false,
    modifier: Modifier = Modifier
) {
    var pressed by remember { mutableStateOf(false) }
    val scale by animateFloatAsState(if (pressed) 0.95f else 1f, label = "cardScale")

    val shape = RoundedCornerShape(8.dp)

    Column(
        modifier = modifier
            .scale(scale)
            .clip(shape)
            .background(AppColors.card)
            .border(1.dp, AppColors.border, shape)
            .pointerInput(Unit) {
                detectTapGestures(
                    onPress = {
                        pressed = true
                        tryAwaitRelease()
                        pressed = false
                        onClick()
                    }
                )
            }
    ) {
        // Image area
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(80.dp)
                .background(AppColors.surface)
        ) {
            CachedAsyncImage(
                url = item.image_url,
                contentDescription = item.name,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(80.dp)
            )
        }

        // Name, price, modifiers indicator
        Column(
            modifier = Modifier.padding(horizontal = 6.dp, vertical = 6.dp)
        ) {
            Text(
                text = item.name,
                style = Typography.bodySmall.copy(fontWeight = FontWeight.Bold),
                color = AppColors.textPrimary,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis
            )
            Spacer(modifier = Modifier.height(2.dp))
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = CurrencyFormatter.format(item.price),
                    style = Typography.bodyMedium.copy(
                        fontWeight = FontWeight.Bold,
                        fontSize = 14.sp
                    ),
                    color = AppColors.accent
                )
                if (hasModifiers) {
                    Icon(
                        imageVector = Icons.Default.Tune,
                        contentDescription = "Has modifiers",
                        tint = AppColors.textTertiary,
                        modifier = Modifier.size(12.dp)
                    )
                }
            }
        }
    }
}
