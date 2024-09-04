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
import android.content.res.AssetManager
import com.google.gson.Gson
import com.google.gson.JsonArray
import com.google.gson.JsonObject
import java.io.File
import java.io.FileOutputStream
import java.io.FileInputStream
import java.io.InputStream
import java.io.IOException
import java.nio.charset.StandardCharsets
import android.media.*
import java.io.ByteArrayOutputStream
import java.nio.ByteBuffer
import android.media.audiofx.HapticGenerator

private fun isAssetPath(path: String, reactContext: ReactApplicationContext): Boolean {
    return try {
        reactContext.assets.open(path).close()
        true
    } catch (e: IOException) {
        false
    }
}

private fun getUncompressedPath(path: String, reactContext: ReactApplicationContext): String {
  if (isAssetPath(path, reactContext)) {
    return getUncompressedAssetPath(path, reactContext)
  } else {
    return path
  }
}

private fun getUncompressedAssetPath(assetName: String, reactContext: ReactApplicationContext): String {
    val uncompressedDir = File(reactContext.filesDir, "hapticlabs_uncompressed")
    if (!uncompressedDir.exists()) {
        uncompressedDir.mkdirs()
    }

    val outFile = File(uncompressedDir, assetName)
    val outDir = outFile.parentFile
    if (!outDir.exists()) {
        outDir.mkdirs()
    }

    if (outFile.exists()) {
        return outFile.absolutePath
    }

    try {
        val inputStream: InputStream = reactContext.assets.open(assetName)
        val outputStream = FileOutputStream(outFile)

        val buffer = ByteArray(1024)
        var length: Int
        while (inputStream.read(buffer).also { length = it } > 0) {
            outputStream.write(buffer, 0, length)
        }

        inputStream.close()
        outputStream.close()
    } catch (e: IOException) {
        e.printStackTrace()
        // Handle error
    }

    return outFile.absolutePath
}

class HapticlabsModule(private val reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

    private val hapticSupportLevel = determineHapticSupportLevel()

    private var mediaPlayer: MediaPlayer? = null
    private var handler: Handler? = null

    private fun determineHapticSupportLevel(): Int {
        var level = 0
        val vibratorManager = reactContext.getSystemService(Context.VIBRATOR_MANAGER_SERVICE) as VibratorManager
        val vibrator = vibratorManager.getDefaultVibrator();
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
        return // Do nothing
      }
      1 -> {
        val path = directoryPath + "/lvl1/main.hla"
        return playHLA(path, promise)
      }
      2 -> {
        val path = directoryPath + "/lvl2/main.hla"
        return playHLA(path, promise)
      }
      3 -> {
        val path = directoryPath + "/lvl3/main.ogg"
        return playOGG(path, promise)
      }
    }
  }

  @ReactMethod
  fun playHLA(path: String, promise: Promise)  {
    val data: String

    val uncompressedPath = getUncompressedPath(path, reactContext)

    try {
      val file = File(uncompressedPath)
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

    val durationMs = jsonObject.get("Duration").asLong

    val audiosArray = jsonObject.getAsJsonArray("Audios")

    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
        // Prepare the vibration
        val vibrationEffect = VibrationEffect.createWaveform(timings, amplitudes, repeat)
        val vibratorManager = reactContext.getSystemService(Context.VIBRATOR_MANAGER_SERVICE) as VibratorManager
        val vibrator = vibratorManager.getDefaultVibrator()

        val audioTrackPlayers = Array(audiosArray.size()) { AudioTrackPlayer("", reactContext) }
        val audioDelays = IntArray(audiosArray.size())

        // Get the directory of the hla file
        val assetManager: AssetManager = reactContext.assets
        val audioDirectoryPath = path.substringBeforeLast('/')

        // Prepare the audio files
        for (i in 0 until audiosArray.size()) {
            val audioObject = audiosArray[i].asJsonObject

            // Get the "Time" value
            val time = audioObject.get("Time").asInt

            // Get the "Filename" value
            val fileName = audioDirectoryPath + "/" + audioObject.get("Filename").asString

            val audioTrackPlayer = AudioTrackPlayer(fileName, reactContext)
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
            vibrator.vibrate(vibrationEffect)
        }, startTime)
        handler?.postAtTime({
            promise.resolve(null);
        }, startTime + durationMs)
    }
  }

  @ReactMethod
  fun playOGG(path: String, promise: Promise) {
    val uncompressedPath = getUncompressedPath(path, reactContext)
    mediaPlayer?.release()
    mediaPlayer = MediaPlayer()
    try {
      mediaPlayer?.setDataSource(uncompressedPath)
    } catch (e: IOException) {
        e.printStackTrace()
        promise.reject("Error reading file", e)
        return
    }

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

class AudioTrackPlayer(private val filePath: String, private val reactContext: ReactApplicationContext) {
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
        val uncompressedPath = getUncompressedPath(filePath, reactContext)
        extractor = MediaExtractor()
        try {
            extractor?.setDataSource(uncompressedPath)
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
