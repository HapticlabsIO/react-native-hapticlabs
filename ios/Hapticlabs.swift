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

  func play(ahapURLs: [URL], resolve: @escaping RCTPromiseResolveBlock,reject: @escaping RCTPromiseRejectBlock) throws {
    // Load all referenced AHAP files into memory to reduce latency.
    let ahapDatas = ahapURLs.map { try! Data(contentsOf: $0) }

    return try self.play(ahapDatas: ahapDatas, resolve: resolve, reject: reject)
  }

  func play(ahapDatas: [Data], resolve: @escaping RCTPromiseResolveBlock,  reject: @escaping RCTPromiseRejectBlock) throws {
    // Start the engine in case it's idle.
    try self.engine.start()

    // Play all patterns.
    for ahapData in ahapDatas {
      try self.engine.playPattern(from: ahapData)
    }
      
    // Use a weak reference to self to avoid retain cycles
    self.engine.notifyWhenPlayersFinished(finishedHandler: { error in
        if let error = error {
            reject("Error", "Failed to play AHAPs: \(error)", nil)
        } else {
            resolve(nil)
        }
        return .leaveEngineRunning
    })

    // self.engine.stop()
  }
}

struct AHAP: Codable {
    let Version: Int
    let Metadata: Metadata
    
    struct Metadata: Codable {
        let Project: String
        let Created: String
        let Description: String
    }
}

@objc(Hapticlabs)
class Hapticlabs: NSObject {
  var engine: CHHapticEngine?
  var audioPlayer: AVAudioPlayer?
  var feedbackGenerator: UIImpactFeedbackGenerator?

  override init() {
    super.init()
    createEngine()
  }

  
  func playAHAPs(ahapPaths: [String], resolve:@escaping RCTPromiseResolveBlock,reject:@escaping RCTPromiseRejectBlock){
    // Create an array of URLs from the AHAP file names.
    let urls = ahapPaths.compactMap{ URL(string: "file://" + $0) }
    var datas: [Data] = []

    let decoder = JSONDecoder()
    do {
      // Read the AHAP files and check if any audio files need to be copied to the documents directory.
      for ahapURL in urls {
        // Load the ahap file
        let data = try Data(contentsOf: ahapURL)
        datas.append(data)

        let parentDirectoryURL = ahapURL.deletingLastPathComponent()

        let ahap = try decoder.decode(AHAP.self, from: data)
        // Code to execute when decoding is successful
        // Extract AHAP_FILES from the description
        let description = ahap.Metadata.Description
        let descriptionParts = description.split(separator: "\n")

        if let supportingAudioDescriptionPartIndex = descriptionParts.firstIndex(where: { $0.starts(with: "AUDIO_FILES=") }) {
            let audioFormat = "^AUDIO_FILES=\\[((?:[^,]*?)(?:,[^,]*?)*)\\]$"
            let audioRegex = try! NSRegularExpression(pattern: audioFormat, options: [])
            let audioDescriptionPart = String(descriptionParts[supportingAudioDescriptionPartIndex])
            
            if let match = audioRegex.firstMatch(in: audioDescriptionPart, options: [], range: NSRange(location: 0, length: audioDescriptionPart.utf16.count)) {
                if let range = Range(match.range(at: 1), in: audioDescriptionPart) {
                    let audioFilesString = audioDescriptionPart[range]
                    let arrayOfAudioFileNameStrings = audioFilesString.split(separator: ",").map { $0.trimmingCharacters(in: .whitespacesAndNewlines) }

                    // Copy the audio files to the documents directory
                    let fileManager = FileManager.default
                    let documentsDirectory = fileManager.urls(for: .documentDirectory, in: .userDomainMask).first!

                    // Iterate through the audio file names and copy them to the documents directory
                    for audioFileNameString in arrayOfAudioFileNameStrings {
                        // The audio file is in the same directory as the AHAP file
                        let sourceAudioURL = parentDirectoryURL.appendingPathComponent(audioFileNameString)
                        
                        // Analyze the audio file name to get the file name and extension
                        // The fileName is everything before the last period
                        let audioFileName = audioFileNameString.split(separator: ".").dropLast().joined(separator: ".")
                        let audioFileExtension = audioFileNameString.split(separator: ".").last!

                        // The target audio file path in the documents directory
                        let targetAudioURL = documentsDirectory.appendingPathComponent(String(audioFileName)).appendingPathExtension(String(audioFileExtension))
                        if !fileManager.fileExists(atPath: targetAudioURL.path) {
                            do {
                                try fileManager.copyItem(at: sourceAudioURL, to: targetAudioURL)
                                print("sisisisisisisisisisisisisisisisisisissiisissisisisisisisisisi copied audio file from \(sourceAudioURL.path) to documents directory: \(targetAudioURL.path)")
                            } catch {
                                reject("Error", "Failed to copy audio file to documents directory: \(error)", nil)
                                return
                            }
                        }
                    }
                }
            }
        }
      }
    } catch {
      reject("Error", "Failed to parse AHAP \(error)", nil)
      return
    }

    if let goodEngine = engine {
      let player = AHAPSyncPlayer(engine: goodEngine)
      do {
        try player.play(ahapDatas: datas, resolve: resolve, reject: reject)
      } catch {
        reject("Error", "Failed to play AHAPs", nil)
      }
    }
  }

  @objc(playAHAP:withResolver:withRejecter:)
  func playAHAP(ahapPath: String, resolve: @escaping RCTPromiseResolveBlock,reject: @escaping RCTPromiseRejectBlock){
    // Find filenames from the AHAP
    // Load the ahap file

    let ahapURL = URL(string: "file://" + ahapPath)
    let parentDirectoryURL = ahapURL?.deletingLastPathComponent()
      do {
          let data = try Data(contentsOf: URL(string: "file://" + ahapPath)!)
    // Parse the json
    let decoder = JSONDecoder()

    var otherPaths: [String] = []
    do {
      let ahap = try decoder.decode(AHAP.self, from: data)
      // Code to execute when decoding is successful
      // Extract AHAP_FILES from the description
      let description = ahap.Metadata.Description
      let descriptionParts = description.split(separator: "\n")

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
    } catch {
      reject("Error", "Failed to parse AHAP \(error)", nil)
      return
    }

    playAHAPs(ahapPaths: [ahapPath] + otherPaths, resolve: resolve, reject: reject)
          
      } catch {
          reject("Error", "Failed to load ahap: " + ahapPath + " because \(error)",nil)
          return
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
