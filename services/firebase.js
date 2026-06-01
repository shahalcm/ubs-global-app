// client/services/firebase.js
import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence, getAuth } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Firebase configuration using environment variables
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

let app = null;
let auth = null;

// Safeguard Firebase initialization against missing/incomplete configuration in production builds
const isConfigValid = firebaseConfig.apiKey && firebaseConfig.projectId;

if (isConfigValid) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    if (Platform.OS === 'web') {
      auth = getAuth(app);
    } else {
      if (typeof getReactNativePersistence === 'function') {
        auth = initializeAuth(app, {
          persistence: getReactNativePersistence(AsyncStorage),
        });
      } else {
        auth = getAuth(app);
      }
    }
    console.log("🔥 Firebase Initialized Successfully");
  } catch (error) {
    console.error("💥 Firebase initialization failed during startup:", error);
  }
} else {
  console.warn("⚠️ Firebase environment variables are missing! Firebase Auth will be disabled.");
}

export { app, auth };
