package com.desktopkitchen.pos.services

import com.desktopkitchen.pos.networking.api.GetnetApi
import com.desktopkitchen.pos.networking.api.GetnetTapChargeRequest
import com.desktopkitchen.pos.networking.api.GetnetTapChargeResponse
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class GetnetService @Inject constructor(
    private val getnetApi: GetnetApi
) {
    suspend fun isEnabled(): Boolean =
        try {
            val status = getnetApi.getStatus()
            status.configured && status.enabled
        } catch (_: Exception) {
            false
        }

    suspend fun isTapEnabled(): Boolean =
        try {
            val status = getnetApi.getStatus()
            status.configured && status.enabled && status.tapOnPhoneEnabled
        } catch (_: Exception) {
            false
        }

    suspend fun tapCharge(
        orderId: Int,
        paymentId: String,
        authCode: String? = null,
        cardBrand: String? = null,
        cardLastFour: String? = null,
        tip: Double = 0.0
    ): GetnetTapChargeResponse =
        getnetApi.tapCharge(
            GetnetTapChargeRequest(
                order_id = orderId,
                getnet_payment_id = paymentId,
                authorization_code = authCode,
                card_brand = cardBrand,
                card_last_four = cardLastFour,
                tip = tip
            )
        )
}
