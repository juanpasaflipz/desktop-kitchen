package com.desktopkitchen.pos.services

import com.desktopkitchen.pos.models.CashPaymentRequest
import com.desktopkitchen.pos.models.ConfirmPaymentRequest
import com.desktopkitchen.pos.models.CreatePaymentIntentRequest
import com.desktopkitchen.pos.models.PaymentIntent
import com.desktopkitchen.pos.models.PaymentSplit
import com.desktopkitchen.pos.models.PaymentStatus
import com.desktopkitchen.pos.models.RefundRecord
import com.desktopkitchen.pos.models.RefundRequest
import com.desktopkitchen.pos.models.RefundResponse
import com.desktopkitchen.pos.models.SplitPaymentRequest
import com.desktopkitchen.pos.models.SplitPaymentResponse
import com.desktopkitchen.pos.networking.api.PaymentApi
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class PaymentService @Inject constructor(
    private val paymentApi: PaymentApi
) {
    suspend fun createIntent(orderId: Int, tip: Double? = null): PaymentIntent =
        paymentApi.createIntent(CreatePaymentIntentRequest(order_id = orderId, tip = tip))

    suspend fun confirm(orderId: Int, paymentIntentId: String) {
        paymentApi.confirm(ConfirmPaymentRequest(order_id = orderId, payment_intent_id = paymentIntentId))
    }

    suspend fun cashPayment(orderId: Int, tip: Double? = null) {
        paymentApi.cashPayment(CashPaymentRequest(order_id = orderId, tip = tip))
    }

    suspend fun splitPayment(orderId: Int, splits: List<PaymentSplit>): SplitPaymentResponse =
        paymentApi.splitPayment(SplitPaymentRequest(order_id = orderId, splits = splits))

    suspend fun refund(orderId: Int, amount: Double? = null, reason: String = ""): RefundResponse =
        paymentApi.refund(RefundRequest(order_id = orderId, amount = amount, reason = reason))

    suspend fun getRefunds(orderId: Int): List<RefundRecord> = paymentApi.getRefunds(orderId)

    suspend fun getStatus(orderId: Int): PaymentStatus = paymentApi.getStatus(orderId)
}
