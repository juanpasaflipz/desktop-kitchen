package com.desktopkitchen.pos.data.local.dao

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.Query
import androidx.room.Update
import com.desktopkitchen.pos.data.local.entities.OfflineOrder

@Dao
interface OfflineOrderDao {
    @Insert
    suspend fun insert(order: OfflineOrder): Long

    @Query("SELECT * FROM offline_orders WHERE synced = 0 ORDER BY createdAt")
    suspend fun getPendingOrders(): List<OfflineOrder>

    @Query("SELECT COUNT(*) FROM offline_orders WHERE synced = 0")
    suspend fun getPendingCount(): Int

    @Update
    suspend fun update(order: OfflineOrder)

    @Query("UPDATE offline_orders SET synced = 1, syncedOrderId = :serverId WHERE localId = :localId")
    suspend fun markSynced(localId: Int, serverId: Int)

    @Query("DELETE FROM offline_orders WHERE synced = 1")
    suspend fun clearSynced()
}
