package net.sensornet.app.sensors

import android.content.Context
import android.net.wifi.WifiManager
import org.json.JSONArray
import org.json.JSONObject
import java.security.MessageDigest

/**
 * Wi-Fi Telemetry Collector with Cryptographic Privacy
 * Maps Wi-Fi density, signal levels, and frequency bands.
 * To protect personal privacy, all MAC addresses (BSSID) and SSIDs are
 * cryptographically hashed with a daily salt before aggregation.
 */
class WifiCollector(private val context: Context) {

    private val wifiManager = context.applicationContext.getSystemService(Context.WIFI_SERVICE) as? WifiManager
    private val salt = "sensornet_depin_salt_${System.currentTimeMillis() / (1000 * 60 * 60 * 24)}"

    fun readWifiMetrics(): JSONObject {
        val result = JSONObject()
        if (wifiManager == null) {
            result.put("status", "UNAVAILABLE")
            return result
        }

        try {
            val scanResults = wifiManager.scanResults ?: emptyList()
            result.put("totalAccessPointsFound", scanResults.size)

            val apArray = JSONArray()
            // Sample up to 8 strongest access points
            val sortedList = scanResults.sortedByDescending { it.level }.take(8)

            for (ap in sortedList) {
                val apObj = JSONObject().apply {
                    put("bssidHash", hashWithSalt(ap.BSSID ?: "unknown"))
                    put("rssiDbm", ap.level)
                    put("frequencyMhz", ap.frequency)
                    put("band", if (ap.frequency > 5000) "5GHz/6GHz" else "2.4GHz")
                    put("channelWidth", ap.channelWidth)
                }
                apArray.put(apObj)
            }

            result.put("sampledAccessPoints", apArray)

            // Current connected Wi-Fi info if applicable
            val connectionInfo = wifiManager.connectionInfo
            if (connectionInfo != null && connectionInfo.networkId != -1) {
                val currentObj = JSONObject().apply {
                    put("connectedRssiDbm", connectionInfo.rssi)
                    put("linkSpeedMbps", connectionInfo.linkSpeed)
                    put("frequencyMhz", connectionInfo.frequency)
                }
                result.put("currentConnection", currentObj)
            }
        } catch (e: SecurityException) {
            result.put("status", "PERMISSION_DENIED")
        } catch (e: Exception) {
            result.put("error", e.message)
        }

        return result
    }

    private fun hashWithSalt(input: String): String {
        val md = MessageDigest.getInstance("SHA-256")
        val bytes = md.digest((input + salt).toByteArray())
        return bytes.take(8).joinToString("") { "%02x".format(it) }
    }
}
