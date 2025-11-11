# 🏗️ Dairy Snap - Architecture Documentation

## Overview

Dairy Snap follows **Clean Architecture** principles combined with **MVVM** (Model-View-ViewModel) pattern to ensure separation of concerns, testability, and maintainability.

---

## Architecture Layers

### 1. Presentation Layer (UI)

**Location**: `app/src/main/java/com/dairysnap/app/ui/`

**Components**:
- **Composable Screens**: Jetpack Compose UI components
- **ViewModels**: State management and business logic coordination
- **Navigation**: Compose Navigation for screen transitions
- **Theme**: Material 3 theming system

**Key Files**:
```
ui/
├── screens/
│   ├── home/HomeScreen.kt
│   ├── entry/EntryScreen.kt
│   ├── search/SearchScreen.kt
│   ├── settings/SettingsScreen.kt
│   └── onboarding/OnboardingScreen.kt
├── viewmodel/
│   └── DiaryViewModel.kt
├── theme/
│   ├── Color.kt
│   ├── Theme.kt
│   └── Type.kt
└── navigation/
    └── NavGraph.kt
```

**Responsibilities**:
- Display data to the user
- Handle user interactions
- Observe ViewModel state
- UI logic only

---

### 2. Domain Layer

**Location**: `app/src/main/java/com/dairysnap/app/domain/`

**Components**:
- **Use Cases**: Business logic for specific operations
- **Speech Manager**: Voice recognition logic

**Key Files**:
```
domain/
├── usecase/
│   ├── GetEntriesUseCase.kt
│   ├── SaveEntryUseCase.kt
│   └── SearchEntriesUseCase.kt
└── speech/
    └── SpeechRecognitionManager.kt
```

**Responsibilities**:
- Encapsulate business logic
- Coordinate between repository and UI
- Independent of Android framework
- Reusable across features

---

### 3. Data Layer

**Location**: `app/src/main/java/com/dairysnap/app/data/`

**Components**:
- **Entities**: Room database models
- **DAOs**: Database access objects
- **Repository**: Single source of truth
- **Preferences**: App settings via DataStore

**Key Files**:
```
data/
├── local/
│   ├── entity/
│   │   └── DiaryEntry.kt
│   ├── dao/
│   │   └── DiaryEntryDao.kt
│   ├── database/
│   │   └── DairySnapDatabase.kt
│   └── converter/
│       └── Converters.kt
├── repository/
│   └── DiaryRepository.kt
└── preferences/
    └── UserPreferences.kt
```

**Responsibilities**:
- Data persistence (Room)
- User preferences (DataStore)
- API calls (future: Firebase)
- Data transformation

---

### 4. Dependency Injection

**Location**: `app/src/main/java/com/dairysnap/app/di/`

**Technology**: Hilt (Dagger)

**Modules**:
- **DatabaseModule**: Provides Room database and DAOs
- **AppModule**: Provides UserPreferences and SpeechManager

**Key Files**:
```
di/
├── DatabaseModule.kt
└── AppModule.kt
```

---

## Data Flow

```
┌─────────────────────────────────────────────────────────┐
│                    User Interaction                     │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│              UI Layer (Composables)                     │
│  • HomeScreen, EntryScreen, SearchScreen, etc.          │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│                  ViewModel Layer                        │
│  • DiaryViewModel                                       │
│  • Manages UI state via StateFlow                       │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│                   Use Case Layer                        │
│  • GetEntriesUseCase                                    │
│  • SaveEntryUseCase                                     │
│  • SearchEntriesUseCase                                 │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│                Repository Layer                         │
│  • DiaryRepository (Single Source of Truth)             │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│                  Data Sources                           │
│  • Room Database (Local)                                │
│  • Firebase (Cloud - Optional)                          │
│  • DataStore (Preferences)                              │
└─────────────────────────────────────────────────────────┘
```

---

## State Management

### ViewModel State Pattern

```kotlin
data class DiaryUiState(
    val isLoading: Boolean = false,
    val isSaving: Boolean = false,
    val isListening: Boolean = false,
    val saveSuccess: Boolean = false,
    val voiceText: String = "",
    val searchResults: List<DiaryEntry> = emptyList(),
    val errorMessage: String? = null
)
```

**Benefits**:
- Single immutable state object
- Easy to test
- Predictable state updates
- Time-travel debugging

---

## Navigation Architecture

### Compose Navigation

```kotlin
sealed class Screen(val route: String) {
    object Onboarding : Screen("onboarding")
    object Home : Screen("home")
    object Entry : Screen("entry/{entryId}")
    object Search : Screen("search")
    object Settings : Screen("settings")
}
```

