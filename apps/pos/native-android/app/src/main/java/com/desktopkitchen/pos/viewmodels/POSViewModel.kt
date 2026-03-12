package com.desktopkitchen.pos.viewmodels

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.desktopkitchen.pos.ai.suggestions.AiSuggestion
import com.desktopkitchen.pos.ai.suggestions.HybridSuggestionService
import com.desktopkitchen.pos.models.CartDiscount
import com.desktopkitchen.pos.models.CartItem
import com.desktopkitchen.pos.models.CreateOrderItem
import com.desktopkitchen.pos.models.MenuCategory
import com.desktopkitchen.pos.models.MenuItem
import com.desktopkitchen.pos.models.ModifierGroup
import com.desktopkitchen.pos.models.ModifierItem
import com.desktopkitchen.pos.models.LoyaltyCustomer
import com.desktopkitchen.pos.data.local.dao.OfflineOrderDao
import com.desktopkitchen.pos.data.local.entities.OfflineOrder
import com.desktopkitchen.pos.models.Order
import com.desktopkitchen.pos.models.PaymentSplit
import com.desktopkitchen.pos.models.DeliveryOrder
import com.desktopkitchen.pos.services.DeliveryService
import com.desktopkitchen.pos.services.GetnetService
import com.desktopkitchen.pos.services.LoyaltyService
import com.desktopkitchen.pos.services.MenuService
import com.desktopkitchen.pos.services.ModifierService
import com.desktopkitchen.pos.services.NetworkMonitor
import com.desktopkitchen.pos.services.OrderService
import com.desktopkitchen.pos.services.PaymentService
import com.desktopkitchen.pos.services.SyncService
import com.squareup.moshi.Moshi
import com.squareup.moshi.Types
import com.desktopkitchen.pos.utilities.CurrencyFormatter
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import java.util.UUID
import javax.inject.Inject

