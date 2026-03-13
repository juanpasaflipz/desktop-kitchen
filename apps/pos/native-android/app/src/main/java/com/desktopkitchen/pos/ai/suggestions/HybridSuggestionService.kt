package com.desktopkitchen.pos.ai.suggestions

import android.util.Log
import com.desktopkitchen.pos.models.CartItem
import com.desktopkitchen.pos.models.MenuCategory
import com.desktopkitchen.pos.models.MenuItem
import com.desktopkitchen.pos.networking.api.AiApi
import com.desktopkitchen.pos.services.NetworkMonitor
import java.util.Calendar
import javax.inject.Inject
import javax.inject.Singleton

/**
 * Hybrid suggestion router.
 *
 * | Condition                  | Source               | Latency       |
 * |----------------------------|----------------------|---------------|
 * | Online + model loaded      | Server (richer data) | ~200ms        |
 * | Online + no model          | Server               | ~200ms        |
 * | Offline + model loaded     | Local (heuristic+LLM)| ~1-2s for LLM|
 * | Offline + no model         | Heuristic only       | <10ms         |
 */
@Singleton
class HybridSuggestionService @Inject constructor(
    private val localService: LocalSuggestionService,
    private val aiApi: AiApi,
    private val networkMonitor: NetworkMonitor
) {
    companion object {
        private const val TAG = "HybridSuggestionService"
    }

    suspend fun getSuggestions(
        cart: List<CartItem>,
        allItems: List<MenuItem>,
        categories: List<MenuCategory>,
        categoryRoles: Map<Int, String>
    ): List<AiSuggestion> {
        if (cart.isEmpty()) return emptyList()

        val isOnline = networkMonitor.isConnected.value

        if (isOnline) {
            try {
                val serverResults = getServerSuggestions(cart)
                if (serverResults.isNotEmpty()) return serverResults
                // Server returned empty → fall through to local heuristics
                Log.d(TAG, "Server returned empty suggestions, using local heuristics")
            } catch (e: Exception) {
                Log.w(TAG, "Server suggestions failed, falling back to local", e)
            }
        }

        // Offline, server empty, or server failed → use local
        return localService.getSuggestions(cart, allItems, categories, categoryRoles)
    }

    private suspend fun getServerSuggestions(cart: List<CartItem>): List<AiSuggestion> {
        val itemIds = cart.map { it.menuItemId }.distinct().joinToString(",")
        val hour = Calendar.getInstance().get(Calendar.HOUR_OF_DAY)
        val serverSuggestions = aiApi.getCartSuggestions(itemIds, hour)

        // Server returns a different format — map to our AiSuggestion
        return serverSuggestions
            .take(2)
            .map { it.copy(source = "server") }
    }
}
