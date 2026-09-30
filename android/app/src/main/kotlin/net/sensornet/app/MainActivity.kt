package net.sensornet.app

import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Build
import android.os.Bundle
import android.widget.Button
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import androidx.lifecycle.lifecycleScope
import kotlinx.coroutines.launch
import net.sensornet.app.services.TelemetryCollectorService
import net.sensornet.app.solana.SeedVaultManager

class MainActivity : AppCompatActivity() {

    private lateinit var seedVaultManager: SeedVaultManager
    private var isCollecting = false
    private var connectedWallet: String? = null

    companion object {
        private const val PERMISSION_REQUEST_CODE = 101
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        seedVaultManager = SeedVaultManager(this)

        setupUI()
        checkAndRequestPermissions()
    }

    private fun setupUI() {
        val btnToggle = findViewById<Button>(R.id.btnToggleCollection)
        val btnConnectWallet = findViewById<Button>(R.id.btnConnectWallet)
        val tvWalletStatus = findViewById<TextView>(R.id.tvWalletStatus)
        val tvStatus = findViewById<TextView>(R.id.tvServiceStatus)

        btnToggle.setOnClickListener {
            if (isCollecting) {
                stopTelemetryService()
                btnToggle.text = "START DEPIN COLLECTION"
                tvStatus.text = "Status: IDLE"
                isCollecting = false
            } else {
                startTelemetryService()
                btnToggle.text = "STOP DEPIN COLLECTION"
                tvStatus.text = "Status: ACTIVE — MAPPING TILES"
                isCollecting = true
            }
        }

        btnConnectWallet.setOnClickListener {
            lifecycleScope.launch {
                val result = seedVaultManager.authorize()
                result.onSuccess { auth ->
                    connectedWallet = auth.publicKey
                    val shortAddr = "${auth.publicKey.take(4)}...${auth.publicKey.takeLast(4)}"
                    tvWalletStatus.text = "Seed Vault: $shortAddr (Seeker V2)"
                    btnConnectWallet.text = "CONNECTED"
                    Toast.makeText(this@MainActivity, "Connected to Seed Vault!", Toast.LENGTH_SHORT).show()
                }.onFailure { err ->
                    Toast.makeText(this@MainActivity, "Wallet error: ${err.message}", Toast.LENGTH_LONG).show()
                }
            }
        }
    }

    private fun startTelemetryService() {
        val intent = Intent(this, TelemetryCollectorService::class.java).apply {
            action = TelemetryCollectorService.ACTION_START
        }
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            startForegroundService(intent)
        } else {
            startService(intent)
        }
    }

    private fun stopTelemetryService() {
        val intent = Intent(this, TelemetryCollectorService::class.java).apply {
            action = TelemetryCollectorService.ACTION_STOP
        }
        startService(intent)
    }

    private fun checkAndRequestPermissions() {
        val permissions = mutableListOf(
            Manifest.permission.ACCESS_FINE_LOCATION,
            Manifest.permission.ACCESS_COARSE_LOCATION,
            Manifest.permission.READ_PHONE_STATE
        )

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            permissions.add(Manifest.permission.ACTIVITY_RECOGNITION)
        }
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            permissions.add(Manifest.permission.POST_NOTIFICATIONS)
        }

        val missing = permissions.filter {
            ContextCompat.checkSelfPermission(this, it) != PackageManager.PERMISSION_GRANTED
        }

        if (missing.isNotEmpty()) {
            ActivityCompat.requestPermissions(this, missing.toTypedArray(), PERMISSION_REQUEST_CODE)
        }
    }

    override fun onRequestPermissionsResult(
        requestCode: Int,
        permissions: Array<out String>,
        grantResults: IntArray
    ) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        if (requestCode == PERMISSION_REQUEST_CODE) {
            if (grantResults.isNotEmpty() && grantResults.all { it == PackageManager.PERMISSION_GRANTED }) {
                Toast.makeText(this, "Permissions granted! Starting SensorNet...", Toast.LENGTH_SHORT).show()
                startTelemetryService()
                isCollecting = true
                findViewById<Button>(R.id.btnToggleCollection).text = "STOP DEPIN COLLECTION"
                findViewById<TextView>(R.id.tvServiceStatus).text = "Status: ACTIVE — MAPPING TILES"
            }
        }
    }
}
