import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
  ActivityIndicator,
  Share
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from "../../context/AuthContext";
import { updatePrivacySettings, exportData, deleteDataRequest } from "../../services/userService";

export default function PrivacySettingsScreen() {
  const { user, updateUser } = useAuth();
  
  const [marketing, setMarketing] = useState(user?.privacySettings?.marketingConsent || false);
  const [processing, setProcessing] = useState(user?.privacySettings?.dataProcessingConsent || false);
  const [loading, setLoading] = useState(false);

  // Sync state if user context updates
  useEffect(() => {
    if (user?.privacySettings) {
      setMarketing(user.privacySettings.marketingConsent || false);
      setProcessing(user.privacySettings.dataProcessingConsent || false);
    }
  }, [user]);

  const handleMarketingChange = async (value) => {
    setMarketing(value);
    try {
      const res = await updatePrivacySettings({ marketingConsent: value });
      if (res.success) {
        const updatedUser = { ...user, privacySettings: res.privacySettings };
        await updateUser(updatedUser);
      }
    } catch (err) {
      setMarketing(!value);
      Alert.alert("Error", "Failed to update marketing consent.");
    }
  };

  const handleProcessingChange = async (value) => {
    setProcessing(value);
    try {
      const res = await updatePrivacySettings({ dataProcessingConsent: value });
      if (res.success) {
        const updatedUser = { ...user, privacySettings: res.privacySettings };
        await updateUser(updatedUser);
      }
    } catch (err) {
      setProcessing(!value);
      Alert.alert("Error", "Failed to update data processing consent.");
    }
  };

  const handleExportData = async () => {
    try {
      setLoading(true);
      const res = await exportData();
      if (res.success) {
        const dataStr = JSON.stringify(res.data, null, 2);
        await Share.share({
          message: dataStr,
          title: "UBS Global GDPR Data Export"
        });
      } else {
        Alert.alert("Error", "Could not export data at this time.");
      }
    } catch (err) {
      console.log("Error exporting data:", err);
      Alert.alert("Error", "An error occurred while exporting your data.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDataRequest = () => {
    Alert.alert(
      "Confirm Data Deletion Request",
      "This will request administrators to permanently purge all your personal records, reviews, and activity from UBS Global. This action is irreversible once processed.\n\nAre you sure you want to proceed?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Request Deletion", 
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);
              const res = await deleteDataRequest();
              if (res.success) {
                Alert.alert("Request Submitted", res.message || "Your request is now pending review.");
              } else {
                Alert.alert("Error", res.message || "Failed to submit request.");
              }
            } catch (err) {
              Alert.alert("Error", "Could not submit deletion request.");
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.canGoBack() ? router.back() : router.replace('/(buyer)/home')}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1565c0" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.sectionTitle}>Consent & Approvals</Text>
          
          <View style={styles.consentItem}>
            <View style={styles.consentText}>
              <Text style={styles.label}>Marketing Consent</Text>
              <Text style={styles.description}>Receive promotional deals, platform updates, and vendor highlights.</Text>
            </View>
            <Switch
              value={marketing}
              onValueChange={handleMarketingChange}
              trackColor={{ false: "#ccc", true: "#1565c0" }}
            />
          </View>

          <View style={styles.consentItem}>
            <View style={styles.consentText}>
              <Text style={styles.label}>Data Processing Consent</Text>
              <Text style={styles.description}>Allow UBS Global to process personal information for customizing experience.</Text>
            </View>
            <Switch
              value={processing}
              onValueChange={handleProcessingChange}
              trackColor={{ false: "#ccc", true: "#1565c0" }}
            />
          </View>

          <Text style={styles.sectionTitle}>GDPR Data Rights</Text>

          <TouchableOpacity style={styles.actionRow} onPress={handleExportData}>
            <MaterialCommunityIcons name="download" size={22} color="#1565c0" style={styles.actionIcon} />
            <View style={styles.actionText}>
              <Text style={styles.actionLabel}>Download My Data</Text>
              <Text style={styles.actionDesc}>Get a portable copy of all your profile, order history, and review records.</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionRow} onPress={handleDeleteDataRequest}>
            <MaterialCommunityIcons name="trash-can-outline" size={22} color="#c62828" style={styles.actionIcon} />
            <View style={styles.actionText}>
              <Text style={[styles.actionLabel, { color: "#c62828" }]}>Delete My Personal Data</Text>
              <Text style={styles.actionDesc}>Submit a request to permanently purge all your personal records from the servers.</Text>
            </View>
          </TouchableOpacity>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#eef1f8" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  backBtn: { padding: 8, marginLeft: -8 },
  headerTitle: { fontSize: 18, fontWeight: "700", color: "#000033" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  content: { padding: 20 },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#666",
    textTransform: "uppercase",
    marginBottom: 12,
    marginTop: 20,
  },
  consentItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  consentText: { flex: 1, marginRight: 16 },
  label: { fontSize: 15, fontWeight: "600", color: "#333", marginBottom: 4 },
  description: { fontSize: 12, color: "#888", lineHeight: 18 },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  actionIcon: { marginRight: 16 },
  actionText: { flex: 1 },
  actionLabel: { fontSize: 15, fontWeight: "600", color: "#333", marginBottom: 2 },
  actionDesc: { fontSize: 12, color: "#888", lineHeight: 18 }
});
