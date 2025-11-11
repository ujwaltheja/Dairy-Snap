package com.dairysnap.app.data.local.dao

import androidx.room.*
import com.dairysnap.app.data.local.entity.DiaryEntry
import com.dairysnap.app.data.local.entity.Mood
import kotlinx.coroutines.flow.Flow
import java.util.Date

@Dao
interface DiaryEntryDao {

    @Query("SELECT * FROM diary_entries ORDER BY createdAt DESC")
    fun getAllEntries(): Flow<List<DiaryEntry>>

    @Query("SELECT * FROM diary_entries WHERE id = :entryId")
    suspend fun getEntryById(entryId: String): DiaryEntry?

    @Query("SELECT * FROM diary_entries WHERE id = :entryId")
    fun getEntryByIdFlow(entryId: String): Flow<DiaryEntry?>

    @Query("SELECT * FROM diary_entries ORDER BY createdAt DESC LIMIT :limit")
    fun getRecentEntries(limit: Int = 10): Flow<List<DiaryEntry>>

    @Query("SELECT * FROM diary_entries WHERE isFavorite = 1 ORDER BY createdAt DESC")
    fun getFavoriteEntries(): Flow<List<DiaryEntry>>

    @Query("""
        SELECT * FROM diary_entries
        WHERE createdAt >= :startDate AND createdAt <= :endDate
        ORDER BY createdAt DESC
    """)
    fun getEntriesByDateRange(startDate: Date, endDate: Date): Flow<List<DiaryEntry>>

    @Query("""
        SELECT * FROM diary_entries
        WHERE mood = :mood
        ORDER BY createdAt DESC
    """)
    fun getEntriesByMood(mood: Mood): Flow<List<DiaryEntry>>

    @Query("""
        SELECT * FROM diary_entries
        WHERE content LIKE '%' || :query || '%'
        OR title LIKE '%' || :query || '%'
        ORDER BY createdAt DESC
    """)
    fun searchEntries(query: String): Flow<List<DiaryEntry>>

    @Query("""
        SELECT * FROM diary_entries
        WHERE language = :languageCode
        ORDER BY createdAt DESC
    """)
    fun getEntriesByLanguage(languageCode: String): Flow<List<DiaryEntry>>

    @Query("SELECT COUNT(*) FROM diary_entries")
    fun getEntryCount(): Flow<Int>

    @Query("SELECT COUNT(*) FROM diary_entries WHERE createdAt >= :date")
    suspend fun getEntryCountSince(date: Date): Int

    @Query("""
        SELECT DATE(createdAt / 1000, 'unixepoch') as date, COUNT(*) as count
        FROM diary_entries
        GROUP BY date
        ORDER BY date DESC
    """)
    fun getEntriesCountByDate(): Flow<Map<String, Int>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertEntry(entry: DiaryEntry): Long

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertEntries(entries: List<DiaryEntry>)

    @Update
    suspend fun updateEntry(entry: DiaryEntry)

    @Delete
    suspend fun deleteEntry(entry: DiaryEntry)

    @Query("DELETE FROM diary_entries WHERE id = :entryId")
    suspend fun deleteEntryById(entryId: String)

    @Query("DELETE FROM diary_entries")
    suspend fun deleteAllEntries()

    @Query("UPDATE diary_entries SET isFavorite = :isFavorite WHERE id = :entryId")
    suspend fun toggleFavorite(entryId: String, isFavorite: Boolean)

    @Query("UPDATE diary_entries SET cloudSynced = :synced, cloudId = :cloudId WHERE id = :entryId")
    suspend fun updateSyncStatus(entryId: String, synced: Boolean, cloudId: String?)
}
