package com.desktopkitchen.pos.models

import com.squareup.moshi.JsonClass

@JsonClass(generateAdapter = true)
data class DeliveryOrder(
    val id: Int,
    val order_id: Int,
    val platform_id: Int,
    val external_order_id: String? = null,
    val platform_status: String? = null,
    val delivery_fee: Double? = null,
    val platform_commission: Double? = null,
    val customer_name: String? = null,
    val delivery_address: String? = null,
    val created_at: String? = null,
    val platform_name: String? = null,
    val order_number: String? = null,
    val total: Double? = null,
    val order_status: String? = null
)
