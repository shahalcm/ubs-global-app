// app/(auth)/role-select.jsx
import React, { useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'

const ROLES = [
  {
    id: 'buyer',
    title: 'Buyer',
    icon: '🛍️',
    description:
      'Browse and purchase products globally. Connect with verified international vendors and manage secure logistics for your business.',
  },
  {
    id: 'seller',
    title: 'Seller',
    icon: '🏪',
    description:
      'List and sell your products worldwide. Gain access to a global network of importers and streamline your export operations.',
  },
]

export default function RoleSelectScreen() {
  const [selectedRole, setSelectedRole] = useState('buyer')
  const [loading, setLoading] = useState(false)

  const handleContinue = async () => {
    setLoading(true)
    try {
      // await api.patch('/auth/set-role', { role: selectedRole })
      if (selectedRole === 'buyer') {
        router.replace('/(auth)/location-permission')
      } else {
        router.replace('/(seller)/dashboard')
      }
    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.container}>

      {/* Top Bar */}
      <View style={styles.topBar}>
        <Text style={styles.topTitle}>UBS Global</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.closeIcon}>✕</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >

        {/* Title */}
        <Text style={styles.title}>How will you use UBS Global?</Text>
        <Text style={styles.subtitle}>
          Select the role that best matches your international trade objectives.
        </Text>

        {/* Role Cards */}
        {ROLES.map((role) => {
          const isSelected = selectedRole === role.id
          return (
            <TouchableOpacity
              key={role.id}
              style={[
                styles.roleCard,
                isSelected && styles.roleCardSelected,
              ]}
              onPress={() => setSelectedRole(role.id)}
              activeOpacity={0.85}
            >
              {/* Check Badge */}
              {isSelected && (
                <View style={styles.checkBadge}>
                  <Text style={styles.checkIcon}>✓</Text>
                </View>
              )}

              {/* Icon Box */}
              <View style={[
                styles.iconBox,
                isSelected ? styles.iconBoxSelected : styles.iconBoxDefault,
              ]}>
                <Text style={styles.roleIcon}>{role.icon}</Text>
              </View>

              {/* Text */}
              <Text style={[
                styles.roleTitle,
                isSelected && styles.roleTitleSelected,
              ]}>
                {role.title}
              </Text>
              <Text style={styles.roleDesc}>{role.description}</Text>
            </TouchableOpacity>
          )
        })}
      </ScrollView>

      {/* Sticky Continue Button */}
      <View style={styles.stickyBottom}>
        <TouchableOpacity
          style={[styles.continueBtn, loading && { opacity: 0.6 }]}
          onPress={handleContinue}
          disabled={loading}
        >
          <Text style={styles.continueBtnText}>
            {loading ? 'Please wait...' : 'Continue  →'}
          </Text>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eef1f8',
  },

  // Top Bar
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  topTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a237e',
  },
  closeIcon: {
    fontSize: 20,
    color: '#1a237e',
    fontWeight: '600',
  },

  // Content
  content: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },

  // Title
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a237e',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 36,
  },
  subtitle: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
    paddingHorizontal: 10,
  },

  // Role Card
  roleCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#dde3f0',
    padding: 22,
    marginBottom: 16,
    position: 'relative',
  },
  roleCardSelected: {
    borderColor: '#1a237e',
    backgroundColor: '#fff',
  },

  // Check Badge
  checkBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#1a237e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkIcon: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },

  // Icon Box
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconBoxSelected: {
    backgroundColor: '#dbeafe',
  },
  iconBoxDefault: {
    backgroundColor: '#f0f0f0',
  },
  roleIcon: {
    fontSize: 26,
  },

  // Role Text
  roleTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  roleTitleSelected: {
    color: '#1a237e',
  },
  roleDesc: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },

  // Sticky Bottom
  stickyBottom: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#eef1f8',
    borderTopWidth: 1,
    borderTopColor: '#e0e4f0',
  },
  continueBtn: {
    backgroundColor: '#1a237e',
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
  },
  continueBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
})