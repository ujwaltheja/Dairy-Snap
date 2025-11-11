package com.dairysnap.app.data.preferences

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.*
import androidx.datastore.preferences.preferencesDataStore
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import javax.inject.Inject
import javax.inject.Singleton

private val Context.dataStore: DataStore<Preferences> by preferencesDataStore(name = "user_preferences")

@Singleton
class UserPreferences @Inject constructor(
    @ApplicationContext private val context: Context
) {
    private val dataStore = context.dataStore

    companion object {
        val THEME_MODE = stringPreferencesKey("theme_mode")
        val VOICE_LANGUAGE = stringPreferencesKey("voice_language")
        val IS_PREMIUM = booleanPreferencesKey("is_premium")
        val CLOUD_SYNC_ENABLED = booleanPreferencesKey("cloud_sync_enabled")
        val ONBOARDING_COMPLETED = booleanPreferencesKey("onboarding_completed")
        val DAILY_REMINDER_ENABLED = booleanPreferencesKey("daily_reminder_enabled")
        val REMINDER_TIME_HOUR = intPreferencesKey("reminder_time_hour")
        val REMINDER_TIME_MINUTE = intPreferencesKey("reminder_time_minute")
        val STREAK_COUNT = intPreferencesKey("streak_count")
        val LAST_ENTRY_DATE = longPreferencesKey("last_entry_date")
    }

    val themeMode: Flow<ThemeMode> = dataStore.data.map { preferences ->
        ThemeMode.valueOf(preferences[THEME_MODE] ?: ThemeMode.SYSTEM.name)
    }

    suspend fun setThemeMode(mode: ThemeMode) {
        dataStore.edit { preferences ->
            preferences[THEME_MODE] = mode.name
        }
    }

    val voiceLanguage: Flow<String> = dataStore.data.map { preferences ->
        preferences[VOICE_LANGUAGE] ?: "en-IN" // Default to English (India)
    }

    suspend fun setVoiceLanguage(languageCode: String) {
        dataStore.edit { preferences ->
            preferences[VOICE_LANGUAGE] = languageCode
        }
    }

    val isPremium: Flow<Boolean> = dataStore.data.map { preferences ->
        preferences[IS_PREMIUM] ?: false
    }

    suspend fun setPremium(premium: Boolean) {
        dataStore.edit { preferences ->
            preferences[IS_PREMIUM] = premium
        }
    }

    val cloudSyncEnabled: Flow<Boolean> = dataStore.data.map { preferences ->
        preferences[CLOUD_SYNC_ENABLED] ?: false
    }

    suspend fun setCloudSyncEnabled(enabled: Boolean) {
        dataStore.edit { preferences ->
            preferences[CLOUD_SYNC_ENABLED] = enabled
        }
    }

    val onboardingCompleted: Flow<Boolean> = dataStore.data.map { preferences ->
        preferences[ONBOARDING_COMPLETED] ?: false
    }

    suspend fun setOnboardingCompleted(completed: Boolean) {
        dataStore.edit { preferences ->
            preferences[ONBOARDING_COMPLETED] = completed
        }
    }

    val dailyReminderEnabled: Flow<Boolean> = dataStore.data.map { preferences ->
        preferences[DAILY_REMINDER_ENABLED] ?: false
    }

    suspend fun setDailyReminderEnabled(enabled: Boolean) {
        dataStore.edit { preferences ->
            preferences[DAILY_REMINDER_ENABLED] = enabled
        }
    }

    val streakCount: Flow<Int> = dataStore.data.map { preferences ->
        preferences[STREAK_COUNT] ?: 0
    }

    suspend fun updateStreak(count: Int) {
        dataStore.edit { preferences ->
            preferences[STREAK_COUNT] = count
        }
    }

    suspend fun resetStreak() {
        dataStore.edit { preferences ->
            preferences[STREAK_COUNT] = 0
        }
    }
}

enum class ThemeMode {
    LIGHT, DARK, SYSTEM
}
