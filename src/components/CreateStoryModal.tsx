import React, { useState, useRef } from 'react';
import { useChat } from '../context/ChatContext';
import { uploadImageToCloudinary } from '../utils/cloudinary';
import {
  X,
  Upload,
  Sparkles,
  Camera,
  Palette,
  Send,
  Loader2,
  AlertCircle,
  Smile,
} from 'lucide-react';
import { CuteAvatar } from '../utils/avatars';
import { sounds } from '../utils/sound';

const FEMALE_PRESET_GRADIENTS = [
  'from-pink-500 via-rose-400 to-amber-300',
  'from-purple-500 via-pink-400 to-rose-300',
  'from-emerald-400 via-teal-500 to-cyan-500',
  'from-amber-400 via-orange-400 to-rose-400',
  'from-sky-400 via-indigo-400 to-purple-500',
  'from-fuchsia-500 via-rose-500 to-amber-400',
];

const MALE_PRESET_GRADIENTS = [
  'from-slate-900 via-blue-950 to-slate-900',
  'from-blue-900 via-indigo-950 to-slate-950',
  'from-cyan-950 via-slate-900 to-blue-900',
  'from-slate-800 via-slate-900 to-black',
  'from-teal-950 via-slate-900 to-blue-950',
  'from-blue-950 via-slate-950 to-indigo-950',
];

const FEMALE_PRESET_EMOJIS = ['🌸', '✨', '💖', '🍡', '🍵', '🧋', '🐰', '🧸', '🍰', '🍓'];
const MALE_PRESET_EMOJIS = ['⚡', '🔥', '💻', '🚀', '🎯', '🎧', '🎮', '💡', '🏆', '🌐'];

