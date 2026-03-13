package com.desktopkitchen.pos.ai.suggestions

import android.util.Log
import com.desktopkitchen.pos.ai.inference.PromptBuilder
import com.desktopkitchen.pos.ai.model.LlamaModel
import com.desktopkitchen.pos.ai.model.ModelState
import com.desktopkitchen.pos.models.CartItem
import com.desktopkitchen.pos.models.MenuCategory
import com.desktopkitchen.pos.models.MenuItem
import com.squareup.moshi.Moshi
import com.squareup.moshi.Types
import javax.inject.Inject
import javax.inject.Singleton

/**
 * On-device suggestion service: heuristics (instant) + optional LLM natural language enhancement.
 *
 * Flow:
 * 1. Heuristic engine runs immediately and returns rule-based suggestions (<10ms)
 * 2. If LLM is loaded, generates a prompt and asks the model for Spanish natural language messages
 * 3. Validates LLM output; falls back to heuristic messages if JSON is malformed
 */
@Singleton
class LocalSuggestionService @Inject constructor(
    private val heuristicEngine: HeuristicSuggestionEngine,
    private val llamaModel: LlamaModel,
    private val moshi: Moshi
) {
    companion object {
        private const val TAG = "LocalSuggestionService"
        private const val MAX_MALFORMED_COUNT = 5
        private const val MALFORMED_RESET_INTERVAL_MS = 300_000L // 5 minutes
    }

    private var malformedCount = 0
    private var lastMalformedReset = System.currentTimeMillis()

    /**
     * Get suggestions for the current cart.
     * Always returns heuristic results first; optionally enhanced by LLM.
     */
    suspend fun getSuggestions(
        cart: List<CartItem>,
        allItems: List<MenuItem>,
        categories: List<MenuCategory>,
        categoryRoles: Map<Int, String>
    ): List<AiSuggestion> {
        // Step 1: Instant heuristic suggestions
        val heuristicSuggestions = heuristicEngine.suggest(cart, allItems, categoryRoles)

        if (heuristicSuggestions.isEmpty()) return emptyList()

        // Step 2: Try LLM enhancement if model is loaded and quality is acceptable
        if (llamaModel.state.value is ModelState.Loaded && !isLlmDisabled()) {
            try {
                val enhanced = enhanceWithLlm(cart, allItems, categories, heuristicSuggestions)
                if (enhanced != null) return enhanced
            } catch (e: Exception) {
                Log.w(TAG, "LLM enhancement failed, using heuristic results", e)
            }
        }

        return heuristicSuggestions
    }

    private suspend fun enhanceWithLlm(
        cart: List<CartItem>,
        allItems: List<MenuItem>,
        categories: List<MenuCategory>,
        heuristicSuggestions: List<AiSuggestion>
    ): List<AiSuggestion>? {
        val prompt = PromptBuilder.buildCartUpsellPrompt(cart, allItems, categories)

        // Safety: don't send if prompt exceeds token budget
        if (PromptBuilder.estimateTokens(prompt) > 1800) {
            Log.w(TAG, "Prompt too large for context window, skipping LLM")
            return null
        }

        val result = llamaModel.generate(prompt, maxTokens = 256, temperature = 0.3f)
        val output = result.getOrNull() ?: return null

        return parseLlmOutput(output, allItems, heuristicSuggestions)
    }

    /**
     * Parse and validate LLM JSON output.
     * Every item_id must exist in the menu. Falls back to null on malformed output.
     */
    private fun parseLlmOutput(
        raw: String,
        allItems: List<MenuItem>,
        fallback: List<AiSuggestion>
    ): List<AiSuggestion>? {
        try {
            // Extract JSON array from output (LLM may include extra text)
            val jsonStart = raw.indexOf('[')
            val jsonEnd = raw.lastIndexOf(']')
            if (jsonStart < 0 || jsonEnd < 0 || jsonEnd <= jsonStart) {
                recordMalformed()
                return null
            }
            val jsonStr = raw.substring(jsonStart, jsonEnd + 1)

            val listType = Types.newParameterizedType(List::class.java, AiSuggestion::class.java)
            val adapter = moshi.adapter<List<AiSuggestion>>(listType)
            val parsed = adapter.fromJson(jsonStr) ?: run {
                recordMalformed()
                return null
            }

            val validItemIds = allItems.map { it.id }.toSet()
            val validated = parsed.filter { it.item_id in validItemIds }

            if (validated.isEmpty()) {
                recordMalformed()
                return null
            }

            // Mark as LLM-sourced
            return validated
                .take(2)
                .map { it.copy(source = "llm") }
        } catch (e: Exception) {
            Log.w(TAG, "Failed to parse LLM output: ${e.message}")
            recordMalformed()
            return null
        }
    }

    private fun recordMalformed() {
        val now = System.currentTimeMillis()
        if (now - lastMalformedReset > MALFORMED_RESET_INTERVAL_MS) {
            malformedCount = 0
            lastMalformedReset = now
        }
        malformedCount++
        if (malformedCount >= MAX_MALFORMED_COUNT) {
            Log.w(TAG, "LLM disabled due to >$MAX_MALFORMED_COUNT malformed outputs in window")
        }
    }

    private fun isLlmDisabled(): Boolean {
        val now = System.currentTimeMillis()
        if (now - lastMalformedReset > MALFORMED_RESET_INTERVAL_MS) {
            malformedCount = 0
            lastMalformedReset = now
        }
        return malformedCount >= MAX_MALFORMED_COUNT
    }
}
