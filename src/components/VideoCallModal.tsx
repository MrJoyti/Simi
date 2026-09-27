import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useChat } from '../context/ChatContext';
import { CuteAvatar } from '../utils/avatars';
import { db } from '../firebase';
import {
  doc,
  setDoc,
  updateDoc,
  collection,
  addDoc,
  onSnapshot,
  getDoc,
  Unsubscribe,
} from 'firebase/firestore';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  PhoneIncoming,
  RotateCcw,
  Sparkles,
  Volume2,
  VolumeX,
  AlertCircle,
  Minimize2,
  Maximize2,
  Phone,
  RefreshCw,
} from 'lucide-react';
import { sounds } from '../utils/sound';
import { CallStatus } from '../types/chat';

// Production-ready ICE Servers with reliable Google STUN servers and optional TURN fallback
const getIceServers = (): RTCConfiguration => {
  const iceServers: RTCIceServer[] = [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' },
  ];

  // Optional TURN server configuration via environment variables
  const turnUrl = import.meta.env.VITE_TURN_URL;
  const turnUsername = import.meta.env.VITE_TURN_USERNAME;
  const turnCredential = import.meta.env.VITE_TURN_CREDENTIAL;

  if (turnUrl) {
    const server: RTCIceServer = { urls: turnUrl };
    if (turnUsername) server.username = turnUsername;
    if (turnCredential) server.credential = turnCredential;
    iceServers.push(server);
  }

  return {
    iceServers,
    iceCandidatePoolSize: 10,
  };
};

