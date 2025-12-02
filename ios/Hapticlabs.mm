#import <React/RCTBridgeModule.h>
#ifdef RCT_NEW_ARCH_ENABLED
#import "HapticlabsSpec.h"
#endif


@interface RCT_EXTERN_MODULE(Hapticlabs, NSObject)

RCT_EXTERN_METHOD(setHapticsMute:(BOOL)mute)
RCT_EXTERN_METHOD(isHapticsMuted:(RCTPromiseResolveBlock)resolve
                 withRejecter:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(setAudioMute:(BOOL)mute)
RCT_EXTERN_METHOD(isAudioMuted:(RCTPromiseResolveBlock)resolve
                 withRejecter:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(playAHAP:(NSString *)ahapPath
                 withResolver:(RCTPromiseResolveBlock)resolve
                 withRejecter:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(playPredefinedIOSVibration:(NSString *)effectName)

+ (BOOL)requiresMainQueueSetup
{
  return NO;
}

#ifdef RCT_NEW_ARCH_ENABLED
- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params
{
    return std::make_shared<facebook::react::HapticlabsSpecJSI>(params);
}
#endif

@end
