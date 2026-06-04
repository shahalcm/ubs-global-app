import React, { useState } from "react";
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
  ActivityIndicator
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from "../../context/AuthContext";
import { deleteAccount } from "../../services/userService";

export default function SettingsScreen() {
  const { logout, user } = useAuth();
  const [notifications, setNotifications] = useState(true);
  const [darkTheme, setDarkTheme] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);

  const handleContactSupport = () => {
    Alert.alert(
      "Connect Support",
      "We offer 24/7 global trade assistance. How would you like to connect?",
      [
        {
          text: "Email Support",
          onPress: () => Linking.openURL('mailto:support@ubsglobalapp.com?subject=UBS Global Support Request')
        },
        {
          text: "Call Hotline",
          onPress: () => Linking.openURL('tel:+18005550199')
        },
        {
          text: "Cancel",
          style: "cancel"
        }
      ]
    );
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText.trim().toUpperCase() !== "DELETE") {
      Alert.alert("Invalid Confirmation", "Please type the word 'DELETE' to confirm.");
      return;
    }

    try {
      setDeleting(true);
      const res = await deleteAccount();
      if (res.success) {
        setShowDeleteModal(false);
        Alert.alert("Account Deleted", "Your account has been deleted successfully.");
        await logout();
        router.replace('/(auth)/login');
      } else {
        Alert.alert("Error", res.message || "Failed to delete account.");
      }
    } catch (err) {
      console.log("Delete account error:", err);
      Alert.alert("Error", "An unexpected error occurred while deleting your account.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>Preferences</Text>
        
        <TouchableOpacity style={styles.settingItem} onPress={() => router.push('/(auth)/language?fromSettings=true')}>
          <View style={styles.settingTextContainer}>
            <Text style={styles.settingLabel}>Language</Text>
            <Text style={styles.settingDesc}>Change application language</Text>
          </View>
          <Text style={styles.chevron}>→</Text>
        </TouchableOpacity>
        
        <View style={styles.settingItem}>
          <View style={styles.settingTextContainer}>
            <Text style={styles.settingLabel}>Push Notifications</Text>
            <Text style={styles.settingDesc}>Receive alerts for your orders</Text>
          </View>
          <Switch
            value={notifications}
            onValueChange={setNotifications}
            trackColor={{ false: "#ccc", true: "#1565c0" }}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingTextContainer}>
            <Text style={styles.settingLabel}>Dark Theme</Text>
            <Text style={styles.settingDesc}>Use dark mode appearance</Text>
          </View>
          <Switch
            value={darkTheme}
            onValueChange={setDarkTheme}
            trackColor={{ false: "#ccc", true: "#1565c0" }}
          />
        </View>

        <Text style={styles.sectionTitle}>Security & GDPR</Text>

        <TouchableOpacity style={styles.settingRow} onPress={() => router.push('/(buyer)/privacy-settings')}>
          <Text style={styles.settingLabel}>Privacy Settings</Text>
          <Text style={styles.chevron}>→</Text>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Legal & Compliance</Text>

        <TouchableOpacity style={styles.settingRow} onPress={() => router.push('/(buyer)/privacy-policy')}>
          <Text style={styles.settingLabel}>Privacy Policy</Text>
          <Text style={styles.chevron}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingRow} onPress={() => router.push('/(buyer)/terms-and-conditions')}>
          <Text style={styles.settingLabel}>Terms & Conditions</Text>
          <Text style={styles.chevron}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingRow} onPress={() => router.push('/(buyer)/refund-policy')}>
          <Text style={styles.settingLabel}>Refund Policy</Text>
          <Text style={styles.chevron}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingRow} onPress={() => router.push('/(buyer)/account-deletion-policy')}>
          <Text style={styles.settingLabel}>Account Deletion Policy</Text>
          <Text style={styles.chevron}>→</Text>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Support</Text>

        <TouchableOpacity style={styles.settingRow} onPress={handleContactSupport}>
          <Text style={styles.settingLabel}>Contact Support</Text>
          <Text style={styles.chevron}>→</Text>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Danger Zone</Text>

        <TouchableOpacity style={styles.settingRow} onPress={() => setShowDeleteModal(true)}>
          <Text style={[styles.settingLabel, { color: "#c62828" }]}>Delete Account</Text>
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
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>⚠️ Delete Your Account?</Text>
            
            <Text style={styles.modalWarningText}>
              This action is permanent and cannot be undone. Under GDPR and App Store Guidelines:
              {"\n\n"}
              • Your profile details will be soft-deleted and anonymized.
              • Active seller stores will be suspended.
              • All your product listings will be deactivated.
              • You will be logged out immediately.
            </Text>

            <Text style={styles.modalInputLabel}>
              Please type the word <Text style={{fontWeight: "bold", color: "#c62828"}}>"DELETE"</Text> to confirm:
            </Text>
            
            <TextInput
              style={styles.modalInput}
              value={deleteConfirmText}
              onChangeText={setDeleteConfirmText}
              placeholder="DELETE"
              placeholderTextColor="#bbb"
              autoCapitalize="characters"
              editable={!deleting}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalCancelBtn]} 
                onPress={() => {
                  setDeleteConfirmText("");
                  setShowDeleteModal(false);
                }}
                disabled={deleting}
              >
                <Text style={styles.modalCancelBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.modalButton, styles.modalDeleteBtn]} 
                onPress={handleDeleteAccount}
                disabled={deleting}
              >
                {deleting ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.modalDeleteBtnText}>Delete Account</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#eef1f8",
  },
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
  backBtn: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000033",
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#666",
    textTransform: "uppercase",
    marginBottom: 12,
    marginTop: 20,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
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
    color: "#333",
    marginBottom: 4,
  },
  settingDesc: {
    fontSize: 13,
    color: "#888",
  },
  chevron: {
    fontSize: 18,
    color: "#ccc",
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
    backgroundColor: "#fff",
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
    color: "#000033",
    marginBottom: 16,
  },
  modalWarningText: {
    fontSize: 14,
    color: "#444",
    lineHeight: 20,
    marginBottom: 20,
  },
  modalInputLabel: {
    fontSize: 14,
    color: "#333",
    marginBottom: 8,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: "#dde3f0",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: "#333",
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