export const VideoCallModal: React.FC = () => {
  const {
    activeCall,
    endCall,
    currentUser,
    theme,
  } = useChat();

  const isMidnight = theme === 'midnight';
  const isVideoCall = activeCall?.callType !== 'audio';
  const isCaller = activeCall?.callerId === currentUser?.id;

  // Local & Remote streams
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

  // Call status state
  const [callState, setCallState] = useState<CallStatus>('idle');
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');

  // DOM Refs
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const remoteAudioRef = useRef<HTMLAudioElement>(null);

  // WebRTC & Lifecycle Refs
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  const pendingCandidatesRef = useRef<RTCIceCandidateInit[]>([]);
  const isSettingUpRef = useRef(false);

  // Timers & Listeners
  const durationTimerRef = useRef<NodeJS.Timeout | null>(null);
  const ringtoneTimerRef = useRef<NodeJS.Timeout | null>(null);
  const unsubCallRef = useRef<Unsubscribe | null>(null);
  const unsubCandidatesRef = useRef<Unsubscribe | null>(null);

  // Sync call state with Firestore activeCall status initially
  useEffect(() => {
    if (activeCall?.status) {
      setCallState((prev) => {
        // Don't downgrade connected to calling
        if (prev === 'connected' && activeCall.status === 'calling') return prev;
        return activeCall.status;
      });
    }
  }, [activeCall?.status]);

  const isIncomingRinging = !isCaller && (callState === 'calling' || callState === 'ringing');
  const isOutgoingRinging = isCaller && (callState === 'calling' || callState === 'ringing');
  const isConnected = callState === 'connected';
  const isReconnecting = callState === 'reconnecting';

  // Ringtone / Dial-tone audio playback
  useEffect(() => {
    if (callState === 'calling' || callState === 'ringing') {
      if (isIncomingRinging) {
        sounds.playReceive();
        ringtoneTimerRef.current = setInterval(() => {
          sounds.playReceive();
        }, 3000);
      } else if (isOutgoingRinging) {
        sounds.playSend();
        ringtoneTimerRef.current = setInterval(() => {
          sounds.playSend();
        }, 3000);
      }
    } else {
      if (ringtoneTimerRef.current) {
        clearInterval(ringtoneTimerRef.current);
        ringtoneTimerRef.current = null;
      }
    }

    return () => {
      if (ringtoneTimerRef.current) {
        clearInterval(ringtoneTimerRef.current);
        ringtoneTimerRef.current = null;
      }
    };
  }, [callState, isIncomingRinging, isOutgoingRinging]);

  // Duration counter when connected
  useEffect(() => {
    if (isConnected) {
      sounds.playReaction();
      setCallDuration(0);
      durationTimerRef.current = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      if (durationTimerRef.current) {
        clearInterval(durationTimerRef.current);
        durationTimerRef.current = null;
      }
    }

    return () => {
      if (durationTimerRef.current) {
        clearInterval(durationTimerRef.current);
        durationTimerRef.current = null;
      }
    };
  }, [isConnected]);

  // Comprehensive Cleanup function
  const cleanupMediaAndPeer = useCallback(() => {
    console.log('[CALL] Cleaning up media tracks, peer connection, and listeners');

    // 1. Stop local tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch (e) {
          console.warn('[CALL] Error stopping local track:', e);
        }
      });
      localStreamRef.current = null;
    }
    setLocalStream(null);

    // 2. Stop remote tracks
    if (remoteStreamRef.current) {
      remoteStreamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch (e) {
          console.warn('[CALL] Error stopping remote track:', e);
        }
      });
      remoteStreamRef.current = null;
    }
    setRemoteStream(null);

    // 3. Clear srcObject on video and audio elements
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }
    if (remoteAudioRef.current) {
      remoteAudioRef.current.srcObject = null;
    }

    // 4. Close RTCPeerConnection
    if (peerConnectionRef.current) {
      try {
        peerConnectionRef.current.ontrack = null;
        peerConnectionRef.current.onicecandidate = null;
        peerConnectionRef.current.onconnectionstatechange = null;
        peerConnectionRef.current.oniceconnectionstatechange = null;
        peerConnectionRef.current.onsignalingstatechange = null;
        peerConnectionRef.current.close();
      } catch (e) {
        console.warn('[CALL] Error closing RTCPeerConnection:', e);
      }
      peerConnectionRef.current = null;
    }

    // 5. Unsubscribe Firestore listeners
    if (unsubCandidatesRef.current) {
      unsubCandidatesRef.current();
      unsubCandidatesRef.current = null;
    }
    if (unsubCallRef.current) {
      unsubCallRef.current();
      unsubCallRef.current = null;
    }

    // 6. Clear timers
    if (durationTimerRef.current) {
      clearInterval(durationTimerRef.current);
      durationTimerRef.current = null;
    }
    if (ringtoneTimerRef.current) {
      clearInterval(ringtoneTimerRef.current);
      ringtoneTimerRef.current = null;
    }

    // 7. Clear pending ICE candidates
    pendingCandidatesRef.current = [];
    isSettingUpRef.current = false;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupMediaAndPeer();
    };
  }, [cleanupMediaAndPeer]);

  // Helper: Add or Queue ICE candidate
  const addOrQueueIceCandidate = async (pc: RTCPeerConnection, candidateData: any) => {
    console.log('[CALL] ICE candidate received');
    const candidate = new RTCIceCandidate(candidateData);
    if (pc.remoteDescription && pc.remoteDescription.type) {
      try {
        await pc.addIceCandidate(candidate);
      } catch (err) {
        console.warn('[CALL] Error adding immediate ICE candidate:', err);
      }
    } else {
      pendingCandidatesRef.current.push(candidateData);
      console.log(
        '[CALL] Queued ICE candidate (waiting for remote description). Current queue length:',
        pendingCandidatesRef.current.length
      );
    }
  };

  // Helper: Flush queued ICE candidates after setRemoteDescription succeeds
  const flushQueuedIceCandidates = async (pc: RTCPeerConnection) => {
    console.log('[CALL] Flushing queued ICE candidates. Count:', pendingCandidatesRef.current.length);
    while (pendingCandidatesRef.current.length > 0) {
      const candData = pendingCandidatesRef.current.shift();
      if (candData) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(candData));
          console.log('[CALL] Successfully applied queued ICE candidate');
        } catch (err) {
          console.warn('[CALL] Error adding queued ICE candidate:', err);
        }
      }
    }
  };

  // Helper: Obtain UserMedia with fallback
  const getUserMediaStream = async (forVideo: boolean): Promise<MediaStream> => {
    const audioConstraints = {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
    };

    if (forVideo) {
      try {
        return await navigator.mediaDevices.getUserMedia({
          audio: audioConstraints,
          video: {
            width: { ideal: 1280, max: 1920 },
            height: { ideal: 720, max: 1080 },
            facingMode: 'user',
          },
        });
      } catch (err) {
        console.warn('[CALL] High-res video constraints failed, trying basic video:', err);
        return await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: true,
        });
      }
    } else {
      return await navigator.mediaDevices.getUserMedia({
        audio: audioConstraints,
        video: false,
      });
    }
  };

  // Helper: Bind PeerConnection event listeners
  const setupPeerConnectionEvents = (pc: RTCPeerConnection, persistentRemoteMedia: MediaStream) => {
    pc.ontrack = (event) => {
      console.log('[CALL] Remote track received:', event.track.kind);
      if (event.track.kind === 'audio') {
        console.log('[CALL] Remote audio track received');
      } else if (event.track.kind === 'video') {
        console.log('[CALL] Remote video track received');
      }

      // Add track to persistent remote MediaStream if not already attached
      const existing = persistentRemoteMedia.getTracks();
      if (!existing.some((t) => t.id === event.track.id)) {
        persistentRemoteMedia.addTrack(event.track);
        console.log('[CALL] Added track to remote MediaStream. Total tracks:', persistentRemoteMedia.getTracks().length);
      }

      setRemoteStream(persistentRemoteMedia);
      remoteStreamRef.current = persistentRemoteMedia;
    };

    pc.onconnectionstatechange = () => {
      console.log('[CALL] Connection state changed:', pc.connectionState);
      if (pc.connectionState === 'connected') {
        setCallState('connected');
      } else if (pc.connectionState === 'connecting') {
        setCallState('connecting');
      } else if (pc.connectionState === 'disconnected') {
        setCallState('reconnecting');
      } else if (pc.connectionState === 'failed') {
        setCallState('failed');
        setMediaError('Call connection failed. Please check network connection.');
      } else if (pc.connectionState === 'closed') {
        setCallState('ended');
      }
    };

    pc.oniceconnectionstatechange = () => {
      console.log('[CALL] ICE connection state changed:', pc.iceConnectionState);
      if (pc.iceConnectionState === 'connected' || pc.iceConnectionState === 'completed') {
        setCallState((prev) => (prev === 'connected' ? prev : 'connected'));
      } else if (pc.iceConnectionState === 'disconnected') {
        setCallState('reconnecting');
      } else if (pc.iceConnectionState === 'failed') {
        setCallState('failed');
      }
    };

    pc.onsignalingstatechange = () => {
      console.log('[CALL] Signaling state changed:', pc.signalingState);
    };
  };

  // Caller Setup: Automatically initialize when caller creates the call
  useEffect(() => {
    if (!activeCall || !currentUser || !isCaller) return;
    if (activeCall.status !== 'calling') return;
    if (peerConnectionRef.current || isSettingUpRef.current) return;

    isSettingUpRef.current = true;
    let isCancelled = false;

    const setupCaller = async () => {
      try {
        setMediaError(null);
        console.log('[CALL] Caller initializing media. Type:', isVideoCall ? 'video' : 'audio');

        const stream = await getUserMediaStream(isVideoCall);
        if (isCancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        setLocalStream(stream);
        localStreamRef.current = stream;

        // Initialize persistent remote stream
        const persistentRemoteStream = new MediaStream();
        setRemoteStream(persistentRemoteStream);
        remoteStreamRef.current = persistentRemoteStream;

        // Initialize RTCPeerConnection
        const pc = new RTCPeerConnection(getIceServers());
        peerConnectionRef.current = pc;

        // Add local tracks BEFORE creating offer
        stream.getTracks().forEach((track) => {
          pc.addTrack(track, stream);
          console.log('[CALL] Added local track to peer connection:', track.kind);
        });

        // Set up track & connection listeners
        setupPeerConnectionEvents(pc, persistentRemoteStream);

        // Send caller ICE candidates to callerCandidates subcollection
        const callerCandidatesCol = collection(db, 'calls', activeCall.id, 'callerCandidates');
        pc.onicecandidate = (event) => {
          if (event.candidate) {
            console.log('[CALL] ICE candidate generated');
            addDoc(callerCandidatesCol, event.candidate.toJSON()).catch((err) => {
              console.warn('[CALL] Error saving caller ICE candidate:', err);
            });
          }
        };

        // Listen for receiver candidates
        const receiverCandidatesCol = collection(db, 'calls', activeCall.id, 'receiverCandidates');
        unsubCandidatesRef.current = onSnapshot(receiverCandidatesCol, (snapshot) => {
          snapshot.docChanges().forEach((change) => {
            if (change.type === 'added') {
              addOrQueueIceCandidate(pc, change.doc.data());
            }
          });
        });

        // Create Offer
        const offerDescription = await pc.createOffer({
          offerToReceiveAudio: true,
          offerToReceiveVideo: isVideoCall,
        });
        await pc.setLocalDescription(offerDescription);

        const callDocRef = doc(db, 'calls', activeCall.id);
        await setDoc(
          callDocRef,
          {
            offer: {
              type: offerDescription.type,
              sdp: offerDescription.sdp,
            },
          },
          { merge: true }
        );

        // Listen for receiver answer and status updates
        unsubCallRef.current = onSnapshot(callDocRef, async (snapshot) => {
          const data = snapshot.data();
          if (!data) return;

          // If other party ended or rejected call
          if (data.status === 'ended' || data.status === 'rejected' || data.status === 'busy') {
            console.log('[CALL] Call ended/rejected by remote user:', data.status);
            setCallState(data.status);
            setTimeout(() => {
              cleanupMediaAndPeer();
              endCall();
            }, 1200);
            return;
          }

          // If answer is provided and remote description not yet set
          if (data.answer && !pc.currentRemoteDescription) {
            const answerDescription = new RTCSessionDescription(data.answer);
            await pc.setRemoteDescription(answerDescription);
            console.log('[CALL] Remote description set');
            await flushQueuedIceCandidates(pc);
            setCallState('connecting');
          }
        });
      } catch (err: any) {
        console.error('[CALL] Caller setup error:', err);
        setMediaError(
          err.name === 'NotAllowedError'
            ? `${isVideoCall ? 'Camera & Microphone' : 'Microphone'} access denied. Please grant permission.`
            : 'Could not access media device.'
        );
        setCallState('failed');
      } finally {
        isSettingUpRef.current = false;
      }
    };

    setupCaller();

    return () => {
      isCancelled = true;
    };
  }, [activeCall?.id, isCaller, isVideoCall, cleanupMediaAndPeer, endCall]);

  // Receiver Setup: Triggered explicitly when receiver clicks Answer / Accept
  const handleAcceptAndConnect = async () => {
    if (!activeCall || !currentUser || isSettingUpRef.current) return;
    isSettingUpRef.current = true;
    sounds.playClick();
    setMediaError(null);
    setCallState('connecting');

    try {
      console.log('[CALL] Receiver accepting call. Type:', isVideoCall ? 'video' : 'audio');

      // 1. Obtain local user media
      const stream = await getUserMediaStream(isVideoCall);
      setLocalStream(stream);
      localStreamRef.current = stream;

      // 2. Initialize persistent remote stream
      const persistentRemoteStream = new MediaStream();
      setRemoteStream(persistentRemoteStream);
      remoteStreamRef.current = persistentRemoteStream;

      // 3. Initialize RTCPeerConnection
      const pc = new RTCPeerConnection(getIceServers());
      peerConnectionRef.current = pc;

      // 4. Add local tracks BEFORE creating answer
      stream.getTracks().forEach((track) => {
        pc.addTrack(track, stream);
        console.log('[CALL] Added local track to peer connection:', track.kind);
      });

      // 5. Setup event listeners
      setupPeerConnectionEvents(pc, persistentRemoteStream);

      // 6. Send receiver ICE candidates to receiverCandidates subcollection
      const receiverCandidatesCol = collection(db, 'calls', activeCall.id, 'receiverCandidates');
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          console.log('[CALL] ICE candidate generated');
          addDoc(receiverCandidatesCol, event.candidate.toJSON()).catch((err) => {
            console.warn('[CALL] Error saving receiver ICE candidate:', err);
          });
        }
      };

      // 7. Listen for caller candidates
      const callerCandidatesCol = collection(db, 'calls', activeCall.id, 'callerCandidates');
      unsubCandidatesRef.current = onSnapshot(callerCandidatesCol, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added') {
            addOrQueueIceCandidate(pc, change.doc.data());
          }
        });
      });

      // 8. Obtain caller's Offer
      const callDocRef = doc(db, 'calls', activeCall.id);
      let offer = activeCall.offer;
      if (!offer) {
        const snap = await getDoc(callDocRef);
        offer = snap.data()?.offer;
      }

      if (!offer) {
        throw new Error('Call offer not found. Could not negotiate connection.');
      }

      // 9. Set remote description from offer
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      console.log('[CALL] Remote description set');

      // Flush queued candidates that arrived before remoteDescription
      await flushQueuedIceCandidates(pc);

      // 10. Create Answer and set local description
      const answerDescription = await pc.createAnswer();
      await pc.setLocalDescription(answerDescription);

      // 11. Update call document in Firestore
      await updateDoc(callDocRef, {
        answer: {
          type: answerDescription.type,
          sdp: answerDescription.sdp,
        },
        status: 'connected',
      });

      setCallState('connecting');

      // Listen for remote call termination
      unsubCallRef.current = onSnapshot(callDocRef, (snapshot) => {
        const data = snapshot.data();
        if (data?.status === 'ended' || data?.status === 'rejected') {
          console.log('[CALL] Remote caller ended the call');
          setCallState(data.status);
          setTimeout(() => {
            cleanupMediaAndPeer();
            endCall();
          }, 1200);
        }
      });
    } catch (err: any) {
      console.error('[CALL] Receiver accept error:', err);
      setMediaError(
        err.name === 'NotAllowedError'
          ? `${isVideoCall ? 'Camera & Microphone' : 'Microphone'} access denied. Please grant permission.`
          : 'Could not connect call. Please try again.'
      );
      setCallState('failed');
    } finally {
      isSettingUpRef.current = false;
    }
  };

  // Reject / Decline call
  const handleRejectCall = async () => {
    sounds.playClick();
    if (!activeCall) return;
    try {
      const callDocRef = doc(db, 'calls', activeCall.id);
      await updateDoc(callDocRef, {
        status: 'rejected',
        endedAt: Date.now(),
      });
    } catch (e) {
      console.warn('Failed to update reject status:', e);
    }
    cleanupMediaAndPeer();
    endCall();
  };

  // End active call
  const handleEndCall = async () => {
    sounds.playClick();
    if (activeCall) {
      try {
        const callDocRef = doc(db, 'calls', activeCall.id);
        await updateDoc(callDocRef, {
          status: 'ended',
          endedAt: Date.now(),
        });
      } catch (e) {
        console.warn('Failed to update end status:', e);
      }
    }
    cleanupMediaAndPeer();
    endCall();
  };

  // 45-second unanswered call timeout to prevent infinite ringing/calling
  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null;
    if (callState === 'calling' || callState === 'ringing') {
      timeoutId = setTimeout(() => {
        console.log('[CALL] Unanswered timeout reached (45s)');
        setMediaError('Call was not answered.');
        setTimeout(() => {
          if (isCaller) {
            handleEndCall();
          } else {
            handleRejectCall();
          }
        }, 1500);
      }, 45000);
    }
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [callState, isCaller]);

  // Local Video preview attachment
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      if (localVideoRef.current.srcObject !== localStream) {
        localVideoRef.current.srcObject = localStream;
      }
      localVideoRef.current.play().catch(() => {});
    }
  }, [localStream, isVideoOff]);

  // Remote Media attachment (Audio & Video)
  useEffect(() => {
    if (!remoteStream) return;

    // Attach to remote video element if in video call
    // Note: Video element is kept MUTED so the dedicated HTMLAudioElement handles audio exclusively without phase echo
    if (isVideoCall && remoteVideoRef.current) {
      if (remoteVideoRef.current.srcObject !== remoteStream) {
        remoteVideoRef.current.srcObject = remoteStream;
        console.log('[CALL] Remote stream attached to video element');
      }
      remoteVideoRef.current.muted = true;
      remoteVideoRef.current.volume = 0;
      remoteVideoRef.current
        .play()
        .then(() => {
          console.log('[CALL] Video playback started');
          setAutoplayBlocked(false);
        })
        .catch((err) => {
          console.warn('[CALL] Video autoplay issue:', err);
        });
    }

    // Always attach to remote audio element to ensure audio is 100% audible across devices
    if (remoteAudioRef.current) {
      if (remoteAudioRef.current.srcObject !== remoteStream) {
        remoteAudioRef.current.srcObject = remoteStream;
        console.log('[CALL] Remote stream attached to audio element');
      }
      remoteAudioRef.current.muted = false;
      remoteAudioRef.current.volume = 1.0;
      remoteAudioRef.current
        .play()
        .then(() => {
          console.log('[CALL] Remote audio playback started');
          setAutoplayBlocked(false);
        })
        .catch((err) => {
          console.warn('[CALL] Audio autoplay blocked:', err);
          setAutoplayBlocked(true);
        });
    }
  }, [remoteStream, isVideoCall, isConnected, callState]);

  // Explicit user gesture to unblock autoplay
  const handleUnblockAutoplay = () => {
    sounds.playClick();
    if (remoteAudioRef.current) {
      remoteAudioRef.current.muted = false;
      remoteAudioRef.current.volume = 1.0;
      remoteAudioRef.current.play().catch(() => {});
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.muted = false;
      remoteVideoRef.current.volume = 1.0;
      remoteVideoRef.current.play().catch(() => {});
    }
    setAutoplayBlocked(false);
  };

  // Toggle Mute Audio
  const toggleMute = () => {
    sounds.playClick();
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  // Toggle Camera
  const toggleVideo = () => {
    sounds.playClick();
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
      }
    }
  };

  // Switch Camera (User vs Environment)
  const switchCamera = async () => {
    sounds.playClick();
    if (!localStream || !isVideoCall) return;
    const nextMode = facingMode === 'user' ? 'environment' : 'user';

    try {
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: nextMode },
        audio: false,
      });
      const newVideoTrack = newStream.getVideoTracks()[0];
      const oldVideoTrack = localStream.getVideoTracks()[0];

      if (oldVideoTrack && peerConnectionRef.current) {
        const sender = peerConnectionRef.current
          .getSenders()
          .find((s) => s.track?.kind === 'video');
        if (sender) {
          await sender.replaceTrack(newVideoTrack);
        }
        oldVideoTrack.stop();
        localStream.removeTrack(oldVideoTrack);
        localStream.addTrack(newVideoTrack);
        setFacingMode(nextMode);
      }
    } catch (err) {
      console.warn('[CALL] Could not switch camera:', err);
    }
  };

  // Speaker / Audio Output toggle where supported
  const toggleSpeaker = async () => {
    sounds.playClick();
    setIsSpeakerOn(!isSpeakerOn);
    try {
      const targetElement = remoteAudioRef.current || remoteVideoRef.current;
      if (targetElement && 'setSinkId' in targetElement) {
        // Attempt switching between default and speaker if available
        const devices = await navigator.mediaDevices.enumerateDevices();
        const audioOutputs = devices.filter((d) => d.kind === 'audiooutput');
        if (audioOutputs.length > 1) {
          const nextDevice = isSpeakerOn ? audioOutputs[0] : audioOutputs[1];
          await (targetElement as any).setSinkId(nextDevice.deviceId);
        }
      }
    } catch (e) {
      console.warn('[CALL] Audio output selection not supported:', e);
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (!activeCall) return null;

  const targetName = isCaller ? activeCall.receiverName : activeCall.callerName;
  const targetAvatar = isCaller ? activeCall.receiverAvatar : activeCall.callerAvatar;
  const targetCustomAvatar = isCaller ? activeCall.receiverCustomAvatar : activeCall.callerCustomAvatar;

  // Mini PiP mode if minimized
  if (isMinimized) {
    return (
      <div
        className={`fixed bottom-20 right-4 z-50 bg-slate-950 text-white rounded-3xl p-3 shadow-2xl border flex items-center gap-3 animate-in zoom-in-90 ${
          isMidnight ? 'border-blue-500/50' : 'border-pink-400/50'
        }`}
      >
        <CuteAvatar
          id={targetAvatar}
          customUrl={targetCustomAvatar}
          size="sm"
          className={isMidnight ? 'ring-2 ring-blue-500' : 'ring-2 ring-pink-400'}
        />
        <div className="flex flex-col">
          <span className="text-xs font-bold truncate max-w-[100px]">{targetName}</span>
          <span className={`text-[10px] font-mono ${isMidnight ? 'text-blue-400' : 'text-pink-300'}`}>
            {isConnected ? formatTimer(callDuration) : isOutgoingRinging ? 'Ringing...' : 'Calling...'}
          </span>
        </div>
        <button
          onClick={() => setIsMinimized(false)}
          className="p-1.5 rounded-full hover:bg-white/20 text-white transition-colors"
          title="Expand"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={handleEndCall}
          className="p-1.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white transition-colors"
          title="End Call"
        >
          <PhoneOff className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 select-none animate-in fade-in duration-200">
      {/* Hidden dedicated HTMLAudioElement for remote audio playback */}
      <audio ref={remoteAudioRef} autoPlay playsInline />

      <div
        className={`relative w-full max-w-2xl h-[90vh] max-h-[740px] bg-slate-950/95 rounded-3xl overflow-hidden shadow-2xl border flex flex-col justify-between animate-modalPop backdrop-blur-xl ${
          isMidnight ? 'border-blue-500/40' : 'border-pink-300/40'
        }`}
      >
        {/* Top Header Bar */}
        <div className="p-4 px-5 flex items-center justify-between z-20 bg-gradient-to-b from-black/80 via-black/40 to-transparent">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-9 h-9 rounded-2xl flex items-center justify-center text-white shadow-md ${
                isMidnight
                  ? 'bg-gradient-to-tr from-blue-600 to-cyan-500 shadow-blue-500/20'
                  : 'bg-gradient-to-tr from-pink-500 to-rose-500 shadow-pink-500/20'
              }`}
            >
              {isVideoCall ? <Video className="w-4 h-4" /> : <Phone className="w-4 h-4" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">{targetName}</h3>
                {isConnected && !isReconnecting && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                )}
              </div>
              <p className={`text-[11px] font-medium ${isMidnight ? 'text-blue-200' : 'text-pink-200'}`}>
                {isReconnecting
                  ? 'Reconnecting...'
                  : isConnected
                  ? `${isVideoCall ? 'Video Call' : 'Audio Call'} · ${formatTimer(callDuration)}`
                  : callState === 'connecting'
                  ? 'Connecting...'
                  : callState === 'ended'
                  ? 'Call Ended'
                  : callState === 'rejected'
                  ? 'Call Declined'
                  : isOutgoingRinging
                  ? 'Ringing...'
                  : `Incoming ${isVideoCall ? 'Video' : 'Audio'} Call...`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsMinimized(true)}
              className="p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              title="Minimize"
            >
              <Minimize2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Media Notice / Error Banner */}
        {mediaError && (
          <div className="mx-4 p-3 bg-rose-500/90 text-white rounded-2xl text-xs flex items-center gap-2 z-20 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span className="flex-1">{mediaError}</span>
          </div>
        )}

        {/* Autoplay Blocked Fallback Pill (Required for mobile browsers) */}
        {autoplayBlocked && (
          <div className="mx-4 p-2.5 bg-amber-500/90 text-slate-950 font-bold rounded-2xl text-xs flex items-center justify-between gap-2 z-30 shadow-lg animate-bounce">
            <div className="flex items-center gap-2">
              <VolumeX className="w-4 h-4 shrink-0" />
              <span>Audio is muted by your browser</span>
            </div>
            <button
              onClick={handleUnblockAutoplay}
              className="px-3 py-1 bg-slate-950 text-white rounded-xl text-[11px] font-extrabold hover:bg-slate-900 transition-colors"
            >
              Tap to hear
            </button>
          </div>
        )}

        {/* Canvas Stage */}
        <div className="relative flex-1 bg-slate-900 flex items-center justify-center overflow-hidden">
          {/* VIDEO CALL: Remote Video Stream (Main viewport) */}
          {isVideoCall && isConnected && remoteStream ? (
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
          ) : (
            /* AUDIO CALL OR RINGING STAGE */
            <div className="flex flex-col items-center justify-center gap-5 text-center p-6 animate-in zoom-in-95">
              <div className="relative flex items-center justify-center">
                {/* Pulsing acoustic rings when connected in audio call */}
                {isConnected && !isVideoCall && (
                  <>
                    <div className="absolute w-44 h-44 rounded-full border-2 border-pink-400/30 animate-ping" />
                    <div className="absolute w-36 h-36 rounded-full border border-pink-400/40 animate-pulse" />
                  </>
                )}

                <div
                  className={`w-32 h-32 rounded-full p-1.5 animate-pulse flex items-center justify-center shadow-2xl ${
                    isMidnight
                      ? 'bg-gradient-to-tr from-blue-600 via-cyan-500 to-indigo-600'
                      : 'bg-gradient-to-tr from-pink-500 via-rose-400 to-amber-300'
                  }`}
                >
                  <CuteAvatar
                    id={targetAvatar}
                    customUrl={targetCustomAvatar}
                    size="xl"
                    className="border-2 border-white"
                  />
                </div>
                <div
                  className={`absolute -bottom-1 -right-1 p-2 rounded-full text-white shadow-md animate-bounce ${
                    isMidnight ? 'bg-blue-600' : 'bg-pink-500'
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                </div>
              </div>

              <div>
                <h4 className="text-xl font-extrabold text-white">{targetName}</h4>
                <p
                  className={`text-xs mt-1 font-medium ${
                    isMidnight ? 'text-blue-300' : 'text-pink-300'
                  }`}
                >
                  {isReconnecting
                    ? 'Reconnecting audio...'
                    : isConnected
                    ? `${isVideoCall ? 'Video Call' : 'Audio Call'} Active`
                    : isOutgoingRinging
                    ? 'Waiting for buddy to answer...'
                    : `is inviting you to an ${isVideoCall ? 'video' : 'audio'} call!`}
                </p>
              </div>
            </div>
          )}

          {/* VIDEO CALL: Local PiP Video Preview (Bottom Right Corner) */}
          {isVideoCall && (
            <div
              className={`absolute bottom-4 right-4 w-28 sm:w-36 aspect-video bg-black/60 rounded-2xl overflow-hidden border-2 shadow-2xl z-20 ${
                isMidnight ? 'border-blue-500/80' : 'border-pink-400/80'
              }`}
            >
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover -scale-x-100 ${
                  isVideoOff ? 'hidden' : 'block'
                }`}
              />
              {isVideoOff && (
                <div className="w-full h-full flex flex-col items-center justify-center bg-slate-800 text-white">
                  <VideoOff className="w-5 h-5 text-slate-400 mb-1" />
                  <span className="text-[9px] text-slate-400">Camera Off</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bottom Call Controls Toolbar */}
        <div className="p-4 px-6 z-20 flex items-center justify-center gap-4 bg-gradient-to-t from-black/85 via-black/50 to-transparent">
          {/* Receiver Incoming Call Actions (Answer / Decline) */}
          {isIncomingRinging ? (
            <div className="flex items-center gap-6">
              <button
                onClick={handleRejectCall}
                className="flex flex-col items-center gap-1.5 p-3.5 px-5 rounded-full bg-rose-600 hover:bg-rose-700 text-white shadow-lg transition-transform active:scale-95"
                title="Decline"
              >
                <PhoneOff className="w-6 h-6" />
                <span className="text-[10px] font-bold">Decline</span>
              </button>

              <button
                onClick={handleAcceptAndConnect}
                className={`flex flex-col items-center gap-1.5 p-3.5 px-7 rounded-full text-white shadow-xl transition-transform active:scale-95 animate-bounce ${
                  isMidnight
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 shadow-blue-500/30'
                    : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-emerald-500/30'
                }`}
                title={`Answer ${isVideoCall ? 'Video' : 'Audio'} Call`}
              >
                <div className="flex items-center gap-2">
                  <PhoneIncoming className="w-5 h-5" />
                  <span className="text-xs font-extrabold">Answer</span>
                </div>
              </button>
            </div>
          ) : (
            /* Active Call In-Call Controls */
            <div className="flex items-center gap-3 sm:gap-4">
              {/* Mute Mic */}
              <button
                onClick={toggleMute}
                className={`p-3 sm:p-3.5 rounded-2xl transition-all shadow-md ${
                  isMuted
                    ? 'bg-rose-600 text-white hover:bg-rose-700'
                    : 'bg-white/20 hover:bg-white/30 text-white'
                }`}
                title={isMuted ? 'Unmute microphone' : 'Mute microphone'}
              >
                {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              {/* Video Call Only: Toggle Camera */}
              {isVideoCall && (
                <button
                  onClick={toggleVideo}
                  className={`p-3 sm:p-3.5 rounded-2xl transition-all shadow-md ${
                    isVideoOff
                      ? 'bg-rose-600 text-white hover:bg-rose-700'
                      : 'bg-white/20 hover:bg-white/30 text-white'
                  }`}
                  title={isVideoOff ? 'Turn camera on' : 'Turn camera off'}
                >
                  {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
                </button>
              )}

              {/* Video Call Only: Switch Camera */}
              {isVideoCall && (
                <button
                  onClick={switchCamera}
                  className="p-3 sm:p-3.5 rounded-2xl bg-white/20 hover:bg-white/30 text-white transition-all shadow-md"
                  title="Switch camera"
                >
                  <RefreshCw className="w-5 h-5" />
                </button>
              )}

              {/* Speaker / Audio Output Toggle */}
              <button
                onClick={toggleSpeaker}
                className={`p-3 sm:p-3.5 rounded-2xl transition-all shadow-md ${
                  isSpeakerOn ? 'bg-white/20 hover:bg-white/30 text-white' : 'bg-slate-700 text-slate-300'
                }`}
                title={isSpeakerOn ? 'Speaker ON' : 'Speaker OFF'}
              >
                {isSpeakerOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </button>

              {/* End / Leave Call */}
              <button
                onClick={handleEndCall}
                className="p-3 sm:p-3.5 px-6 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-lg shadow-rose-600/30 transition-transform active:scale-95 flex items-center gap-2"
                title="End call"
              >
                <PhoneOff className="w-5 h-5" />
                <span className="text-xs font-extrabold">End</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
