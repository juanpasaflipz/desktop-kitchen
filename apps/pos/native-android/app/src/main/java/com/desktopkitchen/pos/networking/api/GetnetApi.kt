package com.desktopkitchen.pos.networking.api

import com.squareup.moshi.JsonClass
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST

@JsonClass(generateAdapter = true)
data class GetnetStatusResponse(
    val configured: Boolean = false,
    val enabled: Boolean = false,
    val tapOnPhoneEnabled: Boolean = false,
    val environment: String? = null
)

@JsonClass(generateAdapter = true)
data class GetnetTapChargeRequest(
    val order_id: Int,
    val getnet_payment_id: String,
    val authorization_code: String? = null,
    val card_brand: String? = null,
    val card_last_four: String? = null,
    val tip: Double = 0.0
)

@JsonClass(generateAdapter = true)
data class GetnetTapChargeResponse(
    val success: Boolean = false,
    val payment_status: String? = null,
    val getnet_payment_id: String? = null
)

interface GetnetApi {
    @GET("api/getnet/status")
    suspend fun getStatus(): GetnetStatusResponse

    @POST("api/getnet/tap-charge")
    suspend fun tapCharge(@Body request: GetnetTapChargeRequest): GetnetTapChargeResponse
}
