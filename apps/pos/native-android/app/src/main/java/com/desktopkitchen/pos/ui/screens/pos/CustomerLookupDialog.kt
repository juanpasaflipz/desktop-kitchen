package com.desktopkitchen.pos.ui.screens.pos

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
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
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Person
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.window.Dialog
import com.desktopkitchen.pos.models.LoyaltyCustomer
import com.desktopkitchen.pos.services.LoyaltyService
import com.desktopkitchen.pos.ui.theme.AppColors
import com.desktopkitchen.pos.ui.theme.Typography
import kotlinx.coroutines.launch

@Composable
fun CustomerLookupDialog(
    loyaltyService: LoyaltyService,
    onCustomerLinked: (LoyaltyCustomer) -> Unit,
    onDismiss: () -> Unit
) {
    var phone by remember { mutableStateOf("") }
    var isSearching by remember { mutableStateOf(false) }
    var foundCustomer by remember { mutableStateOf<LoyaltyCustomer?>(null) }
    var notFound by remember { mutableStateOf(false) }
    var errorMsg by remember { mutableStateOf<String?>(null) }

    // Registration fields
    var registerName by remember { mutableStateOf("") }
    var isRegistering by remember { mutableStateOf(false) }

    val scope = rememberCoroutineScope()

    Dialog(onDismissRequest = onDismiss) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(16.dp))
                .background(AppColors.card)
                .padding(20.dp)
        ) {
            Text("Link Customer", style = Typography.headlineMedium, color = AppColors.textPrimary)
            Spacer(modifier = Modifier.height(16.dp))

            if (foundCustomer != null) {
                // Show found customer
                val customer = foundCustomer!!
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(12.dp))
                        .background(AppColors.surface)
                        .padding(16.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Box(
                        modifier = Modifier
                            .size(48.dp)
                            .clip(CircleShape)
                            .background(AppColors.accent.copy(alpha = 0.2f)),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(Icons.Default.Person, null, tint = AppColors.accent, modifier = Modifier.size(28.dp))
                    }
                    Spacer(modifier = Modifier.width(12.dp))
                    Column(modifier = Modifier.weight(1f)) {
                        Text(customer.name, style = Typography.titleMedium, color = AppColors.textPrimary)
                        Text(customer.phone, style = Typography.bodySmall, color = AppColors.textTertiary)
                        val stamps = customer.activeCard?.stamps_collected ?: 0
                        val required = customer.activeCard?.stamps_required ?: 10
                        Text(
                            "Stamps: $stamps / $required",
                            style = Typography.bodyMedium,
                            color = AppColors.accent
                        )
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    TextButton(onClick = onDismiss, modifier = Modifier.weight(1f)) {
                        Text("Cancel", color = AppColors.textSecondary)
                    }
                    Button(
                        onClick = { onCustomerLinked(customer) },
                        modifier = Modifier.weight(2f),
                        colors = ButtonDefaults.buttonColors(containerColor = AppColors.accent),
                        shape = RoundedCornerShape(12.dp)
                    ) {
                        Icon(Icons.Default.CheckCircle, null, modifier = Modifier.size(18.dp))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("Link", style = Typography.titleMedium, color = AppColors.textPrimary)
                    }
                }
            } else if (notFound) {
                // Registration form
                Text("Customer not found. Register new:", style = Typography.bodyMedium, color = AppColors.textSecondary)
                Spacer(modifier = Modifier.height(8.dp))

                Text("Phone: $phone", style = Typography.bodyMedium, color = AppColors.textPrimary)
                Spacer(modifier = Modifier.height(8.dp))

                OutlinedTextField(
                    value = registerName,
                    onValueChange = { registerName = it },
                    label = { Text("Customer Name") },
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

                if (errorMsg != null) {
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(errorMsg!!, style = Typography.bodySmall, color = AppColors.error)
                }

                Spacer(modifier = Modifier.height(16.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    TextButton(
                        onClick = { notFound = false; phone = ""; errorMsg = null },
                        modifier = Modifier.weight(1f)
                    ) {
                        Text("Back", color = AppColors.textSecondary)
                    }
                    Button(
                        onClick = {
                            if (registerName.isBlank()) return@Button
                            scope.launch {
                                isRegistering = true
                                errorMsg = null
                                try {
                                    val customer = loyaltyService.createCustomer(phone, registerName)
                                    onCustomerLinked(customer)
                                } catch (e: Exception) {
                                    errorMsg = e.message ?: "Registration failed"
                                }
                                isRegistering = false
                            }
                        },
                        enabled = registerName.isNotBlank() && !isRegistering,
                        modifier = Modifier.weight(2f),
                        colors = ButtonDefaults.buttonColors(containerColor = AppColors.accent),
                        shape = RoundedCornerShape(12.dp)
                    ) {
                        if (isRegistering) {
                            CircularProgressIndicator(color = AppColors.textPrimary, modifier = Modifier.size(18.dp), strokeWidth = 2.dp)
                        } else {
                            Text("Register & Link", style = Typography.titleMedium, color = AppColors.textPrimary)
                        }
                    }
                }
            } else {
                // Phone input
                OutlinedTextField(
                    value = phone,
                    onValueChange = { phone = it.filter { c -> c.isDigit() } },
                    label = { Text("Phone Number") },
                    placeholder = { Text("10-digit number") },
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Phone),
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

                if (errorMsg != null) {
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(errorMsg!!, style = Typography.bodySmall, color = AppColors.error)
                }

                Spacer(modifier = Modifier.height(16.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    TextButton(onClick = onDismiss, modifier = Modifier.weight(1f)) {
                        Text("Cancel", color = AppColors.textSecondary)
                    }
                    Button(
                        onClick = {
                            if (phone.length < 10) return@Button
                            scope.launch {
                                isSearching = true
                                errorMsg = null
                                try {
                                    val customer = loyaltyService.lookupByPhone(phone)
                                    foundCustomer = customer
                                } catch (e: retrofit2.HttpException) {
                                    if (e.code() == 404) {
                                        notFound = true
                                    } else {
                                        errorMsg = e.message ?: "Lookup failed"
                                    }
                                } catch (e: Exception) {
                                    errorMsg = e.message ?: "Lookup failed"
                                }
                                isSearching = false
                            }
                        },
                        enabled = phone.length >= 10 && !isSearching,
                        modifier = Modifier.weight(2f),
                        colors = ButtonDefaults.buttonColors(containerColor = AppColors.accent),
                        shape = RoundedCornerShape(12.dp)
                    ) {
                        if (isSearching) {
                            CircularProgressIndicator(color = AppColors.textPrimary, modifier = Modifier.size(18.dp), strokeWidth = 2.dp)
                        } else {
                            Text("Look Up", style = Typography.titleMedium, color = AppColors.textPrimary)
                        }
                    }
                }
            }
        }
    }
}
