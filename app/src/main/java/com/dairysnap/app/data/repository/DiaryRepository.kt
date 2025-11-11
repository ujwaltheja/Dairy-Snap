package com.dairysnap.app.data.repository

import com.dairysnap.app.data.local.dao.DiaryEntryDao
import com.dairysnap.app.data.local.entity.DiaryEntry
import com.dairysnap.app.data.local.entity.Mood
import kotlinx.coroutines.flow.Flow
import java.util.Date
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class DiaryRepository @Inject constructor(
    private val diaryEntryDao: DiaryEntryDao
) {

    fun getAllEntries(): Flow<List<DiaryEntry>> = diaryEntryDao.getAllEntries()

    fun getRecentEntries(limit: Int = 10): Flow<List<DiaryEntry>> =
        diaryEntryDao.getRecentEntries(limit)

    suspend fun getEntryById(entryId: String): DiaryEntry? =
        diaryEntryDao.getEntryById(entryId)

    fun getEntryByIdFlow(entryId: String): Flow<DiaryEntry?> =
        diaryEntryDao.getEntryByIdFlow(entryId)

    fun getFavoriteEntries(): Flow<List<DiaryEntry>> =
        diaryEntryDao.getFavoriteEntries()

    fun getEntriesByDateRange(startDate: Date, endDate: Date): Flow<List<DiaryEntry>> =
        diaryEntryDao.getEntriesByDateRange(startDate, endDate)

    fun getEntriesByMood(mood: Mood): Flow<List<DiaryEntry>> =
        diaryEntryDao.getEntriesByMood(mood)

    fun searchEntries(query: String): Flow<List<DiaryEntry>> =
        diaryEntryDao.searchEntries(query)

    fun getEntriesByLanguage(languageCode: String): Flow<List<DiaryEntry>> =
        diaryEntryDao.getEntriesByLanguage(languageCode)

    fun getEntryCount(): Flow<Int> =
        diaryEntryDao.getEntryCount()

    suspend fun getEntryCountSince(date: Date): Int =
        diaryEntryDao.getEntryCountSince(date)

    suspend fun insertEntry(entry: DiaryEntry): Result<Long> = runCatching {
        diaryEntryDao.insertEntry(entry)
    }

    suspend fun updateEntry(entry: DiaryEntry): Result<Unit> = runCatching {
        diaryEntryDao.updateEntry(entry)
    }

    suspend fun deleteEntry(entry: DiaryEntry): Result<Unit> = runCatching {
        diaryEntryDao.deleteEntry(entry)
    }

    suspend fun deleteEntryById(entryId: String): Result<Unit> = runCatching {
        diaryEntryDao.deleteEntryById(entryId)
    }

    suspend fun toggleFavorite(entryId: String, isFavorite: Boolean): Result<Unit> = runCatching {
        diaryEntryDao.toggleFavorite(entryId, isFavorite)
    }

    suspend fun updateSyncStatus(entryId: String, synced: Boolean, cloudId: String?): Result<Unit> = runCatching {
        diaryEntryDao.updateSyncStatus(entryId, synced, cloudId)
    }
}
