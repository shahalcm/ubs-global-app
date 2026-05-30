import React, { createContext, useContext } from 'react'
import { useAuth } from './AuthContext'
import useVoiceCall from '../hooks/useVoiceCall'
import IncomingCallScreen from '../screens/IncomingCallScreen'
import OutgoingCallScreen from '../screens/OutgoingCallScreen'
import VoiceCallScreen from '../screens/VoiceCallScreen'

const CallContext = createContext(null)

export const CallProvider = ({ children }) => {
  const { user } = useAuth()
  const callState = useVoiceCall(user)

  return (
    <CallContext.Provider value={callState}>
      {children}
      
      {/* 1. Show Incoming call overlay screen */}
      {callState.status === 'ringing' && callState.isIncoming && (
        <IncomingCallScreen
          otherUser={callState.otherUser}
          onAccept={callState.acceptCall}
          onReject={callState.rejectCall}
        />
      )}
      
      {/* 2. Show Outgoing ring/connecting screen */}
      {(callState.status === 'connecting' || (callState.status === 'ringing' && !callState.isIncoming)) && (
        <OutgoingCallScreen
          otherUser={callState.otherUser}
          status={callState.status}
          onEnd={callState.endCall}
        />
      )}
      
      {/* 3. Show Active Voice conversation controls */}
      {callState.status === 'accepted' && (
        <VoiceCallScreen
          otherUser={callState.otherUser}
          duration={callState.duration}
          isMuted={callState.isMuted}
          isSpeaker={callState.isSpeaker}
          onMuteToggle={callState.toggleMute}
          onSpeakerToggle={callState.toggleSpeaker}
          onEnd={callState.endCall}
        />
      )}
    </CallContext.Provider>
  )
}

export const useCall = () => {
  const context = useContext(CallContext)
  if (!context) {
    throw new Error('useCall must be used within a CallProvider')
  }
  return context
}
