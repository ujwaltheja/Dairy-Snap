package com.dairysnap.app.domain.speech

import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.speech.RecognitionListener
import android.speech.RecognizerIntent
import android.speech.SpeechRecognizer
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.callbackFlow
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class SpeechRecognitionManager @Inject constructor(
    @ApplicationContext private val context: Context
) {

    sealed class SpeechResult {
        data class Success(val text: String, val isFinal: Boolean = false) : SpeechResult()
        data class Error(val error: String) : SpeechResult()
        object Listening : SpeechResult()
        object ReadyForSpeech : SpeechResult()
        object EndOfSpeech : SpeechResult()
    }

    fun startListening(languageCode: String = "en-IN"): Flow<SpeechResult> = callbackFlow {
        val speechRecognizer = SpeechRecognizer.createSpeechRecognizer(context)

        val recognitionListener = object : RecognitionListener {
            override fun onReadyForSpeech(params: Bundle?) {
                trySend(SpeechResult.ReadyForSpeech)
            }

            override fun onBeginningOfSpeech() {
                trySend(SpeechResult.Listening)
            }

            override fun onRmsChanged(rmsdB: Float) {
                // Can be used for visualizing audio levels
            }

            override fun onBufferReceived(buffer: ByteArray?) {
                // Not commonly used
            }

            override fun onEndOfSpeech() {
                trySend(SpeechResult.EndOfSpeech)
            }

            override fun onError(error: Int) {
                val errorMessage = when (error) {
                    SpeechRecognizer.ERROR_AUDIO -> "Audio recording error"
                    SpeechRecognizer.ERROR_CLIENT -> "Client side error"
                    SpeechRecognizer.ERROR_INSUFFICIENT_PERMISSIONS -> "Insufficient permissions"
                    SpeechRecognizer.ERROR_NETWORK -> "Network error"
                    SpeechRecognizer.ERROR_NETWORK_TIMEOUT -> "Network timeout"
                    SpeechRecognizer.ERROR_NO_MATCH -> "No speech match"
                    SpeechRecognizer.ERROR_RECOGNIZER_BUSY -> "Recognition service busy"
                    SpeechRecognizer.ERROR_SERVER -> "Server error"
                    SpeechRecognizer.ERROR_SPEECH_TIMEOUT -> "No speech input"
                    else -> "Unknown error"
                }
                trySend(SpeechResult.Error(errorMessage))
                close()
            }

            override fun onResults(results: Bundle?) {
                val matches = results?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)
                val text = matches?.firstOrNull() ?: ""
                trySend(SpeechResult.Success(text, isFinal = true))
                close()
            }

            override fun onPartialResults(partialResults: Bundle?) {
                val matches = partialResults?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)
                val text = matches?.firstOrNull() ?: ""
                trySend(SpeechResult.Success(text, isFinal = false))
            }

            override fun onEvent(eventType: Int, params: Bundle?) {
                // Not commonly used
            }
        }

        speechRecognizer.setRecognitionListener(recognitionListener)

        val intent = Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH).apply {
            putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM)
            putExtra(RecognizerIntent.EXTRA_LANGUAGE, languageCode)
            putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, true)
            putExtra(RecognizerIntent.EXTRA_MAX_RESULTS, 1)
            putExtra(RecognizerIntent.EXTRA_CALLING_PACKAGE, context.packageName)
        }

        speechRecognizer.startListening(intent)

        awaitClose {
            speechRecognizer.stopListening()
            speechRecognizer.destroy()
        }
    }

    companion object {
        // Supported languages with their locale codes
        val SUPPORTED_LANGUAGES = mapOf(
            "English (India)" to "en-IN",
            "English (US)" to "en-US",
            "हिंदी (Hindi)" to "hi-IN",
            "தமிழ் (Tamil)" to "ta-IN",
            "తెలుగు (Telugu)" to "te-IN",
            "ಕನ್ನಡ (Kannada)" to "kn-IN",
            "বাংলা (Bengali)" to "bn-IN",
            "मराठी (Marathi)" to "mr-IN",
            "ગુજરાતી (Gujarati)" to "gu-IN",
            "മലയാളം (Malayalam)" to "ml-IN",
            "ਪੰਜਾਬੀ (Punjabi)" to "pa-IN"
        )

        fun isRecognitionAvailable(context: Context): Boolean {
            return SpeechRecognizer.isRecognitionAvailable(context)
        }
    }
}
