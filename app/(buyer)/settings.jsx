import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
  Linking,
  Modal,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from "../../context/AuthContext";
import { deleteAccount } from "../../services/userService";
import { useTranslation } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "../../context/ThemeContext";

export default function SettingsScreen() {
  const { logout, user } = useAuth();
  const { t } = useTranslation();
  const { darkTheme } = useTheme();
  const [notifications, setNotifications] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);

  // Load preferences from AsyncStorage on mount
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const savedNotifications = await AsyncStorage.getItem("notifications_enabled");
        if (savedNotifications !== null) {
          setNotifications(savedNotifications === "true");
        }
      } catch (err) {
        console.log("Error loading settings preferences:", err);
      }
    };
    loadPreferences();
  }, []);

  const handleNotificationsChange = async (val) => {
    setNotifications(val);
    try {
      await AsyncStorage.setItem("notifications_enabled", String(val));
    } catch (err) {
      console.log("Error saving notifications preference:", err);
    }
  };

  const handleContactSupport = () => {
    Alert.alert(
      t("Connect Support"),
      t("We offer 24/7 global trade assistance. How would you like to connect?"),
      [
        {
          text: t("Email Support"),
          onPress: () => Linking.openURL('mailto:ubsimportingexporting@gmail.com?subject=UBS Global Support Request')
        },
        {
          text: t("Call Hotline"),
          onPress: () => Linking.openURL('tel:9544755008')
        },
        {
          text: t("Cancel"),
          style: "cancel"
        }
      ]
    );
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText.trim().toUpperCase() !== "DELETE") {
      Alert.alert(t("Invalid Confirmation"), t("Please type the word 'DELETE' to confirm."));
      return;
    }

    try {
      setDeleting(true);
      const res = await deleteAccount();
      if (res.success) {
        setShowDeleteModal(false);
        Alert.alert(t("Account Deleted"), t("Your account has been deleted successfully."));
        await logout();
        router.replace('/(auth)/login');
      } else {
        Alert.alert(t("Error"), res.message || t("Failed to delete account."));
      }
    } catch (err) {
      console.log("Delete account error:", err);
      Alert.alert(t("Error"), t("An unexpected error occurred while deleting your account."));
    } finally {
      setDeleting(false);
    }
  };

  // Dynamic theme mapping
  const theme = {
    background: darkTheme ? "#121212" : "#eef1f8",
    cardBg: darkTheme ? "#1e1e1e" : "#fff",
    text: darkTheme ? "#ffffff" : "#333333",
    subText: darkTheme ? "#aaaaaa" : "#666666",
    descText: darkTheme ? "#888888" : "#888888",
    border: darkTheme ? "#2a2a2a" : "#eee",
    headerBg: darkTheme ? "#1a1a1a" : "#fff",
    headerText: darkTheme ? "#ffffff" : "#000033",
    chevron: darkTheme ? "#666" : "#ccc",
    inputBg: darkTheme ? "#2a2a2a" : "#fff",
    inputBorder: darkTheme ? "#3a3a3a" : "#dde3f0"
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.headerBg, borderBottomColor: theme.border }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.canGoBack() ? router.back() : router.replace('/(buyer)/home')}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.headerText }]}>{t("Settings")}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.sectionTitle, { color: theme.subText }]}>{t("Preferences")}</Text>
        
        <TouchableOpacity style={[styles.settingItem, { backgroundColor: theme.cardBg }]} onPress={() => router.push('/(auth)/language?fromSettings=true')}>
          <View style={styles.settingTextContainer}>
            <Text style={[styles.settingLabel, { color: theme.text }]}>{t("Language")}</Text>
            <Text style={[styles.settingDesc, { color: theme.descText }]}>{t("Choose your preferred language")}</Text>
          </View>
          <Text style={[styles.chevron, { color: theme.chevron }]}>→</Text>
        </TouchableOpacity>
        
        <View style={[styles.settingItem, { backgroundColor: theme.cardBg }]}>
          <View style={styles.settingTextContainer}>
            <Text style={[styles.settingLabel, { color: theme.text }]}>{t("Push Notifications")}</Text>
            <Text style={[styles.settingDesc, { color: theme.descText }]}>{t("Receive alerts for your orders")}</Text>
          </View>
          <Switch
            value={notifications}
            onValueChange={handleNotificationsChange}
            trackColor={{ false: "#ccc", true: "#1565c0" }}
          />
        </View>

        <Text style={[styles.sectionTitle, { color: theme.subText }]}>{t("Security & GDPR")}</Text>

        <TouchableOpacity style={[styles.settingRow, { backgroundColor: theme.cardBg }]} onPress={() => router.push('/(buyer)/privacy-settings')}>
          <Text style={[styles.settingLabel, { color: theme.text }]}>{t("Privacy Settings")}</Text>
          <Text style={[styles.chevron, { color: theme.chevron }]}>→</Text>
        </TouchableOpacity>

        <Text style={[styles.sectionTitle, { color: theme.subText }]}>{t("Legal & Compliance")}</Text>

        <TouchableOpacity style={[styles.settingRow, { backgroundColor: theme.cardBg }]} onPress={() => router.push('/(buyer)/privacy-policy')}>
          <Text style={[styles.settingLabel, { color: theme.text }]}>{t("Privacy Policy")}</Text>
          <Text style={[styles.chevron, { color: theme.chevron }]}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.settingRow, { backgroundColor: theme.cardBg }]} onPress={() => router.push('/(buyer)/terms-and-conditions')}>
          <Text style={[styles.settingLabel, { color: theme.text }]}>{t("Terms of Service")}</Text>
          <Text style={[styles.chevron, { color: theme.chevron }]}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.settingRow, { backgroundColor: theme.cardBg }]} onPress={() => router.push('/(buyer)/refund-policy')}>
          <Text style={[styles.settingLabel, { color: theme.text }]}>{t("Refund Policy")}</Text>
          <Text style={[styles.chevron, { color: theme.chevron }]}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.settingRow, { backgroundColor: theme.cardBg }]} onPress={() => router.push('/(buyer)/account-deletion-policy')}>
          <Text style={[styles.settingLabel, { color: theme.text }]}>{t("Account Deletion Policy")}</Text>
          <Text style={[styles.chevron, { color: theme.chevron }]}>→</Text>
        </TouchableOpacity>

        <Text style={[styles.sectionTitle, { color: theme.subText }]}>{t("Support")}</Text>

        <TouchableOpacity style={[styles.settingRow, { backgroundColor: theme.cardBg }]} onPress={handleContactSupport}>
          <Text style={[styles.settingLabel, { color: theme.text }]}>{t("Contact Support")}</Text>
          <Text style={[styles.chevron, { color: theme.chevron }]}>→</Text>
        </TouchableOpacity>

        <Text style={[styles.sectionTitle, { color: theme.subText }]}>{t("Danger Zone")}</Text>

        <TouchableOpacity style={[styles.settingRow, { backgroundColor: theme.cardBg }]} onPress={() => setShowDeleteModal(true)}>
          <Text style={[styles.settingLabel, { color: "#c62828" }]}>{t("Delete Account")}</Text>
          <Text style={[styles.chevron, { color: "#c62828" }]}>→</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Account Deletion Confirmation Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showDeleteModal}
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: theme.cardBg }]}>
              <Text style={[styles.modalTitle, { color: theme.headerText }]}>⚠️ {t("Delete Your Account?")}</Text>
              
              <Text style={[styles.modalWarningText, { color: theme.text }]}>
                {t("This action is permanent and cannot be undone. Under GDPR and App Store Guidelines:")}
                {"\n\n"}
                • {t("Your profile details will be soft-deleted and anonymized.")}
                {"\n"}
                • {t("Active seller stores will be suspended.")}
                {"\n"}
                • {t("All your product listings will be deactivated.")}
                {"\n"}
                • {t("You will be logged out immediately.")}
              </Text>

              <Text style={[styles.modalInputLabel, { color: theme.text }]}>
                {t("Please type the word")} <Text style={{fontWeight: "bold", color: "#c62828"}}>"DELETE"</Text> {t("to confirm:")}
              </Text>
              
              <TextInput
                style={[styles.modalInput, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }]}
                value={deleteConfirmText}
                onChangeText={setDeleteConfirmText}
                placeholder="DELETE"
                placeholderTextColor={darkTheme ? "#666" : "#bbb"}
                autoCapitalize="characters"
                editable={!deleting}
              />

              <View style={styles.modalButtons}>
                <TouchableOpacity 
                  style={[styles.modalButton, styles.modalCancelBtn, darkTheme && { backgroundColor: "#2a2a2a" }]} 
                  onPress={() => {
                    setDeleteConfirmText("");
                    setShowDeleteModal(false);
                  }}
                  disabled={deleting}
                >
                  <Text style={[styles.modalCancelBtnText, darkTheme && { color: "#aaa" }]}>{t("Cancel")}</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.modalButton, styles.modalDeleteBtn]} 
                  onPress={handleDeleteAccount}
                  disabled={deleting}
                >
                  {deleting ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.modalDeleteBtnText}>{t("Delete Account")}</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  backBtn: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    textTransform: "uppercase",
    marginBottom: 12,
    marginTop: 20,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  settingDesc: {
    fontSize: 13,
  },
  chevron: {
    fontSize: 18,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    width: "100%",
    borderRadius: 20,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 16,
  },
  modalWarningText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
  },
  modalInputLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  modalInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 20,
    fontWeight: "700",
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  modalCancelBtn: {
    backgroundColor: "#f5f5f5",
  },
  modalCancelBtnText: {
    color: "#666",
    fontSize: 15,
    fontWeight: "700",
  },
  modalDeleteBtn: {
    backgroundColor: "#c62828",
  },
  modalDeleteBtnText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
});
