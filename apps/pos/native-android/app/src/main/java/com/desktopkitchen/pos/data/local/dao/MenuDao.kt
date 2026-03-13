package com.desktopkitchen.pos.data.local.dao

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import com.desktopkitchen.pos.data.local.entities.CachedCategory
import com.desktopkitchen.pos.data.local.entities.CachedCategoryRole
import com.desktopkitchen.pos.data.local.entities.CachedMenuItem

@Dao
interface MenuDao {
    @Query("SELECT * FROM cached_categories WHERE active = 1 ORDER BY sort_order")
    suspend fun getCategories(): List<CachedCategory>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertCategories(categories: List<CachedCategory>)

    @Query("DELETE FROM cached_categories")
    suspend fun clearCategories()

    @Query("SELECT * FROM cached_menu_items WHERE active = 1 ORDER BY name")
    suspend fun getMenuItems(): List<CachedMenuItem>

    @Query("SELECT * FROM cached_menu_items WHERE category_id = :categoryId AND active = 1 ORDER BY name")
    suspend fun getMenuItemsByCategory(categoryId: Int): List<CachedMenuItem>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertMenuItems(items: List<CachedMenuItem>)

    @Query("DELETE FROM cached_menu_items")
    suspend fun clearMenuItems()

    // Category roles for AI suggestions
    @Query("SELECT * FROM cached_category_roles")
    suspend fun getCategoryRoles(): List<CachedCategoryRole>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertCategoryRoles(roles: List<CachedCategoryRole>)

    @Query("DELETE FROM cached_category_roles")
    suspend fun clearCategoryRoles()
}
