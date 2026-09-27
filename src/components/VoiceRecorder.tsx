import React, { useState, useEffect, useRef } from 'react';
import { useChat } from '../context/ChatContext';
import { Mic, Square, Trash2, Send, Loader2, AlertCircle } from 'lucide-react';
import { sounds } from '../utils/sound';
import { uploadMediaToCloudinary } from '../utils/cloudinary';

interface VoiceRecorderProps {
  onSendVoice: (audioUrl: string, duration: number) => void;
  onCancel: () => void;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  onSendVoice,
  onCancel,
}) => {
  const { simiTheme, showToast } = useChat();
  const isMale = simiTheme.isMale;

  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [duration, setDuration] = useState<number>(0);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [hasMicError, setHasMicError] = useState<boolean>(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

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
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const startRealRecording = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setHasMicError(true);
        showToast('Microphone access is not supported by your browser.', 'error');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      streamRef.current = stream;

      const mimeTypes = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/ogg;codecs=opus',
        'audio/mp4',
        'audio/aac',
      ];
      let selectedMime = '';
      for (const m of mimeTypes) {
        if (MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(m)) {
          selectedMime = m;
          break;
        }
      }

      const mediaRecorder = selectedMime
        ? new MediaRecorder(stream, { mimeType: selectedMime })
        : new MediaRecorder(stream);

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: selectedMime || 'audio/webm',
        });
        setRecordedBlob(audioBlob);
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
        }
      };

      mediaRecorder.start(250);
      setIsRecording(true);

      timerRef.current = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.warn('[VoiceRecorder] Mic access error:', err);
      setHasMicError(true);
      showToast('Microphone permission is required.', 'warning');
    }
  };

  const stopRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  const handleSend = async () => {
    if (hasMicError) {
      showToast('Microphone permission is required.', 'warning');
      return;
    }

    // Stop recording first if active
    if (isRecording) {
      stopRecording();
      // Wait for onstop event to build blob
      await new Promise((resolve) => setTimeout(resolve, 300));
    }

    const blob = recordedBlob || (audioChunksRef.current.length > 0 ? new Blob(audioChunksRef.current, { type: 'audio/webm' }) : null);

    if (!blob || blob.size === 0) {
      showToast('No audio recorded. Please try again.', 'info');
      return;
    }

    setIsUploading(true);
    try {
      // Upload audio blob to Cloudinary (resourceType: 'auto' or 'video')
      const uploadedUrl = await uploadMediaToCloudinary(blob, {
        folder: 'simi/voice_notes',
        resourceType: 'auto',
      });

      onSendVoice(uploadedUrl, duration || 1);
    } catch (err: any) {
      console.error('[VoiceRecorder] Upload error:', err);
      showToast('Failed to upload voice note. Please try again.', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div
      className={`flex items-center justify-between gap-3 px-4 py-2.5 rounded-3xl animate-in fade-in duration-150 border ${
        isMale ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-rose-50/90 border-rose-200/80 text-slate-800'
      }`}
    >
      {/* Waveform and Timer */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div
          className={`relative flex items-center justify-center w-8 h-8 rounded-full text-white shrink-0 ${
            isRecording ? 'animate-pulse' : ''
          } ${isMale ? 'bg-blue-600' : 'bg-rose-500'}`}
        >
          <Mic className="w-4 h-4" />
        </div>

        <div className="flex flex-col min-w-0">
          <span className={`text-xs font-semibold truncate ${isMale ? 'text-white' : 'text-rose-800'}`}>
            {hasMicError
              ? 'Microphone blocked'
              : isRecording
              ? 'Recording Voice Note...'
              : 'Voice Note Ready'}
          </span>
          <span className={`text-[11px] font-mono ${isMale ? 'text-blue-400' : 'text-rose-600'}`}>
            {formatSeconds(duration)}
          </span>
        </div>

        {/* Dynamic Waveform Bars */}
        {!hasMicError && (
          <div className="flex items-center gap-1 h-5 ml-2">
            {[4, 12, 18, 8, 16, 22, 10, 14, 6].map((height, i) => (
              <div
                key={i}
                className={`w-1 rounded-full transition-all duration-150 ${
                  isMale ? 'bg-blue-500' : 'bg-rose-400'
                }`}
                style={{
                  height: isRecording
                    ? `${Math.max(4, ((height * ((duration % 3) + 1)) % 22) + 4)}px`
                    : '6px',
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Mic Permission Warning Indicator */}
      {hasMicError && (
        <div className="flex items-center gap-1 px-2.5 py-1 text-xs rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>Permission needed</span>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex items-center gap-2 shrink-0">
        {isRecording && !hasMicError && (
          <button
            onClick={stopRecording}
            className={`p-2 rounded-full transition-colors ${
              isMale ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-rose-200 hover:bg-rose-300 text-rose-800'
            }`}
            title="Stop recording"
          >
            <Square className={`w-4 h-4 ${isMale ? 'fill-white' : 'fill-rose-800'}`} />
          </button>
        )}

        <button
          onClick={onCancel}
          disabled={isUploading}
          className={`p-2 rounded-full transition-colors ${
            isMale ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-400 hover:text-slate-600 hover:bg-white'
          }`}
          title="Cancel"
        >
          <Trash2 className="w-4 h-4" />
        </button>

        <button
          onClick={handleSend}
          disabled={isUploading || hasMicError}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-white rounded-2xl shadow-xs transition-transform active:scale-95 text-xs font-semibold ${
            isMale ? 'bg-blue-600 hover:bg-blue-500' : 'bg-rose-500 hover:bg-rose-600'
          } ${isUploading || hasMicError ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isUploading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Uploading...</span>
            </>
          ) : (
            <>
              <Send className="w-3.5 h-3.5" />
              <span>Send</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
