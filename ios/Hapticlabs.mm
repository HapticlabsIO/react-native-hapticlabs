#import <React/RCTBridgeModule.h>

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

@end
