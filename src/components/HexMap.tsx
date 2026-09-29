import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Polygon, Text as SvgText, G } from "react-native-svg";
import { Colors } from "../theme/colors";

interface HexTileData {
  id: string;
  col: number;
  row: number;
  cellularQuality: "good" | "moderate" | "poor";
  roadQuality: "smooth" | "moderate" | "rough";
  wifiCount: number;
  isCurrentLocation?: boolean;
}

interface HexMapProps {
  viewMode: "cellular" | "road" | "wifi";
}

export const HexMap: React.FC<HexMapProps> = ({ viewMode }) => {
  // 3x3 Hexagon grid coordinates
  const tiles: HexTileData[] = [
    { id: "h1", col: 0, row: 0, cellularQuality: "good", roadQuality: "smooth", wifiCount: 14 },
    { id: "h2", col: 1, row: 0, cellularQuality: "good", roadQuality: "moderate", wifiCount: 22 },
    { id: "h3", col: 2, row: 0, cellularQuality: "moderate", roadQuality: "smooth", wifiCount: 8 },
    { id: "h4", col: 0, row: 1, cellularQuality: "moderate", roadQuality: "rough", wifiCount: 6 },
    { id: "h5", col: 1, row: 1, cellularQuality: "good", roadQuality: "smooth", wifiCount: 31, isCurrentLocation: true },
    { id: "h6", col: 2, row: 1, cellularQuality: "poor", roadQuality: "rough", wifiCount: 2 },
    { id: "h7", col: 0, row: 2, cellularQuality: "good", roadQuality: "moderate", wifiCount: 19 },
    { id: "h8", col: 1, row: 2, cellularQuality: "moderate", roadQuality: "smooth", wifiCount: 12 },
    { id: "h9", col: 2, row: 2, cellularQuality: "good", roadQuality: "smooth", wifiCount: 17 },
  ];

  const hexRadius = 46;
  const hexWidth = Math.sqrt(3) * hexRadius;
  const hexHeight = 2 * hexRadius;

  const getTileFill = (tile: HexTileData) => {
    if (viewMode === "cellular") {
      if (tile.cellularQuality === "good") return "rgba(16, 185, 129, 0.45)";
      if (tile.cellularQuality === "moderate") return "rgba(245, 158, 11, 0.45)";
      return "rgba(239, 68, 68, 0.45)";
    }
    if (viewMode === "road") {
      if (tile.roadQuality === "smooth") return "rgba(16, 185, 129, 0.45)";
      if (tile.roadQuality === "moderate") return "rgba(245, 158, 11, 0.45)";
      return "rgba(239, 68, 68, 0.55)";
    }
    // wifi density
    if (tile.wifiCount > 20) return "rgba(6, 182, 212, 0.55)";
    if (tile.wifiCount > 10) return "rgba(6, 182, 212, 0.35)";
    return "rgba(6, 182, 212, 0.15)";
  };

  const getTileStroke = (tile: HexTileData) => {
    if (tile.isCurrentLocation) return Colors.seekerGold;
    if (viewMode === "cellular") {
      return tile.cellularQuality === "good" ? Colors.emerald : tile.cellularQuality === "moderate" ? Colors.moderateSignal : Colors.poorSignal;
    }
    if (viewMode === "road") {
      return tile.roadQuality === "smooth" ? Colors.roadSmooth : tile.roadQuality === "moderate" ? Colors.roadRough : Colors.roadPothole;
    }
    return Colors.cyan;
  };

  return (
    <View style={styles.container}>
      <Svg height="260" width="100%" viewBox="0 0 320 260">
        <G transform="translate(45, 25)">
          {tiles.map((t) => {
            const xOffset = t.row % 2 === 1 ? hexWidth / 2 : 0;
            const cx = t.col * hexWidth + xOffset + 40;
            const cy = t.row * (hexHeight * 0.75) + 35;

            // Generate regular hexagon polygon points
            const points = [];
            for (let i = 0; i < 6; i++) {
              const angle = (Math.PI / 180) * (60 * i - 30);
              const px = cx + hexRadius * Math.cos(angle);
              const py = cy + hexRadius * Math.sin(angle);
              points.push(`${px},${py}`);
            }

            return (
              <G key={t.id}>
                <Polygon
                  points={points.join(" ")}
                  fill={getTileFill(t)}
                  stroke={getTileStroke(t)}
                  strokeWidth={t.isCurrentLocation ? "3" : "1.5"}
                />
                <SvgText
                  x={cx}
                  y={cy - 2}
                  fontSize="9"
                  fontFamily="monospace"
                  fontWeight="bold"
                  fill="#FFF"
                  textAnchor="middle"
                >
                  {viewMode === "cellular"
                    ? t.cellularQuality === "good" ? "5G 92%" : t.cellularQuality === "moderate" ? "4G 68%" : "3G 24%"
                    : viewMode === "road"
                    ? t.roadQuality === "smooth" ? "IRI 1.2" : t.roadQuality === "moderate" ? "IRI 3.8" : "BUMP"
                    : `${t.wifiCount} APs`}
                </SvgText>
                {t.isCurrentLocation && (
                  <SvgText
                    x={cx}
                    y={cy + 13}
                    fontSize="8"
                    fontFamily="monospace"
                    fontWeight="bold"
                    fill={Colors.seekerGold}
                    textAnchor="middle"
                  >
                    ● YOU
                  </SvgText>
                )}
              </G>
            );
          })}
        </G>
      </Svg>

      <View style={styles.legendRow}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: Colors.emerald }]} />
          <Text style={styles.legendText}>Optimal</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: Colors.moderateSignal }]} />
          <Text style={styles.legendText}>Moderate</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: Colors.poorSignal }]} />
          <Text style={styles.legendText}>Degraded</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: Colors.seekerGold }]} />
          <Text style={styles.legendText}>Your Seeker</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderColor: Colors.surfaceBorder,
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    alignItems: "center",
    marginBottom: 12,
  },
  legendRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.surfaceBorder,
    paddingTop: 8,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    color: Colors.textMuted,
    fontSize: 10,
    fontFamily: "monospace",
  },
});
