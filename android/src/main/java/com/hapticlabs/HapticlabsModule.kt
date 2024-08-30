package com.hapticlabs

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise
import android.content.Context
import android.os.Build
import android.os.Handler
import android.os.Looper
import android.os.VibratorManager
import android.os.SystemClock
import android.os.VibrationEffect
import android.os.Vibrator
import android.util.Log
import com.google.gson.Gson
import com.google.gson.JsonArray
import com.google.gson.JsonObject
import java.io.File
import java.io.FileInputStream
import java.io.IOException
import java.nio.charset.StandardCharsets
import android.media.*
import java.io.ByteArrayOutputStream
import java.nio.ByteBuffer
import android.media.audiofx.HapticGenerator


class HapticlabsModule(private val reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

    private val hapticSupportLevel = determineHapticSupportLevel()

    private var mediaPlayer: MediaPlayer? = null
    private var handler: Handler? = null

    private fun determineHapticSupportLevel(): Int {
        var level = 0
        val vibrator = reactContext.getSystemService(Context.VIBRATOR_SERVICE) as Vibrator?
        if (vibrator != null) {
            if (vibrator.hasVibrator()) {
                level = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    if (vibrator.hasAmplitudeControl()) {
                        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S && HapticGenerator.isAvailable()) {
                            3
                        } else {
                            2
                        }
                    } else {
                        1
                    }
                } else {
                    1
                }
            }
        } else {
            // Vibrator service not available
            level = 0
        }
        return level
    }

    override fun getConstants(): Map<String, Any> {
        val constants = HashMap<String, Any>()
        constants["hapticSupportLevel"] = hapticSupportLevel
        return constants
    }

  override fun getName(): String {
    return NAME
  }

  @ReactMethod
  fun playAndroidHaptics(directoryPath: String, promise: Promise) {
    // Switch by hapticSupportLevel
    when (hapticSupportLevel) {
      0 -> {
        Log.i("Hapticlabs", "Haptic feedback not supported on this device")
        return // Do nothing
      }
      1 -> {
        val path = directoryPath + "/1/main.hla"
        return playHLA(path, promise)
      }
      2 -> {
        val path = directoryPath + "/2/main.hla"
        return playHLA(path, promise)
      }
      3 -> {
        Log.i("Hapticlabs", "Full feedback")
        val path = directoryPath + "/3/main.ogg"
        return playOGG(path, promise)
      }
    }
  }

  @ReactMethod
  fun playHLA(path: String, promise: Promise)  {
    val data: String
    try {
        val file = File(path)
        val fis = FileInputStream(file)
        val dataBytes = ByteArray(file.length().toInt())
        fis.read(dataBytes)
        fis.close()
        data = String(dataBytes, StandardCharsets.UTF_8)
    } catch (e: IOException) {
        e.printStackTrace()
        promise.reject("Error reading file", e)
        return
    }

    // Parse the file to a JSON
    val gson = Gson()
    val jsonObject = gson.fromJson(data, JsonObject::class.java)

    // Extracting Amplitudes array
    val amplitudesArray = jsonObject.getAsJsonArray("Amplitudes")
    val amplitudes = IntArray(amplitudesArray.size())
    for (i in 0 until amplitudesArray.size()) {
        amplitudes[i] = amplitudesArray[i].asInt
    }

    // Extracting Repeat value
    val repeat = jsonObject.get("Repeat").asInt

    // Extracting Timings array
    val timingsArray = jsonObject.getAsJsonArray("Timings")
    val timings = LongArray(timingsArray.size())
    for (i in 0 until timingsArray.size()) {
        timings[i] = timingsArray[i].asLong
    }

    val audiosArray = jsonObject.getAsJsonArray("Audios")

    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
        // Prepare the vibration
        val vibrationEffect = VibrationEffect.createWaveform(timings, amplitudes, repeat)
        val vibratorManager = reactContext.getSystemService(Context.VIBRATOR_MANAGER_SERVICE) as VibratorManager
        val vibrator = vibratorManager.getDefaultVibrator()

        val audioTrackPlayers = Array(audiosArray.size()) { AudioTrackPlayer("") }
        val audioDelays = IntArray(audiosArray.size())

        // Get the directory of the hla file
        val directory = File(path).parent

        // Prepare the audio files
        for (i in 0 until audiosArray.size()) {
            val audioObject = audiosArray[i].asJsonObject

            // Get the "Time" value
            val time = audioObject.get("Time").asInt

            // Get the "Filename" value
            val fileName = directory + "/" + audioObject.get("Filename").asString

            val audioTrackPlayer = AudioTrackPlayer(fileName)
            audioTrackPlayer.preload()

            audioTrackPlayers[i] = audioTrackPlayer
            audioDelays[i] = time
        }

        val syncDelay = 0

        if (handler == null) {
          handler = Handler(Looper.getMainLooper())
        }

        val startTime = SystemClock.uptimeMillis() + syncDelay

        for (i in 0 until audiosArray.size()) {
            handler?.postAtTime({
                audioTrackPlayers[i].playAudio()
            }, startTime + audioDelays[i])
        }
        handler?.postAtTime({
            promise.resolve(null);
            vibrator.vibrate(vibrationEffect)
        }, startTime)
    }
  }

  @ReactMethod
  fun playOGG(path: String, promise: Promise) {
    Log.i("ogg", "Trying to play audio file: $path")
    mediaPlayer?.release()
    mediaPlayer = MediaPlayer()
    try {
        mediaPlayer?.setDataSource(path)
    } catch (e: IOException) {
        e.printStackTrace()
        Log.i("ogg", "Failed to play audio file: $path $e")
        promise.reject("Error reading file", e)
        return
    }
    Log.i("ogg", "Playing audio file: $path")
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
        mediaPlayer?.setAudioAttributes(
            AudioAttributes.Builder().setHapticChannelsMuted(false).build()
        )
    }
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
        val isAvailable = HapticGenerator.isAvailable()
        if (isAvailable) {
            val generator = HapticGenerator.create(mediaPlayer?.audioSessionId ?: 0)
            generator.setEnabled(false)
        }
    }
    try {
        mediaPlayer?.prepare()
    } catch (e: IOException) {
        e.printStackTrace()
    }
    mediaPlayer?.start()
    mediaPlayer?.setOnCompletionListener { mp ->
        // Playback completed, release resources
        mp.release()
        promise.resolve(null)
    }
  }

  companion object {
    const val NAME = "Hapticlabs"
  }
}

