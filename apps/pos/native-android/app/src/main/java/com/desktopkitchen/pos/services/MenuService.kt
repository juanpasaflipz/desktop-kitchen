package com.desktopkitchen.pos.services

import android.util.Log
import com.desktopkitchen.pos.data.local.dao.MenuDao
import com.desktopkitchen.pos.data.local.entities.CachedCategory
import com.desktopkitchen.pos.data.local.entities.CachedCategoryRole
import com.desktopkitchen.pos.data.local.entities.CachedMenuItem
import com.desktopkitchen.pos.models.MenuCategory
import com.desktopkitchen.pos.models.MenuItem
import com.desktopkitchen.pos.networking.api.AiApi
import com.desktopkitchen.pos.networking.api.MenuApi
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class MenuService @Inject constructor(
    private val menuApi: MenuApi,
    private val menuDao: MenuDao,
    private val aiApi: AiApi
) {
    suspend fun getCategories(): List<MenuCategory> {
        return try {
            val categories = menuApi.getCategories()
            // Cache for offline use
            menuDao.clearCategories()
            menuDao.insertCategories(categories.map {
                CachedCategory(id = it.id, name = it.name, sort_order = it.sort_order, active = it.active)
            })
            categories
        } catch (e: Exception) {
            // Fallback to cache
            val cached = menuDao.getCategories()
            if (cached.isNotEmpty()) {
                cached.map { MenuCategory(id = it.id, name = it.name, sort_order = it.sort_order, active = it.active) }
            } else {
                throw e
            }
        }
    }

    /**
     * Sync category roles from server for AI suggestions.
     * Normalizes server role names (primary/complement/staple) to heuristic names
     * (main/side/drink/dessert/combo) using category_name as a hint.
     * Non-blocking — failures are silently ignored (roles are optional).
     */
    suspend fun syncCategoryRoles() {
        try {
            val roles = aiApi.getCategoryRoles()
            menuDao.clearCategoryRoles()
            menuDao.insertCategoryRoles(roles.map {
                CachedCategoryRole(
                    categoryId = it.category_id,
                    role = normalizeRole(it.role, it.category_name)
                )
            })
        } catch (e: Exception) {
            Log.w("MenuService", "Failed to sync category roles: ${e.message}")
        }
    }

    /**
     * Map server roles + category names to the heuristic role names:
     * main, drink, side, dessert, combo.
     */
    private fun normalizeRole(serverRole: String, categoryName: String?): String {
        // If server already uses heuristic names, pass through
        val known = setOf("main", "drink", "side", "dessert", "combo")
        if (serverRole in known) return serverRole

        // Infer from category name
        val name = categoryName?.lowercase() ?: ""
        return when {
            name.contains("drink") || name.contains("beverage") || name.contains("bebida") -> "drink"
            name.contains("dessert") || name.contains("postre") || name.contains("sweet") -> "dessert"
            name.contains("side") || name.contains("acompañ") || name.contains("guarnicion") -> "side"
            name.contains("combo") || name.contains("pack") || name.contains("family") -> "combo"
            serverRole == "primary" -> "main"
            serverRole == "staple" -> "drink" // staples are typically drinks in MX restaurants
            serverRole == "complement" -> "side" // default complement to side
            else -> serverRole
        }
    }

    /**
     * Get cached category roles as a map (categoryId → role).
     */
    suspend fun getCategoryRolesMap(): Map<Int, String> {
        return menuDao.getCategoryRoles().associate { it.categoryId to it.role }
    }

    suspend fun getMenuItems(categoryId: Int? = null): List<MenuItem> {
        return try {
            val items = menuApi.getItems(categoryId)
            // Cache for offline use
            menuDao.clearMenuItems()
            menuDao.insertMenuItems(items.map {
                CachedMenuItem(
                    id = it.id, category_id = it.category_id, name = it.name,
                    price = it.price, description = it.description,
                    image_url = it.image_url, active = it.active
                )
            })
            items
        } catch (e: Exception) {
            // Fallback to cache
            val cached = if (categoryId != null) {
                menuDao.getMenuItemsByCategory(categoryId)
            } else {
                menuDao.getMenuItems()
            }
            if (cached.isNotEmpty()) {
                cached.map {
                    MenuItem(
                        id = it.id, category_id = it.category_id, name = it.name,
                        price = it.price, description = it.description,
                        image_url = it.image_url, active = it.active
                    )
                }
            } else {
                throw e
            }
        }
    }
}