@HiltViewModel
class POSViewModel @Inject constructor(
    private val menuService: MenuService,
    private val orderService: OrderService,
    private val paymentService: PaymentService,
    private val modifierService: ModifierService,
    val loyaltyService: LoyaltyService,
    val networkMonitor: NetworkMonitor,
    val syncService: SyncService,
    private val offlineOrderDao: OfflineOrderDao,
    private val moshi: Moshi,
    val getnetService: GetnetService,
    private val suggestionService: HybridSuggestionService,
    private val deliveryService: DeliveryService
) : ViewModel() {

    // Data
    var categories by mutableStateOf<List<MenuCategory>>(emptyList())
        private set
    var menuItems by mutableStateOf<List<MenuItem>>(emptyList())
        private set
    var itemIdsWithModifiers by mutableStateOf<Set<Int>>(emptySet())
        private set
    val cart = mutableStateListOf<CartItem>()

    // UI State
    var selectedCategoryId by mutableStateOf<Int?>(null)
    var searchQuery by mutableStateOf("")
    var isLoading by mutableStateOf(true)
        private set
    var error by mutableStateOf<String?>(null)
        private set

    // Modifier dialog
    var showModifierDialog by mutableStateOf(false)
    var modifierDialogItem by mutableStateOf<MenuItem?>(null)
        private set
    var modifierDialogGroups by mutableStateOf<List<ModifierGroup>>(emptyList())
        private set
    var modifierDialogQuantity by mutableStateOf(1)

    // Offline
    var isOffline by mutableStateOf(false)
        private set
    var pendingSyncCount by mutableStateOf(0)
        private set
    private var offlineCounter = 0

    init {
        viewModelScope.launch {
            networkMonitor.isConnected.collect { connected ->
                isOffline = !connected
            }
        }
        viewModelScope.launch {
            syncService.pendingCount.collect { count ->
                pendingSyncCount = count
            }
        }
    }

    // Discount
    var cartDiscount by mutableStateOf<CartDiscount?>(null)
    var showDiscountDialog by mutableStateOf(false)

    val discountAmount: Double
        get() = cartDiscount?.computeAmount(CurrencyFormatter.extractSubtotal(cart.sumOf { it.lineTotal })) ?: 0.0

    // Loyalty
    var linkedCustomer by mutableStateOf<LoyaltyCustomer?>(null)
    var showCustomerLookup by mutableStateOf(false)

    fun linkCustomer(customer: LoyaltyCustomer) {
        linkedCustomer = customer
        showCustomerLookup = false
    }

    fun unlinkCustomer() {
        linkedCustomer = null
    }

    // Payment
    var showPaymentSheet by mutableStateOf(false)
    var showSplitPayment by mutableStateOf(false)
    var isProcessingPayment by mutableStateOf(false)
        private set
    var showOrderConfirmation by mutableStateOf(false)
    var confirmedOrderNumber by mutableStateOf("")
        private set

    // Getnet Tap
    var showGetnetTap by mutableStateOf(false)
    var getnetTapSuccess by mutableStateOf(false)
        private set
    var getnetTapError by mutableStateOf<String?>(null)
        private set

    // AI Suggestions
    var aiSuggestions by mutableStateOf<List<AiSuggestion>>(emptyList())
        private set
    var isSuggestionsLoading by mutableStateOf(false)
        private set
    private var categoryRoles: Map<Int, String> = emptyMap()
    private var suggestionJob: Job? = null

    // Delivery Alerts
    var deliveryAlerts by mutableStateOf<List<DeliveryOrder>>(emptyList())
        private set
    private val dismissedDeliveryIds = mutableSetOf<Int>()

    fun dismissDeliveryAlert(id: Int) {
        dismissedDeliveryIds.add(id)
        deliveryAlerts = deliveryAlerts.filter { it.id !in dismissedDeliveryIds }
    }

    private fun startDeliveryPolling() {
        viewModelScope.launch {
            while (true) {
                try {
                    val orders = deliveryService.getActiveOrders()
                    // Clean dismissed IDs no longer in active list
                    val activeIds = orders.map { it.id }.toSet()
                    dismissedDeliveryIds.retainAll(activeIds)
                    deliveryAlerts = orders.filter { it.id !in dismissedDeliveryIds }
                } catch (_: Exception) {
                    // Silently fail — banner just won't update
                }
                delay(20_000L)
            }
        }
    }

    // AI Suggestion actions
    private fun debounceSuggestions() {
        suggestionJob?.cancel()
        if (cart.isEmpty()) {
            aiSuggestions = emptyList()
            return
        }
        suggestionJob = viewModelScope.launch {
            delay(500L)
            refreshSuggestions()
        }
    }

    private fun refreshSuggestions() {
        suggestionJob?.cancel()
        suggestionJob = viewModelScope.launch {
            isSuggestionsLoading = true
            try {
                val suggestions = suggestionService.getSuggestions(
                    cart = cart.toList(),
                    allItems = menuItems,
                    categories = categories,
                    categoryRoles = categoryRoles
                )
                aiSuggestions = suggestions
            } catch (_: Exception) {
                aiSuggestions = emptyList()
            }
            isSuggestionsLoading = false
        }
    }

    fun acceptSuggestion(suggestion: AiSuggestion) {
        val menuItem = menuItems.find { it.id == suggestion.item_id } ?: return
        addToCart(menuItem)
        aiSuggestions = aiSuggestions.filter { it.item_id != suggestion.item_id }
    }

    fun dismissSuggestion(suggestion: AiSuggestion) {
        aiSuggestions = aiSuggestions.filter { it.item_id != suggestion.item_id }
    }

    // Computed
    val filteredItems: List<MenuItem>
        get() {
            var items = menuItems
            selectedCategoryId?.let { catId ->
                items = items.filter { it.category_id == catId }
            }
            if (searchQuery.isNotBlank()) {
                val query = searchQuery.lowercase()
                items = items.filter {
                    it.name.lowercase().contains(query) ||
                    (it.description?.lowercase()?.contains(query) == true)
                }
            }
            return items
        }

    val cartItemsTotal: Double
        get() = cart.sumOf { it.lineTotal }

    val cartTotal: Double
        get() = (cartItemsTotal - discountAmount).coerceAtLeast(0.0)

    val subtotal: Double
        get() = CurrencyFormatter.extractSubtotal(cartTotal)

    val tax: Double
        get() = CurrencyFormatter.extractTax(cartTotal)

    // Load Data
    fun loadData() {
        viewModelScope.launch {
            isLoading = true
            try {
                val cats = menuService.getCategories()
                val items = menuService.getMenuItems()
                categories = cats
                menuItems = items
                error = null
                // Load which items have modifiers (non-blocking)
                itemIdsWithModifiers = modifierService.getItemsWithModifiers()
                // Sync category roles for AI suggestions (non-blocking)
                menuService.syncCategoryRoles()
                categoryRoles = menuService.getCategoryRolesMap()
                // Start delivery alert polling
                startDeliveryPolling()
            } catch (e: Exception) {
                error = e.message
            }
            isLoading = false
        }
    }

    // Cart Operations
    fun onMenuItemTapped(item: MenuItem) {
        viewModelScope.launch {
            try {
                val groups = modifierService.getGroupsForItem(item.id)
                if (groups.isNotEmpty()) {
                    modifierDialogItem = item
                    modifierDialogGroups = groups
                    modifierDialogQuantity = 1
                    showModifierDialog = true
                } else {
                    addToCart(item)
                }
            } catch (_: Exception) {
                // If modifier fetch fails, add directly
                addToCart(item)
            }
        }
    }

    fun addToCartWithModifiers(item: MenuItem, selectedModifiers: List<ModifierItem>, quantity: Int, notes: String? = null) {
        cart.add(
            CartItem(
                cartId = UUID.randomUUID().toString(),
                menuItemId = item.id,
                itemName = item.name,
                quantity = quantity,
                unitPrice = item.price,
                menuItem = item,
                notes = notes,
                selectedModifierIds = selectedModifiers.map { it.id },
                selectedModifierNames = selectedModifiers.map { it.name },
                selectedModifierPrices = selectedModifiers.map { it.price_adjustment }
            )
        )
        showModifierDialog = false
        modifierDialogItem = null
        modifierDialogGroups = emptyList()
        debounceSuggestions()
    }

    fun dismissModifierDialog() {
        showModifierDialog = false
        modifierDialogItem = null
        modifierDialogGroups = emptyList()
    }

    fun addToCart(item: MenuItem) {
        val existingIndex = cart.indexOfFirst { it.menuItemId == item.id && it.selectedModifierIds == null }
        if (existingIndex >= 0) {
            val existing = cart[existingIndex]
            cart[existingIndex] = existing.copy(quantity = existing.quantity + 1)
        } else {
            cart.add(
                CartItem(
                    cartId = UUID.randomUUID().toString(),
                    menuItemId = item.id,
                    itemName = item.name,
                    quantity = 1,
                    unitPrice = item.price,
                    menuItem = item
                )
            )
        }
        debounceSuggestions()
    }

    fun removeFromCart(cartId: String) {
        cart.removeAll { it.cartId == cartId }
        debounceSuggestions()
    }

    fun updateQuantity(cartId: String, quantity: Int) {
        if (quantity <= 0) {
            removeFromCart(cartId)
        } else {
            val index = cart.indexOfFirst { it.cartId == cartId }
            if (index >= 0) {
                cart[index] = cart[index].copy(quantity = quantity)
            }
            debounceSuggestions()
        }
    }

    fun clearCart() {
        cart.clear()
        cartDiscount = null
        aiSuggestions = emptyList()
    }

    fun applyDiscount(discount: CartDiscount) {
        cartDiscount = discount
        showDiscountDialog = false
    }

    fun removeDiscount() {
        cartDiscount = null
    }

    // Helpers
    private fun buildOrderItems(): List<CreateOrderItem> = cart.map {
        CreateOrderItem(
            menu_item_id = it.menuItemId,
            quantity = it.quantity,
            notes = it.notes,
            modifiers = it.selectedModifierIds
        )
    }

    private suspend fun createOrderWithDiscount(employeeId: Int): Order {
        val discount = cartDiscount
        return orderService.createOrder(
            employeeId = employeeId,
            items = buildOrderItems(),
            discountType = discount?.type,
            discountValue = discount?.value,
            discountReason = discount?.reason?.ifBlank { null }
        )
    }

    private suspend fun addLoyaltyStamp(orderId: Int) {
        linkedCustomer?.let { customer ->
            try {
                loyaltyService.addStamp(customer.id, orderId)
            } catch (_: Exception) {
                // Stamp failure shouldn't block the order
            }
        }
    }

    private fun onOrderSuccess(orderNumber: String) {
        showPaymentSheet = false
        confirmedOrderNumber = orderNumber
        showOrderConfirmation = true
        cart.clear()
        cartDiscount = null
        linkedCustomer = null
    }

    // Payment
    fun processCardPayment(employeeId: Int, tip: Double = 0.0) {
        if (cart.isEmpty()) return
        viewModelScope.launch {
            isProcessingPayment = true
            try {
                val order = createOrderWithDiscount(employeeId)
                val intent = paymentService.createIntent(order.id, tip)
                paymentService.confirm(order.id, intent.payment_intent_id)
                addLoyaltyStamp(order.id)
                onOrderSuccess(order.order_number)
            } catch (e: Exception) {
                error = e.message
            }
            isProcessingPayment = false
        }
    }

    fun processCashPayment(employeeId: Int, tip: Double = 0.0) {
        if (cart.isEmpty()) return
        if (isOffline) {
            processOfflineCashOrder(employeeId, tip)
            return
        }
        viewModelScope.launch {
            isProcessingPayment = true
            try {
                val order = createOrderWithDiscount(employeeId)
                paymentService.cashPayment(order.id, tip)
                addLoyaltyStamp(order.id)
                onOrderSuccess(order.order_number)
            } catch (e: Exception) {
                // If network fails mid-request, queue offline
                processOfflineCashOrder(employeeId, tip)
            }
            isProcessingPayment = false
        }
    }

    private fun processOfflineCashOrder(employeeId: Int, tip: Double) {
        viewModelScope.launch {
            isProcessingPayment = true
            try {
                offlineCounter++
                val tempNumber = "OFF-${String.format("%03d", offlineCounter)}"
                val items = buildOrderItems()
                val listType = Types.newParameterizedType(List::class.java, CreateOrderItem::class.java)
                val adapter = moshi.adapter<List<CreateOrderItem>>(listType)
                val itemsJson = adapter.toJson(items)

                val discount = cartDiscount
                offlineOrderDao.insert(
                    OfflineOrder(
                        tempOrderNumber = tempNumber,
                        employeeId = employeeId,
                        itemsJson = itemsJson,
                        total = cartTotal,
                        tip = tip,
                        discountType = discount?.type,
                        discountValue = discount?.value,
                        discountReason = discount?.reason?.ifBlank { null },
                        customerId = linkedCustomer?.id
                    )
                )
                syncService.refreshPendingCount()
                onOrderSuccess(tempNumber)
            } catch (e: Exception) {
                error = "Failed to save offline order: ${e.message}"
            }
            isProcessingPayment = false
        }
    }

    fun processSplitPayment(employeeId: Int, splits: List<PaymentSplit>) {
        if (cart.isEmpty()) return
        viewModelScope.launch {
            isProcessingPayment = true
            try {
                val order = createOrderWithDiscount(employeeId)
                paymentService.splitPayment(order.id, splits)
                addLoyaltyStamp(order.id)
                showSplitPayment = false
                onOrderSuccess(order.order_number)
            } catch (e: Exception) {
                showSplitPayment = false
                error = e.message
            }
            isProcessingPayment = false
        }
    }

    fun processGetnetTapPayment(employeeId: Int, tip: Double = 0.0) {
        if (cart.isEmpty()) return
        viewModelScope.launch {
            isProcessingPayment = true
            getnetTapError = null
            getnetTapSuccess = false
            try {
                val order = createOrderWithDiscount(employeeId)
                // Mark as cash payment so the order registers as a sale
                paymentService.cashPayment(order.id, tip)
                addLoyaltyStamp(order.id)
                getnetTapSuccess = true
                onOrderSuccess(order.order_number)
            } catch (e: Exception) {
                getnetTapError = e.message ?: "Tap payment failed"
            }
            isProcessingPayment = false
        }
    }

    fun dismissGetnetTap() {
        showGetnetTap = false
        getnetTapSuccess = false
        getnetTapError = null
    }

    fun dismissOrderConfirmation() {
        showOrderConfirmation = false
        confirmedOrderNumber = ""
    }
}
