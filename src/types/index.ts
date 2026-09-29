export interface CellularTelemetry {
  carrier: string;
  networkType: "5G_NR" | "4G_LTE" | "3G_HSPA" | "UNKNOWN";
  signalDbm: number;
  signalLevel: number; // 0 to 4
  cellId?: string;
}

export interface WifiTelemetry {
  totalAccessPoints: number;
  sampledAps: Array<{
    bssidHash: string;
    rssiDbm: number;
    band: "2.4GHz" | "5GHz/6GHz";
  }>;
  connectedSsid?: string;
  connectedLinkSpeedMbps?: number;
}

export interface RoadTelemetry {
  roughnessScore: number; // 1.0 (Smooth) to 10.0 (Severe)
  qualityRating: "Smooth Pavement" | "Moderate / Minor Cracks" | "Rough / Patchwork" | "Severe Degradation / Potholes";
  potholesDetected: number;
  bumpsDetected: number;
  sampleCount: number;
}

export interface HexTileObservation {
  h3Index: string;
  latitude: number;
  longitude: number;
  cellularDbm: number;
  wifiDensity: number;
  roadScore: number;
  timestamp: number;
}

export interface DeviceState {
  isRegistered: boolean;
  isSeekerHardware: boolean;
  streakDays: number;
  totalTilesMapped: number;
  pendingRewardsSntr: number;
  claimedRewardsSntr: number;
  stakedSkr: number;
  multiplier: number; // e.g. 1.25x
  orePowEnabled: boolean;
  collectionActive: boolean;
}
