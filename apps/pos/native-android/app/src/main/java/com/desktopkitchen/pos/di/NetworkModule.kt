package com.desktopkitchen.pos.di

import com.desktopkitchen.pos.networking.FlexibleBooleanAdapter
import com.desktopkitchen.pos.networking.FlexibleDoubleAdapter
import com.desktopkitchen.pos.networking.FlexibleIntAdapter
import com.desktopkitchen.pos.networking.HeaderInterceptor
import com.desktopkitchen.pos.networking.api.AuthApi
import com.desktopkitchen.pos.networking.api.BrandingApi
import com.desktopkitchen.pos.networking.api.MenuApi
import com.desktopkitchen.pos.networking.api.AiApi
import com.desktopkitchen.pos.networking.api.DeliveryApi
import com.desktopkitchen.pos.networking.api.GetnetApi
import com.desktopkitchen.pos.networking.api.LoyaltyApi
import com.desktopkitchen.pos.networking.api.ModifierApi
import com.desktopkitchen.pos.networking.api.OrderApi
import com.desktopkitchen.pos.networking.api.PaymentApi
import com.desktopkitchen.pos.networking.api.ReportApi
import com.squareup.moshi.Moshi
import com.squareup.moshi.kotlin.reflect.KotlinJsonAdapterFactory
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import okhttp3.OkHttpClient
import com.desktopkitchen.pos.BuildConfig
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.moshi.MoshiConverterFactory
import java.util.concurrent.TimeUnit
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object NetworkModule {

    @Provides
    @Singleton
    fun provideMoshi(): Moshi = Moshi.Builder()
        .add(Double::class.java, FlexibleDoubleAdapter())
        .add(Int::class.java, FlexibleIntAdapter())
        .add(Boolean::class.java, FlexibleBooleanAdapter())
        .addLast(KotlinJsonAdapterFactory())
        .build()

    @Provides
    @Singleton
    fun provideOkHttpClient(headerInterceptor: HeaderInterceptor): OkHttpClient {
        val logging = HttpLoggingInterceptor().apply {
            level = if (BuildConfig.DEBUG) HttpLoggingInterceptor.Level.BASIC
                    else HttpLoggingInterceptor.Level.NONE
        }
        return OkHttpClient.Builder()
            .addInterceptor(headerInterceptor)
            .addInterceptor(logging)
            .connectTimeout(15, TimeUnit.SECONDS)
            .readTimeout(15, TimeUnit.SECONDS)
            .build()
    }

    @Provides
    @Singleton
    fun provideRetrofit(client: OkHttpClient, moshi: Moshi): Retrofit =
        Retrofit.Builder()
            // Placeholder — HeaderInterceptor rewrites the host dynamically
            // from ServerConfig so URL changes apply without app restart.
            .baseUrl("https://placeholder.desktop.kitchen/")
            .client(client)
            .addConverterFactory(MoshiConverterFactory.create(moshi))
            .build()

    @Provides @Singleton
    fun provideAuthApi(retrofit: Retrofit): AuthApi = retrofit.create(AuthApi::class.java)

    @Provides @Singleton
    fun provideMenuApi(retrofit: Retrofit): MenuApi = retrofit.create(MenuApi::class.java)

    @Provides @Singleton
    fun provideOrderApi(retrofit: Retrofit): OrderApi = retrofit.create(OrderApi::class.java)

    @Provides @Singleton
    fun providePaymentApi(retrofit: Retrofit): PaymentApi = retrofit.create(PaymentApi::class.java)

    @Provides @Singleton
    fun provideReportApi(retrofit: Retrofit): ReportApi = retrofit.create(ReportApi::class.java)

    @Provides @Singleton
    fun provideBrandingApi(retrofit: Retrofit): BrandingApi = retrofit.create(BrandingApi::class.java)

    @Provides @Singleton
    fun provideModifierApi(retrofit: Retrofit): ModifierApi = retrofit.create(ModifierApi::class.java)

    @Provides @Singleton
    fun provideLoyaltyApi(retrofit: Retrofit): LoyaltyApi = retrofit.create(LoyaltyApi::class.java)

    @Provides @Singleton
    fun provideGetnetApi(retrofit: Retrofit): GetnetApi = retrofit.create(GetnetApi::class.java)

    @Provides @Singleton
    fun provideAiApi(retrofit: Retrofit): AiApi = retrofit.create(AiApi::class.java)

    @Provides @Singleton
    fun provideDeliveryApi(retrofit: Retrofit): DeliveryApi = retrofit.create(DeliveryApi::class.java)
}
