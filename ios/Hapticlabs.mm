#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(Hapticlabs, NSObject)


RCT_EXTERN_METHOD(playAHAP:(NSString *)ahapPath
                 withResolver:(RCTPromiseResolveBlock)resolve
                 withRejecter:(RCTPromiseRejectBlock)reject)

+ (BOOL)requiresMainQueueSetup
{
  return NO;
}

@end
