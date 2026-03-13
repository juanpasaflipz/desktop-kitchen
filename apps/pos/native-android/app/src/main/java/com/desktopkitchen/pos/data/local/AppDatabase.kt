package com.desktopkitchen.pos.data.local

import androidx.room.Database
import androidx.room.RoomDatabase
import com.desktopkitchen.pos.data.local.dao.MenuDao
import com.desktopkitchen.pos.data.local.dao.OfflineOrderDao
import com.desktopkitchen.pos.data.local.entities.CachedCategory
import com.desktopkitchen.pos.data.local.entities.CachedCategoryRole
import com.desktopkitchen.pos.data.local.entities.CachedMenuItem
import com.desktopkitchen.pos.data.local.entities.OfflineOrder

@Database(
    entities = [CachedCategory::class, CachedMenuItem::class, OfflineOrder::class, CachedCategoryRole::class],
    version = 2,
    exportSchema = false
)
abstract class AppDatabase : RoomDatabase() {
    abstract fun menuDao(): MenuDao
    abstract fun offlineOrderDao(): OfflineOrderDao
}
