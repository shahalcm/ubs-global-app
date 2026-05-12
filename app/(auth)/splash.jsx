import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

const SKY = "#38bdf8"; // Bright light blue matching the design
const NAVY = "#0a1c6a"; // Dark navy matching the design

export default function SplashScreen() {
  const router = useRouter();
  const fade = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0)).current;
  const { width } = useWindowDimensions();
  // Adjust logo width. In the image it is quite prominent but not full width.
  const logoWidth = Math.min(width - 120, 260);

  useEffect(() => {
    // Fade in everything
    Animated.timing(fade, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    // Pulse animation for the loader ring
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [fade, pulse]);

  useEffect(() => {
    const id = setTimeout(() => {
      router.replace("/language");
    }, 4500); // Wait 4.5s so the user can enjoy the splash screen
    return () => clearTimeout(id);
  }, [router]);

  // Interpolate pulse value for ring scale and opacity
  const ringScale = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.3],
  });

  const ringOpacity = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 0.2],
  });

  return (
    <View style={styles.screen}>
      <StatusBar style="dark" />
      <Animated.View style={[styles.contentContainer, { opacity: fade }]}>
        {/* Center Block for Logo and Text grouped tightly */}
        <View style={styles.centerBlock}>
          <Image
            source={require("../../assets/images/ubs-splash-logo.png")}
            style={[styles.logo, { width: logoWidth, height: logoWidth }]}
            contentFit="contain"
            accessibilityLabel="UBS Global logo"
          />
        </View>

        {/* Bottom Loader Section */}
        <View style={styles.bottomContainer}>
          <View style={styles.loaderWrapper}>
            <Animated.View
              style={[
                styles.loaderRing,
                {
                  borderColor: SKY,
                  transform: [{ scale: ringScale }],
                  opacity: ringOpacity,
                },
              ]}
            />
            <View style={[styles.loaderDot, { backgroundColor: SKY }]} />
          </View>
          <Text style={styles.loadingText}>INITIALIZING GLOBAL NETWORK</Text>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#ffffff", // Requested pure white background
  },
  contentContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-between", // pushes centerBlock to middle and bottomContainer to bottom
  },
  centerBlock: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    paddingTop: 60, // visual push down to balance bottom content
  },
  logo: {
    marginBottom: 20, // space between logo and title
  },
  bottomContainer: {
    justifyContent: "flex-end",
    alignItems: "center",
    paddingBottom: 50,
  },
  loaderWrapper: {
    width: 60,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  loaderRing: {
    position: "absolute",
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
  },
  loaderDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  loadingText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#808e9b",
    letterSpacing: 1.2,
    textAlign: "center",
  },
});
