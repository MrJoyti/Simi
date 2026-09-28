import React, { useState, useRef } from 'react';
import { useChat } from '../context/ChatContext';
import { CuteAvatar } from '../utils/avatars';
import { resolveSimiTheme } from '../utils/theme';
import {
  X,
  Image as ImageIcon,
  Mic,
  MapPin,
  Smile,
  Tag,
  Plus,
  Trash2,
  Sparkles,
  Camera,
} from 'lucide-react';
import { sounds } from '../utils/sound';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPostCreated?: (post: { content: string; images: string[] }) => void;
}

export const CreatePostModal: React.FC<CreatePostModalProps> = ({
  isOpen,
  onClose,
  onPostCreated,
}) => {
  const { currentUser, addStory, triggerConfetti, simiTheme, showToast } = useChat();
  const isMidnight = simiTheme.isMale;

  const [text, setText] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [selectedMood, setSelectedMood] = useState<string>('');
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [shareToStory, setShareToStory] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen || !currentUser) return null;

  const handleAddImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          setImages((prev) => [...prev, reader.result as string]);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handlePost = async () => {
    if (!text.trim() && images.length === 0) return;
    sounds.playSend();

    // Call callback to add post to feed
    if (onPostCreated) {
      onPostCreated({
        content: text.trim() || 'Shared moments on Simi ✨',
        images,
      });
    }

    // Only share to story if user explicitly chose to
    if (shareToStory) {
      try {
        await addStory({
          text: text.trim() || undefined,
          imageUrl: images[0] || undefined,
          gradientBg: 'from-slate-950 via-blue-950 to-slate-900',
        });
      } catch {
        // ignore
      }
    }

    triggerConfetti();
    setText('');
    setImages([]);
    setShareToStory(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className={`w-full max-w-lg rounded-3xl overflow-hidden border shadow-2xl flex flex-col max-h-[92dvh] animate-in zoom-in-95 duration-200 ${
          isMidnight
            ? 'bg-[#111827] border-slate-800 text-slate-100'
            : 'bg-white border-pink-100 text-slate-800'
        }`}
      >
        {/* Top Header */}
        <div
          className={`flex items-center justify-between px-5 py-3.5 border-b ${
            isMidnight ? 'border-slate-800/80 bg-slate-900/60' : 'border-pink-100/80 bg-[#FFF7F9]'
          }`}
        >
          <button
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className={`p-2 rounded-2xl transition-colors ${
              isMidnight ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:bg-pink-100/70'
            }`}
          >
            <X className="w-5 h-5" />
          </button>

          <h3 className="text-sm font-bold tracking-tight">Create Post</h3>

          <button
            onClick={handlePost}
            disabled={!text.trim() && images.length === 0}
            className={`px-4 py-1.5 rounded-full font-bold text-xs shadow-md transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed ${
              isMidnight
                ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 text-white hover:opacity-95 shadow-blue-900/40'
                : 'bg-gradient-to-r from-rose-500 via-pink-500 to-rose-400 text-white hover:opacity-95 shadow-rose-200/60'
            }`}
          >
            Post
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Identity & Text input */}
          <div className="flex items-start gap-3">
            <CuteAvatar
              id={currentUser.avatarId}
              customUrl={currentUser.customAvatarUrl}
              size="md"
              className={isMidnight ? 'ring-2 ring-blue-500/30' : 'ring-2 ring-pink-200'}
            />
            <div className="flex-1">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-xs font-bold">{currentUser.name}</span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                    isMidnight ? 'bg-slate-800 text-blue-300' : 'bg-pink-100 text-rose-700'
                  }`}
                >
                  Public
                </span>
              </div>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={`What's on your mind, ${currentUser.name.split(' ')[0]}?`}
                rows={3}
                className={`w-full bg-transparent resize-none focus:outline-none text-sm placeholder:text-slate-500 ${
                  isMidnight ? 'text-slate-100' : 'text-slate-800'
                }`}
              />
            </div>
          </div>

          {/* Media Preview Grid */}
          {images.length > 0 && (
            <div className="grid grid-cols-3 gap-2 p-2 rounded-2xl bg-black/20 border border-slate-800/60">
              {images.map((img, idx) => (
                <div key={idx} className="relative aspect-square rounded-xl overflow-hidden group border border-slate-700/50">
                  <img src={img} alt="Post preview" className="w-full h-full object-cover" />
                  <button
                    onClick={() => handleRemoveImage(idx)}
                    className="absolute top-1 right-1 p-1 rounded-full bg-black/60 text-white hover:bg-rose-600 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              {images.length < 6 && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className={`aspect-square rounded-xl border border-dashed flex flex-col items-center justify-center transition-colors ${
                    isMidnight
                      ? 'border-slate-700 hover:border-blue-500 hover:bg-slate-800/40 text-slate-400'
                      : 'border-pink-300 hover:bg-pink-50 text-rose-500'
                  }`}
                >
                  <Plus className="w-6 h-6" />
                  <span className="text-[10px] mt-1 font-medium">Add Photo</span>
                </button>
              )}
            </div>
          )}

          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            className="hidden"
            onChange={handleAddImage}
          />

          {/* Optional Story Cross-Post Toggle */}
          <div
            onClick={() => {
              sounds.playClick();
              setShareToStory(!shareToStory);
            }}
            className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition-colors ${
              isMidnight
                ? shareToStory ? 'bg-blue-950/30 border-blue-500/40 text-blue-200' : 'bg-slate-900/40 border-slate-800/60 text-slate-400'
                : shareToStory ? 'bg-pink-50 border-rose-200 text-rose-700' : 'bg-white border-pink-100 text-slate-500'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <div>
                <span className="text-xs font-bold block">Also share to 24h Story</span>
                <span className="text-[10px] opacity-75 block">Post will also be visible on your story feed</span>
              </div>
            </div>
            <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
              shareToStory
                ? isMidnight ? 'bg-blue-600 border-blue-500 text-white' : 'bg-rose-500 border-rose-500 text-white'
                : isMidnight ? 'border-slate-700 bg-slate-800' : 'border-slate-300 bg-white'
            }`}>
              {shareToStory && <span className="text-xs font-black">✓</span>}
            </div>
          </div>

          {/* Action List Items */}
          <div className="space-y-1.5 pt-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className={`w-full flex items-center justify-between p-3 rounded-2xl transition-all border ${
                isMidnight
                  ? 'bg-slate-900/60 hover:bg-slate-800/80 border-slate-800/80 text-slate-200'
                  : 'bg-white hover:bg-pink-50/70 border-pink-100/90 text-slate-700 shadow-2xs'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                  isMidnight ? 'bg-blue-500/10 text-blue-400' : 'bg-pink-100/80 text-rose-500'
                }`}>
                  <ImageIcon className="w-4 h-4" />
                </div>
                <span className="text-xs font-semibold">Add Photos / Videos</span>
              </div>
              <Plus className="w-4 h-4 text-slate-400" />
            </button>

            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                showToast('Voice recording note feature is ready in direct chats!', 'info');
              }}
              className={`w-full flex items-center justify-between p-3 rounded-2xl transition-all border ${
                isMidnight
                  ? 'bg-slate-900/60 hover:bg-slate-800/80 border-slate-800/80 text-slate-200'
                  : 'bg-white hover:bg-pink-50/70 border-pink-100/90 text-slate-700 shadow-2xs'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                  isMidnight ? 'bg-cyan-500/10 text-cyan-400' : 'bg-purple-100/80 text-purple-600'
                }`}>
                  <Mic className="w-4 h-4" />
                </div>
                <span className="text-xs font-semibold">Add Voice Note</span>
              </div>
              <Plus className="w-4 h-4 text-slate-400" />
            </button>

            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                const loc = prompt('Enter your location:', selectedLocation || 'Dhaka, Bangladesh');
                if (loc) setSelectedLocation(loc);
              }}
              className={`w-full flex items-center justify-between p-3 rounded-2xl transition-all border ${
                isMidnight
                  ? 'bg-slate-900/60 hover:bg-slate-800/80 border-slate-800/80 text-slate-200'
                  : 'bg-white hover:bg-pink-50/70 border-pink-100/90 text-slate-700 shadow-2xs'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                  isMidnight ? 'bg-rose-500/10 text-rose-400' : 'bg-amber-100/80 text-amber-600'
                }`}>
                  <MapPin className="w-4 h-4" />
                </div>
                <span className="text-xs font-semibold">
                  {selectedLocation ? `Location: ${selectedLocation}` : 'Add Location'}
                </span>
              </div>
              <Plus className="w-4 h-4 text-slate-400" />
            </button>

            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                const mood = prompt('What is your current vibe / mood?', 'Exploring ✨');
                if (mood) setSelectedMood(mood);
              }}
              className={`w-full flex items-center justify-between p-3 rounded-2xl transition-all border ${
                isMidnight
                  ? 'bg-slate-900/60 hover:bg-slate-800/80 border-slate-800/80 text-slate-200'
                  : 'bg-white hover:bg-pink-50/70 border-pink-100/90 text-slate-700 shadow-2xs'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                  isMidnight ? 'bg-amber-500/10 text-amber-400' : 'bg-rose-100/80 text-rose-500'
                }`}>
                  <Smile className="w-4 h-4" />
                </div>
                <span className="text-xs font-semibold">
                  {selectedMood ? `Mood: ${selectedMood}` : 'Add Mood / Activity'}
                </span>
              </div>
              <Plus className="w-4 h-4 text-slate-400" />
            </button>

            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                showToast('Mention friends by typing @ in your post!', 'info');
              }}
              className={`w-full flex items-center justify-between p-3 rounded-2xl transition-all border ${
                isMidnight
                  ? 'bg-slate-900/60 hover:bg-slate-800/80 border-slate-800/80 text-slate-200'
                  : 'bg-white hover:bg-pink-50/70 border-pink-100/90 text-slate-700 shadow-2xs'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                  isMidnight ? 'bg-purple-500/10 text-purple-400' : 'bg-sky-100/80 text-sky-600'
                }`}>
                  <Tag className="w-4 h-4" />
                </div>
                <span className="text-xs font-semibold">Add Tag / Mention</span>
              </div>
              <Plus className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