class AudioTrackPlayer(private val filePath: String) {
    private var audioTrack: AudioTrack? = null
    private var extractor: MediaExtractor? = null
    private var codec: MediaCodec? = null
    private var inputBuffers: Array<ByteBuffer>? = null
    private var outputBuffers: Array<ByteBuffer>? = null
    private var info: MediaCodec.BufferInfo? = null
    private val handler: Handler = Handler()
    private var isEOS = false

    /**
     * Preload the audio data from the file. This sets up the MediaExtractor and
     * MediaCodec and prepares the AudioTrack for playback.
     */
    fun preload() {
        extractor = MediaExtractor()
        try {
            extractor?.setDataSource(filePath)
            var format: MediaFormat? = null

            // Find the first audio track in the file
            for (i in 0 until extractor!!.trackCount) {
                format = extractor!!.getTrackFormat(i)
                val mime = format.getString(MediaFormat.KEY_MIME)
                if (mime?.startsWith("audio/") == true) {
                    extractor!!.selectTrack(i)
                    codec = MediaCodec.createDecoderByType(mime)
                    codec?.configure(format, null, null, 0)
                    break
                }
            }

            if (codec == null) {
                return // No suitable codec found
            }

            codec?.start()

            inputBuffers = codec?.inputBuffers
            outputBuffers = codec?.outputBuffers
            info = MediaCodec.BufferInfo()

            // Set up AudioTrack
            val sampleRate = format!!.getInteger(MediaFormat.KEY_SAMPLE_RATE)
            val channelCount = format.getInteger(MediaFormat.KEY_CHANNEL_COUNT)
            val channelConfig = if (channelCount == 1) AudioFormat.CHANNEL_OUT_MONO else AudioFormat.CHANNEL_OUT_STEREO
            val audioFormat = AudioFormat.ENCODING_PCM_16BIT

            val minBufferSize = AudioTrack.getMinBufferSize(sampleRate, channelConfig, audioFormat)
            val bufferSize = Math.max(minBufferSize, info!!.size)

            // Load the entire audio file into the AudioTrack
            val byteArrayOutputStream = ByteArrayOutputStream()

            while (!isEOS) {
                if (!isEOS) {
                    val inIndex = codec!!.dequeueInputBuffer(10000)
                    if (inIndex >= 0) {
                        val buffer = inputBuffers!![inIndex]
                        val sampleSize = extractor!!.readSampleData(buffer, 0)
                        if (sampleSize < 0) {
                            codec!!.queueInputBuffer(inIndex, 0, 0, 0, MediaCodec.BUFFER_FLAG_END_OF_STREAM)
                            isEOS = true
                        } else {
                            codec!!.queueInputBuffer(inIndex, 0, sampleSize, extractor!!.sampleTime, 0)
                            extractor!!.advance()
                        }
                    }
                }

                val outIndex = codec!!.dequeueOutputBuffer(info!!, 10000)
                when (outIndex) {
                    MediaCodec.INFO_OUTPUT_BUFFERS_CHANGED -> outputBuffers = codec!!.outputBuffers
                    MediaCodec.INFO_OUTPUT_FORMAT_CHANGED -> {
                    }
                    MediaCodec.INFO_TRY_AGAIN_LATER -> {}
                    else -> {
                        val outBuffer = outputBuffers!![outIndex]
                        val chunk = ByteArray(info!!.size)
                        outBuffer.get(chunk)
                        outBuffer.clear()
                        // Copy the chunk into the full buffer
                        try {
                            byteArrayOutputStream.write(chunk)
                        } catch (e: IOException) {
                            e.printStackTrace()
                        }
                        codec!!.releaseOutputBuffer(outIndex, false)
                    }
                }

                if (info!!.flags and MediaCodec.BUFFER_FLAG_END_OF_STREAM != 0) {
                    break
                }
            }
            codec!!.stop()
            codec!!.release()
            extractor!!.release()

            val fullBuffer = byteArrayOutputStream.toByteArray()

            audioTrack = AudioTrack(
                AudioManager.STREAM_MUSIC, sampleRate, channelConfig,
                audioFormat, fullBuffer.size, AudioTrack.MODE_STATIC
            )

            Log.i(
                "AudioTrackPlayer",
                "Writing full buffer to AudioTrack, length: ${fullBuffer.size} buffer size: $bufferSize"
            )

            audioTrack?.write(fullBuffer, 0, fullBuffer.size)

        } catch (e: IOException) {
            e.printStackTrace()
        }
    }

    /**
     * Internal method to handle audio playback. This method should be run in a
     * separate thread.
     */
    fun playAudio() {
        audioTrack?.play()
    }
}
