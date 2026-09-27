import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '../context/ChatContext';
import { StickerPicker } from './StickerPicker';
import { ImagePreviewModal } from './ImagePreviewModal';
import { THEMES, resolveSimiTheme } from '../utils/theme';
import { StickerItem } from '../types/chat';
import { uploadImageToCloudinary, uploadMediaToCloudinary } from '../utils/cloudinary';
import {
  Send,
  Sparkles,
  Mic,
  Smile,
  X,
  Image as ImageIcon,
  Square,
  Trash2,
  AlertCircle,
  Play,
  Pause,
  Reply,
  CornerDownRight,
  WifiOff,
  FileText,
  Clock,
  Calendar,
} from 'lucide-react';
import { sounds } from '../utils/sound';
import { getRoomDraft, saveRoomDraft, clearRoomDraft } from '../utils/drafts';
import { ScheduleMessageModal } from './ScheduleMessageModal';

export const ChatInput: React.FC = () => {
  const {
    currentRoomId,
    currentUser,
    sendMessage,
    replyingTo,
    setReplyingTo,
    sendTyping,
    theme,
    triggerConfetti,
    isOnline,
    simiTheme,
    showToast,
  } = useChat();

  const [text, setText] = useState<string>(() => {
    return currentRoomId ? getRoomDraft(currentRoomId) : '';
  });
  const [hasDraft, setHasDraft] = useState<boolean>(() => {
    return currentRoomId ? Boolean(getRoomDraft(currentRoomId).trim()) : false;
  });
  const [showStickers, setShowStickers] = useState(false);

  // Sync draft whenever current room changes
  useEffect(() => {
    if (currentRoomId) {
      const saved = getRoomDraft(currentRoomId);
      setText(saved);
      setHasDraft(Boolean(saved.trim()));
    } else {
      setText('');
      setHasDraft(false);
    }
  }, [currentRoomId]);

  // --- Image Preview Modal & Firebase Storage State ---
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [selectedImagePreview, setSelectedImagePreview] = useState<string | null>(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // --- MediaRecorder Voice Recording State ---
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordDuration, setRecordDuration] = useState<number>(0);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [recordedAudioBlob, setRecordedAudioBlob] = useState<Blob | null>(null);
  const [isUploadingVoice, setIsUploadingVoice] = useState<boolean>(false);
  const [recordedDurationFinal, setRecordedDurationFinal] = useState<number>(0);
  const [micError, setMicError] = useState<string | null>(null);
  const [previewPlaying, setPreviewPlaying] = useState<boolean>(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const textInputRef = useRef<HTMLInputElement>(null);
  const activeTheme = THEMES[theme] || THEMES.strawberry;

  // Auto-focus text input whenever replyingTo changes
  useEffect(() => {
    if (replyingTo) {
      textInputRef.current?.focus();
    }
  }, [replyingTo]);

  // Cleanup active audio tracks and timer on unmount
  useEffect(() => {
    return () => {
      cleanupRecording();
      if (previewAudioRef.current) {
        previewAudioRef.current.pause();
      }
    };
  }, []);

  const cleanupRecording = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch {
        // ignore
      }
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
  };

  // Start MediaRecorder Audio Recording
  const startRecording = async () => {
    sounds.playClick();
    setMicError(null);
    setRecordedAudioUrl(null);
    setRecordDuration(0);
    audioChunksRef.current = [];

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setMicError('Your browser does not support microphone recording.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      mediaStreamRef.current = stream;

      const mimeTypes = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/ogg;codecs=opus',
        'audio/mp4',
        'audio/aac',
      ];
      let selectedMimeType = '';
      for (const mime of mimeTypes) {
        if (MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(mime)) {
          selectedMimeType = mime;
          break;
        }
      }

      const options = selectedMimeType ? { mimeType: selectedMimeType } : undefined;
      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event: BlobEvent) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const mime = selectedMimeType || 'audio/webm';
        const audioBlob = new Blob(audioChunksRef.current, { type: mime });
        setRecordedAudioBlob(audioBlob);
        const localUrl = URL.createObjectURL(audioBlob);
        setRecordedAudioUrl(localUrl);

        if (mediaStreamRef.current) {
          mediaStreamRef.current.getTracks().forEach((track) => track.stop());
          mediaStreamRef.current = null;
        }
      };

      mediaRecorder.start(250);
      setIsRecording(true);

      const startTime = Date.now();
      timerRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        setRecordDuration(elapsed);
        setRecordedDurationFinal(elapsed);

        if (elapsed >= 60) {
          stopRecording();
        }
      }, 500);
    } catch (err: unknown) {
      const e = err as { name?: string; message?: string };
      console.warn('Microphone access issue:', e);
      if (e.name === 'NotAllowedError' || e.name === 'PermissionDeniedError') {
        setMicError('Microphone permission denied. Allow mic access in your browser to record.');
      } else if (e.name === 'NotFoundError') {
        setMicError('No microphone input device found.');
      } else {
        setMicError('Could not start microphone recording.');
      }
      setIsRecording(false);
    }
  };

  // Stop MediaRecorder
  const stopRecording = () => {
    sounds.playClick();
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      try {
        mediaRecorderRef.current.stop();
      } catch {
        // ignore
      }
    }
    setIsRecording(false);
  };

  // Cancel Recording & Reset
  const cancelRecording = () => {
    sounds.playClick();
    cleanupRecording();
    setIsRecording(false);
    if (recordedAudioUrl && recordedAudioUrl.startsWith('blob:')) {
      URL.revokeObjectURL(recordedAudioUrl);
    }
    setRecordedAudioBlob(null);
    setRecordedAudioUrl(null);
    setRecordDuration(0);
    setMicError(null);
    setIsUploadingVoice(false);
    if (previewAudioRef.current) {
      previewAudioRef.current.pause();
    }
    setPreviewPlaying(false);
  };

  // Send Recorded Voice Note (Upload to Cloudinary, never store base64 in Firestore)
  const sendVoiceNote = async () => {
    if (!recordedAudioBlob) return;
    const finalDuration = Math.max(1, recordedDurationFinal || recordDuration || 1);
    setIsUploadingVoice(true);
    sounds.playClick();
    try {
      const secureUrl = await uploadMediaToCloudinary(recordedAudioBlob, {
        folder: 'mochichat_test/voice',
        resourceType: 'auto',
      });
      await sendMessage('Voice Note', 'voice', secureUrl, finalDuration);
      cancelRecording();
    } catch (err) {
      console.error('Failed to upload voice note:', err);
      setMicError('Failed to send voice note. Please retry.');
    } finally {
      setIsUploadingVoice(false);
    }
  };

  // Toggle preview playback of recorded voice note
  const togglePreviewPlay = () => {
    if (!recordedAudioUrl) return;
    if (previewPlaying) {
      if (previewAudioRef.current) previewAudioRef.current.pause();
      setPreviewPlaying(false);
    } else {
      if (!previewAudioRef.current) {
        previewAudioRef.current = new Audio(recordedAudioUrl);
        previewAudioRef.current.onended = () => setPreviewPlaying(false);
      } else {
        previewAudioRef.current.src = recordedAudioUrl;
      }
      previewAudioRef.current.play().then(() => {
        setPreviewPlaying(true);
      }).catch(() => {
        setPreviewPlaying(false);
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setText(val);
    if (currentRoomId) {
      saveRoomDraft(currentRoomId, val);
      setHasDraft(Boolean(val.trim()));
    }
    sendTyping(Boolean(val.trim()));
  };

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const content = text.trim();
    if (!content) return;

    try {
      await sendMessage(content, 'text');
      if (currentRoomId) {
        clearRoomDraft(currentRoomId);
      }
      setText('');
      setHasDraft(false);
      sendTyping(false);
    } catch (err) {
      console.error('Failed to send message:', err);
      showToast('Failed to send message. Please retry.', 'error');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    } else if (e.key === 'Escape' && replyingTo) {
      setReplyingTo(null);
    }
  };

  // Handle device file selection -> Open Preview Modal
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        showToast('Please choose an image file.', 'error');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        showToast('Please select an image under 10MB.', 'error');
        return;
      }

      sounds.playClick();
      setSelectedImageFile(file);
      setUploadError(null);
      setUploadProgress(0);

      // Create preview URL
      const preview = URL.createObjectURL(file);
      setSelectedImagePreview(preview);
      setIsImageModalOpen(true);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Close preview modal and cleanup object URL
  const handleCloseImageModal = () => {
    if (selectedImagePreview) {
      URL.revokeObjectURL(selectedImagePreview);
    }
    setIsImageModalOpen(false);
    setSelectedImageFile(null);
    setSelectedImagePreview(null);
    setIsUploadingImage(false);
    setUploadError(null);
  };

  // Upload to Cloudinary and send message
  const handleUploadAndSendImage = async (caption: string) => {
    if (!selectedImageFile || !currentRoomId || !currentUser) return;

    setIsUploadingImage(true);
    setUploadError(null);
    sounds.playClick();

    try {
      const folder = `mochichat_test/rooms/${currentRoomId}/images`;
      const secureUrl = await uploadImageToCloudinary(
        selectedImageFile,
        folder,
        (progress) => setUploadProgress(progress)
      );

      await sendMessage(caption.trim() || 'Shared a photo', 'image', secureUrl);
      handleCloseImageModal();
    } catch (err: unknown) {
      console.error('Cloudinary upload error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload image. Please try again.';
      setUploadError(errorMessage);
      setIsUploadingImage(false);
    }
  };

  const handleSelectSticker = (sticker: StickerItem) => {
    sendMessage(sticker.id, 'sticker');
    setShowStickers(false);
  };

  const handleSelectEmoji = (emoji: string) => {
    setText((prev) => prev + emoji);
  };

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const isMidnight = simiTheme.isMale;
  const isFemale = simiTheme.isFemale;

  return (
    <div className={`relative p-2.5 sm:p-3.5 border-t backdrop-blur-md ${
      isMidnight
        ? 'bg-[#111821] border-slate-800 text-slate-200'
        : isFemale
        ? 'bg-[#FFF7F9]/95 border-pink-100/90 text-slate-800'
        : 'bg-white/90 border-pink-100'
    }`}>
      {/* Sticker Drawer */}
      {showStickers && (
        <StickerPicker
          onSelectSticker={handleSelectSticker}
          onSelectEmoji={handleSelectEmoji}
          onClose={() => setShowStickers(false)}
        />
      )}

      {/* Image Preview & Upload Modal */}
      <ImagePreviewModal
        isOpen={isImageModalOpen}
        file={selectedImageFile}
        previewUrl={selectedImagePreview}
        onClose={handleCloseImageModal}
        onSend={handleUploadAndSendImage}
        isUploading={isUploadingImage}
        uploadProgress={uploadProgress}
        errorMessage={uploadError}
      />

      {/* Voice Recording / Preview Interface */}
      {(isRecording || recordedAudioUrl || micError) ? (
        <div className="flex flex-col gap-2">
          {micError && (
            <div className={`flex items-center gap-2 p-2.5 border rounded-2xl text-xs animate-in fade-in duration-150 ${
              isMidnight ? 'bg-slate-900 border-rose-900 text-rose-300' : 'bg-rose-50 border-rose-200 text-rose-700'
            }`}>
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              <span className="flex-1">{micError}</span>
              <button
                onClick={() => setMicError(null)}
                className="text-xs font-bold text-rose-400 hover:underline px-1"
              >
                Dismiss
              </button>
            </div>
          )}

          <div className={`flex items-center justify-between border rounded-3xl px-4 py-2.5 shadow-xs animate-in slide-in-from-bottom-2 duration-150 ${
            isMidnight ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-rose-50/80 border-rose-200/90'
          }`}>
            {/* Left Slot: Recording Indicator & Duration */}
            <div className="flex items-center gap-3">
              {isRecording ? (
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping shrink-0" />
                  <span className="text-xs font-bold text-rose-500 font-mono">
                    REC {formatTimer(recordDuration)}
                  </span>
                </div>
              ) : recordedAudioUrl ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={togglePreviewPlay}
                    className="p-1.5 rounded-full bg-rose-500 text-white hover:bg-rose-600 transition-colors shadow-2xs"
                    title={previewPlaying ? 'Pause preview' : 'Play preview'}
                  >
                    {previewPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-white ml-0.5" />}
                  </button>
                  <span className={`text-xs font-semibold ${isMidnight ? 'text-slate-200' : 'text-rose-800'}`}>
                    Voice Note ready ({formatTimer(recordedDurationFinal || recordDuration)})
                  </span>
                </div>
              ) : (
                <span className="text-xs font-medium text-slate-400">Microphone ready</span>
              )}

              {/* Animated Audio Waveform Bars */}
              {isRecording && (
                <div className="flex items-center gap-1 h-5 ml-1">
                  {[8, 16, 22, 12, 18, 24, 10, 15, 6].map((barHeight, idx) => (
                    <div
                      key={idx}
                      className="w-1 bg-rose-500 rounded-full transition-all duration-150 animate-pulse"
                      style={{
                        height: `${Math.max(4, (barHeight * ((recordDuration % 3) + 1)) % 24)}px`,
                      }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Right Slot: Stop, Cancel, and Send Controls */}
            <div className="flex items-center gap-2">
              {isRecording && (
                <button
                  type="button"
                  onClick={stopRecording}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-900/60 hover:bg-rose-800 text-rose-200 rounded-2xl text-xs font-bold transition-all shadow-2xs"
                  title="Stop recording"
                >
                  <Square className="w-3.5 h-3.5 fill-rose-200" />
                  <span>Done</span>
                </button>
              )}

              <button
                type="button"
                onClick={cancelRecording}
                className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-full transition-colors"
                title="Discard voice note"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              {recordedAudioUrl && (
                <button
                  type="button"
                  onClick={sendVoiceNote}
                  className={`flex items-center gap-1.5 px-4 py-1.5 text-white rounded-2xl text-xs font-bold shadow-md transition-transform active:scale-95 ${
                    isMidnight ? 'bg-gradient-to-r from-blue-600 to-cyan-600' : 'bg-gradient-to-r from-pink-500 to-rose-500 shadow-pink-200'
                  }`}
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Voice</span>
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {/* Offline Banner Indicator */}
          {!isOnline && (
            <div className={`flex items-center justify-between px-3 py-1.5 border rounded-2xl text-[11px] shadow-2xs animate-in slide-in-from-bottom-1 duration-150 ${
              isMidnight ? 'bg-amber-950/80 border-amber-800 text-amber-300' : 'bg-amber-50/95 border-amber-200/90 text-amber-900'
            }`}>
              <div className="flex items-center gap-2 min-w-0">
                <WifiOff className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span className="font-medium truncate">
                  Offline Mode · Cached history viewable · Drafts saved locally
                </span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-800/80 text-amber-200 shrink-0 ml-1">
                Offline
              </span>
            </div>
          )}

          {/* Draft Saved Indicator */}
          {hasDraft && (
            <div className="flex items-center justify-between px-2 text-[10px] text-slate-400">
              <div className={`flex items-center gap-1 font-semibold ${isMidnight ? 'text-blue-400' : 'text-pink-600'}`}>
                <FileText className={`w-3 h-3 ${isMidnight ? 'text-blue-400' : 'text-pink-500'}`} />
                <span>Draft saved for this room</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (currentRoomId) clearRoomDraft(currentRoomId);
                  setText('');
                  setHasDraft(false);
                }}
                className="hover:text-rose-400 hover:underline text-[10px]"
              >
                Clear draft
              </button>
            </div>
          )}

          {/* Highlighted Quoted Reply Preview Banner */}
          {replyingTo && (
            <div className={`flex items-center justify-between px-3.5 py-2 border rounded-2xl text-xs shadow-xs animate-in slide-in-from-bottom-2 duration-150 ${
              isMidnight
                ? 'bg-slate-900 border-slate-700 text-slate-200'
                : 'bg-gradient-to-r from-rose-50 via-pink-50 to-rose-50 border border-rose-200/90 text-rose-900'
            }`}>
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <div className={`p-1 rounded-lg shrink-0 ${isMidnight ? 'bg-slate-800 text-blue-400' : 'bg-pink-200/80 text-rose-700'}`}>
                  <Reply className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className={`font-bold text-[11px] ${isMidnight ? 'text-blue-400' : 'text-pink-700'}`}>
                      Replying to {replyingTo.senderName}
                    </span>
                    <span className="text-[10px] text-slate-400 font-normal">
                      (Press Esc to cancel)
                    </span>
                  </div>
                  <p className="text-slate-400 text-[11px] font-medium truncate flex items-center gap-1">
                    <CornerDownRight className={`w-3 h-3 shrink-0 inline ${isMidnight ? 'text-blue-400' : 'text-pink-400'}`} />
                    <span className="truncate">{replyingTo.text}</span>
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  setReplyingTo(null);
                }}
                className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-full transition-colors shrink-0 ml-2"
                title="Cancel reply (Esc)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Input Controls Row */}
          <form
            onSubmit={handleSend}
            className={`flex items-center gap-1 sm:gap-2 border rounded-full p-1 sm:p-1.5 transition-all ${
              isMidnight
                ? 'bg-[#111827]/90 hover:bg-[#131E35] focus-within:bg-[#131E35] border-slate-800 focus-within:border-cyan-500 shadow-xl'
                : isFemale
                ? 'bg-white shadow-xs border-pink-200/80 focus-within:border-rose-400 focus-within:ring-2 focus-within:ring-rose-100'
                : 'bg-pink-50/50 hover:bg-pink-50/80 focus-within:bg-white border-pink-200/70 focus-within:border-pink-400 focus-within:ring-2 focus-within:ring-pink-200'
            }`}
          >
            {/* Attachment Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className={`p-1.5 sm:p-2 rounded-2xl transition-colors shrink-0 ${
                isMidnight ? 'text-slate-300 hover:text-cyan-400 hover:bg-slate-800' : 'text-slate-500 hover:text-pink-600 hover:bg-pink-100/50'
              }`}
              title="Attach photo from device"
            >
              <ImageIcon className="w-4 h-4 shrink-0" />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageFileChange}
              />
            </button>

            {/* Sticker / Emoji Toggle */}
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                setShowStickers(!showStickers);
              }}
              className={`p-1.5 sm:p-2 rounded-2xl transition-colors shrink-0 ${
                showStickers
                  ? isMidnight ? 'bg-slate-800 text-cyan-400' : 'bg-rose-100 text-rose-700'
                  : isMidnight ? 'text-slate-300 hover:text-cyan-400 hover:bg-slate-800' : 'text-slate-500 hover:text-pink-600 hover:bg-pink-100/50'
              }`}
              title="Stickers & emoji"
            >
              <Smile className="w-4 h-4 shrink-0" />
            </button>

            {/* Main Text Input */}
            <input
              ref={textInputRef}
              type="text"
              value={text}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder={
                replyingTo
                  ? `Reply to ${replyingTo.senderName}...`
                  : 'Type a message...'
              }
              className={`flex-1 min-w-0 bg-transparent px-1 sm:px-2 text-xs sm:text-sm focus:outline-none font-medium ${
                isMidnight ? 'text-slate-100 placeholder-slate-500' : 'text-slate-800 placeholder-slate-400'
              }`}
            />

            {/* Sparkle Confetti button */}
            <button
              type="button"
              onClick={() => {
                sounds.playReaction();
                triggerConfetti();
              }}
              className="p-1.5 sm:p-2 rounded-2xl text-amber-500 hover:bg-amber-500/10 hover:scale-110 transition-all shrink-0"
              title="Celebrate with confetti!"
            >
              <Sparkles className="w-4 h-4 shrink-0" />
            </button>

            {/* Send or Voice Record Action Button */}
            {text.trim() ? (
              <button
                type="submit"
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shrink-0 transition-all active:scale-95 ${
                  isMidnight
                    ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 text-white shadow-md shadow-blue-950/60 glow-cyan-blue'
                    : 'bg-gradient-to-r from-rose-500 via-pink-500 to-rose-400 text-white shadow-md shadow-rose-200/60'
                }`}
                title="Send message"
              >
                <Send className="w-4 h-4 shrink-0" />
              </button>
            ) : (
              <button
                type="button"
                onClick={startRecording}
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shrink-0 transition-all active:scale-95 ${
                  isMidnight
                    ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-md shadow-blue-950/60 glow-cyan-blue'
                    : isFemale
                    ? 'bg-gradient-to-r from-rose-500 via-pink-500 to-rose-400 text-white shadow-md shadow-rose-200/60'
                    : 'text-slate-500 hover:text-rose-600 hover:bg-pink-100/50'
                }`}
                title="Record voice note"
              >
                <Mic className="w-4 h-4 shrink-0" />
              </button>
            )}
          </form>
        </div>
      )}
    </div>
  );
};
