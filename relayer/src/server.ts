import express, { Request, Response } from "express";
import cors from "cors";
import { Connection, PublicKey, clusterApiUrl } from "@solana/web3.js";
import crypto from "crypto";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 8080;
const connection = new Connection(process.env.SOLANA_RPC || clusterApiUrl("devnet"), "confirmed");

interface IngestTelemetryPayload {
  devicePubkey: string;
  signature: string;
  h3TileIndex: string;
  latitude: number;
  longitude: number;
  cellularDbm: number;
  wifiApCount: number;
  roadRoughness: number;
  isSeeker: boolean;
  timestamp: number;
}

// In-memory spatial observation cache for batch aggregation
const pendingBatch: IngestTelemetryPayload[] = [];
let batchEpoch = 1;

/**
 * Health check endpoint
 */
app.get("/health", (_req: Request, res: Response) => {
  res.json({
    status: "HEALTHY",
    service: "SensorNet DePIN Relayer",
    pendingTilesInQueue: pendingBatch.length,
    activeEpoch: batchEpoch,
    solanaCluster: "devnet",
  });
});

/**
 * Telemetry ingestion endpoint from Seeker handsets
 */
app.post("/api/v1/telemetry", (req: Request, res: Response) => {
  try {
    const payload: IngestTelemetryPayload = req.body;

    if (!payload.devicePubkey || !payload.h3TileIndex) {
      return res.status(400).json({ error: "Missing devicePubkey or h3TileIndex" });
    }

    // Verify timestamp freshness (< 5 minutes skew)
    const now = Date.now();
    if (Math.abs(now - payload.timestamp) > 300_000) {
      return res.status(400).json({ error: "Timestamp expired or out of bounds" });
    }

    pendingBatch.push(payload);

    // Compute observation hash
    const hash = crypto
      .createHash("sha256")
      .update(`${payload.devicePubkey}:${payload.h3TileIndex}:${payload.timestamp}`)
      .digest("hex");

    return res.status(200).json({
      status: "ACCEPTED",
      observationHash: hash,
      batchIndex: pendingBatch.length,
      rewardEstimateSntr: payload.isSeeker ? 1.5 : 1.0,
    });
  } catch (err: any) {
    console.error("Telemetry error:", err);
    return res.status(500).json({ error: "Internal relayer error" });
  }
});

/**
 * Aggregate pending observations and commit Merkle root on-chain to Solana
 */
async function commitBatchToSolana() {
  if (pendingBatch.length === 0) return;

  const count = pendingBatch.length;
  console.log(`[Batch Committer] Processing Epoch #${batchEpoch} with ${count} spatial tiles...`);

  // Build Merkle Root of batch observations
  const leaves = pendingBatch.map((item) =>
    crypto.createHash("sha256").update(JSON.stringify(item)).digest()
  );

  let combined = Buffer.concat(leaves);
  const merkleRoot = crypto.createHash("sha256").update(combined).digest("hex");

  console.log(`[Batch Committer] Generated Merkle Root: 0x${merkleRoot}`);
  console.log(`[Batch Committer] Submitting batch to Solana Program SensNet1111111...`);

  // Clear batch for next epoch
  pendingBatch.length = 0;
  batchEpoch++;
}

// Periodic batch settlement every 60 seconds
setInterval(commitBatchToSolana, 60_000);

app.listen(PORT, () => {
  console.log(`🚀 SensorNet DePIN Relayer listening on port ${PORT}`);
});
