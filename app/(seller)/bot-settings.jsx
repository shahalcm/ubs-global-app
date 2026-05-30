import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  Switch,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import api from '../../services/api'
import { router } from 'expo-router'
import { colors } from '../../constants/colors'
import { MaterialCommunityIcons } from '@expo/vector-icons'

export default function BotSettingsScreen() {
  const [config, setConfig] = useState(null)
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    loadConfig()
  }, [])

  const loadConfig = async () => {
    try {
      setFetching(true)
      const res = await api.get('/bot-config')
      setConfig(res.data.config)
    } catch (error) {
      console.log('Error fetching bot config:', error)
      Alert.alert('Error', 'Failed to load bot settings')
    } finally {
      setFetching(false)
    }
  }

  const handleToggleBot = async () => {
    try {
      const res = await api.patch('/bot-config/toggle')
      setConfig(prev => ({
        ...prev,
        isEnabled: res.data.isEnabled
      }))
      Alert.alert(
        res.data.isEnabled ? '✅ Bot Enabled' : '⏹ Bot Disabled',
        res.data.isEnabled
          ? 'AI will now auto-reply to buyers.'
          : 'You will handle all chats manually.'
      )
    } catch (error) {
      Alert.alert('Error', 'Failed to toggle bot status')
    }
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      await api.put('/bot-config', config)
      Alert.alert('✅ Saved', 'Bot settings updated successfully!')
    } catch (error) {
      Alert.alert('Error', 'Failed to save settings')
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading AI settings...</Text>
      </SafeAreaView>
    )
  }

  if (!config) return null

  return (
    <SafeAreaView style={styles.container}>
      {/* TOP BAR */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>AI Bot Settings</Text>
        <TouchableOpacity onPress={handleSave} disabled={loading}>
          {loading ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Text style={styles.save}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* STATUS CARD */}
        <View style={styles.statusCard}>
          <View style={styles.botIconCircle}>
            <Text style={styles.botIcon}>🤖</Text>
          </View>
          <View style={styles.statusInfo}>
            <Text style={styles.statusTitle}>AI Chat Assistant</Text>
            <Text style={styles.statusSub}>
              {config.isEnabled
                ? 'Active - Replying automatically'
                : 'Inactive - Manual replies only'
              }
            </Text>
          </View>
          <Switch
            value={config.isEnabled}
            onValueChange={handleToggleBot}
            trackColor={{
              false: '#ddd',
              true: '#c3d7ff'
            }}
            thumbColor={
              config.isEnabled ? colors.primary : '#fff'
            }
          />
        </View>

        {/* BOT NAME */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bot Name</Text>
          <TextInput
            style={styles.input}
            value={config.botName}
            onChangeText={v => setConfig(p => ({
              ...p, botName: v
            }))}
            placeholder="e.g., UBS Assistant"
            placeholderTextColor="#8e99af"
          />
        </View>

        {/* WELCOME MESSAGE */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Welcome Message</Text>
          <TextInput
            style={[styles.input, styles.textarea]}
            value={config.welcomeMessage}
            onChangeText={v => setConfig(p => ({
              ...p, welcomeMessage: v
            }))}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            placeholderTextColor="#8e99af"
          />
        </View>

        {/* CUSTOM INSTRUCTIONS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Custom Instructions</Text>
          <Text style={styles.sectionSub}>
            Tell the AI about your shop details, policies, and items.
          </Text>
          <TextInput
            style={[styles.input, styles.textareaCustom]}
            value={config.customInstructions}
            onChangeText={v => setConfig(p => ({
              ...p, customInstructions: v
            }))}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
            placeholder="e.g., We sell premium textiles. Orders usually ship in 2 days. Returns are accepted within 14 days."
            placeholderTextColor="#8e99af"
          />
        </View>

        {/* AUTO TAKEOVER */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Auto Handover to Seller</Text>
          <Text style={styles.sectionSub}>
            After how many buyer messages should the bot automatically hand over to you?
          </Text>
          <TextInput
            style={styles.input}
            value={config.autoTakeoverAfter?.toString()}
            onChangeText={v => setConfig(p => ({
              ...p, autoTakeoverAfter: Number(v) || 10
            }))}
            keyboardType="number-pad"
          />
        </View>

        {/* HOW IT WORKS */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>💡 How AI Bot Works</Text>
          <Text style={styles.infoItem}>🤖 Bot auto-replies to buyers 24/7</Text>
          <Text style={styles.infoItem}>📦 Knows your product details</Text>
          <Text style={styles.infoItem}>
            🔄 Hands over to seller after {config.autoTakeoverAfter || 10} messages or takeover keywords
          </Text>
          <Text style={styles.infoItem}>👨‍💼 You can take over the chat anytime by replying</Text>
          <Text style={styles.infoItem}>🌍 Replies in the buyer's language automatically</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background
  },
  loadingText: {
    marginTop: 12,
    color: '#7a7a7a',
    fontSize: 14
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.primary,
  },
  save: {
    fontSize: 16,
    color: '#29b6f6',
    fontWeight: '800',
  },
  scroll: { padding: 16, paddingBottom: 40 },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: '#e8ecf4',
    shadowColor: '#000',
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 1
  },
  botIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#e3f2fd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  botIcon: { fontSize: 24 },
  statusInfo: { flex: 1 },
  statusTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.primary,
  },
  statusSub: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e8ecf4',
    shadowColor: '#000',
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 1
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.primary,
    marginBottom: 4,
  },
  sectionSub: {
    fontSize: 12,
    color: '#888',
    marginBottom: 10,
    lineHeight: 16
  },
  input: {
    backgroundColor: '#f5f7fc',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e8ecf4',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: colors.text,
  },
  textarea: {
    height: 80,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  textareaCustom: {
    height: 110,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  infoCard: {
    backgroundColor: '#e3f2fd',
    borderRadius: 18,
    padding: 16,
    marginTop: 8,
    marginBottom: 16,
    gap: 8,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.primary,
    marginBottom: 4,
  },
  infoItem: {
    fontSize: 13,
    color: '#1565c0',
    lineHeight: 20,
  },
})
