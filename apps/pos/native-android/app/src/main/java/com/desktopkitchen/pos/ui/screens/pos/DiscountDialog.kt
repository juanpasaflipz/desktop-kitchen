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
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
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
import com.desktopkitchen.pos.models.CartDiscount
import com.desktopkitchen.pos.ui.theme.AppColors
import com.desktopkitchen.pos.ui.theme.Typography
import com.desktopkitchen.pos.utilities.CurrencyFormatter

@Composable
fun DiscountDialog(
    subtotal: Double,
    onApply: (CartDiscount) -> Unit,
    onDismiss: () -> Unit
) {
    var type by remember { mutableStateOf("percent") }
    var valueText by remember { mutableStateOf("") }
    var reason by remember { mutableStateOf("") }

    val value = valueText.toDoubleOrNull() ?: 0.0
    val previewAmount = when (type) {
        "percent" -> subtotal * (value / 100.0)
        else -> value
    }
    val isValid = value > 0.0 && (type != "percent" || value <= 100.0) && previewAmount <= subtotal

    Dialog(onDismissRequest = onDismiss) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(16.dp))
                .background(AppColors.card)
                .padding(20.dp)
        ) {
            Text("Apply Discount", style = Typography.headlineMedium, color = AppColors.textPrimary)
            Spacer(modifier = Modifier.height(16.dp))

            // Type toggle
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                FilterChip(
                    selected = type == "percent",
                    onClick = { type = "percent"; valueText = "" },
                    label = { Text("Percentage %") },
                    colors = FilterChipDefaults.filterChipColors(
                        selectedContainerColor = AppColors.accent,
                        selectedLabelColor = AppColors.textPrimary
                    )
                )
                FilterChip(
                    selected = type == "fixed",
                    onClick = { type = "fixed"; valueText = "" },
                    label = { Text("Fixed Amount") },
                    colors = FilterChipDefaults.filterChipColors(
                        selectedContainerColor = AppColors.accent,
                        selectedLabelColor = AppColors.textPrimary
                    )
                )
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Value input
            OutlinedTextField(
                value = valueText,
                onValueChange = { valueText = it.filter { c -> c.isDigit() || c == '.' } },
                label = { Text(if (type == "percent") "Percentage" else "Amount") },
                suffix = { Text(if (type == "percent") "%" else "MXN") },
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
                    cursorColor = AppColors.accent,
                    focusedSuffixColor = AppColors.textSecondary,
                    unfocusedSuffixColor = AppColors.textTertiary
                )
            )

            Spacer(modifier = Modifier.height(8.dp))

            // Quick percent buttons
            if (type == "percent") {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    listOf("5", "10", "15", "20").forEach { pct ->
                        Text(
                            text = "$pct%",
                            style = Typography.labelLarge,
                            color = if (valueText == pct) AppColors.accent else AppColors.textSecondary,
                            modifier = Modifier
                                .clip(RoundedCornerShape(8.dp))
                                .background(AppColors.surface)
                                .clickable { valueText = pct }
                                .padding(horizontal = 12.dp, vertical = 8.dp)
                        )
                    }
                }
                Spacer(modifier = Modifier.height(8.dp))
            }

            // Reason
            OutlinedTextField(
                value = reason,
                onValueChange = { reason = it },
                label = { Text("Reason (optional)") },
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
            if (value > 0.0) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text("Discount:", style = Typography.bodyMedium, color = AppColors.textSecondary)
                    Text(
                        "-${CurrencyFormatter.format(previewAmount)}",
                        style = Typography.titleMedium,
                        color = AppColors.error
                    )
                }
                Spacer(modifier = Modifier.height(12.dp))
            }

            // Buttons
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                TextButton(onClick = onDismiss, modifier = Modifier.weight(1f)) {
                    Text("Cancel", color = AppColors.textSecondary)
                }
                Button(
                    onClick = { onApply(CartDiscount(type = type, value = value, reason = reason)) },
                    enabled = isValid,
                    modifier = Modifier.weight(2f),
                    colors = ButtonDefaults.buttonColors(containerColor = AppColors.accent),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Text("Apply Discount", style = Typography.titleMedium, color = AppColors.textPrimary)
                }
            }
        }
    }
}
