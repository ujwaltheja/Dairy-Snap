package com.dairysnap.app.ui.screens.settings

import androidx.lifecycle.ViewModel
import com.dairysnap.app.data.preferences.UserPreferences
import dagger.hilt.android.lifecycle.HiltViewModel
import javax.inject.Inject

@HiltViewModel
class SettingsViewModel @Inject constructor(
    val userPreferences: UserPreferences
) : ViewModel()
