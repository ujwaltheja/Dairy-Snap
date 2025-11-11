package com.dairysnap.app.domain.usecase

import com.dairysnap.app.data.local.entity.DiaryEntry
import com.dairysnap.app.data.local.entity.Mood
import com.dairysnap.app.data.repository.DiaryRepository
import kotlinx.coroutines.flow.Flow
import java.util.Date
import javax.inject.Inject

class SearchEntriesUseCase @Inject constructor(
    private val repository: DiaryRepository
) {
    fun searchByText(query: String): Flow<List<DiaryEntry>> {
        return repository.searchEntries(query)
    }

    fun filterByMood(mood: Mood): Flow<List<DiaryEntry>> {
        return repository.getEntriesByMood(mood)
    }

    fun filterByDateRange(startDate: Date, endDate: Date): Flow<List<DiaryEntry>> {
        return repository.getEntriesByDateRange(startDate, endDate)
    }
}
