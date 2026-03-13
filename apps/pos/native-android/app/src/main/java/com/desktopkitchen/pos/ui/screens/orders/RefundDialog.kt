package com.desktopkitchen.pos.ui.screens.orders

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
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FilterChipDefaults
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.window.Dialog
import com.desktopkitchen.pos.models.Order
import com.desktopkitchen.pos.ui.theme.AppColors
import com.desktopkitchen.pos.ui.theme.Typography
import com.desktopkitchen.pos.utilities.CurrencyFormatter

@Composable
fun RefundDialog(
    order: Order,
    isRefunding: Boolean,
    onRefund: (amount: Double?, reason: String) -> Unit,
    onDismiss: () -> Unit
) {
    var refundType by remember { mutableStateOf("full") } // "full" or "partial"
    var amountText by remember { mutableStateOf("") }
    var reason by remember { mutableStateOf("") }
    var selectedReason by remember { mutableStateOf<String?>(null) }

    val orderTotal = order.total ?: 0.0
    val partialAmount = amountText.toDoubleOrNull() ?: 0.0
    val isValid = when (refundType) {
        "full" -> true
        else -> partialAmount > 0.0 && partialAmount <= orderTotal
    }
    val refundAmount = if (refundType == "full") orderTotal else partialAmount
    val effectiveReason = selectedReason ?: reason

    val reasons = listOf("Wrong order", "Customer complaint", "Quality issue", "Duplicate charge")

    Dialog(onDismissRequest = onDismiss) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(16.dp))
                .background(AppColors.card)
                .padding(20.dp)
        ) {
            Text("Refund Order #${order.order_number}", style = Typography.headlineMedium, color = AppColors.textPrimary)
            Text("Total: ${CurrencyFormatter.format(orderTotal)}", style = Typography.bodyLarge, color = AppColors.accent)

            Spacer(modifier = Modifier.height(16.dp))

            // Refund type
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                FilterChip(
                    selected = refundType == "full",
                    onClick = { refundType = "full" },
                    label = { Text("Full Refund") },
                    colors = FilterChipDefaults.filterChipColors(
                        selectedContainerColor = AppColors.accent,
                        selectedLabelColor = AppColors.textPrimary
                    )
                )
                FilterChip(
                    selected = refundType == "partial",
                    onClick = { refundType = "partial" },
                    label = { Text("Partial") },
                    colors = FilterChipDefaults.filterChipColors(
                        selectedContainerColor = AppColors.accent,
                        selectedLabelColor = AppColors.textPrimary
                    )
                )
            }

            if (refundType == "partial") {
                Spacer(modifier = Modifier.height(8.dp))
                OutlinedTextField(
                    value = amountText,
                    onValueChange = { amountText = it.filter { c -> c.isDigit() || c == '.' } },
                    label = { Text("Refund Amount") },
                    prefix = { Text("$") },
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth(),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedTextColor = AppColors.textPrimary,
                        unfocusedTextColor = AppColors.textPrimary,
                        focusedBorderColor = AppColors.accent,
                        unfocusedBorderColor = AppColors.border,
                        focusedLabelColor = AppColors.accent,
                        unfocusedLabelColor = AppColors.textTertiary,
                        cursorColor = AppColors.accent
                    )
                )
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Reason quick picks
            Text("Reason", style = Typography.bodyMedium, color = AppColors.textSecondary)
            Spacer(modifier = Modifier.height(4.dp))
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(6.dp)
            ) {
                reasons.take(2).forEach { r ->
                    Text(
                        text = r,
                        style = Typography.bodySmall,
                        color = if (selectedReason == r) AppColors.accent else AppColors.textSecondary,
                        modifier = Modifier
                            .clip(RoundedCornerShape(6.dp))
                            .background(if (selectedReason == r) AppColors.accent.copy(alpha = 0.15f) else AppColors.surface)
                            .clickable { selectedReason = if (selectedReason == r) null else r }
                            .padding(horizontal = 8.dp, vertical = 4.dp)
                    )
                }
            }
            Spacer(modifier = Modifier.height(4.dp))
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(6.dp)
            ) {
                reasons.drop(2).forEach { r ->
                    Text(
                        text = r,
                        style = Typography.bodySmall,
                        color = if (selectedReason == r) AppColors.accent else AppColors.textSecondary,
                        modifier = Modifier
                            .clip(RoundedCornerShape(6.dp))
                            .background(if (selectedReason == r) AppColors.accent.copy(alpha = 0.15f) else AppColors.surface)
                            .clickable { selectedReason = if (selectedReason == r) null else r }
                            .padding(horizontal = 8.dp, vertical = 4.dp)
                    )
                }
            }

            Spacer(modifier = Modifier.height(8.dp))

            OutlinedTextField(
                value = reason,
                onValueChange = { reason = it; selectedReason = null },
                label = { Text("Or type a reason") },
                singleLine = true,
                modifier = Modifier.fillMaxWidth(),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedTextColor = AppColors.textPrimary,
                    unfocusedTextColor = AppColors.textPrimary,
                    focusedBorderColor = AppColors.accent,
                    unfocusedBorderColor = AppColors.border,
                    focusedLabelColor = AppColors.accent,
                    unfocusedLabelColor = AppColors.textTertiary,
                    cursorColor = AppColors.accent
                )
            )

            Spacer(modifier = Modifier.height(12.dp))
            HorizontalDivider(color = AppColors.border)
            Spacer(modifier = Modifier.height(12.dp))

            // Preview
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text("Refund Amount:", style = Typography.bodyMedium, color = AppColors.textSecondary)
                Text(
                    CurrencyFormatter.format(refundAmount),
                    style = Typography.titleMedium,
                    color = AppColors.error
                )
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Buttons
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                TextButton(onClick = onDismiss, modifier = Modifier.weight(1f)) {
                    Text("Cancel", color = AppColors.textSecondary)
                }
                Button(
                    onClick = {
                        val amt = if (refundType == "full") null else partialAmount
                        onRefund(amt, effectiveReason)
                    },
                    enabled = isValid && !isRefunding,
                    modifier = Modifier.weight(2f),
                    colors = ButtonDefaults.buttonColors(containerColor = AppColors.error),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    if (isRefunding) {
                        CircularProgressIndicator(color = AppColors.textPrimary, modifier = Modifier.size(18.dp), strokeWidth = 2.dp)
                    } else {
                        Text("Process Refund", style = Typography.titleMedium, color = AppColors.textPrimary)
                    }
                }
            }
        }
    }
}
