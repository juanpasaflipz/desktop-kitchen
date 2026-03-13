package com.desktopkitchen.pos.ui.screens.pos

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Person
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.unit.dp
import com.desktopkitchen.pos.models.LoyaltyCustomer
import com.desktopkitchen.pos.ui.theme.AppColors
import com.desktopkitchen.pos.ui.theme.Typography

@Composable
fun LoyaltyBadge(
    customer: LoyaltyCustomer,
    onUnlink: () -> Unit,
    modifier: Modifier = Modifier
) {
    val stamps = customer.activeCard?.stamps_collected ?: 0
    val required = customer.activeCard?.stamps_required ?: 10

    Row(
        modifier = modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(8.dp))
            .background(AppColors.accent.copy(alpha = 0.1f))
            .padding(horizontal = 10.dp, vertical = 6.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Icon(Icons.Default.Person, null, tint = AppColors.accent, modifier = Modifier.size(16.dp))
        Spacer(modifier = Modifier.width(6.dp))
        Text(
            text = customer.name,
            style = Typography.bodySmall,
            color = AppColors.textPrimary,
            modifier = Modifier.weight(1f)
        )

        // Stamp dots
        Row(horizontalArrangement = Arrangement.spacedBy(3.dp)) {
            repeat(required.coerceAtMost(10)) { i ->
                Box(
                    modifier = Modifier
                        .size(8.dp)
                        .clip(CircleShape)
                        .background(
                            if (i < stamps) AppColors.accent else AppColors.border
                        )
                )
            }
        }

        IconButton(onClick = onUnlink, modifier = Modifier.size(20.dp)) {
            Icon(Icons.Default.Close, "Unlink", tint = AppColors.textTertiary, modifier = Modifier.size(14.dp))
        }
    }
}
