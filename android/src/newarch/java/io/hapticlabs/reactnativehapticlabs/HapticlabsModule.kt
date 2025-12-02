package java.io.hapticlabs.reactnativehapticlabs

import android.content.ContextWrapper
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.WritableMap
import io.hapticlabs.reactnativehapticlabs.HapticlabsModuleImpl
import io.hapticlabs.reactnativehapticlabs.NativeHapticlabsSpec

class HapticlabsModule(private val reactContext: ReactApplicationContext) :
  NativeHapticlabsSpec(reactContext) {
  private val implementation: HapticlabsModuleImpl = HapticlabsModuleImpl(reactContext)

  override fun getAndroidConstants(): WritableMap {
    return implementation.getAndroidConstants()
  }

  override fun getName(): String {
    return implementation.getName()
  }

  override fun playAndroidHaptics(directoryPath: String, promise: Promise) {
    implementation.playAndroidHaptics(directoryPath, promise)
  }

  override fun preloadAndroidHaptics(directoryPath: String) {
    implementation.preloadAndroidHaptics(directoryPath)
  }

  override fun preloadOGG(oggPath: String) {
    implementation.preloadOGG(oggPath)
  }

  override fun unloadAndroidHaptics(directoryPath: String) {
    implementation.unloadAndroidHaptics(directoryPath)
  }

  override fun unloadOGG(oggPath: String) {
    implementation.unloadOGG(oggPath)
  }

  override fun unloadAllAndroidHaptics() {
    implementation.unloadAllAndroidHaptics()
  }

  override fun playHLA(path: String, promise: Promise) {
    implementation.playHLA(path, promise)
  }

  override fun playOGG(path: String, promise: Promise) {
    implementation.playOGG(path, promise)
  }


  override fun playPredefinedHaptics(name: String) {
    implementation.playPredefinedAndroidVibration(name)
  }

  override fun playAHAP(path: String, promise: Promise) {
    // Not meaningful on Android
    promise.resolve(null)
  }

  override fun isAudioMuted(promise: Promise) {
    // Not meaningful on Android
    promise.resolve(false)
  }

  override fun isHapticsMuted(promise: Promise) {
    // Not meaningful on Android
    promise.resolve(false)
  }

  override fun setAudioMute(mute: Boolean) {
    // Not meaningful on Android
  }

  override fun setHapticsMute(mute: Boolean) {
    // Not meaningful on Android
  }



  companion object {
    const val NAME = "Hapticlabs"
  }
}
