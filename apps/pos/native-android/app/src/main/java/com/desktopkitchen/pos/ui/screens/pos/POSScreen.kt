package com.desktopkitchen.pos.ui.screens.pos

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.desktopkitchen.pos.ai.model.ModelDownloadManager
import com.desktopkitchen.pos.ai.model.ModelDownloadState
import com.desktopkitchen.pos.ai.ui.ModelDownloadDialog
import com.desktopkitchen.pos.app.AppState
import com.desktopkitchen.pos.ui.theme.AppColors
import com.desktopkitchen.pos.ui.theme.Typography
import com.desktopkitchen.pos.viewmodels.POSViewModel
import kotlinx.coroutines.launch

@Composable
fun POSScreen(
    viewModel: POSViewModel,
    appState: AppState,
    downloadManager: ModelDownloadManager? = null
) {
    val scope = rememberCoroutineScope()
    var showModelDownload by remember { mutableStateOf(false) }
    val downloadState = downloadManager?.state?.collectAsState()

    LaunchedEffect(Unit) {
        viewModel.loadData()
        // Show model download dialog after first login if not already downloaded
        if (downloadManager != null && !downloadManager.isModelReady) {
            showModelDownload = true
        }
    }

    if (viewModel.isLoading) {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(AppColors.background),
            contentAlignment = Alignment.Center
        ) {
            CircularProgressIndicator(color = AppColors.accent)
        }
        return
    }

    Row(
        modifier = Modifier
            .fillMaxSize()
            .background(AppColors.background)
    ) {
        // Menu area (65%)
        Column(
            modifier = Modifier
                .weight(0.65f)
                .fillMaxHeight()
                .padding(12.dp)
        ) {
            // Delivery alert banner
            DeliveryAlertBanner(
                alerts = viewModel.deliveryAlerts,
                onDismiss = { viewModel.dismissDeliveryAlert(it) },
                modifier = Modifier.padding(bottom = 8.dp)
            )

            // Category pills
            CategoryPills(
                categories = viewModel.categories,
                selectedId = viewModel.selectedCategoryId,
                onSelect = { viewModel.selectedCategoryId = it }
            )

            // Menu grid
            if (viewModel.filteredItems.isEmpty()) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .weight(1f),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = "No items found",
                        style = Typography.bodyLarge,
                        color = AppColors.textTertiary
                    )
                }
            } else {
                MenuGrid(
                    items = viewModel.filteredItems,
                    onItemClick = { viewModel.onMenuItemTapped(it) },
                    itemIdsWithModifiers = viewModel.itemIdsWithModifiers,
                    modifier = Modifier.weight(1f)
                )
            }
        }

        // Cart sidebar (35%)
        CartSidebar(
            cart = viewModel.cart,
            subtotal = viewModel.subtotal,
            tax = viewModel.tax,
            total = viewModel.cartTotal,
            discountAmount = viewModel.discountAmount,
            discountLabel = viewModel.cartDiscount?.let { d ->
                if (d.type == "percent") "Discount (${d.value.toInt()}%)" else "Discount"
            },
            onQuantityChange = { cartId, qty -> viewModel.updateQuantity(cartId, qty) },
            onRemove = { viewModel.removeFromCart(it) },
            onClear = { viewModel.clearCart() },
            onPay = { viewModel.showPaymentSheet = true },
            onDiscount = { viewModel.showDiscountDialog = true },
            onRemoveDiscount = { viewModel.removeDiscount() },
            linkedCustomer = viewModel.linkedCustomer,
            onLinkCustomer = { viewModel.showCustomerLookup = true },
            onUnlinkCustomer = { viewModel.unlinkCustomer() },
            aiSuggestions = viewModel.aiSuggestions,
            isSuggestionsLoading = viewModel.isSuggestionsLoading,
            onAcceptSuggestion = { viewModel.acceptSuggestion(it) },
            onDismissSuggestion = { viewModel.dismissSuggestion(it) },
            isOffline = viewModel.isOffline,
            pendingSyncCount = viewModel.pendingSyncCount,
            onLogout = { appState.logout() },
            onNavigate = { appState.navigate(it) },
            appState = appState,
            modifier = Modifier
                .weight(0.35f)
                .fillMaxHeight()
        )
    }

    // Payment method dialog
    if (viewModel.showPaymentSheet) {
        PaymentMethodDialog(
            total = viewModel.cartTotal,
            onSelect = { method ->
                viewModel.showPaymentSheet = false
                val employeeId = appState.currentEmployee?.id ?: return@PaymentMethodDialog
                when (method) {
                    PaymentMethod.CASH -> viewModel.processCashPayment(employeeId)
                    PaymentMethod.CARD -> viewModel.processCardPayment(employeeId)
                    PaymentMethod.SPLIT -> viewModel.showSplitPayment = true
                    PaymentMethod.GETNET_TAP -> viewModel.showGetnetTap = true
                }
            },
            onDismiss = { viewModel.showPaymentSheet = false }
        )
    }

    // Split payment dialog
    if (viewModel.showSplitPayment) {
        SplitPaymentDialog(
            total = viewModel.cartTotal,
            onConfirm = { splits ->
                val employeeId = appState.currentEmployee?.id ?: return@SplitPaymentDialog
                viewModel.processSplitPayment(employeeId, splits)
            },
            onDismiss = { viewModel.showSplitPayment = false }
        )
    }

    // Customer lookup dialog
    if (viewModel.showCustomerLookup) {
        CustomerLookupDialog(
            loyaltyService = viewModel.loyaltyService,
            onCustomerLinked = { viewModel.linkCustomer(it) },
            onDismiss = { viewModel.showCustomerLookup = false }
        )
    }

    // Discount dialog
    if (viewModel.showDiscountDialog) {
        DiscountDialog(
            subtotal = viewModel.subtotal,
            onApply = { viewModel.applyDiscount(it) },
            onDismiss = { viewModel.showDiscountDialog = false }
        )
    }

    // Modifier selection dialog
    if (viewModel.showModifierDialog) {
        viewModel.modifierDialogItem?.let { item ->
            ModifierSelectionDialog(
                menuItem = item,
                groups = viewModel.modifierDialogGroups,
                quantity = viewModel.modifierDialogQuantity,
                onQuantityChange = { viewModel.modifierDialogQuantity = it },
                onConfirm = { mods, qty, notes -> viewModel.addToCartWithModifiers(item, mods, qty, notes) },
                onDismiss = { viewModel.dismissModifierDialog() }
            )
        }
    }

    // Getnet Tap to Pay dialog
    if (viewModel.showGetnetTap) {
        GetnetTapPaymentDialog(
            total = viewModel.cartTotal,
            onTapConfirmed = {
                val employeeId = appState.currentEmployee?.id ?: return@GetnetTapPaymentDialog
                viewModel.processGetnetTapPayment(employeeId)
            },
            onDismiss = { viewModel.dismissGetnetTap() },
            isProcessing = viewModel.isProcessingPayment,
            isSuccess = viewModel.getnetTapSuccess,
            errorMessage = viewModel.getnetTapError
        )
    }

    // Order confirmation overlay
    if (viewModel.showOrderConfirmation) {
        OrderConfirmationOverlay(
            orderNumber = viewModel.confirmedOrderNumber,
            onDismiss = { viewModel.dismissOrderConfirmation() }
        )
    }

    // AI Model download dialog
    if (showModelDownload && downloadManager != null) {
        ModelDownloadDialog(
            downloadManager = downloadManager,
            onDownload = { scope.launch { downloadManager.download() } },
            onSkip = { showModelDownload = false }
        )
        // Auto-close after Ready
        val currentState = downloadState?.value
        if (currentState is ModelDownloadState.Ready) {
            LaunchedEffect(currentState) {
                showModelDownload = false
            }
        }
    }
}
