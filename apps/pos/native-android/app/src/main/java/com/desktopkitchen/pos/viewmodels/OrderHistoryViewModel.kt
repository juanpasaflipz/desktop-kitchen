package com.desktopkitchen.pos.viewmodels

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.desktopkitchen.pos.models.Order
import com.desktopkitchen.pos.models.RefundResponse
import com.desktopkitchen.pos.services.OrderService
import com.desktopkitchen.pos.services.PaymentService
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class OrderHistoryViewModel @Inject constructor(
    private val orderService: OrderService,
    private val paymentService: PaymentService
) : ViewModel() {

    var orders by mutableStateOf<List<Order>>(emptyList())
        private set
    var isLoading by mutableStateOf(true)
        private set
    var error by mutableStateOf<String?>(null)
        private set

    // Refund state
    var selectedOrder by mutableStateOf<Order?>(null)
    var showRefundDialog by mutableStateOf(false)
    var isRefunding by mutableStateOf(false)
        private set
    var refundResult by mutableStateOf<RefundResponse?>(null)
        private set

    fun loadOrders() {
        viewModelScope.launch {
            isLoading = true
            try {
                // Load completed/paid orders
                orders = orderService.getOrders()
                    .filter { it.payment_status == "paid" || it.payment_status == "completed" }
                    .sortedByDescending { it.created_at }
                error = null
            } catch (e: Exception) {
                error = e.message
            }
            isLoading = false
        }
    }

    fun processRefund(orderId: Int, amount: Double? = null, reason: String = "") {
        viewModelScope.launch {
            isRefunding = true
            try {
                val result = paymentService.refund(orderId, amount, reason)
                refundResult = result
                showRefundDialog = false
                // Reload orders
                loadOrders()
            } catch (e: Exception) {
                error = e.message
            }
            isRefunding = false
        }
    }

    fun dismissRefundResult() {
        refundResult = null
    }
}
