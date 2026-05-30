import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../../constants/colors";

export function BottomNav({ items, activeKey, onPress }) {
  const insets = useSafeAreaInsets();
  const bottomPadding =
    Platform.OS === "android"
      ? Math.max(insets.bottom, 12)
      : Math.max(insets.bottom, 20);

  const barHeight =
    Platform.OS === "android"
      ? 60 + bottomPadding
      : 64 + bottomPadding;

  return (
    <View
      style={[
        styles.bar,
        {
          paddingBottom: bottomPadding,
          height: barHeight,
        },
      ]}
    >
      {items.map((item) => {
        const active = item.key === activeKey;

        return (
          <TouchableOpacity
            key={item.key}
            style={styles.tab}
            onPress={() => onPress(item.key)}
            activeOpacity={0.8}
            accessibilityRole="button"
          >
            {item.icon && (
              <MaterialCommunityIcons
                name={item.icon}
                size={26}
                color={active ? colors.primary : colors.textMuted}
                style={styles.icon}
              />
            )}

            <Text style={[styles.label, active && styles.labelActive]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    backgroundColor: colors.background,
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    elevation: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    overflow: "hidden",
    zIndex: 999,
  },

  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  icon: {
    marginBottom: 4,
  },

  label: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: "500",
    textAlign: "center",
  },

  labelActive: {
    color: colors.primary,
    fontWeight: "700",
  },
});

export default BottomNav;