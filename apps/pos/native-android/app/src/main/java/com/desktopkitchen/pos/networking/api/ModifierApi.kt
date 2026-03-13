package com.desktopkitchen.pos.networking.api

import com.desktopkitchen.pos.models.ModifierGroup
import com.squareup.moshi.JsonClass
import retrofit2.http.GET
import retrofit2.http.Path

@JsonClass(generateAdapter = true)
data class ItemsWithModifiersResponse(
    val itemIds: List<Int>
)

interface ModifierApi {
    @GET("api/modifiers/groups/item/{menuItemId}")
    suspend fun getGroupsForItem(@Path("menuItemId") menuItemId: Int): List<ModifierGroup>

    @GET("api/modifiers/items-with-modifiers")
    suspend fun getItemsWithModifiers(): ItemsWithModifiersResponse
}
