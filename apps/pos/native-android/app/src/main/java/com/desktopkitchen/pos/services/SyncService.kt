package com.desktopkitchen.pos.services

import com.desktopkitchen.pos.data.local.dao.OfflineOrderDao
import com.desktopkitchen.pos.models.CreateOrderItem
import com.squareup.moshi.Moshi
import com.squareup.moshi.Types
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class SyncService @Inject constructor(
    private val offlineOrderDao: OfflineOrderDao,
    private val orderService: OrderService,
    private val paymentService: PaymentService,
    private val loyaltyService: LoyaltyService,
    private val networkMonitor: NetworkMonitor,
    private val moshi: Moshi
) {
    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.IO)

    private val _pendingCount = MutableStateFlow(0)
    val pendingCount: StateFlow<Int> = _pendingCount.asStateFlow()

    private val _isSyncing = MutableStateFlow(false)
    val isSyncing: StateFlow<Boolean> = _isSyncing.asStateFlow()

    fun startMonitoring() {
        scope.launch {
            refreshPendingCount()
            networkMonitor.isConnected.collect { connected ->
                if (connected) {
                    syncPendingOrders()
                }
            }
        }
    }

    suspend fun refreshPendingCount() {
        _pendingCount.value = offlineOrderDao.getPendingCount()
    }

    suspend fun syncPendingOrders() {
        if (_isSyncing.value) return
        _isSyncing.value = true

        try {
            val pending = offlineOrderDao.getPendingOrders()
            val listType = Types.newParameterizedType(List::class.java, CreateOrderItem::class.java)
            val adapter = moshi.adapter<List<CreateOrderItem>>(listType)

            for (offlineOrder in pending) {
                try {
                    val items = adapter.fromJson(offlineOrder.itemsJson) ?: continue

                    val order = orderService.createOrder(
                        employeeId = offlineOrder.employeeId,
                        items = items,
                        discountType = offlineOrder.discountType,
                        discountValue = offlineOrder.discountValue,
                        discountReason = offlineOrder.discountReason
                    )

                    // Process cash payment
                    paymentService.cashPayment(order.id, offlineOrder.tip)

                    // Add loyalty stamp if customer was linked
                    offlineOrder.customerId?.let { customerId ->
                        try {
                            loyaltyService.addStamp(customerId, order.id)
                        } catch (_: Exception) { }
                    }

                    offlineOrderDao.markSynced(offlineOrder.localId, order.id)
                } catch (_: Exception) {
                    // Skip failed orders, retry next time
                }
            }

            offlineOrderDao.clearSynced()
        } finally {
            _isSyncing.value = false
            refreshPendingCount()
        }
    }
}
