package io.hapticlabs.reactnativehapticlabs


import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class HapticlabsModule(private val reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {
  private val implementation: HapticlabsModuleImpl = HapticlabsModuleImpl(reactContext)

  override fun getConstants(): Map<String, Any> {
    return implementation.getConstants()
  }

  override fun getName(): String {
    return implementation.getName()
  }

  @ReactMethod
  fun playAndroidHaptics(directoryPath: String, promise: Promise) {
    implementation.playAndroidHaptics(directoryPath, promise)
  }

  @ReactMethod
  fun preloadAndroidHaptics(directoryPath: String) {
    implementation.preloadAndroidHaptics(directoryPath)
  }

  @ReactMethod
  fun preloadOGG(oggPath: String) {
    implementation.preloadOGG(oggPath)
  }

  @ReactMethod
  fun unloadAndroidHaptics(directoryPath: String) {
    implementation.unloadAndroidHaptics(directoryPath)
  }

  @ReactMethod
  fun unloadOGG(oggPath: String) {
    implementation.unloadOGG(oggPath)
  }

  @ReactMethod
  fun unloadAllAndroidHaptics() {
    implementation.unloadAllAndroidHaptics()
  }

  @ReactMethod
  fun playHLA(path: String, promise: Promise) {
    implementation.playHLA(path, promise)
  }

  @ReactMethod
  fun playOGG(path: String, promise: Promise) {
    implementation.playOGG(path, promise)
  }


  @ReactMethod
  fun playPredefinedAndroidVibration(name: String) {
    implementation.playPredefinedAndroidVibration(name)
  }

  companion object {
    const val NAME = "Hapticlabs"
  }
}
