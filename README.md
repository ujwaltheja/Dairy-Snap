# 📖 Dairy Snap

**Your voice, your story, your language.**

Dairy Snap is a modern, multilingual diary app for Android that allows users to create personal diary entries using voice-to-text input in multiple Indian languages.

<div align="center">

[![Android](https://img.shields.io/badge/Platform-Android-green.svg)](https://www.android.com/)
[![Kotlin](https://img.shields.io/badge/Language-Kotlin-blue.svg)](https://kotlinlang.org/)
[![Jetpack Compose](https://img.shields.io/badge/UI-Jetpack%20Compose-4285F4.svg)](https://developer.android.com/jetpack/compose)
[![Material 3](https://img.shields.io/badge/Design-Material%203-6200EA.svg)](https://m3.material.io/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

</div>

---

## ✨ Features

### 🎤 Voice-to-Text Input
- **Multilingual Support**: Hindi, Tamil, Telugu, Kannada, Bengali, Marathi, Gujarati, Malayalam, Punjabi, and English
- **Real-time Recognition**: Instant transcription with partial results
- **Offline-First**: All data stored locally on device

### 📝 Smart Diary Management
- **Mood Tracking**: 12 different mood emojis to express your feelings
- **Rich Text Entries**: Title, content, tags, and timestamps
- **Search & Filter**: Find entries by keyword, mood, or date
- **Favorites**: Mark important entries for quick access

### 🎨 Premium Design
- **Material 3**: Modern, beautiful UI with dynamic theming
- **Dark/Light Mode**: Automatic theme switching based on system preference
- **Smooth Animations**: Delightful transitions and micro-interactions
- **Multilingual Typography**: Optimized fonts for all supported scripts

### 🚀 Viral Growth Features
- **Diary Cards**: Export entries as stylized shareable images
- **Onboarding Flow**: Smooth introduction to app features
- **Premium Tier**: Ad-free experience with cloud sync and custom themes

### 🔐 Privacy & Security
- **Offline-First**: All entries stored locally using Room database
- **Optional Cloud Sync**: Premium feature with Firebase integration
- **No Tracking**: Your data stays private

---

## 🏗️ Architecture

Dairy Snap follows **Clean Architecture** principles with **MVVM** pattern:

```
app/
├── data/                      # Data Layer
│   ├── local/
│   │   ├── entity/           # Room entities
│   │   ├── dao/              # Data Access Objects
│   │   ├── database/         # Database configuration
│   │   └── converter/        # Type converters
│   ├── repository/           # Repository implementations
│   └── preferences/          # DataStore preferences
│
├── domain/                    # Domain Layer
│   ├── usecase/              # Business logic
│   └── speech/               # Speech recognition manager
│
├── ui/                        # Presentation Layer
│   ├── screens/              # Compose screens
│   │   ├── home/
│   │   ├── entry/
│   │   ├── search/
│   │   ├── settings/
│   │   └── onboarding/
│   ├── viewmodel/            # ViewModels
│   ├── theme/                # Material 3 theme
│   └── navigation/           # Navigation graph
│
├── di/                        # Dependency Injection (Hilt)
├── util/                      # Utility classes
└── ads/                       # AdMob integration
```

### Tech Stack

| Category | Technology |
|----------|-----------|
| **Language** | Kotlin |
| **UI Framework** | Jetpack Compose |
| **Architecture** | MVVM + Clean Architecture |
| **Dependency Injection** | Hilt |
| **Database** | Room |
| **Preferences** | DataStore |
| **Speech Recognition** | Android SpeechRecognizer |
| **Backend (Optional)** | Firebase (Auth, Firestore, Storage) |
| **Monetization** | Google AdMob |
| **Async** | Kotlin Coroutines + Flow |
| **Material Design** | Material 3 |

---

## 🚀 Getting Started

### Prerequisites

- Android Studio Hedgehog (2023.1.1) or later
- JDK 17
- Android SDK 34
- Minimum Android API 24 (Android 7.0)

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/Dairy-Snap.git
   cd Dairy-Snap
   ```

2. **Open in Android Studio**
   - Open Android Studio
   - Select "Open an Existing Project"
   - Navigate to the cloned directory

3. **Configure Firebase (Optional)**
   - Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Download `google-services.json`
   - Replace the placeholder file in `app/google-services.json`
   - Enable Firestore, Authentication, and Storage in Firebase Console

4. **Configure AdMob**
   - Create an AdMob account at [AdMob Console](https://apps.admob.com/)
   - Create ad units for your app
   - Update `AdManager.kt` with your Ad Unit IDs:
     ```kotlin
     const val BANNER_AD_UNIT_ID = "your-banner-ad-unit-id"
     const val INTERSTITIAL_AD_UNIT_ID = "your-interstitial-ad-unit-id"
     ```
   - Update `AndroidManifest.xml` with your AdMob App ID

5. **Build and Run**
   ```bash
   ./gradlew assembleDebug
   ```
   Or use Android Studio's Run button

---

## 📱 Supported Languages

Dairy Snap supports voice input in the following languages:

| Language | Locale Code |
|----------|-------------|
| English (India) | `en-IN` |
| English (US) | `en-US` |
| हिंदी (Hindi) | `hi-IN` |
| தமிழ் (Tamil) | `ta-IN` |
| తెలుగు (Telugu) | `te-IN` |
| ಕನ್ನಡ (Kannada) | `kn-IN` |
| বাংলা (Bengali) | `bn-IN` |
| मराठी (Marathi) | `mr-IN` |
| ગુજરાતી (Gujarati) | `gu-IN` |
| മലയാളം (Malayalam) | `ml-IN` |
| ਪੰਜਾਬੀ (Punjabi) | `pa-IN` |

---

## 🎯 Roadmap

### Phase 1 (MVP) ✅
- [x] Voice-to-text diary entries
- [x] Multilingual support
- [x] Mood tracking
- [x] Search and filter
- [x] Material 3 theme
- [x] Onboarding flow

### Phase 2 (Growth)
- [ ] Calendar view with entry heatmap
- [ ] Daily reminders and notifications
- [ ] Streak tracking
- [ ] Export to PDF/Text
- [ ] Lock with PIN/Biometric

### Phase 3 (Monetization)
- [ ] Premium subscription
- [ ] Cloud sync with Firebase
- [ ] Custom themes pack
- [ ] AI-powered daily summaries
- [ ] Sentiment analysis

### Phase 4 (Scale)
- [ ] Multi-device sync
- [ ] Collaborative journals
- [ ] Voice notes storage
- [ ] Photo attachments
- [ ] Web version

---

## 💰 Monetization Strategy

### Free Tier
- ✅ Unlimited entries
- ✅ Voice-to-text in all languages
- ✅ Search and filter
- ✅ Basic themes
- ⚠️ Banner ads

### Premium Tier ($4.99/month)
- ✨ Ad-free experience
- ✨ Cloud sync across devices
- ✨ Custom themes
- ✨ Advanced search
- ✨ AI daily summaries
- ✨ Export to PDF
- ✨ Priority support

---

## 🎨 Design Principles

1. **Simplicity**: Minimal, distraction-free interface
2. **Speed**: Quick entry creation with voice input
3. **Privacy**: Local-first, secure data storage
4. **Accessibility**: Support for screen readers and large fonts
5. **Delight**: Smooth animations and beautiful typography

---

## 📊 Database Schema

### DiaryEntry Entity

```kotlin
@Entity(tableName = "diary_entries")
data class DiaryEntry(
    @PrimaryKey val id: String,
    val title: String,
    val content: String,
    val mood: Mood?,
    val tags: List<String>,
    val createdAt: Date,
    val updatedAt: Date,
    val language: String,
    val isFavorite: Boolean,
    val wordCount: Int,
    val voiceRecorded: Boolean,
    val cloudSynced: Boolean,
    val cloudId: String?
)
```

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style
- Follow [Kotlin Coding Conventions](https://kotlinlang.org/docs/coding-conventions.html)
- Use meaningful variable and function names
- Add comments for complex logic
- Write unit tests for new features

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [Material Design 3](https://m3.material.io/) for design guidelines
- [Jetpack Compose](https://developer.android.com/jetpack/compose) for modern Android UI
- [Hilt](https://dagger.dev/hilt/) for dependency injection
- [Room](https://developer.android.com/training/data-storage/room) for local database
- Google ML Kit for speech recognition

---

## 📧 Contact

For questions, feedback, or support:
- **Email**: support@dairysnap.app
- **Twitter**: [@DairySnapApp](https://twitter.com/DairySnapApp)
- **Website**: [www.dairysnap.app](https://www.dairysnap.app)

---

<div align="center">

**Made with ❤️ for the Indian community**

*Empowering everyone to express themselves in their native language*

</div>
