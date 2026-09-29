import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Colors } from "../theme/colors";

interface MetricCardProps {
  title: string;
  badge?: string;
  badgeColor?: string;
  primaryValue: string;
  primaryUnit?: string;
  subValue: string;
  accentColor?: string;
  icon?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  badge,
  badgeColor = Colors.emerald,
  primaryValue,
  primaryUnit,
  subValue,
  accentColor = Colors.emerald,
  icon,
}) => {
  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.titleRow}>
          {icon && <Text style={styles.icon}>{icon}</Text>}
          <Text style={styles.titleText}>{title}</Text>
        </View>
        {badge && (
          <View style={[styles.badge, { borderColor: badgeColor, backgroundColor: `${badgeColor}18` }]}>
            <Text style={[styles.badgeText, { color: badgeColor }]}>{badge}</Text>
          </View>
        )}
      </View>

      <View style={styles.valueRow}>
        <Text style={[styles.primaryValue, { color: accentColor }]}>{primaryValue}</Text>
        {primaryUnit && <Text style={styles.primaryUnit}>{primaryUnit}</Text>}
      </View>

      <Text style={styles.subValue}>{subValue}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderColor: Colors.surfaceBorder,
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  icon: {
    fontSize: 14,
  },
  titleText: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontFamily: "monospace",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  badge: {
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "700",
    fontFamily: "monospace",
  },
  valueRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
    marginVertical: 4,
  },
  primaryValue: {
    fontSize: 24,
    fontWeight: "900",
    fontFamily: "monospace",
  },
  primaryUnit: {
    fontSize: 13,
    color: Colors.textMuted,
    fontFamily: "monospace",
  },
  subValue: {
    fontSize: 12,
    color: Colors.textMuted,
  },
});
