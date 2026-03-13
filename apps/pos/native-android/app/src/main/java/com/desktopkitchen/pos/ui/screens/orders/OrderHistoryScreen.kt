package com.desktopkitchen.pos.ui.screens.orders

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.unit.dp
import com.desktopkitchen.pos.app.AppState
import com.desktopkitchen.pos.app.Screen
import com.desktopkitchen.pos.models.Order
import com.desktopkitchen.pos.ui.theme.AppColors
import com.desktopkitchen.pos.ui.theme.Typography
import com.desktopkitchen.pos.utilities.CurrencyFormatter
import com.desktopkitchen.pos.utilities.DateFormatters
import com.desktopkitchen.pos.viewmodels.OrderHistoryViewModel

@Composable
fun OrderHistoryScreen(
    viewModel: OrderHistoryViewModel,
    appState: AppState
) {
    LaunchedEffect(Unit) {
        viewModel.loadOrders()
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(AppColors.background)
    ) {
        // Header
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .background(AppColors.card)
                .padding(12.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            IconButton(onClick = { appState.navigate(Screen.POS) }) {
                Icon(Icons.AutoMirrored.Filled.ArrowBack, "Back", tint = AppColors.textPrimary)
            }
            Text("Order History", style = Typography.headlineMedium, color = AppColors.textPrimary)
        }

        if (viewModel.isLoading) {
            Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                CircularProgressIndicator(color = AppColors.accent)
            }
            return
        }

        if (viewModel.orders.isEmpty()) {
            Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                Text("No paid orders found", style = Typography.bodyLarge, color = AppColors.textTertiary)
            }
            return
        }

        // Two-column layout: order list + detail
        Row(modifier = Modifier.fillMaxSize()) {
            // Order list
            LazyColumn(
                modifier = Modifier
                    .weight(0.4f)
                    .fillMaxHeight()
                    .padding(8.dp),
                verticalArrangement = Arrangement.spacedBy(6.dp)
            ) {
                items(viewModel.orders, key = { it.id }) { order ->
                    val isSelected = viewModel.selectedOrder?.id == order.id
                    OrderListItem(
                        order = order,
                        isSelected = isSelected,
                        onClick = { viewModel.selectedOrder = order }
                    )
                }
            }

            // Detail panel
            Column(
                modifier = Modifier
                    .weight(0.6f)
                    .fillMaxHeight()
                    .background(AppColors.card)
                    .padding(16.dp)
            ) {
                val selected = viewModel.selectedOrder
                if (selected == null) {
                    Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                        Text("Select an order", style = Typography.bodyLarge, color = AppColors.textTertiary)
                    }
                } else {
                    OrderDetailPanel(
                        order = selected,
                        onRefund = {
                            viewModel.showRefundDialog = true
                        }
                    )
                }
            }
        }
    }

    // Refund dialog
    if (viewModel.showRefundDialog && viewModel.selectedOrder != null) {
        RefundDialog(
            order = viewModel.selectedOrder!!,
            isRefunding = viewModel.isRefunding,
            onRefund = { amount, reason ->
                viewModel.processRefund(viewModel.selectedOrder!!.id, amount, reason)
            },
            onDismiss = { viewModel.showRefundDialog = false }
        )
    }

    // Refund success message
    viewModel.refundResult?.let { result ->
        if (result.success) {
            androidx.compose.material3.AlertDialog(
                onDismissRequest = { viewModel.dismissRefundResult() },
                title = { Text("Refund Processed", color = AppColors.textPrimary) },
                text = {
                    Text(
                        "Refunded ${CurrencyFormatter.format(result.amount ?: 0.0)}",
                        color = AppColors.textSecondary
                    )
                },
                confirmButton = {
                    androidx.compose.material3.TextButton(onClick = { viewModel.dismissRefundResult() }) {
                        Text("OK", color = AppColors.accent)
                    }
                },
                containerColor = AppColors.card
            )
        }
    }
}

