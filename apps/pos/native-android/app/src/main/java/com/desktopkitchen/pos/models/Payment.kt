package com.desktopkitchen.pos.models

import com.squareup.moshi.JsonClass

@JsonClass(generateAdapter = true)
data class PaymentIntent(
    val client_secret: String,
    val payment_intent_id: String,
    val amount: Double
)

@JsonClass(generateAdapter = true)
data class PaymentStatus(
    val status: String,
    val payment_intent_id: String? = null,
    val amount: Double? = null
)

@JsonClass(generateAdapter = true)
data class CreatePaymentIntentRequest(
    val order_id: Int,
    val tip: Double? = null
)

@JsonClass(generateAdapter = true)
data class ConfirmPaymentRequest(
    val order_id: Int,
    val payment_intent_id: String
)

@JsonClass(generateAdapter = true)
data class CashPaymentRequest(
    val order_id: Int,
    val tip: Double? = null,
    val amount_received: Double? = null
)

@JsonClass(generateAdapter = true)
data class PaymentSplit(
    val payment_method: String,
    val amount: Double,
    val tip: Double = 0.0
)

@JsonClass(generateAdapter = true)
data class SplitPaymentRequest(
    val order_id: Int,
    val split_type: String = "mixed",
    val splits: List<PaymentSplit>
)

@JsonClass(generateAdapter = true)
data class SplitPaymentResponse(
    val success: Boolean,
    val message: String? = null,
    val splits_count: Int? = null
)
