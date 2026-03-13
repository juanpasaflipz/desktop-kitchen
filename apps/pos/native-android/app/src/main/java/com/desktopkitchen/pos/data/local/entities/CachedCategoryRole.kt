package com.desktopkitchen.pos.data.local.entities

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "cached_category_roles")
data class CachedCategoryRole(
    @PrimaryKey val categoryId: Int,
    val role: String, // "main", "drink", "side", "combo", "dessert", "unknown"
    val cachedAt: Long = System.currentTimeMillis()
)
