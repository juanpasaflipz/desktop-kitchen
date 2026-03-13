package com.desktopkitchen.pos.data.local.entities

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "cached_menu_items")
data class CachedMenuItem(
    @PrimaryKey val id: Int,
    val category_id: Int,
    val name: String,
    val price: Double,
    val description: String? = null,
    val image_url: String? = null,
    val active: Boolean = true,
    val cachedAt: Long = System.currentTimeMillis()
)
