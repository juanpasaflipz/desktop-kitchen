package com.desktopkitchen.pos.services

import com.desktopkitchen.pos.models.AddStampRequest
import com.desktopkitchen.pos.models.CreateCustomerRequest
import com.desktopkitchen.pos.models.LoyaltyCustomer
import com.desktopkitchen.pos.models.StampCard
import com.desktopkitchen.pos.networking.api.LoyaltyApi
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class LoyaltyService @Inject constructor(
    private val loyaltyApi: LoyaltyApi
) {
    suspend fun lookupByPhone(phone: String): LoyaltyCustomer =
        loyaltyApi.lookupByPhone(phone)

    suspend fun createCustomer(phone: String, name: String): LoyaltyCustomer =
        loyaltyApi.createCustomer(CreateCustomerRequest(phone = phone, name = name))

    suspend fun addStamp(customerId: Int, orderId: Int): StampCard =
        loyaltyApi.addStamp(customerId, AddStampRequest(order_id = orderId))

    suspend fun redeem(customerId: Int): StampCard =
        loyaltyApi.redeem(customerId)
}
