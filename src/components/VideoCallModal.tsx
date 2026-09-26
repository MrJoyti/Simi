import React, { useState, useEffect, useRef } from 'react';
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
  AlertCircle,
  Minimize2,
  Maximize2,
} from 'lucide-react';
import { sounds } from '../utils/sound';

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
  ],
};

export const VideoCallModal: React.FC = () => {
  const {
    activeCall,
    endCall,
    answerCall,
    rejectCall,
    currentUser,
    theme,
  } = useChat();

  const isMale = theme === 'midnight';
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [mediaError, setMediaError] = useState<string | null>(null);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const durationTimerRef = useRef<NodeJS.Timeout | null>(null);
  const ringtoneTimerRef = useRef<NodeJS.Timeout | null>(null);

  const isCaller = activeCall?.callerId === currentUser?.id;
  const isIncomingRinging = !isCaller && activeCall?.status === 'calling';
  const isOutgoingRinging = isCaller && activeCall?.status === 'calling';
  const isConnected = activeCall?.status === 'connected';

  // Ringtone sounds
  useEffect(() => {
    if (activeCall?.status === 'calling') {
      sounds.playReceive();
      ringtoneTimerRef.current = setInterval(() => {
        sounds.playReceive();
      }, 3000);
    } else {
      if (ringtoneTimerRef.current) {
        clearInterval(ringtoneTimerRef.current);
        ringtoneTimerRef.current = null;
      }
    }

    return () => {
      if (ringtoneTimerRef.current) {
        clearInterval(ringtoneTimerRef.current);
      }
    };
  }, [activeCall?.status]);

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
      }
    };
  }, [isConnected]);

  // Clean up streams & peer connection
  const cleanupMediaAndPeer = () => {
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
      setLocalStream(null);
    }
    if (remoteStream) {
      remoteStream.getTracks().forEach((track) => track.stop());
      setRemoteStream(null);
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      cleanupMediaAndPeer();
    };
  }, []);

  // WebRTC Setup: Caller starts call (creates Offer)
  useEffect(() => {
    if (!activeCall || !currentUser) return;

    let pc: RTCPeerConnection;

    const setupCaller = async () => {
      if (!isCaller || activeCall.status !== 'calling') return;
      if (peerConnectionRef.current) return;

      try {
        setMediaError(null);
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
          audio: true,
        });
        setLocalStream(stream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        pc = new RTCPeerConnection(ICE_SERVERS);
        peerConnectionRef.current = pc;

        // Push local tracks to peer connection
        stream.getTracks().forEach((track) => pc.addTrack(track, stream));

        // Create remote stream container
        const remoteMedia = new MediaStream();
        setRemoteStream(remoteMedia);
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteMedia;
        }

        pc.ontrack = (event) => {
          event.streams[0].getTracks().forEach((track) => {
            remoteMedia.addTrack(track);
          });
        };

        // Listen for remote ICE candidates (from receiverCandidates)
        const receiverCandidatesCol = collection(db, 'calls', activeCall.id, 'receiverCandidates');
        const unsubCandidates = onSnapshot(receiverCandidatesCol, (snapshot) => {
          snapshot.docChanges().forEach(async (change) => {
            if (change.type === 'added') {
              const candidate = new RTCIceCandidate(change.doc.data());
              try {
                await pc.addIceCandidate(candidate);
              } catch (e) {
                console.warn('Error adding ICE candidate:', e);
              }
            }
          });
        });

        // Send local caller ICE candidates to callerCandidates collection
        const callerCandidatesCol = collection(db, 'calls', activeCall.id, 'callerCandidates');
        pc.onicecandidate = (event) => {
          if (event.candidate) {
            addDoc(callerCandidatesCol, event.candidate.toJSON()).catch(() => {});
          }
        };

        // Create WebRTC Offer
        const offerDescription = await pc.createOffer();
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

        // Listen for Answer when receiver answers
        const unsubCall = onSnapshot(callDocRef, async (snapshot) => {
          const data = snapshot.data();
          if (data?.answer && !pc.currentRemoteDescription) {
            const answerDescription = new RTCSessionDescription(data.answer);
            await pc.setRemoteDescription(answerDescription);
          }
        });

        return () => {
          unsubCandidates();
          unsubCall();
        };
      } catch (err: any) {
        console.error('Camera/Mic permission error:', err);
        setMediaError(
          err.name === 'NotAllowedError'
            ? 'Camera / Microphone permission denied. Please allow access.'
            : 'Could not access camera or microphone.'
        );
      }
    };

    if (isCaller) {
      setupCaller();
    }
  }, [activeCall?.id, isCaller]);

  // WebRTC Setup: Receiver answers call (creates Answer)
  const handleAcceptAndConnect = async () => {
    if (!activeCall || !currentUser) return;
    sounds.playClick();
    setMediaError(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
        audio: true,
      });
      setLocalStream(stream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      const pc = new RTCPeerConnection(ICE_SERVERS);
      peerConnectionRef.current = pc;

      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      const remoteMedia = new MediaStream();
      setRemoteStream(remoteMedia);
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remoteMedia;
      }

      pc.ontrack = (event) => {
        event.streams[0].getTracks().forEach((track) => {
          remoteMedia.addTrack(track);
        });
      };

      // Listen for caller candidates
      const callerCandidatesCol = collection(db, 'calls', activeCall.id, 'callerCandidates');
      onSnapshot(callerCandidatesCol, (snapshot) => {
        snapshot.docChanges().forEach(async (change) => {
          if (change.type === 'added') {
            const candidate = new RTCIceCandidate(change.doc.data());
            try {
              await pc.addIceCandidate(candidate);
            } catch (e) {
              console.warn('Error adding ICE candidate:', e);
            }
          }
        });
      });

      // Send receiver candidates
      const receiverCandidatesCol = collection(db, 'calls', activeCall.id, 'receiverCandidates');
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          addDoc(receiverCandidatesCol, event.candidate.toJSON()).catch(() => {});
        }
      };

      // Set Remote Description from caller's offer
      if (activeCall.offer) {
        await pc.setRemoteDescription(new RTCSessionDescription(activeCall.offer));
        const answerDescription = await pc.createAnswer();
        await pc.setLocalDescription(answerDescription);

        const callDocRef = doc(db, 'calls', activeCall.id);
        await updateDoc(callDocRef, {
          answer: {
            type: answerDescription.type,
            sdp: answerDescription.sdp,
          },
          status: 'connected',
        });
      }
    } catch (err: any) {
      console.error('Camera/Mic permission error on accept:', err);
      setMediaError(
        err.name === 'NotAllowedError'
          ? 'Camera/Microphone permission denied. Allow access to answer.'
          : 'Could not connect video call.'
      );
    }
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

  // Toggle Video Camera
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

  const handleEndCall = async () => {
    sounds.playClick();
    cleanupMediaAndPeer();
    await endCall();
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (!activeCall) return null;

  // Mini PiP mode if minimized
  if (isMinimized) {
    return (
      <div className={`fixed bottom-20 right-4 z-50 bg-slate-950 text-white rounded-3xl p-3 shadow-2xl border flex items-center gap-3 animate-in zoom-in-90 ${
        isMale ? 'border-blue-500/50' : 'border-pink-400/50'
      }`}>
        <CuteAvatar
          id={isCaller ? activeCall.receiverAvatar : activeCall.callerAvatar}
          size="sm"
          className={isMale ? 'ring-2 ring-blue-500' : 'ring-2 ring-pink-400'}
        />
        <div className="flex flex-col">
          <span className="text-xs font-bold truncate max-w-[100px]">
            {isCaller ? activeCall.receiverName : activeCall.callerName}
          </span>
          <span className={`text-[10px] font-mono ${isMale ? 'text-blue-400' : 'text-pink-300'}`}>
            {isConnected ? formatTimer(callDuration) : 'Calling...'}
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
      <div className={`relative w-full max-w-2xl h-[88vh] max-h-[720px] bg-slate-950/95 rounded-3xl overflow-hidden shadow-2xl border flex flex-col justify-between animate-modalPop backdrop-blur-xl ${
        isMale ? 'border-blue-500/40' : 'border-pink-300/40'
      }`}>
        {/* Top Header Bar */}
        <div className="p-4 px-5 flex items-center justify-between z-20 bg-gradient-to-b from-black/70 to-transparent">
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-2xl flex items-center justify-center text-white shadow-md ${
              isMale ? 'bg-gradient-to-tr from-blue-600 to-cyan-500 shadow-blue-500/20' : 'bg-gradient-to-tr from-pink-500 to-rose-500 shadow-pink-500/20'
            }`}>
              <Video className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">
                  {isCaller ? activeCall.receiverName : activeCall.callerName}
                </h3>
                {isConnected && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                )}
              </div>
              <p className={`text-[11px] font-medium ${isMale ? 'text-blue-200' : 'text-pink-200'}`}>
                {isConnected
                  ? `In Call · ${formatTimer(callDuration)}`
                  : isOutgoingRinging
                  ? 'Ringing...'
                  : 'Incoming Video Call...'}
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

        {/* Video Canvas Stage */}
        <div className="relative flex-1 bg-slate-900 flex items-center justify-center overflow-hidden">
          {/* Remote Video Stream (Main viewport) */}
          {isConnected && remoteStream ? (
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            /* Calling / Ringing Placeholder Stage */
            <div className="flex flex-col items-center justify-center gap-4 text-center p-6 animate-in zoom-in-95">
              <div className="relative">
                <div className={`w-28 h-28 rounded-full p-1 animate-pulse flex items-center justify-center shadow-xl ${
                  isMale ? 'bg-gradient-to-tr from-blue-600 via-cyan-500 to-indigo-600' : 'bg-gradient-to-tr from-pink-500 via-rose-400 to-amber-300'
                }`}>
                  <CuteAvatar
                    id={isCaller ? activeCall.receiverAvatar : activeCall.callerAvatar}
                    customUrl={isCaller ? activeCall.receiverCustomAvatar : activeCall.callerCustomAvatar}
                    size="lg"
                    className="border-2 border-white"
                  />
                </div>
                <div className={`absolute -bottom-1 -right-1 p-2 rounded-full text-white shadow-md animate-bounce ${
                  isMale ? 'bg-blue-600' : 'bg-pink-500'
                }`}>
                  <Sparkles className="w-4 h-4" />
                </div>
              </div>

              <div>
                <h4 className="text-lg font-bold text-white">
                  {isCaller ? activeCall.receiverName : activeCall.callerName}
                </h4>
                <p className={`text-xs mt-0.5 ${isMale ? 'text-blue-300' : 'text-pink-300'}`}>
                  {isOutgoingRinging
                    ? 'Waiting for buddy to answer...'
                    : 'is inviting you to a video call!'}
                </p>
              </div>
            </div>
          )}

          {/* Local PiP Video Preview (Bottom Right Corner) */}
          <div className={`absolute bottom-4 right-4 w-28 sm:w-36 aspect-video bg-black/60 rounded-2xl overflow-hidden border-2 shadow-2xl z-20 ${
            isMale ? 'border-blue-500/80' : 'border-pink-400/80'
          }`}>
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
        </div>

        {/* Bottom Call Controls Toolbar */}
        <div className="p-4 px-6 z-20 flex items-center justify-center gap-4 bg-gradient-to-t from-black/80 via-black/50 to-transparent">
          {/* Receiver Incoming Call Actions (Answer / Reject) */}
          {isIncomingRinging ? (
            <div className="flex items-center gap-6">
              <button
                onClick={rejectCall}
                className="flex flex-col items-center gap-1.5 p-3 rounded-full bg-rose-600 hover:bg-rose-700 text-white shadow-lg transition-transform active:scale-95"
                title="Decline"
              >
                <PhoneOff className="w-6 h-6" />
                <span className="text-[10px] font-bold">Decline</span>
              </button>

              <button
                onClick={handleAcceptAndConnect}
                className={`flex flex-col items-center gap-1.5 p-3.5 px-6 rounded-full text-white shadow-xl transition-transform active:scale-95 animate-bounce ${
                  isMale
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 shadow-blue-500/30'
                    : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-emerald-500/30'
                }`}
                title="Answer Video Call"
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

              {/* Toggle Camera */}
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

              {/* End / Leave Call */}
              <button
                onClick={handleEndCall}
                className="p-3 sm:p-3.5 px-6 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-lg shadow-rose-600/30 transition-transform active:scale-95 flex items-center gap-2"
                title="End video call"
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
