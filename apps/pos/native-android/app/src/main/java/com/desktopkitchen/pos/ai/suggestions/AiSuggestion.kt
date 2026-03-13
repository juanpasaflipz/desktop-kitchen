package com.desktopkitchen.pos.ai.suggestions

import com.squareup.moshi.JsonClass

/**
 * AI upsell suggestion matching the server format.
 * Used by both heuristic engine and LLM enhancement.
 */
@JsonClass(generateAdapter = true)
data class AiSuggestion(
    val item_id: Int,
    val item_name: String,
    val price: Double,
    val message: String,
    val rule: String,
    val priority: Int,
    val source: String = "local" // "local", "server", "llm"
)