export const CreateStoryModal: React.FC = () => {
  const {
    currentUser,
    showCreateStoryModal,
    setShowCreateStoryModal,
    addStory,
    theme,
  } = useChat();

  const isMale = theme === 'midnight';
  const PRESET_GRADIENTS = isMale ? MALE_PRESET_GRADIENTS : FEMALE_PRESET_GRADIENTS;
  const PRESET_EMOJIS = isMale ? MALE_PRESET_EMOJIS : FEMALE_PRESET_EMOJIS;

  const [mode, setMode] = useState<'text' | 'photo'>('text');
  const [text, setText] = useState('');
  const [gradientBg, setGradientBg] = useState(PRESET_GRADIENTS[0]);
  const [selectedPhotoFile, setSelectedPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!showCreateStoryModal || !currentUser) return null;

  const handleClose = () => {
    if (photoPreview) {
      URL.revokeObjectURL(photoPreview);
    }
    setText('');
    setSelectedPhotoFile(null);
    setPhotoPreview(null);
    setIsUploading(false);
    setErrorMsg(null);
    setShowCreateStoryModal(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please choose an image file.');
        return;
      }
      if (file.size > 8 * 1024 * 1024) {
        alert('Please choose an image under 8MB.');
        return;
      }

      sounds.playClick();
      setSelectedPhotoFile(file);
      const url = URL.createObjectURL(file);
      setPhotoPreview(url);
      setMode('photo');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() && !selectedPhotoFile) return;

    setIsUploading(true);
    setErrorMsg(null);

    let finalImageUrl: string | undefined = undefined;

    if (selectedPhotoFile) {
      try {
        finalImageUrl = await uploadImageToCloudinary(
          selectedPhotoFile,
          'mochichat_test/stories',
          (pct) => setUploadProgress(pct)
        );
      } catch (err: unknown) {
        console.error('Cloudinary story upload error:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to upload photo story.';
        setErrorMsg(errorMessage);
        setIsUploading(false);
        return;
      }
    }

    await addStory({
      text: text.trim() || undefined,
      imageUrl: finalImageUrl,
      gradientBg,
    });

    handleClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className={`relative w-full max-w-sm sm:max-w-md rounded-3xl shadow-2xl border overflow-hidden flex flex-col max-h-[92vh] animate-modalPop backdrop-blur-xl ${
        isMale ? 'bg-slate-900/95 border-slate-800/80 text-slate-100' : 'bg-white/95 border-pink-100/80 text-slate-800'
      }`}>
        {/* Header */}
        <div className={`p-4 px-5 border-b flex items-center justify-between ${
          isMale
            ? 'bg-slate-950/80 border-slate-800'
            : 'bg-gradient-to-r from-pink-50 via-rose-50 to-pink-50 border-pink-100'
        }`}>
          <div className="flex items-center gap-2">
            <Sparkles className={`w-5 h-5 ${isMale ? 'text-blue-400' : 'text-rose-500'}`} />
            <div>
              <h3 className={`text-sm font-bold ${isMale ? 'text-white' : 'text-slate-800'}`}>Add to 24h Story</h3>
              <p className={`text-[10px] font-medium ${isMale ? 'text-blue-400' : 'text-pink-500'}`}>Disappears in 24 hours</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className={`p-1.5 rounded-full transition-colors ${
              isMale ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-400 hover:text-slate-700 hover:bg-white'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Toggle: Text Story vs Photo Story */}
        <div className={`flex p-2 gap-1.5 border-b ${
          isMale ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-100'
        }`}>
          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              setMode('text');
            }}
            className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              mode === 'text'
                ? isMale
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-white text-rose-600 shadow-2xs'
                : isMale
                ? 'text-slate-400 hover:text-white'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>{isMale ? 'Text Story' : 'Cozy Text'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              setMode('photo');
              if (!photoPreview) {
                fileInputRef.current?.click();
              }
            }}
            className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              mode === 'photo'
                ? isMale
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-white text-rose-600 shadow-2xs'
                : isMale
                ? 'text-slate-400 hover:text-white'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Photo Story</span>
          </button>
        </div>

        {/* Story Canvas Preview */}
        <div className={`p-4 flex-1 flex flex-col items-center justify-center min-h-[300px] overflow-hidden ${
          isMale ? 'bg-slate-950/60' : 'bg-slate-100/50'
        }`}>
          <div
            className={`relative w-full aspect-[9/14] max-w-[260px] rounded-3xl shadow-xl overflow-hidden flex flex-col justify-between p-4 transition-all duration-300 ${
              mode === 'photo' && photoPreview
                ? 'bg-black'
                : `bg-gradient-to-br ${gradientBg}`
            }`}
          >
            {/* Story Header Preview */}
            <div className="flex items-center gap-2 z-10">
              <div className="w-8 h-8 rounded-full ring-2 ring-white/90 bg-white/20 backdrop-blur-sm flex items-center justify-center text-sm shadow-sm overflow-hidden">
                {currentUser.customAvatarUrl ? (
                  <img src={currentUser.customAvatarUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <CuteAvatar id={currentUser.avatarId} size="xs" />
                )}
              </div>
              <div className="text-white drop-shadow-md min-w-0">
                <span className="text-xs font-bold block truncate">{currentUser.name}</span>
                <span className="text-[10px] text-white/80 block">Just now</span>
              </div>
            </div>

            {/* Photo background if in photo mode */}
            {mode === 'photo' && photoPreview && (
              <img
                src={photoPreview}
                alt="Story"
                className="absolute inset-0 w-full h-full object-cover z-0"
              />
            )}

            {/* Text Content */}
            <div className="my-auto z-10 text-center px-2 py-4">
              <p
                className={`font-extrabold text-base sm:text-lg leading-snug drop-shadow-md break-words ${
                  mode === 'photo' && photoPreview ? 'text-white bg-black/40 p-2.5 rounded-2xl backdrop-blur-2xs' : 'text-white'
                }`}
              >
                {text || (mode === 'text' ? 'What’s on your mind?' : 'Photo moments')}
              </p>
            </div>

            {/* Upload progress indicator */}
            {isUploading && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center text-white z-20 gap-2">
                <Loader2 className={`w-7 h-7 animate-spin ${isMale ? 'text-blue-400' : 'text-pink-400'}`} />
                <span className="text-xs font-bold">Posting Story...</span>
                {uploadProgress > 0 && (
                  <span className={`text-[10px] ${isMale ? 'text-blue-200' : 'text-pink-200'}`}>{uploadProgress}%</span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Story Form & Controls */}
        <form onSubmit={handleSubmit} className={`p-4 px-5 border-t space-y-3 ${
          isMale ? 'bg-slate-900 border-slate-800' : 'bg-white border-pink-100'
        }`}>
          {errorMsg && (
            <div className="p-2 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-1.5 text-xs text-rose-400">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Text input */}
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={140}
            placeholder={mode === 'text' ? (isMale ? 'Type a story update...' : 'Type something sweet or cozy...') : 'Add a caption...'}
            className={`w-full px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-medium focus:outline-none transition-all ${
              isMale
                ? 'bg-slate-950 border border-slate-700 focus:border-blue-500 text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500/30'
                : 'bg-slate-50 border border-slate-200 focus:border-pink-400 text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-pink-200'
            }`}
          />

          {/* Quick Preset Emojis */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
            {PRESET_EMOJIS.map((em) => (
              <button
                type="button"
                key={em}
                onClick={() => setText((prev) => prev + em)}
                className="w-7 h-7 shrink-0 text-sm hover:scale-125 transition-transform"
              >
                {em}
              </button>
            ))}
          </div>

          {/* Gradient Palette choices (if text mode) */}
          {mode === 'text' && (
            <div>
              <span className={`text-[11px] font-bold uppercase tracking-wider block mb-1 ${
                isMale ? 'text-slate-400' : 'text-slate-500'
              }`}>
                Background Palette
              </span>
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {PRESET_GRADIENTS.map((grad, i) => (
                  <button
                    type="button"
                    key={i}
                    onClick={() => {
                      sounds.playClick();
                      setGradientBg(grad);
                    }}
                    className={`w-7 h-7 rounded-full bg-gradient-to-br ${grad} shrink-0 transition-all ${
                      gradientBg === grad
                        ? isMale
                          ? 'ring-3 ring-blue-500 scale-110 shadow-xs'
                          : 'ring-3 ring-pink-500 scale-110 shadow-xs'
                        : 'opacity-80 hover:opacity-100'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Photo file picker trigger (if photo mode) */}
          {mode === 'photo' && (
            <div className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 border border-dashed rounded-2xl text-xs font-bold transition-colors ${
                  isMale
                    ? 'border-blue-700 bg-blue-950/30 hover:bg-blue-900/50 text-blue-400'
                    : 'border-pink-300 bg-pink-50/50 hover:bg-pink-100/60 text-pink-700'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>{selectedPhotoFile ? 'Change Photo' : 'Select Photo from Device'}</span>
              </button>
            </div>
          )}

          {/* Submit Row */}
          <div className={`flex items-center justify-end gap-2 pt-2 border-t ${
            isMale ? 'border-slate-800' : 'border-slate-100'
          }`}>
            <button
              type="button"
              onClick={handleClose}
              className={`px-4 py-2 text-xs font-semibold rounded-2xl transition-colors ${
                isMale ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUploading || (!text.trim() && !selectedPhotoFile)}
              className={`flex items-center gap-1.5 px-5 py-2 text-white rounded-2xl text-xs font-bold transition-transform active:scale-95 disabled:opacity-50 ${
                isMale
                  ? 'bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-950'
                  : 'bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 shadow-md shadow-pink-200'
              }`}
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Sharing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Share Story</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

