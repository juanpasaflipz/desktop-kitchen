package com.desktopkitchen.pos.ui.screens.pos

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
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
import androidx.compose.material.icons.filled.CallSplit
import androidx.compose.material.icons.filled.CreditCard
import androidx.compose.material.icons.filled.Money
import androidx.compose.material.icons.filled.Nfc
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.unit.dp
import androidx.compose.ui.window.Dialog
import com.desktopkitchen.pos.ui.theme.AppColors
import com.desktopkitchen.pos.ui.theme.Typography
import com.desktopkitchen.pos.utilities.CurrencyFormatter

enum class PaymentMethod { CASH, CARD, SPLIT, GETNET_TAP }

@Composable
fun PaymentMethodDialog(
    total: Double,
    onSelect: (PaymentMethod) -> Unit,
    onDismiss: () -> Unit
) {
    Dialog(onDismissRequest = onDismiss) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(16.dp))
                .background(AppColors.card)
                .padding(20.dp)
        ) {
            Text("Payment Method", style = Typography.headlineMedium, color = AppColors.textPrimary)
            Text(CurrencyFormatter.format(total), style = Typography.titleLarge, color = AppColors.accent)
            Spacer(modifier = Modifier.height(16.dp))

            PaymentOptionRow(
                icon = Icons.Default.Money,
                label = "Cash",
                description = "Pay with cash",
                onClick = { onSelect(PaymentMethod.CASH) }
            )
            Spacer(modifier = Modifier.height(8.dp))
            PaymentOptionRow(
                icon = Icons.Default.CreditCard,
                label = "Card",
                description = "Credit or debit card",
                onClick = { onSelect(PaymentMethod.CARD) }
            )
            Spacer(modifier = Modifier.height(8.dp))
            PaymentOptionRow(
                icon = Icons.Default.CallSplit,
                label = "Split",
                description = "Split between methods",
                onClick = { onSelect(PaymentMethod.SPLIT) }
            )
            Spacer(modifier = Modifier.height(8.dp))
            PaymentOptionRow(
                icon = Icons.Default.Nfc,
                label = "Getnet Tap",
                description = "Tap card on device",
                onClick = { onSelect(PaymentMethod.GETNET_TAP) }
            )

            Spacer(modifier = Modifier.height(16.dp))
            TextButton(onClick = onDismiss, modifier = Modifier.fillMaxWidth()) {
                Text("Cancel", color = AppColors.textSecondary)
            }
        }
    }
}

@Composable
private fun PaymentOptionRow(
    icon: ImageVector,
    label: String,
    description: String,
    onClick: () -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(12.dp))
            .background(AppColors.surface)
            .clickable(onClick = onClick)
            .padding(16.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Icon(icon, null, tint = AppColors.accent, modifier = Modifier.size(28.dp))
        Spacer(modifier = Modifier.width(12.dp))
        Column {
            Text(label, style = Typography.titleMedium, color = AppColors.textPrimary)
            Text(description, style = Typography.bodySmall, color = AppColors.textTertiary)
        }
    }
}
