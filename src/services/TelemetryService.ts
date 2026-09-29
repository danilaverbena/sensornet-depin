import {
  CellularTelemetry,
  WifiTelemetry,
  RoadTelemetry,
  HexTileObservation,
} from "../types";

export class TelemetryService {
  private static instance: TelemetryService;
  private isCollecting: boolean = false;
  private listeners: Array<(data: { cellular: CellularTelemetry; wifi: WifiTelemetry; road: RoadTelemetry; tile: HexTileObservation }) => void> = [];
  private intervalId: any = null;

  // Base mock coordinates for Seeker GPS demo (San Francisco tech hub / Solana HQ)
  private currentLat = 37.7749;
  private currentLng = -122.4194;

  private constructor() {}

  public static getInstance(): TelemetryService {
    if (!TelemetryService.instance) {
      TelemetryService.instance = new TelemetryService();
    }
    return TelemetryService.instance;
  }

  public startCollection(callback: (data: { cellular: CellularTelemetry; wifi: WifiTelemetry; road: RoadTelemetry; tile: HexTileObservation }) => void) {
    this.listeners.push(callback);
    if (this.isCollecting) return;
    this.isCollecting = true;

    // Simulate 3-second live sensor updates
    this.intervalId = setInterval(() => {
      // Step GPS slightly (user walking/driving)
      this.currentLat += (Math.random() - 0.48) * 0.0005;
      this.currentLng += (Math.random() - 0.48) * 0.0005;

      const cellular = this.generateCellularMetrics();
      const wifi = this.generateWifiMetrics();
      const road = this.generateRoadMetrics();
      const tile = this.generateHexTile(cellular, wifi, road);

      this.listeners.forEach((listener) => listener({ cellular, wifi, road, tile }));
    }, 3000);
  }

  public stopCollection() {
    this.isCollecting = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.listeners = [];
  }

  private generateCellularMetrics(): CellularTelemetry {
    // Dynamic signal fluctuation: -110dBm (poor) to -70dBm (strong 5G)
    const dbm = Math.round(-95 + (Math.random() * 35));
    const is5G = dbm > -85;
    const level = dbm > -80 ? 4 : dbm > -90 ? 3 : dbm > -100 ? 2 : 1;

    return {
      carrier: "Helium / Solana Mobile",
      networkType: is5G ? "5G_NR" : "4G_LTE",
      signalDbm: dbm,
      signalLevel: level,
      cellId: "eNB_" + Math.floor(100000 + Math.random() * 900000),
    };
  }

  private generateWifiMetrics(): WifiTelemetry {
    const apCount = Math.floor(6 + Math.random() * 18);
    const sampledAps = Array.from({ length: Math.min(apCount, 5) }).map((_, idx) => ({
      bssidHash: "ap_" + Math.random().toString(16).substring(2, 10),
      rssiDbm: Math.round(-80 + Math.random() * 35),
      band: (idx % 2 === 0 ? "5GHz/6GHz" : "2.4GHz") as any,
    }));

    return {
      totalAccessPoints: apCount,
      sampledAps,
      connectedSsid: "SeekerMesh_Secure",
      connectedLinkSpeedMbps: 650,
    };
  }

  private generateRoadMetrics(): RoadTelemetry {
    // Road roughness 1.0 (smooth) to 8.5 (potholes)
    const isPothole = Math.random() < 0.08;
    const isBump = Math.random() < 0.15;
    const roughness = isPothole ? Number((6.5 + Math.random() * 2.5).toFixed(2)) : Number((1.2 + Math.random() * 2.8).toFixed(2));

    const rating = roughness < 2.5
      ? "Smooth Pavement"
      : roughness < 4.5
      ? "Moderate / Minor Cracks"
      : roughness < 7.0
      ? "Rough / Patchwork"
      : "Severe Degradation / Potholes";

    return {
      roughnessScore: roughness,
      qualityRating: rating,
      potholesDetected: isPothole ? 1 : 0,
      bumpsDetected: isBump ? 1 : 0,
      sampleCount: 120,
    };
  }

  private generateHexTile(cellular: CellularTelemetry, wifi: WifiTelemetry, road: RoadTelemetry): HexTileObservation {
    // Generate simulated H3 index (Resolution 8 ~460m hex tile)
    const latPrefix = Math.floor(Math.abs(this.currentLat) * 100);
    const lngPrefix = Math.floor(Math.abs(this.currentLng) * 100);
    const h3Simulated = `8828308${latPrefix.toString(16)}${lngPrefix.toString(16)}ffff`;

    return {
      h3Index: h3Simulated,
      latitude: this.currentLat,
      longitude: this.currentLng,
      cellularDbm: cellular.signalDbm,
      wifiDensity: wifi.totalAccessPoints,
      roadScore: road.roughnessScore,
      timestamp: Date.now(),
    };
  }
}
