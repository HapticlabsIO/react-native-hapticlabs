import AVFoundation
import CoreHaptics
import Foundation
import React
import UIKit
import os

class AHAPSyncPlayer {
  private var engine: CHHapticEngine

  init(engine: CHHapticEngine) {
    self.engine = engine
  }

  func play(
    ahapURLs: [URL], resolve: @escaping RCTPromiseResolveBlock,
    reject: @escaping RCTPromiseRejectBlock
  ) throws {
    // Load all referenced AHAP files into memory to reduce latency.
    let ahapDatas = ahapURLs.map { try! Data(contentsOf: $0) }

    return try self.play(ahapDatas: ahapDatas, resolve: resolve, reject: reject, isRetry: false)
  }

  func play(
    ahapDatas: [Data], resolve: @escaping RCTPromiseResolveBlock,
    reject: @escaping RCTPromiseRejectBlock, isRetry: Bool
  ) throws {
    // Start the engine in case it's idle.
    try self.engine.start()

    // Play all patterns.
    for ahapData in ahapDatas {
      do {
        try self.engine.playPattern(from: ahapData)
      } catch {
        // Failed to play the AHAP pattern.

        // Stop
        self.engine.stop()

        // Try again
        if !isRetry {
          return try self.play(
            ahapDatas: ahapDatas, resolve: resolve, reject: reject, isRetry: true)
        } else {
          reject("Error", "Failed to play AHAPs: \(error)", nil)
          return
        }
      }
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

@objc
public class HapticlabsImpl: NSObject {
  var engine: CHHapticEngine?
  // Store AVAudioPlayers to keep them alive during playback
  var audioPlayersStore: [AVAudioPlayer]? = nil

  public override init() {
    super.init()
    createEngine()
  }

  func playAHAPs(
    ahapPaths: [String], resolve: @escaping RCTPromiseResolveBlock,
    reject: @escaping RCTPromiseRejectBlock
  ) {
    print("[Hapticlabs] playAHAPs called with paths: \(ahapPaths)")
    // Create an array of URLs from the AHAP file names.
    let urls = ahapPaths.compactMap { URL(string: "file://" + $0) }
    var datas: [Data] = []

    let fileManager = FileManager.default
    let documentsDirectory = fileManager.urls(
      for: .documentDirectory, in: .userDomainMask
    ).first!

    // Keep track of the timestamps at which to play audio directly
    var audioFileTimestamps: [String: [Double]] = [:]

    let decoder = JSONDecoder()
    do {
      // Read the AHAP files and check if any audio files need to be copied to the documents directory.
      for ahapURL in urls {
        // Keep track of total uncompressed samples and files to play directly
        var totalSamples: Int = 0
        var audioFilesToPlayDirectly: [String] = []
        var filteredAudioFileNames: [String] = []

        // Load the ahap file
        let data = try Data(contentsOf: ahapURL)

        let parentDirectoryURL = ahapURL.deletingLastPathComponent()

        let ahap = try decoder.decode(AHAP.self, from: data)
        // Code to execute when decoding is successful
        // Extract AHAP_FILES from the description
        let description = ahap.Metadata.Description
        let descriptionParts = description.split(separator: "\n")

        if let supportingAudioDescriptionPartIndex = descriptionParts.firstIndex(where: {
          $0.starts(with: "AUDIO_FILES=")
        }) {
          let audioFormat = "^AUDIO_FILES=\\[((?:[^,]*?)(?:,[^,]*?)*)\\]$"
          let audioRegex = try! NSRegularExpression(pattern: audioFormat, options: [])
          let audioDescriptionPart = String(descriptionParts[supportingAudioDescriptionPartIndex])

          if let match = audioRegex.firstMatch(
            in: audioDescriptionPart, options: [],
            range: NSRange(location: 0, length: audioDescriptionPart.utf16.count))
          {
            if let range = Range(match.range(at: 1), in: audioDescriptionPart) {
              let audioFilesString = audioDescriptionPart[range]
              let arrayOfAudioFileNameStrings = audioFilesString.split(separator: ",").map {
                $0.trimmingCharacters(in: .whitespacesAndNewlines)
              }

              // Copy the audio files to the documents directory

              for audioFileNameString in arrayOfAudioFileNameStrings {
                let sourceAudioURL = parentDirectoryURL.appendingPathComponent(audioFileNameString)

                // The audio file is in the same directory as the AHAP file
                let audioFileName = audioFileNameString.split(separator: ".").dropLast().joined(
                  separator: ".")
                let audioFileExtension = audioFileNameString.split(separator: ".").last!

                let targetAudioURL = documentsDirectory.appendingPathComponent(
                  String(audioFileName)
                ).appendingPathExtension(String(audioFileExtension))

                // Copy the file to the documents directory if it doesn't already exist
                if !fileManager.fileExists(atPath: targetAudioURL.path) {
                  do {
                    try fileManager.copyItem(at: sourceAudioURL, to: targetAudioURL)
                  } catch {
                    reject(
                      "Error", "Failed to copy audio file to documents directory: \(error)", nil)
                    return
                  }
                }

                // Get audio file properties
                let asset = AVURLAsset(url: targetAudioURL)
                guard
                  let format = asset.tracks(withMediaType: .audio).first?.formatDescriptions
                    .first as! CMAudioFormatDescription?,
                  let asbd = CMAudioFormatDescriptionGetStreamBasicDescription(format)
                else {
                  print("[Hapticlabs] Could not get audio format for \(audioFileNameString)")
                  continue
                }
                let sampleRate = Int(asbd.pointee.mSampleRate)
                let channelCount = Int(asbd.pointee.mChannelsPerFrame)
                let durationSeconds = asset.duration.seconds
                let samples = Int(Double(sampleRate * channelCount) * durationSeconds)

                if filteredAudioFileNames.contains(audioFileNameString) {
                  // Already included
                  continue
                }
                if totalSamples + samples > (1 << 21) {
                  // Exceeds limit, mark for direct playback
                  audioFilesToPlayDirectly.append(audioFileNameString)
                  continue  // Do not copy or include in AHAP
                } else {
                  totalSamples += samples
                  filteredAudioFileNames.append(audioFileNameString)
                }
              }

            }
          }
        }

        let fullAHAP = try JSONSerialization.jsonObject(with: data)

        // Iterate the Pattern array to find Events with EventType "AudioCustom"
        // and "WaveformPath" matching audio files to play directly
        // Delete those events from the AHAP, and record their timestamps
        if var fullAHAPDict = fullAHAP as? [String: Any],
          let patternArray = fullAHAPDict["Pattern"] as? [[String: Any]]
        {
          var newPatternArray: [[String: Any]] = []
          for element in patternArray {
            // Look for an "Event" object with "EventType" == "AudioCustom"
            if let event = element["Event"] as? [String: Any],
              let eventTypeValue = event["EventType"] as? String,
              eventTypeValue == "AudioCustom",
              let path = event["EventWaveformPath"] as? String
            {
              // Check if this path is in the audioFilesToPlayDirectly list
              if audioFilesToPlayDirectly.contains(path) {
                // Record the timestamp
                let time = event["Time"] as? Double ?? 0.0
                if audioFileTimestamps[path] != nil {
                  audioFileTimestamps[path]?.append(time)
                } else {
                  audioFileTimestamps[path] = [time]
                }
                // Skip adding this element to the new pattern array
                continue
              }
            }

            // Not an audio event to play directly, keep it
            newPatternArray.append(element)
          }
          fullAHAPDict["Pattern"] = newPatternArray
          let modifiedData = try JSONSerialization.data(
            withJSONObject: fullAHAPDict, options: [])
          datas.append(modifiedData)
        } else {
          datas.append(data)
        }
      }
    } catch {
      reject("Error", "Failed to parse AHAP \(error)", nil)
      return
    }

    if let goodEngine = engine {
      let player = AHAPSyncPlayer(engine: goodEngine)
      do {
        // Prepare AVAudioPlayers for each audio file and timestamp
        let audioPlayerQueue = DispatchQueue(label: "com.hapticlabs.audioplayerqueue")
        if self.audioPlayersStore == nil {
          self.audioPlayersStore = []
        }
        // Dictionary to store prepared players for each audio file
        var preparedAudioPlayers: [String: [AVAudioPlayer]] = [:]
        for (audioFileName, timestamps) in audioFileTimestamps {
          let audioFileURL = documentsDirectory.appendingPathComponent(audioFileName)
          var audioPlayers: [AVAudioPlayer] = []
          for _ in timestamps {
            do {
              let player = try AVAudioPlayer(contentsOf: audioFileURL)
              player.prepareToPlay()
              audioPlayers.append(player)
              self.audioPlayersStore?.append(player)
            } catch {
              print("[Hapticlabs] Failed to create audio player for \(audioFileName): \(error)")
              let dummyPlayer = AVAudioPlayer()
              audioPlayers.append(dummyPlayer)
              self.audioPlayersStore?.append(dummyPlayer)
            }
          }
          preparedAudioPlayers[audioFileName] = audioPlayers
        }

        // Start the AHAPs (haptics) playback
        try player.play(ahapDatas: datas, resolve: resolve, reject: reject, isRetry: false)

        // Schedule audio playback after starting haptics
        let now = DispatchTime.now()
        for (audioFileName, timestamps) in audioFileTimestamps {
          guard let audioPlayers = preparedAudioPlayers[audioFileName] else { continue }
          for (index, timestamp) in timestamps.enumerated() {
            if timestamp == 0 {
              audioPlayers[index].play()
            } else {
              audioPlayerQueue.asyncAfter(deadline: now + timestamp) {
                let player = audioPlayers[index]
                player.play()
              }
            }
            // Schedule removal of the player after playback finishes
            let removalTime = now + timestamp + audioPlayers[index].duration + 1.0
            let removablePlayer = audioPlayers[index]
            audioPlayerQueue.asyncAfter(deadline: removalTime) {
              if let idx = self.audioPlayersStore?.firstIndex(of: removablePlayer) {
                self.audioPlayersStore?.remove(at: idx)
              }
            }
          }
        }

      } catch {
        reject("Error", "Failed to play AHAPs", nil)
      }
    }
  }

  @objc(setHapticsMute:)
  public func setHapticsMute(mute: Bool) {
    // Mute haptics
    engine?.isMutedForHaptics = mute
  }

  @objc(setAudioMute:)
  public func setAudioMute(mute: Bool) {
    // Mute audio
    engine?.isMutedForAudio = mute
  }

  @objc(isHapticsMuted:withRejecter:)
  public func isHapticsMuted(
    resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock
  ) {
    resolve(engine?.isMutedForHaptics)
  }

  @objc(isAudioMuted:withRejecter:)
  public func isAudioMuted(
    resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock
  ) {
    resolve(engine?.isMutedForAudio)
  }

  @objc(playAHAP:withResolver:withRejecter:)
  public func playAHAP(
    ahapPath: String, resolve: @escaping RCTPromiseResolveBlock,
    reject: @escaping RCTPromiseRejectBlock
  ) {
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

        if let supportingAHAPDescriptionPartIndex = descriptionParts.firstIndex(where: {
          $0.starts(with: "AHAP_FILES=")
        }) {
          let ahapFormat = "^AHAP_FILES=\\[((?:[^,]*?)(?:,[^,]*?)*)\\]$"
          let ahapRegex = try! NSRegularExpression(pattern: ahapFormat, options: [])
          let ahapDescriptionPart = String(descriptionParts[supportingAHAPDescriptionPartIndex])

          if let match = ahapRegex.firstMatch(
            in: ahapDescriptionPart, options: [],
            range: NSRange(location: 0, length: ahapDescriptionPart.utf16.count))
          {
            if let range = Range(match.range(at: 1), in: ahapDescriptionPart) {
              let ahapFilesString = ahapDescriptionPart[range]
              let arrayOfAHAPFileNameStrings = ahapFilesString.split(separator: ",").map {
                $0.trimmingCharacters(in: .whitespacesAndNewlines)
              }

              // Add the parent directory to the file names
              otherPaths = arrayOfAHAPFileNameStrings.map {
                parentDirectoryURL!.appendingPathComponent($0).path
              }
            }
          }
        }
      } catch {
        reject("Error", "Failed to parse AHAP \(error)", nil)
        return
      }

      playAHAPs(ahapPaths: [ahapPath] + otherPaths, resolve: resolve, reject: reject)

    } catch {
      reject("Error", "Failed to load ahap: " + ahapPath + " because \(error)", nil)
      return
    }
  }

  @objc(playPredefinedIOSVibration:)
  public func playPredefinedIOSVibration(_ name: String) {
    // Log the received data
    if name == "light" {
      let feedbackGenerator = UIImpactFeedbackGenerator(style: .light)
      feedbackGenerator.prepare()

      feedbackGenerator.impactOccurred()
    } else if name == "heavy" {
      let feedbackGenerator = UIImpactFeedbackGenerator(style: .heavy)
      feedbackGenerator.prepare()

      feedbackGenerator.impactOccurred()
    } else if name == "medium" {
      let feedbackGenerator = UIImpactFeedbackGenerator(style: .medium)
      feedbackGenerator.prepare()

      feedbackGenerator.impactOccurred()
    } else if name == "rigid" {
      let feedbackGenerator = UIImpactFeedbackGenerator(style: .rigid)
      feedbackGenerator.prepare()

      feedbackGenerator.impactOccurred()
    } else if name == "soft" {
      let feedbackGenerator = UIImpactFeedbackGenerator(style: .soft)
      feedbackGenerator.prepare()

      feedbackGenerator.impactOccurred()
    } else if name == "error" {
      let notificationFeedbackGenerator = UINotificationFeedbackGenerator()
      notificationFeedbackGenerator.notificationOccurred(.error)
    } else if name == "warning" {
      let notificationFeedbackGenerator = UINotificationFeedbackGenerator()
      notificationFeedbackGenerator.notificationOccurred(.warning)
    } else if name == "success" {
      let notificationFeedbackGenerator = UINotificationFeedbackGenerator()
      notificationFeedbackGenerator.notificationOccurred(.success)
    } else if name == "selection" {
      let selectionFeedbackGenerator = UISelectionFeedbackGenerator()
      selectionFeedbackGenerator.prepare()
      selectionFeedbackGenerator.selectionChanged()
    }
  }

  func createEngine() {

    // Create and configure a haptic engine.
    do {
      engine = try CHHapticEngine()
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

    engine.isMutedForAudio = false
    engine.isMutedForHaptics = false
  }
}
