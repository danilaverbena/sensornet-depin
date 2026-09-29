import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Colors } from "../theme/colors";
import { MobileWalletManager } from "../solana/MobileWalletManager";

interface RewardsScreenProps {
  pendingRewards: number;
  onClaimSuccess: () => void;
}

export const RewardsScreen: React.FC<RewardsScreenProps> = ({
  pendingRewards,
  onClaimSuccess,
}) => {
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimHistory, setClaimHistory] = useState([
    { id: "1", amount: 245.2, date: "Yesterday, 18:42", txHash: "4x8k...9P2q" },
    { id: "2", amount: 189.0, date: "28 Sep, 12:15", txHash: "3mK9...7Rt1" },
    { id: "3", amount: 312.4, date: "27 Sep, 21:03", txHash: "9zL0...4wE2" },
  ]);

  const handleClaim = async () => {
    if (pendingRewards <= 0) {
      Alert.alert("No Rewards", "You have no pending rewards to claim yet.");
      return;
    }

    setIsClaiming(true);
    try {
      const walletManager = MobileWalletManager.getInstance();
      const wallet = walletManager.getWallet();

      if (!wallet) {
        Alert.alert("Wallet Required", "Please connect your Solana wallet / Seed Vault first.");
        setIsClaiming(false);
        return;
      }

      // Simulate on-chain Seed Vault transaction claim
      setTimeout(() => {
        setIsClaiming(false);
        const newClaim = {
          id: Date.now().toString(),
          amount: pendingRewards,
          date: "Just now",
          txHash: "5X" + Math.random().toString(36).substring(2, 6) + "..." + Math.random().toString(36).substring(2, 6),
        };
        setClaimHistory([newClaim, ...claimHistory]);
        onClaimSuccess();
        Alert.alert(
          "Claim Successful! 🎉",
          `Transferred ${pendingRewards.toFixed(2)} $SNTR directly into your wallet (${wallet.publicKey.toBase58().slice(0, 4)}...${wallet.publicKey.toBase58().slice(-4)}) via Seed Vault.`
        );
      }, 1500);
    } catch (e: any) {
      setIsClaiming(false);
      Alert.alert("Claim Failed", e?.message || "Error signing transaction");
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.headerTitle}>CLAIM EARNINGS</Text>
      <Text style={styles.headerSubtitle}>
        Micro-rewards are accrued on-chain and settled directly to your Solana Seeker wallet.
      </Text>

      {/* Hero Claim Box */}
      <View style={styles.heroBox}>
        <Text style={styles.heroLabel}>CLAIMABLE BALANCE</Text>
        <View style={styles.amountRow}>
          <Text style={styles.heroAmount}>{pendingRewards.toFixed(2)}</Text>
          <Text style={styles.heroToken}>$SNTR</Text>
        </View>

        <TouchableOpacity
          style={[styles.claimButton, pendingRewards <= 0 && styles.claimButtonDisabled]}
          onPress={handleClaim}
          disabled={isClaiming || pendingRewards <= 0}
          activeOpacity={0.85}
        >
          <Text style={styles.claimButtonText}>
            {isClaiming ? "SIGNING WITH SEED VAULT..." : "CLAIM VIA SEED VAULT"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Claim History */}
      <Text style={styles.sectionTitle}>TRANSACTION HISTORY</Text>
      <View style={styles.historyList}>
        {claimHistory.map((item) => (
          <View key={item.id} style={styles.historyItem}>
            <View>
              <Text style={styles.historyAmount}>+{item.amount.toFixed(1)} $SNTR</Text>
              <Text style={styles.historyDate}>{item.date}</Text>
            </View>
            <View style={styles.txBadge}>
              <Text style={styles.txText}>{item.txHash}</Text>
            </View>
          </View>
        ))}
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
    backgroundColor: Colors.surface,
    borderColor: Colors.surfaceBorder,
    borderWidth: 1,
    borderRadius: 14,
    padding: 20,
    alignItems: "center",
    marginBottom: 20,
  },
  heroLabel: {
    fontSize: 11,
    fontFamily: "monospace",
    color: Colors.textMuted,
    letterSpacing: 1,
  },
  amountRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 6,
    marginVertical: 10,
  },
  heroAmount: {
    fontSize: 38,
    fontWeight: "900",
    color: Colors.emerald,
    fontFamily: "monospace",
  },
  heroToken: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontFamily: "monospace",
    fontWeight: "700",
  },
  claimButton: {
    backgroundColor: Colors.emerald,
    width: "100%",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  claimButtonDisabled: {
    backgroundColor: Colors.surfaceBorder,
    opacity: 0.5,
  },
  claimButtonText: {
    color: "#000",
    fontFamily: "monospace",
    fontWeight: "900",
    fontSize: 12,
    letterSpacing: 0.8,
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: "monospace",
    color: Colors.textMuted,
    letterSpacing: 1.2,
    marginBottom: 10,
  },
  historyList: {
    backgroundColor: Colors.surface,
    borderColor: Colors.surfaceBorder,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
  },
  historyItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceBorder,
  },
  historyAmount: {
    color: Colors.textPrimary,
    fontFamily: "monospace",
    fontWeight: "800",
    fontSize: 14,
  },
  historyDate: {
    color: Colors.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  txBadge: {
    backgroundColor: Colors.background,
    borderColor: Colors.surfaceBorder,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  txText: {
    color: Colors.cyan,
    fontFamily: "monospace",
    fontSize: 10,
  },
});
