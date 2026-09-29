import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
} from "react-native";
import { Colors } from "./src/theme/colors";
import { Header } from "./src/components/Header";
import { DashboardScreen } from "./src/screens/DashboardScreen";
import { StakingScreen } from "./src/screens/StakingScreen";
import { RewardsScreen } from "./src/screens/RewardsScreen";
import { MobileWalletManager } from "./src/solana/MobileWalletManager";

export default function App() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "staking" | "rewards">("dashboard");
  const [walletAddress, setWalletAddress] = useState<string | undefined>(undefined);
  const [multiplier, setMultiplier] = useState(14500); // 1.45x (Seeker 1.2x + 1000 SKR + 5% ORE)
  const [stakedSkr, setStakedSkr] = useState(5000);
  const [pendingRewards, setPendingRewards] = useState(148.2);

  const handleConnectWallet = async () => {
    try {
      const walletManager = MobileWalletManager.getInstance();
      const connected = await walletManager.connect();
      setWalletAddress(connected.publicKey.toBase58());
    } catch (e: any) {
      console.warn("Wallet error:", e);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />

      {/* Persistent Top Navigation Bar */}
      <Header
        isSeeker={true}
        walletAddress={walletAddress}
        onConnectWallet={handleConnectWallet}
        streakDays={7}
      />

      {/* Screen Views */}
      <View style={styles.mainContent}>
        {activeTab === "dashboard" && (
          <DashboardScreen
            multiplier={multiplier}
            onNavigateToStaking={() => setActiveTab("staking")}
          />
        )}
        {activeTab === "staking" && (
          <StakingScreen
            currentMultiplier={multiplier}
            onUpdateMultiplier={setMultiplier}
            stakedSkr={stakedSkr}
            onStakeSkr={setStakedSkr}
          />
        )}
        {activeTab === "rewards" && (
          <RewardsScreen
            pendingRewards={pendingRewards}
            onClaimSuccess={() => setPendingRewards(0)}
          />
        )}
      </View>

      {/* Bottom Cyberpunk Tab Bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabItem, activeTab === "dashboard" && styles.tabItemActive]}
          onPress={() => setActiveTab("dashboard")}
        >
          <Text style={styles.tabIcon}>📡</Text>
          <Text style={[styles.tabLabel, activeTab === "dashboard" && styles.tabLabelActive]}>
            TELEMETRY
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === "staking" && styles.tabItemActive]}
          onPress={() => setActiveTab("staking")}
        >
          <Text style={styles.tabIcon}>⚡</Text>
          <Text style={[styles.tabLabel, activeTab === "staking" && styles.tabLabelActive]}>
            BOOST & SKR
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === "rewards" && styles.tabItemActive]}
          onPress={() => setActiveTab("rewards")}
        >
          <Text style={styles.tabIcon}>🪙</Text>
          <Text style={[styles.tabLabel, activeTab === "rewards" && styles.tabLabelActive]}>
            EARNINGS
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  mainContent: {
    flex: 1,
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.surfaceBorder,
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    gap: 4,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tabItemActive: {
    backgroundColor: "rgba(16, 185, 129, 0.08)",
  },
  tabIcon: {
    fontSize: 18,
  },
  tabLabel: {
    fontSize: 10,
    fontFamily: "monospace",
    color: Colors.textMuted,
    fontWeight: "700",
  },
  tabLabelActive: {
    color: Colors.emerald,
  },
});
