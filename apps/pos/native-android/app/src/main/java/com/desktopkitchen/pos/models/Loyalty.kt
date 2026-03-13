package com.desktopkitchen.pos.models

import com.squareup.moshi.JsonClass

@JsonClass(generateAdapter = true)
data class LoyaltyCustomer(
    val id: Int,
    val name: String,
    val phone: String,
    val stamps_earned: Int = 0,
    val total_spent: Double = 0.0,
    val activeCard: StampCard? = null,
    val created: Boolean? = null
)

@JsonClass(generateAdapter = true)
data class StampCard(
    val id: Int? = null,
    val customer_id: Int? = null,
    val stamps_collected: Int = 0,
    val stamps_required: Int = 10,
    val completed: Boolean = false,
    val redeemed: Boolean = false,
    val created_at: String? = null
)

@JsonClass(generateAdapter = true)
data class CreateCustomerRequest(
    val phone: String,
    val name: String,
    val sms_opt_in: Boolean = true
)

@JsonClass(generateAdapter = true)
data class AddStampRequest(
    val order_id: Int
)
