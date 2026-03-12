package com.desktopkitchen.pos.networking.api

import com.desktopkitchen.pos.models.DeliveryOrder
import retrofit2.http.GET

interface DeliveryApi {
    @GET("api/delivery/orders/active")
    suspend fun getActiveOrders(): List<DeliveryOrder>
}
