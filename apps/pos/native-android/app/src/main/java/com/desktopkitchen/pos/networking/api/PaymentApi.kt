package com.desktopkitchen.pos.networking.api

import com.desktopkitchen.pos.models.CashPaymentRequest
import com.desktopkitchen.pos.models.ConfirmPaymentRequest
import com.desktopkitchen.pos.models.CreatePaymentIntentRequest
import com.desktopkitchen.pos.models.PaymentIntent
import com.desktopkitchen.pos.models.PaymentStatus
import com.desktopkitchen.pos.models.RefundRequest
import com.desktopkitchen.pos.models.RefundResponse
import com.desktopkitchen.pos.models.RefundRecord
import com.desktopkitchen.pos.models.SplitPaymentRequest
import com.desktopkitchen.pos.models.SplitPaymentResponse
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.Path

interface PaymentApi {
    @POST("api/payments/create-intent")
    suspend fun createIntent(@Body request: CreatePaymentIntentRequest): PaymentIntent

    @POST("api/payments/confirm")
    suspend fun confirm(@Body request: ConfirmPaymentRequest)

    @POST("api/payments/cash")
    suspend fun cashPayment(@Body request: CashPaymentRequest)

    @POST("api/payments/split")
    suspend fun splitPayment(@Body request: SplitPaymentRequest): SplitPaymentResponse

    @POST("api/payments/refund")
    suspend fun refund(@Body request: RefundRequest): RefundResponse

    @GET("api/payments/refunds/{orderId}")
    suspend fun getRefunds(@Path("orderId") orderId: Int): List<RefundRecord>

    @GET("api/payments/{orderId}")
    suspend fun getStatus(@Path("orderId") orderId: Int): PaymentStatus
}
