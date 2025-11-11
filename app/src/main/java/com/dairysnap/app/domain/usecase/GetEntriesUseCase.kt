package com.dairysnap.app.domain.usecase

import com.dairysnap.app.data.local.entity.DiaryEntry
import com.dairysnap.app.data.repository.DiaryRepository
import kotlinx.coroutines.flow.Flow
import javax.inject.Inject

class GetEntriesUseCase @Inject constructor(
    private val repository: DiaryRepository
) {
    operator fun invoke(): Flow<List<DiaryEntry>> {
        return repository.getAllEntries()
    }

    fun getRecent(limit: Int = 10): Flow<List<DiaryEntry>> {
        return repository.getRecentEntries(limit)
    }
}
