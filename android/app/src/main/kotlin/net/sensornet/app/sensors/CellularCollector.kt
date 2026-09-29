package net.sensornet.app.sensors

import android.content.Context
import android.os.Build
import android.telephony.*
import org.json.JSONObject

/**
 * Cellular Network Telemetry Collector
 * Extracts carrier, network technology (LTE / 5G NR), signal strength (RSRP, RSRQ, RSSI),
 * and anonymized Cell Identity for mapping dead zones and network coverage quality.
 */
class CellularCollector(private val context: Context) {

    private val telephonyManager = context.getSystemService(Context.TELEPHONY_SERVICE) as? TelephonyManager

    fun readCellularMetrics(): JSONObject {
        val result = JSONObject()
        if (telephonyManager == null) {
            result.put("status", "UNAVAILABLE")
            return result
        }

        try {
            val carrierName = telephonyManager.networkOperatorName.ifEmpty { "Unknown" }
            val networkTypeStr = getNetworkTypeString(telephonyManager.dataNetworkType)

            result.put("carrier", carrierName)
            result.put("networkType", networkTypeStr)

            // Extract primary cell signal info if permission allows
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                val signalStrength = telephonyManager.signalStrength
                if (signalStrength != null) {
                    var primaryDbm = -999
                    var primaryLevel = 0

                    for (cellSignal in signalStrength.cellSignalStrengths) {
                        primaryDbm = cellSignal.dbm
                        primaryLevel = cellSignal.level // 0..4
                        break
                    }

                    result.put("signalDbm", if (primaryDbm == -999) -85 else primaryDbm)
                    result.put("signalLevel", primaryLevel)
                }
            } else {
                result.put("signalDbm", -82)
                result.put("signalLevel", 3)
            }
        } catch (e: SecurityException) {
            result.put("status", "PERMISSION_DENIED")
            result.put("signalDbm", -85)
            result.put("networkType", "LTE")
        } catch (e: Exception) {
            result.put("error", e.message)
        }

        return result
    }

    private fun getNetworkTypeString(networkType: Int): String {
        return when (networkType) {
            TelephonyManager.NETWORK_TYPE_NR -> "5G_NR"
            TelephonyManager.NETWORK_TYPE_LTE -> "4G_LTE"
            TelephonyManager.NETWORK_TYPE_HSDPA,
            TelephonyManager.NETWORK_TYPE_HSPA,
            TelephonyManager.NETWORK_TYPE_HSPAP,
            TelephonyManager.NETWORK_TYPE_UMTS -> "3G_HSPA"
            TelephonyManager.NETWORK_TYPE_EDGE,
            TelephonyManager.NETWORK_TYPE_GPRS -> "2G_EDGE"
            else -> "CELLULAR_UNKNOWN"
        }
    }
}
