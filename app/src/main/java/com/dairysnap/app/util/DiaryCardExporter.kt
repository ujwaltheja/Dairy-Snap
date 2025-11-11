package com.dairysnap.app.util

import android.content.Context
import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.graphics.Rect
import android.graphics.Typeface
import android.os.Environment
import com.dairysnap.app.data.local.entity.DiaryEntry
import java.io.File
import java.io.FileOutputStream
import java.text.SimpleDateFormat
import java.util.*

object DiaryCardExporter {

    private const val CARD_WIDTH = 1080
    private const val CARD_HEIGHT = 1920
    private const val PADDING = 80
    private const val LINE_SPACING = 20

    fun exportDiaryCard(
        context: Context,
        entry: DiaryEntry,
        backgroundColor: Int = Color.parseColor("#6750A4"),
        textColor: Int = Color.WHITE
    ): File? {
        return try {
            val bitmap = createDiaryCardBitmap(entry, backgroundColor, textColor)
            saveBitmapToFile(context, bitmap, entry.id)
        } catch (e: Exception) {
            e.printStackTrace()
            null
        }
    }

    private fun createDiaryCardBitmap(
        entry: DiaryEntry,
        backgroundColor: Int,
        textColor: Int
    ): Bitmap {
        val bitmap = Bitmap.createBitmap(CARD_WIDTH, CARD_HEIGHT, Bitmap.Config.ARGB_8888)
        val canvas = Canvas(bitmap)

        // Background
        canvas.drawColor(backgroundColor)

        val paint = Paint().apply {
            isAntiAlias = true
            color = textColor
            textAlign = Paint.Align.CENTER
        }

        var yPosition = PADDING + 100f

        // Mood emoji (if exists)
        entry.mood?.let { mood ->
            paint.textSize = 120f
            canvas.drawText(mood.emoji, CARD_WIDTH / 2f, yPosition, paint)
            yPosition += 150f
        }

        // Date
        paint.textSize = 40f
        paint.alpha = 180
        val dateFormat = SimpleDateFormat("MMMM dd, yyyy", Locale.getDefault())
        canvas.drawText(
            dateFormat.format(entry.createdAt),
            CARD_WIDTH / 2f,
            yPosition,
            paint
        )
        yPosition += 80f

        // Content (wrapped)
        paint.textSize = 48f
        paint.alpha = 255
        paint.textAlign = Paint.Align.LEFT

        val maxWidth = CARD_WIDTH - (PADDING * 2)
        val words = entry.content.split(" ")
        var line = ""

        words.forEach { word ->
            val testLine = if (line.isEmpty()) word else "$line $word"
            val bounds = Rect()
            paint.getTextBounds(testLine, 0, testLine.length, bounds)

            if (bounds.width() > maxWidth && line.isNotEmpty()) {
                canvas.drawText(line, PADDING.toFloat(), yPosition, paint)
                yPosition += paint.textSize + LINE_SPACING
                line = word
            } else {
                line = testLine
            }
        }

        if (line.isNotEmpty()) {
            canvas.drawText(line, PADDING.toFloat(), yPosition, paint)
            yPosition += paint.textSize + LINE_SPACING
        }

        // App branding
        paint.textSize = 36f
        paint.alpha = 150
        paint.textAlign = Paint.Align.CENTER
        canvas.drawText(
            "Dairy Snap",
            CARD_WIDTH / 2f,
            CARD_HEIGHT - PADDING.toFloat(),
            paint
        )

        return bitmap
    }

    private fun saveBitmapToFile(context: Context, bitmap: Bitmap, entryId: String): File {
        val timestamp = SimpleDateFormat("yyyyMMdd_HHmmss", Locale.getDefault()).format(Date())
        val fileName = "diary_card_${timestamp}.png"

        val directory = File(
            context.getExternalFilesDir(Environment.DIRECTORY_PICTURES),
            "DairySnap"
        )
        if (!directory.exists()) {
            directory.mkdirs()
        }

        val file = File(directory, fileName)
        FileOutputStream(file).use { out ->
            bitmap.compress(Bitmap.CompressFormat.PNG, 100, out)
        }

        return file
    }
}
