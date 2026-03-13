package com.desktopkitchen.pos.networking.api

import com.desktopkitchen.pos.ai.suggestions.AiSuggestion
import com.squareup.moshi.JsonClass
import retrofit2.http.GET
import retrofit2.http.Query

@JsonClass(generateAdapter = true)
data class CategoryRoleResponse(
    val category_id: Int,
    val role: String,
    val category_name: String? = null
)

interface AiApi {
    @GET("/api/ai/suggestions/cart")
    suspend fun getCartSuggestions(
        @Query("items") items: String,
        @Query("hour") hour: Int
    ): List<AiSuggestion>

    @GET("/api/ai/category-roles")
    suspend fun getCategoryRoles(): List<CategoryRoleResponse>
}
