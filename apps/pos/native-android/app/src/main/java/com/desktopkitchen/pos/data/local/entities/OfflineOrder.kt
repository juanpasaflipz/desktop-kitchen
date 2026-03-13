package com.desktopkitchen.pos.data.local.entities

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "offline_orders")
data class OfflineOrder(
    @PrimaryKey(autoGenerate = true) val localId: Int = 0,
    val tempOrderNumber: String,
    val employeeId: Int,
    val itemsJson: String, // JSON array of CreateOrderItem
    val total: Double,
    val tip: Double = 0.0,
    val discountType: String? = null,
    val discountValue: Double? = null,
    val discountReason: String? = null,
    val customerId: Int? = null,
    val synced: Boolean = false,
    val syncedOrderId: Int? = null,
    val createdAt: Long = System.currentTimeMillis()
)
