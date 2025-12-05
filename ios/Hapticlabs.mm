#import "Hapticlabs.h"
#import <react_native_hapticlabs-Swift.h>

@implementation Hapticlabs

RCT_EXPORT_MODULE()

// Create an instance
HapticlabsImpl *hapticlabsInstance = [[HapticlabsImpl alloc] init];

RCT_REMAP_METHOD(isAudioMuted, isAudioResolve:(nonnull RCTPromiseResolveBlock) resolve
                 reject:(nonnull RCTPromiseRejectBlock) reject){
  return [hapticlabsInstance isAudioMuted:resolve withRejecter:reject];
}
RCT_REMAP_METHOD(isHapticsMuted, isHapticsResolve:(nonnull RCTPromiseResolveBlock) resolve
                 reject:(nonnull RCTPromiseRejectBlock) reject){
  return [hapticlabsInstance isHapticsMuted:resolve withRejecter:reject];
}
RCT_REMAP_METHOD(playAHAP, playAHAPPath:(nonnull NSString *)path
                 resolve:(nonnull RCTPromiseResolveBlock) resolve
                 reject:(nonnull RCTPromiseRejectBlock) reject){
  return [hapticlabsInstance playAHAP:path withResolver:resolve withRejecter:reject];
}
RCT_REMAP_METHOD(playAndroidHaptics, playAndroidHapticsPath:(nonnull NSString *)directoryPath
                 resolve:(nonnull RCTPromiseResolveBlock) resolve
                 reject:(nonnull RCTPromiseRejectBlock) reject){
  // No-op on iOS
  resolve(nil);
}
RCT_REMAP_METHOD(playHLA, playHLAPath:(nonnull NSString *)path
                 resolve:(nonnull RCTPromiseResolveBlock) resolve
                 reject:(nonnull RCTPromiseRejectBlock) reject){
  // No-op on iOS
  resolve(nil);
}
RCT_REMAP_METHOD(playOGG, playOGGPath:(nonnull NSString *)path
                 resolve:(nonnull RCTPromiseResolveBlock) resolve
                 reject:(nonnull RCTPromiseRejectBlock) reject){
  // No-op on iOS
  resolve(nil);
}
RCT_REMAP_METHOD(playPredefinedHaptics, playPredefinedHapticsArg:(nonnull NSString *)signal){
  [hapticlabsInstance playPredefinedIOSVibration:signal];
}
RCT_REMAP_METHOD(preloadAndroidHaptics, preloadAndroidHapticsPath:(nonnull NSString *)directoryPath){
  // No-op on iOS
}
RCT_REMAP_METHOD(preloadOGG, preloadOGGPath:(nonnull NSString *)path){
  // No-op on iOS
}
RCT_REMAP_METHOD(setAudioMute, setAudioMuteArg:(BOOL)mute){
  [hapticlabsInstance setAudioMute:mute];
}
RCT_REMAP_METHOD(setHapticsMute, setHapticsMuteArg:(BOOL)mute){
  [hapticlabsInstance setHapticsMute:mute];
}
RCT_REMAP_METHOD(unloadAllAndroidHaptics, unloadAllAndroidHapticsSignature){
  // No-op on iOS
}
RCT_REMAP_METHOD(unloadAndroidHaptics, unloadAndroidHapticsPath:(nonnull NSString *)path){
  // No-op on iOS
}
RCT_REMAP_METHOD(unloadOGG, unloadOGGPath:(nonnull NSString *)path){
  // No-op on iOS
}
RCT_REMAP_METHOD(getAndroidConstants, getAndroidConstantsResolve:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject){
  // Return an empty dictionary as there are no Android constants on iOS
  resolve(@{});
}

// Thanks to this guard, we won't compile this code when we build for the old
// architecture.
#if RCT_NEW_ARCH_ENABLED
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
