package com.dairysnap.app.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.dairysnap.app.data.local.entity.DiaryEntry
import com.dairysnap.app.data.local.entity.Mood
import com.dairysnap.app.domain.speech.SpeechRecognitionManager
import com.dairysnap.app.domain.usecase.GetEntriesUseCase
import com.dairysnap.app.domain.usecase.SaveEntryUseCase
import com.dairysnap.app.domain.usecase.SearchEntriesUseCase
import com.dairysnap.app.data.repository.DiaryRepository
import com.dairysnap.app.data.preferences.UserPreferences
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import java.util.Date
import javax.inject.Inject

@HiltViewModel
class DiaryViewModel @Inject constructor(
    private val getEntriesUseCase: GetEntriesUseCase,
    private val saveEntryUseCase: SaveEntryUseCase,
    private val searchEntriesUseCase: SearchEntriesUseCase,
    private val repository: DiaryRepository,
    private val userPreferences: UserPreferences,
    private val speechRecognitionManager: SpeechRecognitionManager
) : ViewModel() {

    private val _uiState = MutableStateFlow(DiaryUiState())
    val uiState: StateFlow<DiaryUiState> = _uiState.asStateFlow()

    val recentEntries = getEntriesUseCase.getRecent(20)
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val allEntries = getEntriesUseCase()
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val isPremium = userPreferences.isPremium
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), false)

    val voiceLanguage = userPreferences.voiceLanguage
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), "en-IN")

    init {
        loadEntries()
    }

    private fun loadEntries() {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true) }
            // Entries are automatically loaded via Flow
            _uiState.update { it.copy(isLoading = false) }
        }
    }

    fun saveEntry(
        content: String,
        title: String = "",
        mood: Mood? = null,
        tags: List<String> = emptyList(),
        voiceRecorded: Boolean = false,
        language: String = "en"
    ) {
        viewModelScope.launch {
            _uiState.update { it.copy(isSaving = true) }

            val entry = DiaryEntry(
                content = content,
                title = title,
                mood = mood,
                tags = tags,
                createdAt = Date(),
                updatedAt = Date(),
                voiceRecorded = voiceRecorded,
                language = language
            )

            saveEntryUseCase(entry).fold(
                onSuccess = {
                    _uiState.update {
                        it.copy(
                            isSaving = false,
                            saveSuccess = true,
                            errorMessage = null
                        )
                    }
                },
                onFailure = { error ->
                    _uiState.update {
                        it.copy(
                            isSaving = false,
                            saveSuccess = false,
                            errorMessage = error.message
                        )
                    }
                }
            )
        }
    }

    fun updateEntry(entry: DiaryEntry) {
        viewModelScope.launch {
            _uiState.update { it.copy(isSaving = true) }

            repository.updateEntry(entry).fold(
                onSuccess = {
                    _uiState.update {
                        it.copy(
                            isSaving = false,
                            saveSuccess = true,
                            errorMessage = null
                        )
                    }
                },
                onFailure = { error ->
                    _uiState.update {
                        it.copy(
                            isSaving = false,
                            saveSuccess = false,
                            errorMessage = error.message
                        )
                    }
                }
            )
        }
    }

    fun deleteEntry(entryId: String) {
        viewModelScope.launch {
            repository.deleteEntryById(entryId)
        }
    }

    fun toggleFavorite(entryId: String, isFavorite: Boolean) {
        viewModelScope.launch {
            repository.toggleFavorite(entryId, isFavorite)
        }
    }

    fun searchEntries(query: String) {
        viewModelScope.launch {
            searchEntriesUseCase.searchByText(query)
                .collect { results ->
                    _uiState.update { it.copy(searchResults = results) }
                }
        }
    }

    fun filterByMood(mood: Mood) {
        viewModelScope.launch {
            searchEntriesUseCase.filterByMood(mood)
                .collect { results ->
                    _uiState.update { it.copy(searchResults = results) }
                }
        }
    }

    fun startVoiceRecognition(languageCode: String = "en-IN") {
        viewModelScope.launch {
            _uiState.update { it.copy(isListening = true, voiceText = "") }

            speechRecognitionManager.startListening(languageCode)
                .collect { result ->
                    when (result) {
                        is SpeechRecognitionManager.SpeechResult.Success -> {
                            _uiState.update {
                                it.copy(
                                    voiceText = result.text,
                                    isListening = !result.isFinal
                                )
                            }
                        }
                        is SpeechRecognitionManager.SpeechResult.Error -> {
                            _uiState.update {
                                it.copy(
                                    isListening = false,
                                    errorMessage = result.error
                                )
                            }
                        }
                        SpeechRecognitionManager.SpeechResult.Listening -> {
                            _uiState.update { it.copy(isListening = true) }
                        }
                        SpeechRecognitionManager.SpeechResult.EndOfSpeech -> {
                            _uiState.update { it.copy(isListening = false) }
                        }
                        else -> {}
                    }
                }
        }
    }

    fun clearVoiceText() {
        _uiState.update { it.copy(voiceText = "") }
    }

    fun clearError() {
        _uiState.update { it.copy(errorMessage = null) }
    }

    fun resetSaveSuccess() {
        _uiState.update { it.copy(saveSuccess = false) }
    }
}

data class DiaryUiState(
    val isLoading: Boolean = false,
    val isSaving: Boolean = false,
    val isListening: Boolean = false,
    val saveSuccess: Boolean = false,
    val voiceText: String = "",
    val searchResults: List<DiaryEntry> = emptyList(),
    val errorMessage: String? = null
)
