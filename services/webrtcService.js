let WebRTC = null
try {
  WebRTC = require('react-native-webrtc')
} catch (error) {
  console.warn('react-native-webrtc native module is missing or failed to evaluate. WebRTC functionality will be disabled.', error)
}

const getIceServers = () => {
  const iceServers = [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' }
  ]

  if (process.env.EXPO_PUBLIC_TURN_URL) {
    iceServers.push({
      urls: process.env.EXPO_PUBLIC_TURN_URL,
      username: process.env.EXPO_PUBLIC_TURN_USERNAME || '',
      credential: process.env.EXPO_PUBLIC_TURN_PASSWORD || ''
    })
  }
  return iceServers
}

class WebRTCManager {
  constructor() {
    this.peerConnection = null
    this.localStream = null
    this.remoteStream = null
    this.iceCandidateQueue = []
    this.onIceCandidateCallback = null
    this.onTrackCallback = null
    this.onConnectionStateChangeCallback = null
  }

  // Setup user audio media track
  async setupLocalStream() {
    try {
      if (this.localStream) {
        return this.localStream
      }

      if (!WebRTC?.mediaDevices) {
        throw new Error('WebRTC mediaDevices is not available on this platform')
      }

      console.log('[Mobile WebRTC] Requesting microphone stream...')
      const stream = await WebRTC.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        },
        video: false
      })
      this.localStream = stream
      console.log('[Mobile WebRTC] Microphone stream obtained successfully')
      return stream
    } catch (error) {
      console.error('[Mobile WebRTC] getUserMedia error:', error)
      throw error
    }
  }

  // Create peer connection with candidate queueing
  createPeerConnection() {
    this.cleanUp()

    const pcConfig = {
      iceServers: getIceServers()
    }

    if (!WebRTC?.RTCPeerConnection) {
      throw new Error('WebRTC RTCPeerConnection is not available on this platform')
    }

    console.log('[Mobile WebRTC] Creating RTCPeerConnection with STUN/TURN servers:', pcConfig.iceServers)
    this.peerConnection = new WebRTC.RTCPeerConnection(pcConfig)
    this.iceCandidateQueue = []

    // Add local tracks to peer connection
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => {
        this.peerConnection.addTrack(track, this.localStream)
      })
    }

    // Listen for discover ICE candidates
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        console.log('[ICE Candidate Sent]', event.candidate)
        if (this.onIceCandidateCallback) {
          this.onIceCandidateCallback(event.candidate)
        }
      }
    }

    // Listen for incoming remote audio tracks
    this.peerConnection.ontrack = (event) => {
      console.log('[Mobile WebRTC] Incoming remote audio track:', event.streams)
      if (event.streams && event.streams[0]) {
        this.remoteStream = event.streams[0]
        if (this.onTrackCallback) {
          this.onTrackCallback(this.remoteStream)
        }
      }
    }

    // Track connection state
    this.peerConnection.onconnectionstatechange = () => {
      const state = this.peerConnection?.connectionState
      console.log('[Mobile WebRTC Connection State Changed]', state)
      if (this.onConnectionStateChangeCallback) {
        this.onConnectionStateChangeCallback(state)
      }
    }

    return this.peerConnection
  }

  // Generate SDP offer
  async createOffer() {
    try {
      if (!this.peerConnection) {
        throw new Error('PeerConnection is not initialized')
      }
      console.log('[Offer Sent] Creating local SDP offer...')
      const offer = await this.peerConnection.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: false
      })
      await this.peerConnection.setLocalDescription(offer)
      return offer
    } catch (error) {
      console.error('[Mobile WebRTC] createOffer error:', error)
      throw error
    }
  }

  // Generate SDP answer responding to offer
  async createAnswer(remoteOffer) {
    try {
      if (!this.peerConnection) {
        throw new Error('PeerConnection is not initialized')
      }
      if (!WebRTC?.RTCSessionDescription) {
        throw new Error('WebRTC RTCSessionDescription is not available on this platform')
      }

      console.log('[Offer Received] Setting remote description...')
      await this.peerConnection.setRemoteDescription(new WebRTC.RTCSessionDescription(remoteOffer))

      // Flush queued candidates
      await this.flushIceCandidateQueue()

      console.log('[Answer Sent] Generating answer...')
      const answer = await this.peerConnection.createAnswer()
      await this.peerConnection.setLocalDescription(answer)
      return answer
    } catch (error) {
      console.error('[Mobile WebRTC] createAnswer error:', error)
      throw error
    }
  }

  // Accept and set remote answer
  async setAnswer(remoteAnswer) {
    try {
      if (!this.peerConnection) {
        throw new Error('PeerConnection is not initialized')
      }
      if (!WebRTC?.RTCSessionDescription) {
        throw new Error('WebRTC RTCSessionDescription is not available on this platform')
      }
      console.log('[Answer Received] Setting remote description answer...')
      await this.peerConnection.setRemoteDescription(new WebRTC.RTCSessionDescription(remoteAnswer))

      // Flush queued candidates
      await this.flushIceCandidateQueue()
    } catch (error) {
      console.error('[Mobile WebRTC] setAnswer error:', error)
      throw error
    }
  }

  // Add remote candidate discovered with buffering queue
  async addIceCandidate(candidate) {
    if (!candidate) return

    try {
      if (this.peerConnection && this.peerConnection.remoteDescription && this.peerConnection.remoteDescription.type) {
        console.log('[ICE Candidate Received] Adding candidate to peer connection')
        if (!WebRTC?.RTCIceCandidate) {
          throw new Error('WebRTC RTCIceCandidate is not available on this platform')
        }
        await this.peerConnection.addIceCandidate(new WebRTC.RTCIceCandidate(candidate))
      } else {
        console.log('[ICE Candidate Received] Remote description not set yet. Queueing candidate...')
        this.iceCandidateQueue.push(candidate)
      }
    } catch (error) {
      console.error('[Mobile WebRTC] addIceCandidate error:', error)
    }
  }

  // Flush queued candidates once remote description is set
  async flushIceCandidateQueue() {
    if (this.iceCandidateQueue.length > 0 && this.peerConnection) {
      console.log(`[Mobile WebRTC] Flushing ${this.iceCandidateQueue.length} queued candidates...`)
      while (this.iceCandidateQueue.length > 0) {
        const cand = this.iceCandidateQueue.shift()
        try {
          if (WebRTC?.RTCIceCandidate) {
            await this.peerConnection.addIceCandidate(new WebRTC.RTCIceCandidate(cand))
          }
        } catch (e) {
          console.error('[Mobile WebRTC] Error applying queued candidate:', e)
        }
      }
    }
  }

  // Toggle mic status
  toggleMute(isMuted) {
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach((track) => {
        track.enabled = !isMuted
      })
      console.log(`[Mobile WebRTC] Microphone track mute set to: ${isMuted}`)
    }
  }

  // Toggle audio speaker route
  toggleSpeaker(isSpeakerOn) {
    console.log(`[Mobile WebRTC] Route audio stream to speaker: ${isSpeakerOn}`)
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach((track) => {
        if (track._setVolume) {
          track._setVolume(isSpeakerOn ? 1.0 : 0.5)
        }
      })
    }
  }

  // Reset service and release hardware devices
  cleanUp() {
    console.log('[Mobile WebRTC] Cleaning up WebRTC resources')
    if (this.peerConnection) {
      this.peerConnection.close()
      this.peerConnection = null
    }

    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => {
        track.stop()
      })
      this.localStream = null
    }

    this.remoteStream = null
    this.iceCandidateQueue = []
    this.onIceCandidateCallback = null
    this.onTrackCallback = null
    this.onConnectionStateChangeCallback = null
  }
}

export default new WebRTCManager()
