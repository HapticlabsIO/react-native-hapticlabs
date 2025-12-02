package io.hapticlabs.reactnativehapticlabs

import android.content.ContextWrapper
import android.os.Build
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.WritableMap
import io.hapticlabs.hapticlabsplayer.HapticlabsPlayer

class HapticlabsModuleImpl(private val reactContext: ContextWrapper) {
  private val hapticlabsPlayer: HapticlabsPlayer = HapticlabsPlayer(reactContext)

  fun getAndroidConstants(): WritableMap {
    val constants = Arguments.createMap()
    constants.putInt(
      "hapticSupportLevel",
      hapticlabsPlayer.hapticsCapabilities.hapticSupportLevel.toInt()
    )
    constants.putBoolean(
      "areOnOffHapticsSupported",
      hapticlabsPlayer.hapticsCapabilities.supportsOnOff
    )
    constants.putBoolean(
      "areAmplitudeControlHapticsSupported",
      hapticlabsPlayer.hapticsCapabilities.supportsAmplitudeControl
    )
    constants.putBoolean(
      "areAudioCoupledHapticsSupported",
      hapticlabsPlayer.hapticsCapabilities.supportsAudioCoupled
    )
    constants.putBoolean(
      "areEnvelopeHapticsSupported",
      hapticlabsPlayer.hapticsCapabilities.supportsEnvelopeEffects
    )

    if (!hapticlabsPlayer.hapticsCapabilities.resonantFrequency.isNaN()) {
      constants.putDouble(
        "resonanceFrequency",
        hapticlabsPlayer.hapticsCapabilities.resonantFrequency.toDouble()
      )
    }
    if (!hapticlabsPlayer.hapticsCapabilities.qFactor.isNaN()) {
      constants.putDouble("qFactor", hapticlabsPlayer.hapticsCapabilities.qFactor.toDouble())
    }

    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.BAKLAVA) {
      hapticlabsPlayer.hapticsCapabilities.frequencyResponse?.let {
        constants.putDouble("minFrequency", it.minFrequencyHz.toDouble())
        constants.putDouble("maxFrequency", it.maxFrequencyHz.toDouble())
        constants.putDouble("maxAcceleration", it.maxOutputAccelerationGs.toDouble())

        // Serialize the frequency response
        val frequencyResponseMap = it.frequenciesOutputAcceleration
        val frequencyResponseKeys = Arguments.createArray()
        val frequencyResponseValues = Arguments.createArray()

        for (index in 0 until frequencyResponseMap.size()) {
          frequencyResponseKeys.pushDouble(frequencyResponseMap.keyAt(index).toDouble())
          frequencyResponseValues.pushDouble(frequencyResponseMap.valueAt(index).toDouble())
        }

        constants.putArray("frequencyResponseKeys", frequencyResponseKeys)
        constants.putArray("frequencyResponseValues", frequencyResponseValues)
      }

      hapticlabsPlayer.hapticsCapabilities.envelopeEffectInfo?.let {
        constants.putLong("envelopeControlPointMinDurationMillis", it.minControlPointDurationMillis)
        constants.putLong("envelopeControlPointMaxDurationMillis", it.maxControlPointDurationMillis)
        constants.putLong("envelopeMaxDuration", it.maxDurationMillis)
        constants.putInt("envelopeMaxControlPoints", it.maxSize)
      }
    }

    return constants
  }

  fun getName(): String {
    return NAME
  }

  fun playAndroidHaptics(directoryPath: String, promise: Promise) {
    hapticlabsPlayer.play(directoryPath) { promise.resolve(null) }
  }

  fun preloadAndroidHaptics(directoryPath: String) {
    hapticlabsPlayer.preload(directoryPath)
  }

  fun preloadOGG(oggPath: String) {
    hapticlabsPlayer.preloadOGG(oggPath)
  }

  fun unloadAndroidHaptics(directoryPath: String) {
    hapticlabsPlayer.unload(directoryPath)
  }

  fun unloadOGG(oggPath: String) {
    hapticlabsPlayer.unloadOGG(oggPath)
  }

  fun unloadAllAndroidHaptics() {
    hapticlabsPlayer.unloadAll()
  }

  fun playHLA(path: String, promise: Promise) {
    hapticlabsPlayer.playHLA(path) { promise.resolve(null) }
  }

  fun playOGG(path: String, promise: Promise) {
    hapticlabsPlayer.playOGG(path) { promise.resolve(null) }
  }

  fun playPredefinedAndroidVibration(name: String) {
    hapticlabsPlayer.playBuiltIn(name)
  }

  companion object {
    const val NAME = "Hapticlabs"
  }
}
