package com.dairysnap.app.domain.usecase

import com.dairysnap.app.data.local.entity.DiaryEntry
import com.dairysnap.app.data.repository.DiaryRepository
import java.util.Date
import javax.inject.Inject

class SaveEntryUseCase @Inject constructor(
    private val repository: DiaryRepository
) {
    suspend operator fun invoke(entry: DiaryEntry): Result<Long> {
        val updatedEntry = entry.copy(
            updatedAt = Date(),
            wordCount = entry.content.split("\\s+".toRegex()).filter { it.isNotEmpty() }.size
        )
        return repository.insertEntry(updatedEntry)
    }
}
