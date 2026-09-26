import React, { useState, useEffect, useRef } from 'react';
import { useChat } from '../context/ChatContext';
import { Mic, Square, Trash2, Send, Sparkles } from 'lucide-react';
import { sounds } from '../utils/sound';

interface VoiceRecorderProps {
  onSendVoice: (audioDataUrl: string, duration: number) => void;
  onCancel: () => void;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  onSendVoice,
  onCancel,
}) => {
  const { theme } = useChat();
  const isMale = theme === 'midnight';

  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [duration, setDuration] = useState<number>(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [hasMicError, setHasMicError] = useState<boolean>(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    startRealRecording();
    return () => {
      cleanup();
    };
  }, []);

  const cleanup = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      try {
        mediaRecorderRef.current.stop();
      } catch {
        // ignore
      }
    }
  };

  const startRealRecording = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setHasMicError(true);
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          setAudioUrl(reader.result as string);
        };
        // Stop audio tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);

      timerRef.current = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    } catch {
      setHasMicError(true);
    }
  };

  const stopRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  // Fallback voice note generator if mic permission denied
  const generateCuteAudioDemo = () => {
    sounds.playReceive();
    const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const sampleRate = audioContext.sampleRate;
    const numChannels = 1;
    const numFrames = sampleRate * 2.5; // 2.5 seconds
    const buffer = audioContext.createBuffer(numChannels, numFrames, sampleRate);
    const channelData = buffer.getChannelData(0);

    for (let i = 0; i < numFrames; i++) {
      const t = i / sampleRate;
      const f1 = 523.25; // C5
      const f2 = 659.25; // E5
      const f3 = 783.99; // G5
      const f4 = 1046.5; // C6
      const freq = t < 0.6 ? f1 : t < 1.2 ? f2 : t < 1.8 ? f3 : f4;
      const envelope = Math.exp(-((t % 0.6) * 4));
      channelData[i] = Math.sin(2 * Math.PI * freq * t) * envelope * 0.4;
    }

    // Convert AudioBuffer to WAV blob
    const wavBlob = audioBufferToWavBlob(buffer);
    const reader = new FileReader();
    reader.readAsDataURL(wavBlob);
    reader.onloadend = () => {
      onSendVoice(reader.result as string, 3);
    };
  };

  const handleSend = () => {
    if (audioUrl) {
      onSendVoice(audioUrl, duration || 1);
    } else if (hasMicError) {
      generateCuteAudioDemo();
    }
  };

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className={`flex items-center justify-between gap-3 px-4 py-2.5 rounded-3xl animate-in fade-in duration-150 border ${
      isMale ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-rose-50/90 border-rose-200/80 text-slate-800'
    }`}>
      {/* Waveform and Timer */}
      <div className="flex items-center gap-3 flex-1">
        <div className={`relative flex items-center justify-center w-8 h-8 rounded-full text-white animate-pulse ${
          isMale ? 'bg-blue-600' : 'bg-rose-500'
        }`}>
          <Mic className="w-4 h-4" />
        </div>

        <div className="flex flex-col">
          <span className={`text-xs font-semibold ${isMale ? 'text-white' : 'text-rose-800'}`}>
            {isRecording ? 'Recording Voice Note...' : 'Voice Note Ready'}
          </span>
          <span className={`text-[11px] font-mono ${isMale ? 'text-blue-400' : 'text-rose-600'}`}>
            {formatSeconds(duration)}
          </span>
        </div>

        {/* Dancing Waveform Bars */}
        <div className="flex items-center gap-1 h-5 ml-2">
          {[4, 12, 18, 8, 16, 22, 10, 14, 6].map((height, i) => (
            <div
              key={i}
              className={`w-1 rounded-full transition-all duration-150 ${
                isMale ? 'bg-blue-500' : 'bg-rose-400'
              }`}
              style={{
                height: isRecording ? `${Math.max(4, (height * (duration % 3 + 1)) % 22)}px` : '6px',
              }}
            />
          ))}
        </div>
      </div>

      {/* Fallback info if mic blocked */}
      {hasMicError && (
        <button
          onClick={generateCuteAudioDemo}
          className={`flex items-center gap-1 px-2.5 py-1 text-xs rounded-xl transition-colors ${
            isMale ? 'bg-blue-950 text-blue-300 hover:bg-blue-900' : 'bg-amber-100 hover:bg-amber-200 text-amber-900'
          }`}
        >
          <Sparkles className={`w-3.5 h-3.5 ${isMale ? 'text-blue-400' : 'text-amber-600'}`} />
          <span>Demo Note</span>
        </button>
      )}

      {/* Action buttons */}
      <div className="flex items-center gap-2">
        {isRecording && !hasMicError ? (
          <button
            onClick={stopRecording}
            className={`p-2 rounded-full transition-colors ${
              isMale ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-rose-200 hover:bg-rose-300 text-rose-800'
            }`}
            title="Stop recording"
          >
            <Square className={`w-4 h-4 ${isMale ? 'fill-white' : 'fill-rose-800'}`} />
          </button>
        ) : null}

        <button
          onClick={onCancel}
          className={`p-2 rounded-full transition-colors ${
            isMale ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-400 hover:text-slate-600 hover:bg-white'
          }`}
          title="Cancel"
        >
          <Trash2 className="w-4 h-4" />
        </button>

        <button
          onClick={handleSend}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-white rounded-2xl shadow-xs transition-transform active:scale-95 text-xs font-semibold ${
            isMale ? 'bg-blue-600 hover:bg-blue-500' : 'bg-rose-500 hover:bg-rose-600'
          }`}
        >
          <Send className="w-3.5 h-3.5" />
          <span>Send</span>
        </button>
      </div>
    </div>
  );
};


// Helper: converts AudioBuffer to WAV Blob
function audioBufferToWavBlob(buffer: AudioBuffer): Blob {
  const numOfChan = buffer.numberOfChannels;
  const length = buffer.length * numOfChan * 2 + 44;
  const outBuffer = new ArrayBuffer(length);
  const view = new DataView(outBuffer);
  const channels: Float32Array[] = [];
  let sampleRate = buffer.sampleRate;
  let offset = 0;
  let pos = 0;

  function setUint16(data: number) {
    view.setUint16(pos, data, true);
    pos += 2;
  }
  function setUint32(data: number) {
    view.setUint32(pos, data, true);
    pos += 4;
  }

  // RIFF identifier
  setUint32(0x46464952);
  setUint32(length - 8);
  setUint32(0x45564157); // WAVE
  setUint32(0x20746d66); // fmt
  setUint32(16);
  setUint16(1); // PCM
  setUint16(numOfChan);
  setUint32(sampleRate);
  setUint32(sampleRate * 2 * numOfChan);
  setUint16(numOfChan * 2);
  setUint16(16);
  setUint32(0x61746164); // data
  setUint32(length - pos - 4);

  for (let i = 0; i < buffer.numberOfChannels; i++) {
    channels.push(buffer.getChannelData(i));
  }

  while (pos < length) {
    for (let i = 0; i < numOfChan; i++) {
      let sample = Math.max(-1, Math.min(1, channels[i][offset]));
      sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0;
      view.setInt16(pos, sample, true);
      pos += 2;
    }
    offset++;
  }

  return new Blob([outBuffer], { type: 'audio/wav' });
}
