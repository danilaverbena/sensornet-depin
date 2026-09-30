package net.sensornet.app.sensors

import android.content.Context
import android.hardware.*
import org.json.JSONObject
import kotlin.math.sqrt

/**
 * Road Roughness & Pavement Quality Telemetry Collector
 * Uses the smartphone's IMU (Linear Accelerometer + Gyroscope) to detect:
 * 1. High-frequency road vibration (Root Mean Square / RMS acceleration)
 * 2. Severe vertical anomalies (Potholes, speed bumps, pavement cracks)
 * Converts mechanical motion into an International Roughness Index (IRI) proxy score (1.0..10.0).
 */
class RoadRoughnessCollector(context: Context) : SensorEventListener {

    private val sensorManager = context.getSystemService(Context.SENSOR_SERVICE) as? SensorManager
    private val accelerometer = sensorManager?.getDefaultSensor(Sensor.TYPE_ACCELEROMETER)
    private val gyroscope = sensorManager?.getDefaultSensor(Sensor.TYPE_GYROSCOPE)

    private val samples = mutableListOf<Float>()
    private var potholeCount = 0
    private var bumpCount = 0
    private val lock = Any()

    fun startMonitoring() {
        sensorManager?.let { sm ->
            accelerometer?.let { sm.registerListener(this, it, SensorManager.SENSOR_DELAY_GAME) }
            gyroscope?.let { sm.registerListener(this, it, SensorManager.SENSOR_DELAY_GAME) }
        }
    }

    fun stopMonitoring() {
        sensorManager?.unregisterListener(this)
    }

    override fun onSensorChanged(event: SensorEvent?) {
        if (event == null) return
        if (event.sensor.type == Sensor.TYPE_ACCELEROMETER) {
            val ax = event.values[0]
            val ay = event.values[1]
            val az = event.values[2]

            // Calculate magnitude of dynamic acceleration (subtracting gravity ~9.81m/s^2)
            val magnitude = sqrt((ax * ax + ay * ay + az * az).toDouble()).toFloat()
            val dynamicDeviation = kotlin.math.abs(magnitude - SensorManager.GRAVITY_EARTH)

            synchronized(lock) {
                samples.add(dynamicDeviation)
                if (samples.size > 500) {
                    samples.removeAt(0)
                }

                // Peak detection for road anomalies
                if (dynamicDeviation > 5.5f) {
                    potholeCount++
                } else if (dynamicDeviation > 3.0f) {
                    bumpCount++
                }
            }
        }
    }

    override fun onAccuracyChanged(sensor: Sensor?, accuracy: Int) {}

    fun readAndResetMetrics(): JSONObject {
        synchronized(lock) {
            val result = JSONObject()
            if (samples.isEmpty()) {
                result.put("roughnessScore", 1.2) // Default smooth road
                result.put("roadQuality", "Smooth Asphalt")
                result.put("potholesDetected", 0)
                result.put("bumpsDetected", 0)
                return result
            }

            // Calculate RMS (Root Mean Square)
            val meanSquare = samples.map { it * it }.average()
            val rms = sqrt(meanSquare).toFloat()

            // Normalized Roughness Index: 1.0 (Flawless) to 10.0 (Severe Off-Road / Destroyed)
            val roughnessIndex = ((rms / 4.0f) * 9.0f + 1.0f).coerceIn(1.0f, 10.0f)

            val qualityRating = when {
                roughnessIndex < 2.5f -> "Smooth Pavement"
                roughnessIndex < 4.5f -> "Moderate / Minor Cracks"
                roughnessIndex < 7.0f -> "Rough / Patchwork"
                else -> "Severe Degradation / Potholes"
            }

            result.put("roughnessScore", String.format("%.2f", roughnessIndex).toDouble())
            result.put("roadQuality", qualityRating)
            result.put("potholesDetected", potholeCount)
            result.put("bumpsDetected", bumpCount)
            result.put("sampleCount", samples.size)

            // Reset counters for next collection window
            samples.clear()
            potholeCount = 0
            bumpCount = 0

            return result
        }
    }
}
