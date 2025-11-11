package com.dairysnap.app.di

import android.content.Context
import androidx.room.Room
import com.dairysnap.app.data.local.dao.DiaryEntryDao
import com.dairysnap.app.data.local.database.DairySnapDatabase
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object DatabaseModule {

    @Provides
    @Singleton
    fun provideDairySnapDatabase(
        @ApplicationContext context: Context
    ): DairySnapDatabase {
        return Room.databaseBuilder(
            context,
            DairySnapDatabase::class.java,
            DairySnapDatabase.DATABASE_NAME
        )
            .fallbackToDestructiveMigration()
            .build()
    }

    @Provides
    @Singleton
    fun provideDiaryEntryDao(database: DairySnapDatabase): DiaryEntryDao {
        return database.diaryEntryDao()
    }
}
