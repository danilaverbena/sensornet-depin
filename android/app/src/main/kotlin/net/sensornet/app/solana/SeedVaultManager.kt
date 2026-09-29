package net.sensornet.app.solana

import android.app.Activity
import android.net.Uri
import com.solanamobile.mobilewalletadapter.clientlib.ActivityResultSender
import com.solanamobile.mobilewalletadapter.clientlib.MobileWalletAdapter
import com.solanamobile.mobilewalletadapter.clientlib.TransactionResult
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

/**
 * Solana Mobile Seed Vault & Wallet Adapter Manager
 * Interfaces with Solana Mobile Stack (SMS) to authorize, sign telemetry batches,
 * and submit transactions with hardware-grade security via the Seeker Seed Vault.
 */
class SeedVaultManager(private val activity: Activity) {

    private val walletAdapter = MobileWalletAdapter(
        activityResultSender = ActivityResultSender(activity)
    )

    data class AuthResult(
        val publicKey: String,
        val authToken: String,
        val walletUriBase: String?
    )

    suspend fun authorize(): Result<AuthResult> = withContext(Dispatchers.IO) {
        try {
            val result = walletAdapter.transact(ActivityResultSender(activity)) {
                val auth = authorize(
                    identityUri = Uri.parse("https://sensornet.network"),
                    iconUri = Uri.parse("https://sensornet.network/icon.png"),
                    identityName = "SensorNet Mobile DePIN",
                    rpcCluster = "devnet"
                )
                AuthResult(
                    publicKey = auth.publicKey.toBase58(),
                    authToken = auth.authToken,
                    walletUriBase = auth.walletUriBase?.toString()
                )
            }

            when (result) {
                is TransactionResult.Success -> Result.success(result.payload)
                is TransactionResult.Failure -> Result.failure(Exception("Wallet authorization failed: ${result.message}"))
                is TransactionResult.NoWalletFound -> Result.failure(Exception("No MWA-compatible wallet found on device"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun signAndSendBatchTransaction(
        serializedTransaction: ByteArray,
        authToken: String
    ): Result<ByteArray> = withContext(Dispatchers.IO) {
        try {
            val result = walletAdapter.transact(ActivityResultSender(activity)) {
                reauthorize(
                    identityUri = Uri.parse("https://sensornet.network"),
                    iconUri = Uri.parse("https://sensornet.network/icon.png"),
                    identityName = "SensorNet Mobile DePIN",
                    authToken = authToken
                )
                val signResult = signAndSendTransactions(arrayOf(serializedTransaction))
                signResult.signatures.first()
            }

            when (result) {
                is TransactionResult.Success -> Result.success(result.payload)
                is TransactionResult.Failure -> Result.failure(Exception("Failed to sign transaction: ${result.message}"))
                is TransactionResult.NoWalletFound -> Result.failure(Exception("No MWA-compatible wallet found on device"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
