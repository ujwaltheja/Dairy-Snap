package com.dairysnap.app.data.local.database

import androidx.room.Database
import androidx.room.RoomDatabase
import androidx.room.TypeConverters
import com.dairysnap.app.data.local.converter.Converters
import com.dairysnap.app.data.local.dao.DiaryEntryDao
import com.dairysnap.app.data.local.entity.DiaryEntry

@Database(
    entities = [DiaryEntry::class],
    version = 1,
    exportSchema = true
)
@TypeConverters(Converters::class)
abstract class DairySnapDatabase : RoomDatabase() {

    abstract fun diaryEntryDao(): DiaryEntryDao

    companion object {
        const val DATABASE_NAME = "dairy_snap_database"
    }
}
