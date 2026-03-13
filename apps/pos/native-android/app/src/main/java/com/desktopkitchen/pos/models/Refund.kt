package com.desktopkitchen.pos.models

import com.squareup.moshi.JsonClass

@JsonClass(generateAdapter = true)
data class RefundRequest(
    val order_id: Int,
    val amount: Double? = null,
    val reason: String = ""
)

@JsonClass(generateAdapter = true)
data class RefundResponse(
    val success: Boolean,
    val refund_id: Int? = null,
    val amount: Double? = null,
    val refund_type: String? = null,
    val new_refund_total: Double? = null,
    val fully_refunded: Boolean? = null
)

@JsonClass(generateAdapter = true)
data class RefundRecord(
    val id: Int,
    val order_id: Int,
    val amount: Double,
    val reason: String? = null,
    val refund_type: String? = null,
    val refunded_by: Int? = null,
    val refunded_by_name: String? = null,
    val created_at: String? = null
)
