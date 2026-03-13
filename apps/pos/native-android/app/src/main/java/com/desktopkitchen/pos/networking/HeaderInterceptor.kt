package com.desktopkitchen.pos.networking

import com.desktopkitchen.pos.configuration.ServerConfig
import okhttp3.HttpUrl.Companion.toHttpUrlOrNull
import okhttp3.Interceptor
import okhttp3.Response
import javax.inject.Inject

class HeaderInterceptor @Inject constructor(
    private val serverConfig: ServerConfig
) : Interceptor {
    override fun intercept(chain: Interceptor.Chain): Response {
        var request = chain.request()

        // Rewrite base URL dynamically so changes in Server Settings
        // take effect immediately without restarting the app.
        val configuredUrl = serverConfig.baseURL
        if (configuredUrl.isNotEmpty()) {
            val target = configuredUrl.trimEnd('/').toHttpUrlOrNull()
            if (target != null) {
                val newUrl = request.url.newBuilder()
                    .scheme(target.scheme)
                    .host(target.host)
                    .port(target.port)
                    .build()
                request = request.newBuilder().url(newUrl).build()
            }
        }

        // Don't add Content-Type manually — Retrofit's MoshiConverterFactory
        // already sets it. Duplicate headers can cause 400 from proxies.
        val builder = request.newBuilder()

        // Only send tenant header when admin secret is also provided
        // (required by backend in production). Otherwise, let the backend
        // resolve tenant from the subdomain in the server URL.
        val tenantId = serverConfig.tenantID
        val secret = serverConfig.adminSecret
        if (tenantId.isNotEmpty() && secret.isNotEmpty()) {
            builder.addHeader("X-Tenant-ID", tenantId)
            builder.addHeader("X-Admin-Secret", secret)
        }

        AuthTokenStore.token?.let { token ->
            builder.addHeader("Authorization", "Bearer $token")
        }

        return chain.proceed(builder.build())
    }
}
