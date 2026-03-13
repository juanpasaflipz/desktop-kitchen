package com.desktopkitchen.pos.networking.api

import com.desktopkitchen.pos.models.AddStampRequest
import com.desktopkitchen.pos.models.CreateCustomerRequest
import com.desktopkitchen.pos.models.LoyaltyCustomer
import com.desktopkitchen.pos.models.StampCard
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.Path

interface LoyaltyApi {
    @GET("api/loyalty/customers/phone/{phone}")
    suspend fun lookupByPhone(@Path("phone") phone: String): LoyaltyCustomer

    @POST("api/loyalty/customers")
    suspend fun createCustomer(@Body request: CreateCustomerRequest): LoyaltyCustomer

    @POST("api/loyalty/customers/{id}/stamps")
    suspend fun addStamp(@Path("id") customerId: Int, @Body request: AddStampRequest): StampCard

    @POST("api/loyalty/customers/{id}/redeem")
    suspend fun redeem(@Path("id") customerId: Int, @Body body: Map<String, String> = emptyMap()): StampCard
}
