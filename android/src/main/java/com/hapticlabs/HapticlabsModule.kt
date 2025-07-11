package com.hapticlabs

import android.content.Context
import android.media.*
import android.media.audiofx.HapticGenerator
import android.os.Build
import android.os.Handler
import android.os.Looper
import android.os.SystemClock
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.google.gson.Gson
import com.google.gson.JsonObject
import java.io.ByteArrayOutputStream
import java.io.File
import java.io.FileInputStream
import java.io.FileOutputStream
import java.io.IOException
import java.io.InputStream
import java.nio.charset.StandardCharsets
import java.nio.file.Paths
import kotlin.math.abs
import io.hapticlabs.hapticlabsplayer.HapticlabsPlayer

class HapticlabsModule(private val reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {
  private val hapticlabsPlayer: HapticlabsPlayer = HapticlabsPlayer(reactContext)

  override fun getConstants(): Map<String, Any> {
    val constants = HashMap<String, Any>()
    constants["hapticSupportLevel"] = hapticlabsPlayer.hapticsCapabilities.hapticSupportLevel
    constants["areOnOffHapticsSupported"] = hapticlabsPlayer.hapticsCapabilities.supportsOnOff
    constants["areAmplitudeControlHapticsSupported"] = hapticlabsPlayer.hapticsCapabilities.supportsAmplitudeControl
    constants["areAudioCoupledHapticsSupported"] = hapticlabsPlayer.hapticsCapabilities.supportsAudioCoupled
    constants["areEnvelopeHapticsSupported"] = hapticlabsPlayer.hapticsCapabilities.supportsEnvelopeEffects

    if (!hapticlabsPlayer.hapticsCapabilities.resonantFrequency.isNaN()) {
      constants["resonanceFrequency"] = hapticlabsPlayer.hapticsCapabilities.resonantFrequency
    }
    if (!hapticlabsPlayer.hapticsCapabilities.qFactor.isNaN()) {
      constants["qFactor"] = hapticlabsPlayer.hapticsCapabilities.qFactor
    }

    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.BAKLAVA) {
      hapticlabsPlayer.hapticsCapabilities.frequencyResponse?.let {
        constants["minFrequency"] = it.minFrequencyHz
        constants["maxFrequency"] = it.maxFrequencyHz
        constants["maxAcceleration"] = it.maxOutputAccelerationGs

        // Serialize the frequency response
        val frequencyResponseMap = it.frequenciesOutputAcceleration
        val frequencyResponseKeys = Array(frequencyResponseMap.size()){
            index -> frequencyResponseMap.keyAt(index)
        }
        val frequencyResponseValues = Array<Float>(frequencyResponseMap.size()) {
            index -> frequencyResponseMap.valueAt(index)
        }

        constants["frequencyResponseKeys"] = frequencyResponseKeys
        constants["frequencyResponseValues"] = frequencyResponseValues
      }

      hapticlabsPlayer.hapticsCapabilities.envelopeEffectInfo?.let {
        constants["envelopeControlPointMinDurationMillis"] = it.minControlPointDurationMillis
        constants["envelopeControlPointMaxDuration  Millis"] = it.maxControlPointDurationMillis
        constants["envelopeMaxDuration"] = it.maxDurationMillis
        constants["envelopeMaxControlPoints"] = it.maxSize
      }
    }

    return constants
  }

  override fun getName(): String {
    return NAME
  }

  @ReactMethod
  fun playAndroidHaptics(directoryPath: String, promise: Promise) {
    hapticlabsPlayer.play(directoryPath) { promise.resolve(null) }
  }

  @ReactMethod
  fun preloadAndroidHaptics(directoryPath: String) {
    hapticlabsPlayer.preload(directoryPath)
  }

  @ReactMethod
  fun preloadOGG(oggPath: String) {
    hapticlabsPlayer.preloadOGG(oggPath)
  }

  @ReactMethod
  fun unloadAndroidHaptics(directoryPath: String) {
    hapticlabsPlayer.unload(directoryPath)
  }

  @ReactMethod
  fun unloadOGG(oggPath: String) {
    hapticlabsPlayer.unloadOGG(oggPath)
  }

  @ReactMethod
  fun unloadAllAndroidHaptics() {
    hapticlabsPlayer.unloadAll()
  }

  @ReactMethod
  fun playHLA(path: String, promise: Promise) {
    hapticlabsPlayer.playHLA(path) { promise.resolve(null) }
  }

  @ReactMethod
  fun playOGG(path: String, promise: Promise) {
    hapticlabsPlayer.playOGG(path) { promise.resolve(null) }
  }


  @ReactMethod
  fun playPredefinedAndroidVibration(name: String) {
    hapticlabsPlayer.playBuiltIn(name)
  }

  companion object {
    const val NAME = "Hapticlabs"
  }
}