@Composable
private fun OrderListItem(
    order: Order,
    isSelected: Boolean,
    onClick: () -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(8.dp))
            .background(if (isSelected) AppColors.accent.copy(alpha = 0.15f) else AppColors.card)
            .clickable(onClick = onClick)
            .padding(12.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Column {
            Text("#${order.order_number}", style = Typography.titleMedium, color = AppColors.textPrimary)
            order.created_at?.let {
                Text(
                    DateFormatters.formatTime(it),
                    style = Typography.bodySmall,
                    color = AppColors.textTertiary
                )
            }
        }
        Column(horizontalAlignment = Alignment.End) {
            Text(
                CurrencyFormatter.format(order.total ?: 0.0),
                style = Typography.titleMedium,
                color = AppColors.accent
            )
            Text(
                order.payment_method ?: "N/A",
                style = Typography.bodySmall,
                color = AppColors.textTertiary
            )
        }
    }
}

@Composable
private fun OrderDetailPanel(
    order: Order,
    onRefund: () -> Unit
) {
    Column {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text("Order #${order.order_number}", style = Typography.headlineMedium, color = AppColors.textPrimary)
                order.created_at?.let {
                    Text(DateFormatters.formatTime(it), style = Typography.bodyMedium, color = AppColors.textTertiary)
                }
            }
            Text(
                order.payment_status ?: "",
                style = Typography.labelLarge,
                color = when (order.payment_status) {
                    "paid", "completed" -> AppColors.success
                    "refunded" -> AppColors.error
                    else -> AppColors.textSecondary
                },
                modifier = Modifier
                    .clip(RoundedCornerShape(6.dp))
                    .background(AppColors.surface)
                    .padding(horizontal = 8.dp, vertical = 4.dp)
            )
        }

        Spacer(modifier = Modifier.height(12.dp))
        HorizontalDivider(color = AppColors.border)
        Spacer(modifier = Modifier.height(12.dp))

        // Items
        Text("Items", style = Typography.titleMedium, color = AppColors.textSecondary)
        Spacer(modifier = Modifier.height(8.dp))

        order.items?.forEach { item ->
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 4.dp),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Row {
                    Text("${item.quantity}x", style = Typography.bodyMedium, color = AppColors.textTertiary)
                    Spacer(modifier = Modifier.width(8.dp))
                    Column {
                        Text(item.item_name, style = Typography.bodyMedium, color = AppColors.textPrimary)
                        item.modifiers?.let { mods ->
                            if (mods.isNotEmpty()) {
                                Text(
                                    mods.joinToString(", ") { it.displayName },
                                    style = Typography.bodySmall,
                                    color = AppColors.textTertiary
                                )
                            }
                        }
                    }
                }
                Text(
                    CurrencyFormatter.format((item.unit_price ?: 0.0) * item.quantity),
                    style = Typography.bodyMedium,
                    color = AppColors.textPrimary
                )
            }
        }

        Spacer(modifier = Modifier.height(12.dp))
        HorizontalDivider(color = AppColors.border)
        Spacer(modifier = Modifier.height(8.dp))

        // Totals
        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
            Text("Subtotal", style = Typography.bodyMedium, color = AppColors.textSecondary)
            Text(CurrencyFormatter.format(order.subtotal ?: 0.0), style = Typography.bodyMedium, color = AppColors.textSecondary)
        }
        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
            Text(CurrencyFormatter.TAX_LABEL, style = Typography.bodyMedium, color = AppColors.textSecondary)
            Text(CurrencyFormatter.format(order.tax ?: 0.0), style = Typography.bodyMedium, color = AppColors.textSecondary)
        }
        if ((order.tip ?: 0.0) > 0.0) {
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                Text("Tip", style = Typography.bodyMedium, color = AppColors.textSecondary)
                Text(CurrencyFormatter.format(order.tip!!), style = Typography.bodyMedium, color = AppColors.textSecondary)
            }
        }
        Spacer(modifier = Modifier.height(4.dp))
        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
            Text("Total", style = Typography.titleMedium, color = AppColors.textPrimary)
            Text(CurrencyFormatter.format(order.total ?: 0.0), style = Typography.titleMedium, color = AppColors.accent)
        }

        Spacer(modifier = Modifier.weight(1f))

        // Refund button
        if (order.payment_status == "paid" || order.payment_status == "completed") {
            androidx.compose.material3.Button(
                onClick = onRefund,
                modifier = Modifier.fillMaxWidth(),
                colors = ButtonDefaults.buttonColors(containerColor = AppColors.error),
                shape = RoundedCornerShape(12.dp)
            ) {
                Text("Process Refund", style = Typography.titleMedium, color = AppColors.textPrimary)
            }
        }
    }
}
