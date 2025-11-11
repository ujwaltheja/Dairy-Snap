package com.dairysnap.app.data.local.entity

import androidx.room.Entity
import androidx.room.PrimaryKey
import androidx.room.TypeConverters
import com.dairysnap.app.data.local.converter.Converters
import java.util.Date
import java.util.UUID

@Entity(tableName = "diary_entries")
@TypeConverters(Converters::class)
data class DiaryEntry(
    @PrimaryKey
    val id: String = UUID.randomUUID().toString(),

    val title: String = "",

    val content: String,

    val mood: Mood? = null,

    val tags: List<String> = emptyList(),

    val createdAt: Date,

    val updatedAt: Date,

    val language: String = "en", // Language code (en, hi, ta, te, kn, etc.)

    val isFavorite: Boolean = false,

    val wordCount: Int = 0,

    val voiceRecorded: Boolean = false, // Whether this entry was created via voice

    val cloudSynced: Boolean = false, // For premium cloud sync feature

    val cloudId: String? = null // Firebase document ID if synced
)

enum class Mood(val emoji: String, val displayName: String) {
    HAPPY("😊", "Happy"),
    SAD("😢", "Sad"),
    EXCITED("🤩", "Excited"),
    ANXIOUS("😰", "Anxious"),
    PEACEFUL("😌", "Peaceful"),
    ANGRY("😠", "Angry"),
    GRATEFUL("🙏", "Grateful"),
    NEUTRAL("😐", "Neutral"),
    LOVED("❤️", "Loved"),
    TIRED("😴", "Tired"),
    ENERGETIC("⚡", "Energetic"),
    CONFUSED("😕", "Confused")
}
