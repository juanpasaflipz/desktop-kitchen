package com.desktopkitchen.pos.ai.inference

import com.desktopkitchen.pos.models.CartItem
import com.desktopkitchen.pos.models.MenuCategory
import com.desktopkitchen.pos.models.MenuItem
import java.util.Calendar

/**
 * Builds compact prompts (~700 tokens for 50-item menu) for on-device LLM upsell suggestions.
 * Output format: JSON array matching [AiSuggestion] structure.
 * Messages in Spanish. Prices in MXN.
 */
object PromptBuilder {

    private const val MAX_MENU_ITEMS = 100

    fun buildCartUpsellPrompt(
        cart: List<CartItem>,
        menuItems: List<MenuItem>,
        categories: List<MenuCategory>,
        currentHour: Int = Calendar.getInstance().get(Calendar.HOUR_OF_DAY)
    ): String {
        val timeContext = when {
            currentHour in 12..14 || currentHour in 19..21 -> "rush"
            currentHour in 15..17 || currentHour in 10..11 -> "slow"
            else -> "normal"
        }

        val catMap = categories.associate { it.id to it.name }

        // Truncate to most popular items for large menus
        val truncatedItems = menuItems
            .filter { it.active }
            .take(MAX_MENU_ITEMS)

        val categorySummary = categories
            .sortedBy { it.sort_order }
            .joinToString(",") { "${it.id}:${it.name}" }

        val menuBlock = truncatedItems.joinToString("\n") { item ->
            "${item.id}|${item.category_id}|${item.name}|${item.price}"
        }

        val cartBlock = cart.joinToString("\n") { item ->
            "${item.menuItemId}:${item.itemName} x${item.quantity} @${"$%.0f".format(item.unitPrice)}"
        }
        val cartTotal = cart.sumOf { it.lineTotal }

        return """<system>
You are a restaurant POS upsell assistant. Given cart and menu, suggest 1-2 complementary items.
Reply ONLY with JSON array. Messages in Spanish. Prices in MXN.
Rules: no drink -> suggest drink, no side -> suggest side, items > combo price -> suggest combo, large order -> suggest dessert.
Output: [{"item_id":INT,"item_name":"STR","price":NUM,"message":"STR","rule":"STR","priority":INT}]
</system>

<menu>
Categories: $categorySummary
$menuBlock
</menu>

<cart>
$cartBlock
Total: ${"$%.0f".format(cartTotal)} MXN
</cart>

<context>Hour: $currentHour ($timeContext)</context>"""
    }

    /**
     * Estimate token count (rough: ~4 chars per token for Spanish/English mix).
     */
    fun estimateTokens(prompt: String): Int = prompt.length / 4
}
