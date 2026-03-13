package com.desktopkitchen.pos.data.local.entities

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "cached_categories")
data class CachedCategory(
    @PrimaryKey val id: Int,
    val name: String,
    val sort_order: Int = 0,
    val active: Boolean = true,
    val cachedAt: Long = System.currentTimeMillis()
)
