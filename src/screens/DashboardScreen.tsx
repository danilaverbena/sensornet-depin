import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Colors } from "../theme/colors";
import { MetricCard } from "../components/MetricCard";
import { HexMap } from "../components/HexMap";
import { TelemetryService } from "../services/TelemetryService";
import { CellularTelemetry, WifiTelemetry, RoadTelemetry, HexTileObservation } from "../types";

interface DashboardScreenProps {
  onNavigateToStaking: () => void;
  multiplier: number;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  onNavigateToStaking,
  multiplier,
}) => {
  const [isCollecting, setIsCollecting] = useState(true);
  const [mapMode, setMapMode] = useState<"cellular" | "road" | "wifi">("cellular");

  const [cellular, setCellular] = useState<CellularTelemetry>({
    carrier: "Helium / Solana Mobile",
    networkType: "5G_NR",
    signalDbm: -78,
    signalLevel: 4,
    cellId: "eNB_589201",
  });

  const [wifi, setWifi] = useState<WifiTelemetry>({
    totalAccessPoints: 16,
    sampledAps: [],
    connectedSsid: "SeekerMesh_5G",
    connectedLinkSpeedMbps: 650,
  });

  const [road, setRoad] = useState<RoadTelemetry>({
    roughnessScore: 1.45,
    qualityRating: "Smooth Pavement",
    potholesDetected: 0,
    bumpsDetected: 0,
    sampleCount: 150,
  });

  const [sessionTiles, setSessionTiles] = useState(24);
  const [pendingSntr, setPendingSntr] = useState(128.5);

  useEffect(() => {
    const service = TelemetryService.getInstance();
    service.startCollection(({ cellular, wifi, road }) => {
      setCellular(cellular);
      setWifi(wifi);
      setRoad(road);
      setSessionTiles((prev) => prev + 1);
      setPendingSntr((prev) => Number((prev + 1.25 * (multiplier / 10000)).toFixed(2)));
    });

    return () => {
      service.stopCollection();
    };
  }, [multiplier]);

  const toggleCollection = () => {
    setIsCollecting(!isCollecting);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Earnings & Multiplier Bar */}
      <View style={styles.statsBanner}>
        <View>
          <Text style={styles.statsLabel}>PENDING REWARDS</Text>
          <View style={styles.rewardRow}>
            <Text style={styles.rewardAmount}>{pendingSntr}</Text>
            <Text style={styles.rewardSymbol}>$SNTR</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.multiplierBadge}
          onPress={onNavigateToStaking}
          activeOpacity={0.8}
        >
          <Text style={styles.multiplierLabel}>BOOST</Text>
          <Text style={styles.multiplierValue}>{(multiplier / 10000).toFixed(2)}x</Text>
        </TouchableOpacity>
      </View>

      {/* Main Switch Button */}
      <TouchableOpacity
        style={[styles.mainActionButton, isCollecting ? styles.activeButton : styles.idleButton]}
        onPress={toggleCollection}
        activeOpacity={0.85}
      >
        <View style={styles.pulseDot} />
        <Text style={styles.actionButtonText}>
          {isCollecting ? "DEPIN TELEMETRY ACTIVE" : "COLLECTION PAUSED — RESUME"}
        </Text>
      </TouchableOpacity>

      {/* Map Mode Selector */}
      <View style={styles.mapSelectorRow}>
        <TouchableOpacity
          style={[styles.modeTab, mapMode === "cellular" && styles.modeTabActive]}
          onPress={() => setMapMode("cellular")}
        >
          <Text style={[styles.modeTabText, mapMode === "cellular" && styles.modeTabTextActive]}>
            CELLULAR 5G
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.modeTab, mapMode === "road" && styles.modeTabActive]}
          onPress={() => setMapMode("road")}
        >
          <Text style={[styles.modeTabText, mapMode === "road" && styles.modeTabTextActive]}>
            ROAD IRI
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.modeTab, mapMode === "wifi" && styles.modeTabActive]}
          onPress={() => setMapMode("wifi")}
        >
          <Text style={[styles.modeTabText, mapMode === "wifi" && styles.modeTabTextActive]}>
            WI-FI MESH
          </Text>
        </TouchableOpacity>
      </View>

      {/* Live Hex Grid Visualization */}
      <HexMap viewMode={mapMode} />

      {/* Real-time Telemetry Metrics */}
      <Text style={styles.sectionTitle}>LIVE HARDWARE SENSORS</Text>

      <MetricCard
        icon="📡"
        title="Cellular Radio"
        badge={cellular.networkType}
        badgeColor={Colors.emerald}
        primaryValue={`${cellular.signalDbm}`}
        primaryUnit="dBm"
        subValue={`Carrier: ${cellular.carrier} • Signal Level: ${cellular.signalLevel}/4`}
        accentColor={cellular.signalDbm > -85 ? Colors.emerald : Colors.moderateSignal}
      />

      <MetricCard
        icon="🛜"
        title="Wi-Fi Density"
        badge={`${wifi.totalAccessPoints} APs`}
        badgeColor={Colors.cyan}
        primaryValue={`${wifi.totalAccessPoints}`}
        primaryUnit="nodes in range"
        subValue={`Link: ${wifi.connectedLinkSpeedMbps || 650} Mbps • Salted SHA-256`}
        accentColor={Colors.cyan}
      />

      <MetricCard
        icon="🚗"
        title="Road Surface Dynamics"
        badge={road.potholesDetected > 0 ? "POTHOLE!" : "SMOOTH"}
        badgeColor={road.potholesDetected > 0 ? Colors.roadPothole : Colors.roadSmooth}
        primaryValue={`${road.roughnessScore}`}
        primaryUnit="IRI"
        subValue={`Quality: ${road.qualityRating} • Potholes: ${road.potholesDetected}`}
        accentColor={road.roughnessScore < 3.0 ? Colors.roadSmooth : Colors.roadPothole}
      />

      {/* Daily Streak & Session Info */}
      <View style={styles.sessionCard}>
        <View style={styles.sessionRow}>
          <Text style={styles.sessionText}>Hex Tiles Mapped Today:</Text>
          <Text style={styles.sessionHighlight}>{sessionTiles} tiles</Text>
        </View>
        <View style={styles.sessionRow}>
          <Text style={styles.sessionText}>Active Daily Streak:</Text>
          <Text style={styles.sessionHighlight}>🔥 7 Days (+15% Tier)</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  statsBanner: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderColor: Colors.surfaceBorder,
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
  },
  statsLabel: {
    fontSize: 10,
    color: Colors.textMuted,
    fontFamily: "monospace",
    letterSpacing: 1,
  },
  rewardRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 6,
    marginTop: 2,
  },
  rewardAmount: {
    fontSize: 28,
    fontWeight: "900",
    color: Colors.emerald,
    fontFamily: "monospace",
  },
  rewardSymbol: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontFamily: "monospace",
    fontWeight: "700",
  },
  multiplierBadge: {
    backgroundColor: "rgba(153, 69, 255, 0.15)",
    borderColor: Colors.solanaPurple,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
  },
  multiplierLabel: {
    color: Colors.solanaPurple,
    fontSize: 9,
    fontFamily: "monospace",
    fontWeight: "800",
  },
  multiplierValue: {
    color: "#C084FC",
    fontSize: 18,
    fontWeight: "900",
    fontFamily: "monospace",
  },
  mainActionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 16,
  },
  activeButton: {
    backgroundColor: "rgba(16, 185, 129, 0.15)",
    borderColor: Colors.emerald,
    borderWidth: 1,
  },
  idleButton: {
    backgroundColor: "rgba(245, 158, 11, 0.15)",
    borderColor: Colors.moderateSignal,
    borderWidth: 1,
  },
  pulseDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.emerald,
  },
  actionButtonText: {
    color: Colors.textPrimary,
    fontFamily: "monospace",
    fontWeight: "800",
    fontSize: 13,
    letterSpacing: 0.8,
  },
  mapSelectorRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 10,
  },
  modeTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderColor: Colors.surfaceBorder,
    borderWidth: 1,
    borderRadius: 8,
  },
  modeTabActive: {
    borderColor: Colors.emerald,
    backgroundColor: "rgba(16, 185, 129, 0.12)",
  },
  modeTabText: {
    fontSize: 11,
    fontFamily: "monospace",
    color: Colors.textMuted,
    fontWeight: "700",
  },
  modeTabTextActive: {
    color: Colors.emerald,
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: "monospace",
    color: Colors.textMuted,
    letterSpacing: 1.2,
    marginVertical: 10,
  },
  sessionCard: {
    backgroundColor: Colors.surface,
    borderColor: Colors.surfaceBorder,
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginTop: 6,
    gap: 8,
  },
  sessionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sessionText: {
    color: Colors.textSecondary,
    fontSize: 12,
  },
  sessionHighlight: {
    color: Colors.textPrimary,
    fontFamily: "monospace",
    fontWeight: "700",
    fontSize: 13,
  },
});
