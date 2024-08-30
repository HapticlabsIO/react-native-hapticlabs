import Foundation
import AVFoundation
import UIKit
import os
import CoreHaptics
import MobileCoreServices
import React
import CoreNFC


class AHAPSyncPlayer {
  private var engine: CHHapticEngine

  init(engine: CHHapticEngine) {
    self.engine = engine
  }

  func play(ahapURLs: [URL]) throws {
    // Load all referenced AHAP files into memory to reduce latency.
    let ahapDatas = ahapURLs.map { try! Data(contentsOf: $0) }

    // Start the engine in case it's idle.
   try self.engine.start()

    // Play all patterns.
    for ahapData in ahapDatas {
      try self.engine.playPattern(from: ahapData)
    }

    // self.engine.stop()
  }
}

struct AHAP: Codable {
    let version: Int
    let metadata: Metadata
    
    struct Metadata: Codable {
        let project: String
        let created: String
        let description: String
    }
}

@objc(Hapticlabs)
class Hapticlabs: NSObject {
  var engine: CHHapticEngine?
  var audioPlayer: AVAudioPlayer?
  var feedbackGenerator: UIImpactFeedbackGenerator?

  @objc(multiply:withB:withResolver:withRejecter:)
  func multiply(a: Float, b: Float, resolve:RCTPromiseResolveBlock,reject:RCTPromiseRejectBlock) -> Void {
    resolve(a*b)
  }

  override init() {
      super.init()
    createEngine()
  }

  
  func playAHAPs(ahapPaths: [String], resolve:RCTPromiseResolveBlock,reject:RCTPromiseRejectBlock){
    // Create an array of URLs from the AHAP file names.
    let urls = ahapPaths.compactMap{ URL(string: "file://" + $0) }
    if let goodEngine = engine {
      let player = AHAPSyncPlayer(engine: goodEngine)
      do {
        try player.play(ahapURLs: urls)
      } catch {
        reject("Error", "Failed to play AHAPs", nil)
      }
    }
    resolve(nil);
  }

  @objc(playAHAP:withResolver:withRejecter:)
  func playAHAP(ahapPath: String, resolve:RCTPromiseResolveBlock,reject:RCTPromiseRejectBlock){
    // Find filenames from the AHAP
    // Load the ahap file

    var ahapURL = URL(string: "file://" + ahapPath)
    var parentDirectoryURL = ahapURL?.deletingLastPathComponent()
      do {
          let data = try Data(contentsOf: URL(string: "file://" + ahapPath)!)
    // Parse the json
    let decoder = JSONDecoder()

    var otherPaths: [String] = []
    if let ahap = try? decoder.decode(AHAP.self, from: data) {
      // Code to execute when decoding is successful
      // Extract AHAP_FILES from the description
      let description = ahap.metadata.description
      var descriptionParts = description.split(separator: "\n")

      if let supportingAHAPDescriptionPartIndex = descriptionParts.firstIndex(where: { $0.starts(with: "AHAP_FILES=") }) {
          let ahapFormat = "^AHAP_FILES=\\[((?:[^,]*?)(?:,[^,]*?)*)\\]$"
          let ahapRegex = try! NSRegularExpression(pattern: ahapFormat, options: [])
          let ahapDescriptionPart = String(descriptionParts[supportingAHAPDescriptionPartIndex])
          
          if let match = ahapRegex.firstMatch(in: ahapDescriptionPart, options: [], range: NSRange(location: 0, length: ahapDescriptionPart.utf16.count)) {
              if let range = Range(match.range(at: 1), in: ahapDescriptionPart) {
                  let ahapFilesString = ahapDescriptionPart[range]
                  let arrayOfAHAPFileNameStrings = ahapFilesString.split(separator: ",").map { $0.trimmingCharacters(in: .whitespacesAndNewlines) }

                  // Add the parent directory to the file names
                  otherPaths = arrayOfAHAPFileNameStrings.map { parentDirectoryURL!.appendingPathComponent($0).path }
              }
          }
      }
    } else {
      reject("Error", "Failed to parse AHAP", nil)
    }

    // Log the paths for good measure
    print("AHAP Path: \(ahapPath)")
    print("Other Paths: \(otherPaths)")

    playAHAPs(ahapPaths: [ahapPath] + otherPaths, resolve: resolve, reject: reject)
          
      } catch {
          reject("Error", "Failed to load ahap",nil)
      }
  }
  
  func createEngine() {
    
    // Create and configure a haptic engine.
    do {
      // Associate the haptic engine with the default audio session
      // to ensure the correct behavior when playing audio-based haptics.

      let audioSession = AVAudioSession.sharedInstance()
      engine = try CHHapticEngine(audioSession: audioSession)
    } catch _ {
    }
    
    guard let engine = engine else {
      print("Failed to create engine!")
      return
    }
    
    // The stopped handler alerts you of engine stoppage due to external causes.
    engine.stoppedHandler = { reason in
      print("The engine stopped for reason: \(reason.rawValue)")
      switch reason {
      case .audioSessionInterrupt:
        print("Audio session interrupt")
      case .applicationSuspended:
        print("Application suspended")
      case .idleTimeout:
        print("Idle timeout")
      case .systemError:
        print("System error")
      case .notifyWhenFinished:
        print("Playback finished")
      case .gameControllerDisconnect:
        print("Controller disconnected.")
      case .engineDestroyed:
        print("Engine destroyed.")
      @unknown default:
        print("Unknown error")
      }
    }
    
    // The reset handler provides an opportunity for your app to restart the engine in case of failure.
    engine.resetHandler = {
      // Try restarting the engine.
      do {
        try engine.start()
      } catch {
        print("Failed to restart the engine: \(error)")
      }
    }
  }
}
