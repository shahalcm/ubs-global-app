import { useState, useEffect, useRef, useCallback } from 'react'
import { getSocket } from '../services/socketService'
import webrtcService from '../services/webrtcService'
import api from '../services/api'
import { Alert } from 'react-native'

export default function useVoiceCall(currentUser) {
  const [callId, setCallId] = useState(null)
  const [channelId, setChannelId] = useState(null)
  const [status, setStatus] = useState('idle') // idle, connecting, ringing, accepted, rejected, ended, missed
  const [isIncoming, setIsIncoming] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isSpeaker, setIsSpeaker] = useState(false)
  const [duration, setDuration] = useState(0)
  const [otherUser, setOtherUser] = useState(null) // { id, name, avatar }
  
  const timerRef = useRef(null)
  const socketRef = useRef(null)
  const otherUserRef = useRef(null)
  const callIdRef = useRef(null)

  // Sync refs to avoid stale closures in socket callbacks
  useEffect(() => {
    otherUserRef.current = otherUser
  }, [otherUser])

  useEffect(() => {
    callIdRef.current = callId
  }, [callId])

  // Reset the calling state locally
  const resetCallState = useCallback(() => {
    console.log('VoiceCallHook: Resetting call state')
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    webrtcService.cleanUp()
    setCallId(null)
    setChannelId(null)
    setStatus('idle')
    setIsIncoming(false)
    setIsMuted(false)
    setIsSpeaker(false)
    setDuration(0)
    setOtherUser(null)
  }, [])

  // Start call timer when call is accepted
  useEffect(() => {
    if (status === 'accepted') {
      setDuration(0)
      timerRef.current = setInterval(() => {
        setDuration((prev) => prev + 1)
      }, 1000)
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [status])

  // Setup WebRTC and signaling socket listeners
  useEffect(() => {
    const socket = getSocket()
    if (!socket) return
    socketRef.current = socket

    // Helper: Initialize peer connection on receiver's side
    const initReceiverPeerConnection = async (sdpOffer) => {
      try {
        await webrtcService.setupLocalStream()
        webrtcService.createPeerConnection()

        // Send ICE candidate discovered locally
        webrtcService.onIceCandidateCallback = (candidate) => {
          if (otherUserRef.current) {
            socket.emit('ice-candidate', {
              targetId: otherUserRef.current.id,
              candidate
            })
          }
        }

        // Set remote stream output
        webrtcService.onTrackCallback = (stream) => {
          console.log('VoiceCallHook: Received remote audio track')
        }

        // Create SDP answer and send it back to caller
        const answer = await webrtcService.createAnswer(sdpOffer)
        if (otherUserRef.current) {
          socket.emit('answer', {
            targetId: otherUserRef.current.id,
            answer
          })
        }
      } catch (error) {
        console.error('Failed to setup receiver WebRTC:', error)
        handleEndCall()
      }
    }

    // 1. Listen for incoming calls
    socket.on('incoming-call', (data) => {
      // If already in a call, auto-reject
      if (status !== 'idle') {
        socket.emit('call-rejected', {
          targetId: data.callerId,
          callId: data.callId,
          reason: 'busy'
        })
        return
      }

      console.log('VoiceCallHook: Received incoming-call event from:', data.callerName)
      setCallId(data.callId)
      setChannelId(data.channelId)
      setIsIncoming(true)
      setStatus('ringing')
      setOtherUser({
        id: data.callerId,
        name: data.callerName,
        avatar: data.callerAvatar
      })
    })

    // 2. Listen for SDP offer (on receiver side)
    socket.on('offer', async (data) => {
      console.log('VoiceCallHook: Received SDP offer from caller')
      await initReceiverPeerConnection(data.offer)
    })

    // 3. Listen for SDP answer (on caller side)
    socket.on('answer', async (data) => {
      console.log('VoiceCallHook: Received SDP answer from receiver')
      try {
        await webrtcService.setAnswer(data.answer)
        setStatus('accepted')
        // Update call log to accepted in database
        if (callIdRef.current) {
          await api.patch(`/calls/${callIdRef.current}`, { status: 'accepted' })
        }
      } catch (error) {
        console.error('Failed to set remote answer:', error)
        handleEndCall()
      }
    })

    // 4. Listen for ICE candidates
    socket.on('ice-candidate', async (data) => {
      await webrtcService.addIceCandidate(data.candidate)
    })

    // 5. Listen for Call Rejection
    socket.on('call-rejected', async (data) => {
      console.log('VoiceCallHook: Call rejected. Reason:', data.reason)
      setStatus('rejected')
      
      // Update call log state on server
      if (callIdRef.current) {
        const updateStatus = data.reason === 'busy' ? 'rejected' : 'rejected'
        await api.patch(`/calls/${callIdRef.current}`, { status: updateStatus })
      }
      
      Alert.alert('Call Failed', data.reason === 'busy' ? 'User is busy' : 'Call rejected')
      setTimeout(() => {
        resetCallState()
      }, 2000)
    })

    // 6. Listen for Call Ended by peer
    socket.on('call-ended', async () => {
      console.log('VoiceCallHook: Call ended by remote user')
      setStatus('ended')
      setTimeout(() => {
        resetCallState()
      }, 1500)
    })

    // 7. Listen for Call Cancelled by caller before pickup
    socket.on('call-cancelled', () => {
      console.log('VoiceCallHook: Outgoing call cancelled by caller')
      setStatus('missed')
      setTimeout(() => {
        resetCallState()
      }, 1500)
    })

    return () => {
      socket.off('incoming-call')
      socket.off('offer')
      socket.off('answer')
      socket.off('ice-candidate')
      socket.off('call-rejected')
      socket.off('call-ended')
      socket.off('call-cancelled')
    }
  }, [status, resetCallState, currentUser])

  // Initiate an outgoing call
  const handleStartCall = async (receiverId, receiverName, receiverAvatar) => {
    if (!socketRef.current) {
      Alert.alert('Connection Error', 'Socket is disconnected. Retrying...')
      return
    }

    try {
      setStatus('connecting')
      setOtherUser({
        id: receiverId,
        name: receiverName,
        avatar: receiverAvatar
      })

      // 1. Create call log on backend
      const res = await api.post('/calls', { receiverId })
      if (!res.data || !res.data.success) {
        throw new Error(res.data?.message || 'Failed to initialize call API')
      }

      const { call, receiver } = res.data
      setCallId(call._id)
      setChannelId(call.channelId)
      
      // Update otherUser with resolved receiver details
      setOtherUser({
        id: receiver._id,
        name: receiver.name,
        avatar: receiver.avatar
      })

      // 2. Setup WebRTC Peer Connection locally
      await webrtcService.setupLocalStream()
      webrtcService.createPeerConnection()

      // Bind candidate handler
      webrtcService.onIceCandidateCallback = (candidate) => {
        socketRef.current.emit('ice-candidate', {
          targetId: receiver._id,
          candidate
        })
      }

      // Bind remote track handler
      webrtcService.onTrackCallback = (stream) => {
        console.log('VoiceCallHook: Connected to remote track stream')
      }

      // 3. Emit signaling 'call-user' to recipient
      socketRef.current.emit('call-user', {
        receiverId: receiver._id,
        callerId: currentUser._id,
        callerName: currentUser.name,
        callerAvatar: currentUser.avatar,
        channelId: call.channelId,
        callId: call._id
      })

      // 4. Generate WebRTC SDP offer and emit
      const offer = await webrtcService.createOffer()
      socketRef.current.emit('offer', {
        targetId: receiver._id,
        offer
      })

      setStatus('ringing')
    } catch (error) {
      console.error('Failed to initiate outgoing call:', error)
      Alert.alert('Call Failed', error.message || 'Error establishing connection')
      resetCallState()
    }
  }

  // Accept incoming call
  const handleAcceptCall = async () => {
    if (!otherUser || !callId) return
    try {
      setStatus('accepted')
      await api.patch(`/calls/${callId}`, { status: 'accepted' })
      console.log('VoiceCallHook: Call accepted')
    } catch (error) {
      console.error('Error accepting call:', error)
      handleEndCall()
    }
  }

  // Reject incoming call
  const handleRejectCall = async () => {
    if (!otherUser || !callId) return
    try {
      setStatus('rejected')
      socketRef.current.emit('call-rejected', {
        targetId: otherUser.id,
        callId
      })
      await api.patch(`/calls/${callId}`, { status: 'rejected' })
      resetCallState()
    } catch (error) {
      console.error('Error rejecting call:', error)
      resetCallState()
    }
  }

  // End active call or cancel outgoing call
  const handleEndCall = async () => {
    if (!otherUser) {
      resetCallState()
      return
    }

    try {
      if (status === 'connecting' || status === 'ringing') {
        if (isIncoming) {
          // Reject incoming call
          socketRef.current.emit('call-rejected', {
            targetId: otherUser.id,
            callId,
            reason: 'declined'
          })
          if (callId) {
            await api.patch(`/calls/${callId}`, { status: 'rejected' })
          }
        } else {
          // Cancel outgoing call
          socketRef.current.emit('call-cancelled', {
            targetId: otherUser.id,
            callId
          })
          if (callId) {
            await api.patch(`/calls/${callId}`, { status: 'missed' })
          }
        }
      } else if (status === 'accepted') {
        // End active ongoing call
        socketRef.current.emit('call-ended', {
          targetId: otherUser.id,
          callId
        })
        if (callId) {
          await api.patch(`/calls/${callId}`, { status: 'ended' })
        }
      }
    } catch (error) {
      console.error('Error ending call:', error)
    } finally {
      setStatus('ended')
      setTimeout(() => {
        resetCallState()
      }, 1000)
    }
  }

  // Toggle local mute
  const handleToggleMute = () => {
    const nextMutedState = !isMuted
    setIsMuted(nextMutedState)
    webrtcService.toggleMute(nextMutedState)
  }

  // Toggle device speakerphone
  const handleToggleSpeaker = () => {
    const nextSpeakerState = !isSpeaker
    setIsSpeaker(nextSpeakerState)
    webrtcService.toggleSpeaker(nextSpeakerState)
  }

  return {
    callId,
    channelId,
    status,
    isIncoming,
    isMuted,
    isSpeaker,
    duration,
    otherUser,
    startCall: handleStartCall,
    acceptCall: handleAcceptCall,
    rejectCall: handleRejectCall,
    endCall: handleEndCall,
    toggleMute: handleToggleMute,
    toggleSpeaker: handleToggleSpeaker
  }
}
