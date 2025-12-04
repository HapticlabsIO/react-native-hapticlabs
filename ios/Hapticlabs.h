#import <Foundation/Foundation.h>

#ifdef RCT_NEW_ARCH_ENABLED

#import <HapticlabsSpec/HapticlabsSpec.h>
@interface Hapticlabs: NSObject <NativeHapticlabsSpec>

#else

#import <React/RCTBridgeModule.h>
@interface Hapticlabs: NSObject <RCTBridgeModule>

#endif

@end