**Flow**:
1. User lands on Onboarding (first time)
2. After completion → Home Screen
3. User can navigate to Entry, Search, or Settings
4. Entry screen can be opened with or without entryId

---

## Database Schema

### DiaryEntry Table

| Column | Type | Description |
|--------|------|-------------|
| id | String (PK) | Unique identifier |
| title | String | Entry title |
| content | String | Entry content |
| mood | Enum | User's mood |
| tags | List<String> | Tags for categorization |
| createdAt | Date | Creation timestamp |
| updatedAt | Date | Last update timestamp |
| language | String | Language code |
| isFavorite | Boolean | Favorite flag |
| wordCount | Int | Word count |
| voiceRecorded | Boolean | Voice input flag |
| cloudSynced | Boolean | Cloud sync status |
| cloudId | String? | Firebase document ID |

---

## Threading Model

### Kotlin Coroutines

```kotlin
viewModelScope.launch {
    // Runs on Main (UI) thread
    _uiState.update { it.copy(isLoading = true) }

    // Repository automatically handles background threading
    val result = repository.getEntries()

    // Back to Main thread
    _uiState.update { it.copy(isLoading = false) }
}
```

**Key Points**:
- ViewModelScope automatically cancelled when ViewModel is cleared
- Room queries run on background thread by default
- UI updates always on Main thread

---

## Voice Recognition Flow

```
User taps Mic Button
         │
         ▼
Request RECORD_AUDIO Permission
         │
         ▼
Initialize SpeechRecognizer
         │
         ▼
Start Listening
         │
         ├─→ Partial Results → Update UI (Live)
         │
         └─→ Final Results → Save to Content
```

---

## Offline-First Strategy

1. **Write Operations**:
   - Save to Room database immediately
   - Queue for cloud sync (if premium)
   - Sync when network available

2. **Read Operations**:
   - Always read from local database
   - Background sync from cloud (if enabled)

3. **Conflict Resolution**:
   - Last-write-wins strategy
   - Use `updatedAt` timestamp

---

## Testing Strategy

### Unit Tests
- ViewModels
- Use Cases
- Repository
- Type Converters

### Integration Tests
- Room DAO queries
- Repository + Database

### UI Tests
- Compose screens
- Navigation flows
- User interactions

---

## Performance Optimizations

1. **LazyColumn**: Efficient list rendering
2. **Flow**: Reactive data streams
3. **Room Indices**: Fast database queries
4. **Pagination**: Load entries in chunks (future)
5. **Image Caching**: Coil for efficient image loading
6. **Debouncing**: Search queries

---

## Security Considerations

1. **Local Storage**: Encrypted SharedPreferences (future)
2. **Cloud Sync**: Firebase Authentication
3. **API Keys**: Never hardcode, use BuildConfig
4. **ProGuard**: Obfuscate release builds
5. **SSL Pinning**: For API calls (future)

---

## Scalability Plan

### Phase 1 (Current)
- Local Room database
- Single user
- Offline-first

### Phase 2
- Firebase cloud sync
- Multi-device support
- Real-time updates

### Phase 3
- Backend API (Node.js/Kotlin)
- Advanced analytics
- ML-powered features

---

## Design Patterns Used

1. **Repository Pattern**: Single source of truth
2. **Observer Pattern**: Flow/LiveData
3. **Factory Pattern**: ViewModelFactory
4. **Singleton Pattern**: Database, Repositories
5. **Dependency Injection**: Hilt
6. **Strategy Pattern**: Speech recognition
7. **State Pattern**: UI state management

---

## Monitoring & Analytics

### Future Implementation

```kotlin
// Firebase Analytics
analytics.logEvent("entry_created") {
    param("language", languageCode)
    param("voice_recorded", isVoice)
    param("mood", mood?.name)
}

// Crashlytics
crashlytics.log("User created entry")
crashlytics.setUserId(userId)
```

---

## Continuous Integration

### GitHub Actions (Future)

```yaml
- Build Debug APK
- Run Unit Tests
- Run Lint Checks
- Generate Test Coverage
- Deploy to Firebase App Distribution
```

---

## Conclusion

Dairy Snap's architecture is designed for:
- ✅ **Scalability**: Easy to add features
- ✅ **Testability**: Clear separation of concerns
- ✅ **Maintainability**: Clean, readable code
- ✅ **Performance**: Optimized data flow
- ✅ **Flexibility**: Easy to swap implementations

For questions or contributions, refer to the main [README.md](README.md).
