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
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Close
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FilterChipDefaults
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.window.Dialog
import com.desktopkitchen.pos.models.PaymentSplit
import com.desktopkitchen.pos.ui.theme.AppColors
import com.desktopkitchen.pos.ui.theme.Typography
import com.desktopkitchen.pos.utilities.CurrencyFormatter
import kotlin.math.roundToInt

data class SplitEntry(
    val method: String = "cash",
    val amountText: String = "",
    val amount: Double = 0.0
)

@Composable
fun SplitPaymentDialog(
    total: Double,
    onConfirm: (List<PaymentSplit>) -> Unit,
    onDismiss: () -> Unit
) {
    val splits = remember {
        val half = (total / 2 * 100).roundToInt() / 100.0
        mutableStateListOf(
            SplitEntry(method = "cash", amountText = "%.2f".format(half), amount = half),
            SplitEntry(method = "card", amountText = "%.2f".format(total - half), amount = total - half)
        )
    }

    val allocatedTotal = splits.sumOf { it.amount }
    val remaining = total - allocatedTotal
    val isValid = splits.size >= 2 && splits.all { it.amount > 0 } && Math.abs(remaining) < 0.01

    Dialog(onDismissRequest = onDismiss) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(16.dp))
                .background(AppColors.card)
                .padding(20.dp)
        ) {
            Text("Split Payment", style = Typography.headlineMedium, color = AppColors.textPrimary)
            Text(
                "Total: ${CurrencyFormatter.format(total)}",
                style = Typography.bodyLarge,
                color = AppColors.accent
            )

            Spacer(modifier = Modifier.height(12.dp))

            // Quick even split buttons
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                listOf(2, 3, 4).forEach { ways ->
                    FilterChip(
                        selected = false,
                        onClick = {
                            splits.clear()
                            val each = (total / ways * 100).roundToInt() / 100.0
                            repeat(ways) { i ->
                                val amt = if (i == ways - 1) total - each * (ways - 1) else each
                                splits.add(
                                    SplitEntry(
                                        method = if (i % 2 == 0) "cash" else "card",
                                        amountText = "%.2f".format(amt),
                                        amount = amt
                                    )
                                )
                            }
                        },
                        label = { Text("${ways}-way") },
                        colors = FilterChipDefaults.filterChipColors(
                            containerColor = AppColors.surface,
                            labelColor = AppColors.textSecondary
                        )
                    )
                }
            }

            Spacer(modifier = Modifier.height(12.dp))
            HorizontalDivider(color = AppColors.border)
            Spacer(modifier = Modifier.height(12.dp))

            // Split entries
            splits.forEachIndexed { index, entry ->
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(8.dp))
                        .background(AppColors.surface)
                        .padding(8.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    // Method toggle
                    Text(
                        text = if (entry.method == "cash") "Cash" else "Card",
                        style = Typography.labelLarge,
                        color = AppColors.accent,
                        modifier = Modifier
                            .clip(RoundedCornerShape(6.dp))
                            .background(AppColors.accent.copy(alpha = 0.15f))
                            .clickable {
                                splits[index] = entry.copy(
                                    method = if (entry.method == "cash") "card" else "cash"
                                )
                            }
                            .padding(horizontal = 10.dp, vertical = 4.dp)
                    )

                    Spacer(modifier = Modifier.width(8.dp))

                    OutlinedTextField(
                        value = entry.amountText,
                        onValueChange = { text ->
                            val filtered = text.filter { c -> c.isDigit() || c == '.' }
                            val amt = filtered.toDoubleOrNull() ?: 0.0
                            splits[index] = entry.copy(amountText = filtered, amount = amt)
                        },
                        prefix = { Text("$", color = AppColors.textTertiary) },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
                        singleLine = true,
                        modifier = Modifier.weight(1f),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedTextColor = AppColors.textPrimary,
                            unfocusedTextColor = AppColors.textPrimary,
                            focusedBorderColor = AppColors.accent,
                            unfocusedBorderColor = AppColors.border,
                            cursorColor = AppColors.accent
                        )
                    )

                    if (splits.size > 2) {
                        IconButton(
                            onClick = { splits.removeAt(index) },
                            modifier = Modifier.padding(start = 4.dp)
                        ) {
                            Icon(Icons.Default.Close, "Remove", tint = AppColors.error)
                        }
                    }
                }
                Spacer(modifier = Modifier.height(6.dp))
            }

            // Add split button
            if (splits.size < 4) {
                TextButton(
                    onClick = {
                        splits.add(SplitEntry(method = "cash", amountText = "0.00", amount = 0.0))
                    },
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Icon(Icons.Default.Add, null, tint = AppColors.accent)
                    Text(" Add Split", color = AppColors.accent)
                }
            }

            Spacer(modifier = Modifier.height(8.dp))

            // Remaining balance
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text("Remaining:", style = Typography.bodyMedium, color = AppColors.textSecondary)
                Text(
                    CurrencyFormatter.format(remaining.coerceAtLeast(0.0)),
                    style = Typography.titleMedium,
                    color = if (Math.abs(remaining) < 0.01) AppColors.success else AppColors.warning
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
                        val paymentSplits = splits.map {
                            PaymentSplit(payment_method = it.method, amount = it.amount)
                        }
                        onConfirm(paymentSplits)
                    },
                    enabled = isValid,
                    modifier = Modifier.weight(2f),
                    colors = ButtonDefaults.buttonColors(containerColor = AppColors.accent),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Text("Confirm Split", style = Typography.titleMedium, color = AppColors.textPrimary)
                }
            }
        }
    }
}
