package com.desktopkitchen.pos.di

import android.content.Context
import androidx.room.Room
import com.desktopkitchen.pos.data.local.AppDatabase
import com.desktopkitchen.pos.data.local.dao.MenuDao
import com.desktopkitchen.pos.data.local.dao.OfflineOrderDao
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object DatabaseModule {

    @Provides
    @Singleton
    fun provideDatabase(@ApplicationContext context: Context): AppDatabase =
        Room.databaseBuilder(
            context,
            AppDatabase::class.java,
            "desktop_kitchen_pos"
        ).fallbackToDestructiveMigration().build()

    @Provides
    fun provideMenuDao(db: AppDatabase): MenuDao = db.menuDao()

    @Provides
    fun provideOfflineOrderDao(db: AppDatabase): OfflineOrderDao = db.offlineOrderDao()
}
