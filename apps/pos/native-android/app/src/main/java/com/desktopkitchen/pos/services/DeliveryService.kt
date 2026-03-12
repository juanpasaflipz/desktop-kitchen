package com.desktopkitchen.pos.services

import com.desktopkitchen.pos.models.DeliveryOrder
import com.desktopkitchen.pos.networking.api.DeliveryApi
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class DeliveryService @Inject constructor(
    private val deliveryApi: DeliveryApi
) {
    suspend fun getActiveOrders(): List<DeliveryOrder> {
        return deliveryApi.getActiveOrders()
    }
}
