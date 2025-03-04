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
    constants["hapticSupportLevel"] = hapticlabsPlayer.hapticSupportLevel
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
