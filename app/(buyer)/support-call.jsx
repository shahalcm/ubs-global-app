import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ActivityIndicator
} from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { useAuth } from '../../context/AuthContext'
import useSupportCall from '../../hooks/useSupportCall'

export default function SupportCallScreen() {
  const { user } = useAuth()
  const {
    status,
    isMuted,
    isSpeaker,
    duration,
    endCall,
    toggleMute,
    toggleSpeaker
  } = useSupportCall(user)

  // Auto exit screen when call ends or resets
  React.useEffect(() => {
    if (status === 'idle') {
      if (router.canGoBack()) {
        router.back()
      } else {
        router.replace('/(buyer)/help')
      }
    }
  }, [status])

  const formatDuration = (secs) => {
    const mins = Math.floor(secs / 60)
    const remainingSecs = secs % 60
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`
  }

  const renderStatusLabel = () => {
    switch (status) {
      case 'connecting':
        return 'Connecting to Support...'
      case 'ringing':
        return 'Ringing Support Agent...'
      case 'accepted':
        return `Connected • ${formatDuration(duration)}`
      case 'rejected':
        return 'Call Declined'
      case 'missed':
        return 'No Support Agent Answered'
      case 'ended':
        return 'Call Ended'
      default:
        return 'Connecting...'
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />

      {/* Header Info */}
      <View style={styles.header}>
        <Text style={styles.appTitle}>UBS GLOBAL SUPPORT</Text>
        <Text style={styles.secureText}>🔒 End-to-End Encrypted Audio</Text>
      </View>

      {/* Main Avatar & Call Info */}
      <View style={styles.centerContainer}>
        <View style={styles.avatarCircle}>
          <MaterialCommunityIcons name="headset" size={64} color="#38bdf8" />
        </View>

        <Text style={styles.agentName}>Customer Care Agent</Text>
        <Text style={styles.statusText}>{renderStatusLabel()}</Text>

        {(status === 'connecting' || status === 'ringing') && (
          <ActivityIndicator size="large" color="#38bdf8" style={{ marginTop: 24 }} />
        )}
      </View>

      {/* Audio Controls Bar */}
      <View style={styles.controlsContainer}>
        <TouchableOpacity
          style={[styles.controlBtn, isMuted && styles.controlBtnActive]}
          onPress={toggleMute}
          disabled={status !== 'accepted'}
        >
          <MaterialCommunityIcons
            name={isMuted ? 'microphone-off' : 'microphone'}
            size={28}
            color={isMuted ? '#ef4444' : '#f8fafc'}
          />
          <Text style={styles.controlText}>{isMuted ? 'Muted' : 'Mute'}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.endCallBtn}
          onPress={async () => {
            await endCall()
            if (router.canGoBack()) router.back()
          }}
        >
          <MaterialCommunityIcons name="phone-hangup" size={32} color="#ffffff" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.controlBtn, isSpeaker && styles.controlBtnActive]}
          onPress={toggleSpeaker}
          disabled={status !== 'accepted'}
        >
          <MaterialCommunityIcons
            name={isSpeaker ? 'volume-high' : 'volume-medium'}
            size={28}
            color={isSpeaker ? '#38bdf8' : '#f8fafc'}
          />
          <Text style={styles.controlText}>{isSpeaker ? 'Speaker' : 'Earpiece'}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    justifyContent: 'space-between',
    paddingVertical: 24,
    paddingHorizontal: 20
  },
  header: {
    alignItems: 'center',
    marginTop: 20
  },
  appTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#94a3b8',
    letterSpacing: 2
  },
  secureText: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4
  },
  centerContainer: {
    alignItems: 'center'
  },
  avatarCircle: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#334155',
    marginBottom: 20,
    shadowColor: '#38bdf8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 6
  },
  agentName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#f8fafc'
  },
  statusText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#38bdf8',
    marginTop: 8
  },
  controlsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingBottom: 24
  },
  controlBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#334155'
  },
  controlBtnActive: {
    backgroundColor: '#334155',
    borderColor: '#38bdf8'
  },
  controlText: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 4,
    fontWeight: '600'
  },
  endCallBtn: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#ef4444',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8
  }
})
