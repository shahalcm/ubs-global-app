import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  StatusBar
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { MaterialCommunityIcons } from '@expo/vector-icons'

const { width } = Dimensions.get('window')

export default function OutgoingCallScreen({ otherUser, status, onEnd }) {
  const avatarUrl = otherUser?.avatar || 'https://via.placeholder.com/150'
  const name = otherUser?.name || 'UBS User'

  const getStatusLabel = () => {
    switch (status) {
      case 'connecting':
        return 'Connecting...'
      case 'ringing':
        return 'Ringing...'
      default:
        return 'Calling...'
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />

      <View style={styles.recipientInfoContainer}>
        <Text style={styles.outgoingLabel}>Outgoing Voice Call</Text>
        <Image source={{ uri: avatarUrl }} style={styles.avatar} />
        <Text style={styles.recipientName}>{name}</Text>
        <Text style={styles.statusLabel}>{getStatusLabel()}</Text>
      </View>

      <View style={styles.actionContainer}>
        {/* End Call Button */}
        <TouchableOpacity
          style={[styles.button, styles.endButton]}
          onPress={onEnd}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="phone-hangup" size={32} color="#fff" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#0f172a', // Sleek dark slate
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 60,
    zIndex: 9999,
  },
  recipientInfoContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  outgoingLabel: {
    color: '#38bdf8', // Light sky blue
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 30,
  },
  avatar: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 4,
    borderColor: 'rgba(56, 189, 248, 0.2)', // Translucent border
    marginBottom: 20,
  },
  recipientName: {
    color: '#f8fafc',
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  statusLabel: {
    color: '#94a3b8',
    fontSize: 16,
    fontWeight: '500',
  },
  actionContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: width * 0.8,
    marginBottom: 40,
  },
  button: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  endButton: {
    backgroundColor: '#ef4444', // Red-500
  }
})
