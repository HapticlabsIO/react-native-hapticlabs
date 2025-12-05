package io.hapticlabs.reactnativehapticlabs

import android.content.ContextWrapper
import android.os.Build
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.WritableMap
import io.hapticlabs.hapticlabsplayer.HapticlabsPlayer

class HapticlabsModuleImpl(private val reactContext: ContextWrapper) {
  private val hapticlabsPlayer: HapticlabsPlayer = HapticlabsPlayer(reactContext)

  fun getConstants(): Map<String, Any> {
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
        constants["envelopeControlPointMaxDurationMillis"] = it.maxControlPointDurationMillis
        constants["envelopeMaxDurationMillis"] = it.maxDurationMillis
        constants["envelopeMaxControlPointCount"] = it.maxSize
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

  fun playHAC(path: String, promise: Promise) {
    hapticlabsPlayer.playHAC(path) { promise.resolve(null) }
  }

  fun playPredefinedAndroidVibration(name: String) {
    hapticlabsPlayer.playBuiltIn(name)
  }

  companion object {
    const val NAME = "Hapticlabs"
  }
}
