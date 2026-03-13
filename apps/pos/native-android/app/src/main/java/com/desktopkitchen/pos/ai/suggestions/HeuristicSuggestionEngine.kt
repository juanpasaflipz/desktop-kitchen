package com.desktopkitchen.pos.ai.suggestions

import com.desktopkitchen.pos.models.CartItem
import com.desktopkitchen.pos.models.MenuItem
import java.util.Calendar
import javax.inject.Inject
import javax.inject.Singleton

/**
 * Pure Kotlin port of server's upsell.js heuristic rules.
 * Runs instantly (<10ms) with no LLM dependency — uses cached menu data + category roles.
 *
 * Rules:
 * 1. Cart has main but no drink → suggest cheapest drink
 * 2. Cart has main but no side → suggest cheapest side
 * 3. Cart items cost more than a combo → suggest combo upgrade with savings
 * 4. 1-2 tacos in cart → suggest 3-pack
 * 5. Cart > $400 MXN, no dessert → suggest dessert
 * 6. Slow period + large order → suggest family pack
 */
@Singleton
class HeuristicSuggestionEngine @Inject constructor() {
    companion object {
        private val RUSH_HOURS = setOf(12, 13, 14, 19, 20, 21)
        private val SLOW_HOURS = setOf(15, 16, 17, 10, 11)
        private const val LARGE_ORDER_THRESHOLD = 400.0
    }

    /**
     * Generate instant upsell suggestions from cart + cached menu data.
     * Returns max 2 suggestions sorted by priority descending.
     */
    suspend fun suggest(
        cart: List<CartItem>,
        allItems: List<MenuItem>,
        categoryRoles: Map<Int, String>,
        currentHour: Int = Calendar.getInstance().get(Calendar.HOUR_OF_DAY)
    ): List<AiSuggestion> {
        if (cart.isEmpty() || allItems.isEmpty()) return emptyList()

        val suggestions = mutableListOf<AiSuggestion>()
        val cartItemIds = cart.map { it.menuItemId }.toSet()
        val cartTotal = cart.sumOf { it.lineTotal }

        // Resolve roles for cart items
        val cartRoles = cart.mapNotNull { cartItem ->
            val item = allItems.find { it.id == cartItem.menuItemId }
            item?.let { categoryRoles[it.category_id] }
        }

        val hasMains = cartRoles.contains("main")
        val hasDrink = cartRoles.contains("drink")
        val hasSide = cartRoles.contains("side")
        val hasCombo = cartRoles.contains("combo")
        val hasDessert = cartRoles.contains("dessert")

        // Items by role (not already in cart)
        fun itemsByRole(role: String) = allItems.filter {
            it.active && categoryRoles[it.category_id] == role && it.id !in cartItemIds
        }

        // Rule 1: Main but no drink → suggest cheapest drink
        if (hasMains && !hasDrink) {
            val cheapestDrink = itemsByRole("drink").minByOrNull { it.price }
            if (cheapestDrink != null) {
                suggestions.add(
                    AiSuggestion(
                        item_id = cheapestDrink.id,
                        item_name = cheapestDrink.name,
                        price = cheapestDrink.price,
                        message = "Add a ${cheapestDrink.name}?",
                        rule = "missing_drink",
                        priority = 60
                    )
                )
            }
        }

        // Rule 2: Main but no side → suggest cheapest side
        if (hasMains && !hasSide && !hasCombo) {
            val cheapestSide = itemsByRole("side").minByOrNull { it.price }
            if (cheapestSide != null) {
                suggestions.add(
                    AiSuggestion(
                        item_id = cheapestSide.id,
                        item_name = cheapestSide.name,
                        price = cheapestSide.price,
                        message = "Complete your meal with ${cheapestSide.name}!",
                        rule = "missing_side",
                        priority = 50
                    )
                )
            }
        }

        // Rule 3: Cart items cost more than a combo → suggest combo upgrade
        if (hasMains && !hasCombo) {
            val combos = itemsByRole("combo").sortedBy { it.price }
            for (combo in combos) {
                if (cartTotal > combo.price) {
                    val savings = Math.round((cartTotal - combo.price) * 100.0) / 100.0
                    val priority = if (currentHour in RUSH_HOURS) 85 else 80
                    suggestions.add(
                        AiSuggestion(
                            item_id = combo.id,
                            item_name = combo.name,
                            price = combo.price,
                            message = "Upgrade to ${combo.name} and save ${"$%.0f".format(savings)} MXN!",
                            rule = "combo_upgrade",
                            priority = priority
                        )
                    )
                    break
                }
            }
        }

        // Rule 4: 1-2 tacos → suggest 3-pack
        val tacoItems = cart.filter { cartItem ->
            cartItem.itemName.contains("Taco", ignoreCase = true) &&
                !cartItem.itemName.contains("(3)")
        }
        if (tacoItems.size in 1..2) {
            val tacoPack = allItems.find {
                it.active && it.name.contains("Street Tacos", ignoreCase = true) && it.id !in cartItemIds
            }
            if (tacoPack != null) {
                val currentTacoTotal = tacoItems.sumOf { it.lineTotal }
                if (currentTacoTotal > tacoPack.price * 0.8) {
                    suggestions.add(
                        AiSuggestion(
                            item_id = tacoPack.id,
                            item_name = tacoPack.name,
                            price = tacoPack.price,
                            message = "Get the ${tacoPack.name} for a better deal!",
                            rule = "taco_3pack",
                            priority = 55
                        )
                    )
                }
            }
        }

        // Rule 5: Cart > $400 MXN, no dessert → suggest dessert
        if (cartTotal > LARGE_ORDER_THRESHOLD && !hasDessert) {
            val dessert = itemsByRole("dessert").minByOrNull { it.price }
            if (dessert != null) {
                suggestions.add(
                    AiSuggestion(
                        item_id = dessert.id,
                        item_name = dessert.name,
                        price = dessert.price,
                        message = "Big order! Treat yourself to ${dessert.name} for just ${"$%.0f".format(dessert.price)} MXN",
                        rule = "dessert_upsell",
                        priority = 45
                    )
                )
            }
        }

        // Rule 6: Slow period + large order → suggest family pack
        if (currentHour in SLOW_HOURS && cart.size >= 3 && !hasCombo) {
            val familyPack = allItems.find {
                it.active && it.name.contains("Family Pack", ignoreCase = true) && it.id !in cartItemIds
            }
            if (familyPack != null && cartTotal > familyPack.price * 0.7) {
                suggestions.add(
                    AiSuggestion(
                        item_id = familyPack.id,
                        item_name = familyPack.name,
                        price = familyPack.price,
                        message = "Family Pack special - great value for a group!",
                        rule = "family_pack_slow",
                        priority = 55
                    )
                )
            }
        }

        return suggestions
            .sortedByDescending { it.priority }
            .take(2)
    }

}
