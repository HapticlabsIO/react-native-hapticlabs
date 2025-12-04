#import "Hapticlabs.h"
#import <react_native_hapticlabs-Swift.h>

@implementation Hapticlabs

RCT_EXPORT_MODULE("Hapticlabs")

// Create an instance
HapticlabsImpl *hapticlabsInstance = [[HapticlabsImpl alloc] init];

// Thanks to this guard, we won't compile this code when we build for the old
// architecture.
#ifdef RCT_NEW_ARCH_ENABLED
- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params {
  return std::make_shared<facebook::react::NativeHapticlabsSpecJSI>(params);
}
#endif

- (nonnull NSDictionary *)getAndroidConstants {
  // Return an empty dictionary as there are no Android constants on iOS
  return @{};
}

- (void)isAudioMuted:(nonnull RCTPromiseResolveBlock)resolve
              reject:(nonnull RCTPromiseRejectBlock)reject {
  [hapticlabsInstance isAudioMuted:resolve withRejecter:reject];
}

- (void)isHapticsMuted:(nonnull RCTPromiseResolveBlock)resolve
                reject:(nonnull RCTPromiseRejectBlock)reject {
  [hapticlabsInstance isHapticsMuted:resolve withRejecter:reject];
}

- (void)playAHAP:(nonnull NSString *)path
         resolve:(nonnull RCTPromiseResolveBlock)resolve
          reject:(nonnull RCTPromiseRejectBlock)reject {
  [hapticlabsInstance playAHAP:path withResolver:resolve withRejecter:reject];
}

- (void)playAndroidHaptics:(nonnull NSString *)directoryPath
                   resolve:(nonnull RCTPromiseResolveBlock)resolve
                    reject:(nonnull RCTPromiseRejectBlock)reject {
  // No-op on iOS
  resolve(nil);
}

- (void)playHLA:(nonnull NSString *)path
        resolve:(nonnull RCTPromiseResolveBlock)resolve
         reject:(nonnull RCTPromiseRejectBlock)reject {
  // No-op on iOS
  resolve(nil);
}

- (void)playOGG:(nonnull NSString *)path
        resolve:(nonnull RCTPromiseResolveBlock)resolve
         reject:(nonnull RCTPromiseRejectBlock)reject {
  // No-op on iOS
  resolve(nil);
}

- (void)playPredefinedHaptics:(nonnull NSString *)signal {
  [hapticlabsInstance playPredefinedIOSVibration:signal];
}

- (void)preloadAndroidHaptics:(nonnull NSString *)directoryPath {
  // No-op on iOS
}

- (void)preloadOGG:(nonnull NSString *)path {
  // No-op on iOS
}

- (void)setAudioMute:(BOOL)mute {
  [hapticlabsInstance setAudioMute:mute];
}

- (void)setHapticsMute:(BOOL)mute {
  [hapticlabsInstance setHapticsMute:mute];
}

- (void)unloadAllAndroidHaptics {
  // No-op on iOS
}

- (void)unloadAndroidHaptics:(nonnull NSString *)path {
  // No-op on iOS
}

- (void)unloadOGG:(nonnull NSString *)path {
  // No-op on iOS
}

@end
