package com.desktopkitchen.pos.ui.screens.pos

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.Logout
import androidx.compose.material.icons.filled.Assessment
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Discount
import androidx.compose.material.icons.filled.CloudOff
import androidx.compose.material.icons.filled.History
import androidx.compose.material.icons.filled.Loyalty
import androidx.compose.material.icons.filled.Restaurant
import androidx.compose.material.icons.filled.Sync
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import com.desktopkitchen.pos.models.LoyaltyCustomer
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.unit.dp
import com.desktopkitchen.pos.ai.suggestions.AiSuggestion
import com.desktopkitchen.pos.ai.ui.SuggestionBanner
import com.desktopkitchen.pos.app.AppState
import com.desktopkitchen.pos.app.Screen
import com.desktopkitchen.pos.models.CartItem
import com.desktopkitchen.pos.ui.theme.AppColors
import com.desktopkitchen.pos.ui.theme.Typography
import com.desktopkitchen.pos.utilities.CurrencyFormatter

@Composable
fun CartSidebar(
    cart: List<CartItem>,
    subtotal: Double,
    tax: Double,
    total: Double,
    discountAmount: Double = 0.0,
    discountLabel: String? = null,
    onQuantityChange: (String, Int) -> Unit,
    onRemove: (String) -> Unit,
    onClear: () -> Unit,
    onPay: () -> Unit,
    onDiscount: () -> Unit = {},
    onRemoveDiscount: () -> Unit = {},
    linkedCustomer: LoyaltyCustomer? = null,
    onLinkCustomer: () -> Unit = {},
    onUnlinkCustomer: () -> Unit = {},
    aiSuggestions: List<AiSuggestion> = emptyList(),
    isSuggestionsLoading: Boolean = false,
    onAcceptSuggestion: (AiSuggestion) -> Unit = {},
    onDismissSuggestion: (AiSuggestion) -> Unit = {},
    isOffline: Boolean = false,
    pendingSyncCount: Int = 0,
    onLogout: () -> Unit,
    onNavigate: (Screen) -> Unit,
    appState: AppState,
    modifier: Modifier = Modifier
) {
    Column(
        modifier = modifier
            .background(AppColors.card)
            .padding(12.dp)
    ) {
        // Header with nav icons
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = "Cart",
                style = Typography.titleLarge,
                color = AppColors.textPrimary
            )
            Row {
                val role = appState.currentEmployee?.role
                if (role == "admin" || role == "manager") {
                    IconButton(onClick = { onNavigate(Screen.Kitchen) }) {
                        Icon(Icons.Default.Restaurant, "Kitchen", tint = AppColors.textSecondary)
                    }
                    IconButton(onClick = { onNavigate(Screen.Reports) }) {
                        Icon(Icons.Default.Assessment, "Reports", tint = AppColors.textSecondary)
                    }
                    IconButton(onClick = { onNavigate(Screen.OrderHistory) }) {
                        Icon(Icons.Default.History, "Order History", tint = AppColors.textSecondary)
                    }
                }
                IconButton(onClick = onLogout) {
                    Icon(Icons.AutoMirrored.Filled.Logout, "Logout", tint = AppColors.textSecondary)
                }
            }
        }

        HorizontalDivider(color = AppColors.border, modifier = Modifier.padding(vertical = 8.dp))

        // Offline banner
        if (isOffline || pendingSyncCount > 0) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(8.dp))
                    .background(if (isOffline) AppColors.warning.copy(alpha = 0.15f) else AppColors.info.copy(alpha = 0.15f))
                    .padding(horizontal = 10.dp, vertical = 6.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(6.dp)
            ) {
                Icon(
                    if (isOffline) Icons.Default.CloudOff else Icons.Default.Sync,
                    null,
                    tint = if (isOffline) AppColors.warning else AppColors.info,
                    modifier = Modifier.size(16.dp)
                )
                Text(
                    text = if (isOffline) "Offline Mode" else "Syncing...",
                    style = Typography.bodySmall,
                    color = if (isOffline) AppColors.warning else AppColors.info,
                    modifier = Modifier.weight(1f)
                )
                if (pendingSyncCount > 0) {
                    Text(
                        text = "$pendingSyncCount pending",
                        style = Typography.bodySmall,
                        color = AppColors.textTertiary
                    )
                }
            }
            Spacer(modifier = Modifier.height(4.dp))
        }

        // Loyalty badge or link button
        if (linkedCustomer != null) {
            LoyaltyBadge(
                customer = linkedCustomer,
                onUnlink = onUnlinkCustomer
            )
            Spacer(modifier = Modifier.height(4.dp))
        } else {
            TextButton(
                onClick = onLinkCustomer,
                modifier = Modifier.fillMaxWidth()
            ) {
                Icon(Icons.Default.Loyalty, "Loyalty", tint = AppColors.accent, modifier = Modifier.size(16.dp))
                Text(" Link Customer", color = AppColors.accent, style = Typography.bodySmall)
            }
        }

        // Cart items
        if (cart.isEmpty()) {
            Column(
                modifier = Modifier
                    .weight(1f)
                    .fillMaxWidth(),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.Center
            ) {
                Text(
                    text = "Cart is empty",
                    style = Typography.bodyLarge,
                    color = AppColors.textTertiary
                )
            }
        } else {
            LazyColumn(
                modifier = Modifier.weight(1f),
                verticalArrangement = Arrangement.spacedBy(4.dp)
            ) {
                items(cart, key = { it.cartId }) { item ->
                    CartItemRow(
                        item = item,
                        onQuantityChange = { onQuantityChange(item.cartId, it) },
                        onRemove = { onRemove(item.cartId) }
                    )
                }

                // AI Suggestions (inside scroll area, after cart items)
                if (aiSuggestions.isNotEmpty() || isSuggestionsLoading) {
                    item(key = "ai_suggestions") {
                        Spacer(modifier = Modifier.height(4.dp))
                        SuggestionBanner(
                            suggestions = aiSuggestions,
                            isLoading = isSuggestionsLoading,
                            onAccept = onAcceptSuggestion,
                            onDismiss = onDismissSuggestion
                        )
                    }
                }
            }
        }

        // Totals
        if (cart.isNotEmpty()) {
            HorizontalDivider(color = AppColors.border, modifier = Modifier.padding(vertical = 8.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text("Subtotal", style = Typography.bodyMedium, color = AppColors.textSecondary)
                Text(CurrencyFormatter.format(subtotal), style = Typography.bodyMedium, color = AppColors.textSecondary)
            }
            Spacer(modifier = Modifier.height(4.dp))
            if (discountAmount > 0.0) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text(
                            discountLabel ?: "Discount",
                            style = Typography.bodyMedium,
                            color = AppColors.error
                        )
                        IconButton(
                            onClick = onRemoveDiscount,
                            modifier = Modifier.size(20.dp)
                        ) {
                            Icon(Icons.Default.Close, "Remove discount", tint = AppColors.error, modifier = Modifier.size(14.dp))
                        }
                    }
                    Text("-${CurrencyFormatter.format(discountAmount)}", style = Typography.bodyMedium, color = AppColors.error)
                }
                Spacer(modifier = Modifier.height(4.dp))
            }
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text(CurrencyFormatter.TAX_LABEL, style = Typography.bodyMedium, color = AppColors.textSecondary)
                Text(CurrencyFormatter.format(tax), style = Typography.bodyMedium, color = AppColors.textSecondary)
            }
            Spacer(modifier = Modifier.height(8.dp))
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text("Total", style = Typography.titleMedium, color = AppColors.textPrimary)
                Text(CurrencyFormatter.format(total), style = Typography.titleMedium, color = AppColors.accent)
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Action buttons
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                TextButton(
                    onClick = onClear,
                    modifier = Modifier.weight(1f)
                ) {
                    Icon(Icons.Default.Delete, "Clear", tint = AppColors.error)
                    Text(" Clear", color = AppColors.error)
                }
                if (discountAmount == 0.0) {
                    TextButton(
                        onClick = onDiscount,
                        modifier = Modifier.weight(1f)
                    ) {
                        Icon(Icons.Default.Discount, "Discount", tint = AppColors.accent)
                        Text(" %", color = AppColors.accent)
                    }
                }
                Button(
                    onClick = onPay,
                    modifier = Modifier.weight(2f),
                    colors = ButtonDefaults.buttonColors(containerColor = AppColors.accent),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Text(
                        "Pay ${CurrencyFormatter.format(total)}",
                        style = Typography.titleMedium,
                        color = AppColors.textPrimary
                    )
                }
            }
        }
    }
}
