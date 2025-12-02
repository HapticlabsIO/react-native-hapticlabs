package io.hapticlabs.reactnativehapticlabs

import com.facebook.react.TurboReactPackage;
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.model.ReactModuleInfo
import com.facebook.react.module.model.ReactModuleInfoProvider
import java.io.hapticlabs.reactnativehapticlabs.HapticlabsModule


class HapticlabsPackage : TurboReactPackage() {
  override fun getModule(name: String, reactContext: ReactApplicationContext): NativeModule? {
    if (name == HapticlabsModule.Companion.NAME) {
      return HapticlabsModule(reactContext)
    }
    return null
  }

  override fun getReactModuleInfoProvider(): ReactModuleInfoProvider {
    return ReactModuleInfoProvider {
      val moduleInfos = HashMap<String, ReactModuleInfo>()
      val isTurboModule = BuildConfig.IS_NEW_ARCHITECTURE_ENABLED;
      moduleInfos[HapticlabsModule.Companion.NAME] = ReactModuleInfo(
        HapticlabsModule.Companion.NAME,
        HapticlabsModule.Companion.NAME,
        false, // canOverrideExistingModule
        needsEagerInit = false, // needsEagerInit
        hasConstants = true, // hasConstants
        isCxxModule = false, // isCxxModule
        isTurboModule = isTurboModule // isTurboModule
      )
      moduleInfos
    }
  }
}
