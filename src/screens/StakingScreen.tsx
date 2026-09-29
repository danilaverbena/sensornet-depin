import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import { Colors } from "../theme/colors";

interface StakingScreenProps {
  currentMultiplier: number;
  onUpdateMultiplier: (newMult: number) => void;
  stakedSkr: number;
  onStakeSkr: (amount: number) => void;
}

export const StakingScreen: React.FC<StakingScreenProps> = ({
  currentMultiplier,
  onUpdateMultiplier,
  stakedSkr,
  onStakeSkr,
}) => {
  const [stakeInput, setStakeInput] = useState("5000");
  const [isOreMining, setIsOreMining] = useState(true);
  const [miningStatus, setMiningStatus] = useState("Idle Proofs Active • 24.8 KH/s");

  const tiers = [
    { title: "Tier 1: Explorer", skrRequired: 1000, boost: "+25% (1.25x)", color: Colors.cyan },
    { title: "Tier 2: Pioneer", skrRequired: 5000, boost: "+50% (1.50x)", color: Colors.solanaPurple },
    { title: "Tier 3: Grid Architect", skrRequired: 20000, boost: "+100% (2.00x)", color: Colors.seekerGold },
  ];

  const handleStake = () => {
    const val = Number(stakeInput);
    if (isNaN(val) || val <= 0) {
      Alert.alert("Invalid Amount", "Please enter a valid $SKR amount to stake.");
      return;
    }

    onStakeSkr(val);
    const newBoost = val >= 20000 ? 20000 : val >= 5000 ? 15000 : val >= 1000 ? 12500 : 10000;
    const finalMult = newBoost + (isOreMining ? 500 : 0) + 2000; // +20% for Seeker hardware
    onUpdateMultiplier(finalMult);

    Alert.alert(
      "Staked Successfully via Seed Vault",
      `Staked ${val} $SKR tokens! Your reward multiplier is now ${(finalMult / 10000).toFixed(2)}x.`
    );
  };

  const toggleOrePoW = () => {
    const nextState = !isOreMining;
    setIsOreMining(nextState);
    if (nextState) {
      setMiningStatus("Solving ORE PoW • 28.2 KH/s (Seeker CPU)");
      onUpdateMultiplier(currentMultiplier + 500);
    } else {
      setMiningStatus("ORE Anti-Sybil Idle");
      onUpdateMultiplier(Math.max(10000, currentMultiplier - 500));
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.headerTitle}>MULTIPLIER & STAKING</Text>
      <Text style={styles.headerSubtitle}>
        Stake $SKR and activate background ORE PoW to supercharge your DePIN telemetry rewards.
      </Text>

      {/* Multiplier Hero Box */}
      <View style={styles.heroBox}>
        <Text style={styles.heroLabel}>CURRENT ACTIVE MULTIPLIER</Text>
        <Text style={styles.heroValue}>{(currentMultiplier / 10000).toFixed(2)}x</Text>
        <View style={styles.heroBreakdown}>
          <Text style={styles.breakdownItem}>⚡ Seeker Hardware: +20%</Text>
          <Text style={styles.breakdownItem}>🪙 Staked {stakedSkr} $SKR: +{Math.round(((currentMultiplier - 12000) / 10000) * 100)}%</Text>
          {isOreMining && <Text style={styles.breakdownItem}>⛏️ ORE PoW Verifier: +5%</Text>}
        </View>
      </View>

      {/* SKR Staking Section */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>🪙 $SKR TOKEN STAKING</Text>
          <View style={styles.bountyBadge}>
            <Text style={styles.bountyText}>$10K BOUNTY</Text>
          </View>
        </View>
        <Text style={styles.cardDescription}>
          Stake Radiants $SKR to unlock higher yield tiers and govern the spatial hexagonal reward curve.
        </Text>

        <View style={styles.tiersContainer}>
          {tiers.map((t, idx) => (
            <View
              key={idx}
              style={[
                styles.tierRow,
                stakedSkr >= t.skrRequired && styles.tierRowActive,
              ]}
            >
              <View>
                <Text style={[styles.tierTitle, { color: t.color }]}>{t.title}</Text>
                <Text style={styles.tierSub}>{t.skrRequired.toLocaleString()} $SKR required</Text>
              </View>
              <Text style={styles.tierBoost}>{t.boost}</Text>
            </View>
          ))}
        </View>

        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={stakeInput}
            onChangeText={setStakeInput}
            keyboardType="numeric"
            placeholder="Amount of SKR"
            placeholderTextColor={Colors.textMuted}
          />
          <TouchableOpacity style={styles.stakeButton} onPress={handleStake}>
            <Text style={styles.stakeButtonText}>STAKE</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ORE Integration Section */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>⛏️ ORE PROOF-OF-WORK VERIFIER</Text>
          <View style={[styles.bountyBadge, { borderColor: Colors.solanaGreen }]}>
            <Text style={[styles.bountyText, { color: Colors.solanaGreen }]}>MATCHED PRIZE</Text>
          </View>
        </View>
        <Text style={styles.cardDescription}>
          Executes lightweight cryptographic anti-sybil hash challenges while your phone is plugged in or idle. Validates hardware identity and yields bonus rewards.
        </Text>

        <View style={styles.oreStatusRow}>
          <View style={[styles.oreStatusDot, isOreMining ? styles.oreOnline : styles.oreOffline]} />
          <Text style={styles.oreStatusText}>{miningStatus}</Text>
        </View>

        <TouchableOpacity
          style={[styles.oreButton, isOreMining ? styles.oreButtonActive : styles.oreButtonInactive]}
          onPress={toggleOrePoW}
        >
          <Text style={styles.oreButtonText}>
            {isOreMining ? "DEACTIVATE ORE POW" : "ACTIVATE ORE POW (+5% BOOST)"}
          </Text>
        </TouchableOpacity>
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
  headerTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: Colors.textPrimary,
    fontFamily: "monospace",
    letterSpacing: 1,
  },
  headerSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
    marginBottom: 16,
    lineHeight: 18,
  },
  heroBox: {
    backgroundColor: "rgba(153, 69, 255, 0.1)",
    borderColor: Colors.solanaPurple,
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
    marginBottom: 16,
  },
  heroLabel: {
    fontSize: 10,
    fontFamily: "monospace",
    color: Colors.solanaPurple,
    fontWeight: "700",
    letterSpacing: 1,
  },
  heroValue: {
    fontSize: 36,
    fontWeight: "900",
    color: "#E9D5FF",
    fontFamily: "monospace",
    marginVertical: 4,
  },
  heroBreakdown: {
    gap: 2,
    marginTop: 4,
    alignItems: "center",
  },
  breakdownItem: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontFamily: "monospace",
  },
  card: {
    backgroundColor: Colors.surface,
    borderColor: Colors.surfaceBorder,
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: Colors.textPrimary,
    fontFamily: "monospace",
  },
  bountyBadge: {
    borderColor: Colors.seekerGold,
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  bountyText: {
    color: Colors.seekerGold,
    fontSize: 9,
    fontWeight: "800",
    fontFamily: "monospace",
  },
  cardDescription: {
    fontSize: 12,
    color: Colors.textMuted,
    lineHeight: 16,
    marginBottom: 12,
  },
  tiersContainer: {
    gap: 8,
    marginBottom: 14,
  },
  tierRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: Colors.background,
    borderColor: Colors.surfaceBorder,
    borderWidth: 1,
    padding: 10,
    borderRadius: 8,
  },
  tierRowActive: {
    borderColor: Colors.emerald,
    backgroundColor: "rgba(16, 185, 129, 0.08)",
  },
  tierTitle: {
    fontSize: 12,
    fontWeight: "700",
    fontFamily: "monospace",
  },
  tierSub: {
    fontSize: 10,
    color: Colors.textMuted,
  },
  tierBoost: {
    fontSize: 12,
    fontWeight: "800",
    color: Colors.textPrimary,
    fontFamily: "monospace",
  },
  inputRow: {
    flexDirection: "row",
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.background,
    borderColor: Colors.surfaceBorder,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: Colors.textPrimary,
    fontFamily: "monospace",
  },
  stakeButton: {
    backgroundColor: Colors.emerald,
    paddingHorizontal: 20,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
  },
  stakeButtonText: {
    color: "#000",
    fontWeight: "800",
    fontFamily: "monospace",
    fontSize: 12,
  },
  oreStatusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: Colors.background,
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  oreStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  oreOnline: {
    backgroundColor: Colors.emerald,
  },
  oreOffline: {
    backgroundColor: Colors.textMuted,
  },
  oreStatusText: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontFamily: "monospace",
  },
  oreButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
  },
  oreButtonActive: {
    borderColor: "rgba(239, 68, 68, 0.4)",
    backgroundColor: "rgba(239, 68, 68, 0.12)",
  },
  oreButtonInactive: {
    borderColor: Colors.solanaGreen,
    backgroundColor: "rgba(20, 241, 149, 0.15)",
  },
  oreButtonText: {
    color: Colors.textPrimary,
    fontFamily: "monospace",
    fontWeight: "800",
    fontSize: 11,
  },
});
