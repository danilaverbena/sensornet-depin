import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Colors } from "../theme/colors";

interface HeaderProps {
  isSeeker: boolean;
  walletAddress?: string;
  onConnectWallet: () => void;
  streakDays: number;
}

export const Header: React.FC<HeaderProps> = ({
  isSeeker,
  walletAddress,
  onConnectWallet,
  streakDays,
}) => {
  const shortAddress = walletAddress
    ? `${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}`
    : "Connect Wallet";

  return (
    <View style={styles.container}>
      <View style={styles.leftRow}>
        <View style={styles.brandBadge}>
          <Text style={styles.logoText}>SENSOR</Text>
          <Text style={styles.logoTextAccent}>NET</Text>
        </View>
        {isSeeker && (
          <View style={styles.seekerBadge}>
            <Text style={styles.seekerText}>⚡ SEEKER V2</Text>
          </View>
        )}
      </View>

      <View style={styles.rightRow}>
        <View style={styles.streakBadge}>
          <Text style={styles.streakEmoji}>🔥</Text>
          <Text style={styles.streakText}>{streakDays}d</Text>
        </View>

        <TouchableOpacity
          style={[styles.walletButton, walletAddress ? styles.walletConnected : null]}
          onPress={onConnectWallet}
          activeOpacity={0.8}
        >
          <Text style={styles.walletText}>{shortAddress}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 12,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceBorder,
  },
  leftRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  brandBadge: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoText: {
    fontFamily: "monospace",
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 1.5,
    color: Colors.textPrimary,
  },
  logoTextAccent: {
    fontFamily: "monospace",
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 1.5,
    color: Colors.emerald,
  },
  seekerBadge: {
    backgroundColor: Colors.seekerBadgeBg,
    borderColor: Colors.seekerBadgeBorder,
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  seekerText: {
    color: Colors.seekerGold,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  rightRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  streakBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(239, 68, 68, 0.15)",
    borderColor: "rgba(239, 68, 68, 0.3)",
    borderWidth: 1,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 12,
  },
  streakEmoji: {
    fontSize: 11,
    marginRight: 2,
  },
  streakText: {
    color: "#F87171",
    fontSize: 11,
    fontWeight: "800",
  },
  walletButton: {
    backgroundColor: Colors.surface,
    borderColor: Colors.emerald,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  walletConnected: {
    borderColor: Colors.cyan,
    backgroundColor: "rgba(6, 182, 212, 0.12)",
  },
  walletText: {
    color: Colors.textPrimary,
    fontFamily: "monospace",
    fontSize: 11,
    fontWeight: "600",
  },
});
