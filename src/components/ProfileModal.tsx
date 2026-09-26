import React, { useState } from 'react';
import { useChat } from '../context/ChatContext';
import { CuteAvatar, AVATAR_LIST } from '../utils/avatars';
import { THEMES, CHAT_PATTERNS } from '../utils/theme';
import { ThemeColor, ChatPattern, PrivacyVisibility } from '../types/chat';
import {
  X,
  Sparkles,
  Upload,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Palette,
  ChevronDown,
  Shield,
  Camera,
  MessageCircle,
  UserPlus,
  UserCheck,
  UserX,
  Ban,
  Lock,
} from 'lucide-react';
import { sounds } from '../utils/sound';
import { canViewProfile } from '../utils/privacy';

const BADGE_OPTIONS = [
  '🍓 Sweet Soul',
  '🌸 Cozy Friend',
  '✨ Kawaii VIP',
  '🧋 Boba Fanatic',
  '🐾 Bunny Companion',
  '🌙 Night Owl',
];

const MOOD_EMOJIS = ['🌸', '✨', '🍓', '🍰', '🧋', '🍵', '🐾', '🎀', '🧸', '💖', '💤', '🥺'];

export const ProfileModal: React.FC = () => {
  const {
    currentUser,
    activeUsers,
    updateProfile,
    showProfileModal,
    setShowProfileModal,
    selectedProfileUser,
    setSelectedProfileUser,
    theme: currentActiveTheme,
    setTheme: setGlobalTheme,
    chatPattern: currentGlobalPattern,
    setChatPattern: setGlobalPattern,
    startDirectMessage,
    getBuddyRequestState,
    sendBuddyRequest,
    acceptBuddyRequest,
    declineBuddyRequest,
    cancelBuddyRequest,
    removeBuddy,
    isBuddy,
    buddyRequests,
    isBlocked,
    toggleBlockUser,
  } = useChat();

  const handleClose = () => {
    setShowProfileModal(false);
    setSelectedProfileUser(null);
  };

  if (!showProfileModal || !currentUser) return null;

  // Viewing another user's profile
  if (selectedProfileUser && selectedProfileUser.id !== currentUser.id) {
    const isAllowed = canViewProfile(selectedProfileUser, currentUser, activeUsers);
    const reqState = getBuddyRequestState(selectedProfileUser.id);
    const blocked = isBlocked(selectedProfileUser.id);
    const isMidnight = currentActiveTheme === 'midnight';

    const activeReq = buddyRequests.find(
      (r) =>
        (r.fromUserId === currentUser.id && r.toUserId === selectedProfileUser.id) ||
        (r.fromUserId === selectedProfileUser.id && r.toUserId === currentUser.id)
    );

    return (
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
        onClick={handleClose}
      >
        <div
          className={`relative w-full max-w-md rounded-3xl shadow-2xl border overflow-hidden ${
            isMidnight ? 'bg-[#111821] border-slate-800 text-slate-100' : 'bg-white border-pink-100'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Cover Photo Banner */}
          <div className="w-full h-32 relative bg-slate-200 overflow-hidden">
            {isAllowed && selectedProfileUser.coverUrl ? (
              <img src={selectedProfileUser.coverUrl} alt="Cover" className="w-full h-full object-cover" />
            ) : (
              <div
                className="w-full h-full"
                style={{
                  background: isMidnight
                    ? 'linear-gradient(135deg, #1e293b, #0f172a, #3b82f6)'
                    : 'linear-gradient(135deg, #fb7185, #f472b6, #fbbf24)',
                }}
              />
            )}
            <button
              onClick={handleClose}
              className="absolute top-3 right-3 p-1.5 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-xs transition-colors z-10"
              title="Close profile"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Profile Card Body */}
          <div className="p-6 pt-0 text-center flex flex-col items-center">
            <div className="relative -mt-10 mb-3">
              <CuteAvatar
                id={selectedProfileUser.avatarId}
                customUrl={isAllowed ? selectedProfileUser.customAvatarUrl : undefined}
                size="lg"
                className="ring-4 ring-white shadow-xl"
              />
              <span className="absolute -bottom-1 -right-1 text-2xl">
                {selectedProfileUser.moodEmoji || '🌸'}
              </span>
            </div>

            <h3 className="text-base font-bold text-slate-800">{selectedProfileUser.name}</h3>
            <p className="text-xs text-slate-400">@{selectedProfileUser.username}</p>

            {isBuddy(selectedProfileUser.id) ? (
              <div className="mt-2.5 w-full p-2.5 rounded-2xl bg-pink-50/70 border border-pink-200/80 text-left space-y-1">
                <div className="flex items-center justify-between gap-2 min-w-0">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email</span>
                  <span className="text-xs font-semibold text-slate-700 truncate">{selectedProfileUser.email}</span>
                </div>
                <div className="flex items-center justify-between gap-2 min-w-0">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">User ID</span>
                  <code className="text-xs font-mono font-bold text-rose-700 truncate">{selectedProfileUser.id}</code>
                </div>
              </div>
            ) : (
              <div className="mt-2 text-center text-[11px] text-slate-400 italic bg-slate-50 p-2 rounded-xl border border-slate-100 w-full">
                🔒 Email & User ID hidden (Add buddy to view)
              </div>
            )}

            {isAllowed ? (
              <>
                <p className="mt-2 text-xs text-slate-600 bg-pink-50/60 p-2.5 rounded-2xl border border-pink-100/80 max-w-xs">
                  "{selectedProfileUser.bio || 'Sweet cozy chats'}"
                </p>
                {selectedProfileUser.badge && (
                  <span className="mt-2 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-pink-100 text-pink-700">
                    {selectedProfileUser.badge}
                  </span>
                )}
              </>
            ) : (
              <div className="mt-3 p-3 bg-amber-50 border border-amber-200/80 rounded-2xl flex items-center justify-center gap-1.5 text-amber-800 text-xs font-semibold">
                <Lock className="w-4 h-4 text-amber-600" />
                <span>Profile is Private</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2 mt-5 w-full">
              {/* Direct Message Button (Independent of Profile Privacy!) */}
              <button
                onClick={() => {
                  sounds.playClick();
                  startDirectMessage(selectedProfileUser);
                  handleClose();
                }}
                disabled={blocked}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white rounded-2xl text-xs font-bold shadow-md shadow-pink-200 transition-transform active:scale-95 disabled:opacity-50"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Message</span>
              </button>

              {/* Buddy Request Action Button */}
              {reqState === 'buddy' ? (
                <button
                  onClick={() => removeBuddy(selectedProfileUser.id)}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-emerald-100 hover:bg-rose-100 text-emerald-800 hover:text-rose-700 border border-emerald-200 hover:border-rose-200 rounded-2xl text-xs font-bold transition-colors"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Buddy ✓</span>
                </button>
              ) : reqState === 'requestSent' ? (
                <button
                  onClick={() => cancelBuddyRequest(selectedProfileUser.id)}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-2xl text-xs font-bold transition-colors"
                  title="Cancel Request"
                >
                  <UserX className="w-4 h-4 text-rose-500" />
                  <span>Cancel Request</span>
                </button>
              ) : reqState === 'incomingRequest' ? (
                <div className="flex gap-1">
                  <button
                    onClick={() => acceptBuddyRequest(selectedProfileUser.id, selectedProfileUser.id)}
                    className="flex-1 py-2 px-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-2xs transition-colors"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => declineBuddyRequest(selectedProfileUser.id)}
                    className="py-2 px-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold transition-colors"
                  >
                    Decline
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => sendBuddyRequest(selectedProfileUser)}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-white hover:bg-pink-50 text-pink-700 border border-pink-200 rounded-2xl text-xs font-bold shadow-2xs transition-transform active:scale-95"
                >
                  <UserPlus className="w-4 h-4 text-pink-500" />
                  <span>Add Buddy</span>
                </button>
              )}
            </div>

            {/* Block / Unblock Toggle */}
            <button
              onClick={() => toggleBlockUser(selectedProfileUser.id)}
              className="mt-3 text-[11px] font-bold text-slate-400 hover:text-rose-500 transition-colors flex items-center gap-1"
            >
              <Ban className="w-3 h-3" />
              <span>{blocked ? `Unblock ${selectedProfileUser.name}` : `Block ${selectedProfileUser.name}`}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const [name, setName] = useState(currentUser.name);
  const [username, setUsername] = useState(currentUser.username);
  const [avatarId, setAvatarId] = useState(currentUser.avatarId);
  const [customAvatarUrl, setCustomAvatarUrl] = useState<string | undefined>(
    currentUser.customAvatarUrl
  );
  const [coverUrl, setCoverUrl] = useState<string>(currentUser.coverUrl || '');
  const [bio, setBio] = useState(currentUser.bio);
  const [moodEmoji, setMoodEmoji] = useState(currentUser.moodEmoji);
  const [moodText, setMoodText] = useState(currentUser.moodText);
  const [badge, setBadge] = useState(currentUser.badge || BADGE_OPTIONS[0]);
  const [showActiveStatus, setShowActiveStatus] = useState<boolean>(
    currentUser.showActiveStatus ?? true
  );
  const [privacyVisibility, setPrivacyVisibility] = useState<PrivacyVisibility>(
    currentUser.privacyVisibility || 'buddies'
  );
  const [selectedTheme, setSelectedTheme] = useState<ThemeColor>(currentUser.theme || 'strawberry');
  const [selectedPattern, setSelectedPattern] = useState<ChatPattern>(currentUser.chatPattern || 'mochi_dots');
  const [isThemeDropdownOpen, setIsThemeDropdownOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  const handleCopyId = () => {
    navigator.clipboard.writeText(currentUser.id);
    sounds.playClick();
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleThemeChange = (newTheme: ThemeColor) => {
    setSelectedTheme(newTheme);
    setGlobalTheme(newTheme); // Instantly preview & update global theme
    setIsThemeDropdownOpen(false);
    sounds.playReaction();
  };

  const handlePatternChange = (newPattern: ChatPattern) => {
    setSelectedPattern(newPattern);
    setGlobalPattern(newPattern); // Instantly preview chat background pattern
    sounds.playReaction();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSaving(true);
    sounds.playClick();

    await updateProfile({
      name: name.trim(),
      username: username.trim().toLowerCase().replace(/\s+/g, '_'),
      avatarId,
      customAvatarUrl,
      coverUrl,
      bio: bio.trim(),
      moodEmoji,
      moodText: moodText.trim(),
      badge,
      showActiveStatus,
      privacyVisibility,
      theme: selectedTheme,
      chatPattern: selectedPattern,
    });

    setIsSaving(false);
    setSavedSuccess(true);
    sounds.playSend();

    setTimeout(() => {
      setSavedSuccess(false);
      setShowProfileModal(false);
    }, 600);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('Please choose an image under 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setCustomAvatarUrl(reader.result as string);
        sounds.playClick();
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCoverFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Please choose an image under 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverUrl(reader.result as string);
        sounds.playClick();
      };
      reader.readAsDataURL(file);
    }
  };

  const currentThemeObj = THEMES[selectedTheme] || THEMES.strawberry;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-pink-100 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Pastel Header */}
        <div
          className="p-4 sm:p-5 flex items-center justify-between text-white relative overflow-hidden transition-colors"
          style={{
            background: `linear-gradient(135deg, ${currentThemeObj.accent}, ${currentThemeObj.accentHover})`,
          }}
        >
          <div className="flex items-center gap-2.5 z-10">
            <span className="text-2xl">{currentThemeObj.icon}</span>
            <div>
              <h3 className="font-bold text-base sm:text-lg drop-shadow-xs">Profile & Settings</h3>
            </div>
          </div>
          <button
            onClick={() => setShowProfileModal(false)}
            className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors z-10"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1 scrollbar-thin">
          {/* User ID & Email Share banner */}
          <div className="p-3 bg-pink-50/70 border border-pink-200/80 rounded-2xl space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  User ID
                </span>
                <span className="text-xs font-mono font-bold text-pink-700 truncate block">
                  {currentUser.id}
                </span>
              </div>
              <button
                type="button"
                onClick={handleCopyId}
                className="flex items-center gap-1 px-3 py-1.5 bg-white hover:bg-pink-100 text-rose-700 text-xs font-bold rounded-xl border border-pink-200 transition-colors shrink-0 shadow-2xs"
              >
                {copiedId ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy ID</span>
                  </>
                )}
              </button>
            </div>

            <div className="border-t border-pink-200/60 pt-2 flex items-center justify-between gap-2">
              <div className="min-w-0">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Email Address
                </span>
                <span className="text-xs font-semibold text-slate-700 truncate block">
                  {currentUser.email}
                </span>
              </div>
              <span className="text-[10px] font-bold text-emerald-700 bg-white border border-pink-200 px-2 py-0.5 rounded-full shrink-0">
                {currentUser.emailVerified ? 'Verified ✓' : 'Unverified'}
              </span>
            </div>
          </div>

          {/* Cover Photo Banner Preview & Selection */}
          <div className="bg-pink-50/40 p-3.5 rounded-3xl border border-pink-100 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-pink-500" />
                <span>Cover Photo</span>
              </label>
              {coverUrl && (
                <button
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    setCoverUrl('');
                  }}
                  className="text-[10px] font-bold text-rose-500 hover:text-rose-700"
                >
                  Remove Cover
                </button>
              )}
            </div>

            <div className="w-full h-24 rounded-2xl overflow-hidden relative border border-pink-200/80 bg-slate-100 group shadow-2xs">
              {coverUrl ? (
                <img src={coverUrl} alt="Cover Preview" className="w-full h-full object-cover" />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center text-xs font-semibold text-white/90"
                  style={{
                    background: `linear-gradient(135deg, ${currentThemeObj.accent}, ${currentThemeObj.accentHover})`,
                  }}
                >
                  <span className="drop-shadow-xs font-bold">Theme Gradient Banner (Default)</span>
                </div>
              )}

              <label className="absolute inset-0 bg-black/20 hover:bg-black/40 flex items-center justify-center cursor-pointer transition-colors text-white text-xs font-bold gap-1.5 opacity-90 hover:opacity-100">
                <Upload className="w-4 h-4" />
                <span>{coverUrl ? 'Change Cover Photo' : 'Upload Cover Photo'}</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleCoverFileUpload}
                />
              </label>
            </div>
          </div>

          {/* Avatar Preview & Selection */}
          <div className="bg-slate-50/70 p-3.5 rounded-3xl border border-slate-200/60">
            <div className="flex items-center gap-4 mb-3">
              <div className="relative">
                <CuteAvatar
                  id={avatarId}
                  customUrl={customAvatarUrl}
                  size="lg"
                  className="ring-4 ring-pink-200 shadow-md"
                />
                <span className="absolute -bottom-1 -right-1 text-lg">
                  {moodEmoji}
                </span>
                {showActiveStatus && (
                  <span
                    className="absolute -top-1 -left-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white ring-2 ring-emerald-300 animate-pulse shadow-sm z-10"
                    title="Active Status ON (Green light blinks when online)"
                  />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-slate-800 truncate">{name || 'Sweetie'}</h4>
                  {currentUser.emailVerified ? (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>Verified</span>
                    </span>
                  ) : (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-semibold flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 text-amber-600" />
                      <span>Unverified</span>
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 truncate">@{username || 'user'}</p>
                <p className="text-xs text-rose-500 italic mt-0.5 truncate">
                  "{moodText || 'Smiling brightly'}"
                </p>
              </div>
            </div>

            {/* SVG Avatar Grid */}
            <div className="grid grid-cols-4 gap-2 mb-2">
              {AVATAR_LIST.map((av) => (
                <button
                  type="button"
                  key={av.id}
                  onClick={() => {
                    sounds.playClick();
                    setAvatarId(av.id);
                    setCustomAvatarUrl(undefined);
                  }}
                  className={`flex flex-col items-center gap-1.5 p-2 rounded-2xl border transition-all ${
                    avatarId === av.id && !customAvatarUrl
                      ? 'border-pink-500 bg-pink-50/80 shadow-xs scale-105'
                      : 'border-slate-100 hover:border-pink-200 bg-white'
                  }`}
                >
                  <CuteAvatar id={av.id} size="md" />
                  <span className="text-[11px] text-slate-600 font-medium truncate w-full text-center">
                    {av.name.split(' ')[0]}
                  </span>
                </button>
              ))}
            </div>

            {/* Custom Photo Upload */}
            <div className="flex items-center gap-2 mt-2">
              <label className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 border border-dashed border-pink-300 rounded-2xl bg-pink-50/30 hover:bg-pink-50 text-xs font-semibold text-pink-600 cursor-pointer transition-colors">
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Custom Photo</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </label>
              {customAvatarUrl && (
                <button
                  type="button"
                  onClick={() => setCustomAvatarUrl(undefined)}
                  className="px-3 py-2 text-xs font-medium text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-2xl transition-colors"
                >
                  Remove Photo
                </button>
              )}
            </div>
          </div>

          {/* Name & Username Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Display Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={30}
                required
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:bg-white transition-all"
                placeholder="e.g. Cotton Candy"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Username handle
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-xs text-slate-400">@</span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  maxLength={20}
                  required
                  className="w-full pl-7 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:bg-white transition-all"
                  placeholder="username"
                />
              </div>
            </div>
          </div>

          {/* Mood Status Emoji & Text */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Mood Status
            </label>
            <div className="flex items-center gap-2 mb-2 overflow-x-auto pb-1 scrollbar-none">
              {MOOD_EMOJIS.map((emoji) => (
                <button
                  type="button"
                  key={emoji}
                  onClick={() => {
                    sounds.playClick();
                    setMoodEmoji(emoji);
                  }}
                  className={`w-8 h-8 shrink-0 flex items-center justify-center text-base rounded-xl transition-all ${
                    moodEmoji === emoji
                      ? 'bg-pink-200 shadow-xs scale-110'
                      : 'hover:bg-pink-100/70'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={moodText}
              onChange={(e) => setMoodText(e.target.value)}
              maxLength={50}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:bg-white transition-all"
              placeholder="e.g. Sipping peach iced tea 🍑"
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Cute Bio
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={2}
              maxLength={120}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:bg-white transition-all resize-none"
              placeholder="Tell friends about your cozy hobbies or favorite snacks..."
            />
          </div>

          {/* Cute Badge Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Profile Badge
            </label>
            <div className="flex flex-wrap gap-1.5">
              {BADGE_OPTIONS.map((b) => (
                <button
                  type="button"
                  key={b}
                  onClick={() => {
                    sounds.playClick();
                    setBadge(b);
                  }}
                  className={`px-3 py-1 rounded-xl text-xs font-medium transition-all ${
                    badge === b
                      ? 'bg-rose-500 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>

          {/* Active Status ON / OFF Toggle */}
          <div className="p-3 bg-pink-50/50 border border-pink-200/80 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-3 w-3">
                {showActiveStatus ? (
                  <>
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
                  </>
                ) : (
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-slate-400" />
                )}
              </span>
              <div>
                <p className="text-xs font-bold text-slate-800">Active Status</p>
                <p className="text-[10px] text-slate-500">
                  {showActiveStatus ? 'ON' : 'OFF'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                setShowActiveStatus(!showActiveStatus);
              }}
              className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                showActiveStatus ? 'bg-emerald-500' : 'bg-slate-300'
              }`}
              title={showActiveStatus ? 'Turn OFF Active Status' : 'Turn ON Active Status'}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  showActiveStatus ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Privacy & Visibility Settings */}
          <div className="p-3.5 bg-pink-50/40 rounded-3xl border border-pink-100 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-pink-500" />
                <span>Privacy Visibility</span>
              </label>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              {[
                { id: 'only_me', label: 'Only Me', desc: 'Hidden' },
                { id: 'buddies', label: 'Buddy', desc: 'Friends only' },
                { id: 'buddies_of_buddies', label: 'Buddy of Buddy', desc: 'Friends & mutuals' },
                { id: 'public', label: 'Public', desc: 'Everyone' },
              ].map((opt) => {
                const isSelected = privacyVisibility === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      sounds.playClick();
                      setPrivacyVisibility(opt.id as PrivacyVisibility);
                    }}
                    className={`flex flex-col p-2.5 rounded-2xl border text-left transition-all ${
                      isSelected
                        ? 'border-pink-500 bg-pink-50/90 shadow-xs ring-2 ring-pink-300 font-bold'
                        : 'border-slate-200/80 hover:border-pink-200 bg-white hover:bg-pink-50/30'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-800 block truncate">{opt.label}</span>
                      {isSelected && <span className="w-2 h-2 rounded-full bg-pink-500" />}
                    </div>
                    <span className="text-[10px] text-slate-400 font-normal block truncate">{opt.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Gender Display */}
          <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700">Gender Profile</span>
            <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full capitalize ${
              currentUser.gender === 'male' 
                ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                : 'bg-pink-100 text-pink-800 border border-pink-200'
            }`}>
              {currentUser.gender === 'male' ? 'Male' : 'Female'}
            </span>
          </div>

          {/* --- Theme Switcher Dropdown --- */}
          <div className="p-3.5 bg-pink-50/40 rounded-3xl border border-pink-100 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-pink-500" />
                <span>Theme Palette</span>
              </label>
            </div>

            {currentUser.gender === 'male' ? (
              <div className="p-3 bg-slate-900 border border-slate-700 rounded-2xl text-slate-200">
                <div className="flex items-center gap-2 font-bold text-blue-400 text-xs mb-1">
                  <span>Midnight Forge</span>
                </div>
              </div>
            ) : (
              <>
                {/* Custom Dropdown Trigger */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsThemeDropdownOpen(!isThemeDropdownOpen)}
                    className="w-full flex items-center justify-between px-3.5 py-2.5 bg-white border border-pink-200 hover:border-pink-300 rounded-2xl shadow-xs transition-all text-left"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-xl">{currentThemeObj.icon}</span>
                      <div>
                        <span className="text-xs font-bold text-slate-800 block truncate">
                          {currentThemeObj.name}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <div className="flex items-center -space-x-1">
                        <span
                          className="w-4 h-4 rounded-full border-2 border-white shadow-2xs"
                          style={{ backgroundColor: currentThemeObj.accent }}
                        />
                        <span
                          className="w-4 h-4 rounded-full border-2 border-white shadow-2xs"
                          style={{ backgroundColor: currentThemeObj.accentHover }}
                        />
                      </div>
                      <ChevronDown
                        className={`w-4 h-4 text-slate-400 transition-transform ${
                          isThemeDropdownOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </div>
                  </button>

                  {/* Theme Dropdown Menu */}
                  {isThemeDropdownOpen && (
                    <div className="absolute left-0 right-0 mt-1.5 bg-white rounded-2xl shadow-xl border border-pink-100 p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100 space-y-1">
                      {(Object.keys(THEMES) as ThemeColor[])
                        .filter((tk) => tk !== 'midnight')
                        .map((themeKey) => {
                          const t = THEMES[themeKey];
                          const isSelected = selectedTheme === themeKey;
                          return (
                            <button
                              type="button"
                              key={themeKey}
                              onClick={() => handleThemeChange(themeKey)}
                              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                                isSelected
                                  ? 'bg-pink-50 text-rose-700 border border-pink-200 shadow-2xs'
                                  : 'text-slate-700 hover:bg-slate-50'
                              }`}
                            >
                              <div className="flex items-center gap-2.5">
                                <span className="text-lg">{t.icon}</span>
                                <div className="text-left">
                                  <span className="block font-bold">{t.name}</span>
                                </div>
                              </div>

                              <div className="flex items-center gap-1.5">
                                <div
                                  className="w-3.5 h-3.5 rounded-full border border-black/10"
                                  style={{ backgroundColor: t.accent }}
                                />
                                <div
                                  className="w-3.5 h-3.5 rounded-full border border-black/10"
                                  style={{ backgroundColor: t.accentLight }}
                                />
                                {isSelected && <Check className="w-3.5 h-3.5 text-rose-500 ml-1" />}
                              </div>
                            </button>
                          );
                        })}
                    </div>
                  )}
                </div>

                {/* Quick Preview Chips */}
                <div className="grid grid-cols-5 gap-1.5 pt-1">
                  {(Object.keys(THEMES) as ThemeColor[])
                    .filter((tk) => tk !== 'midnight')
                    .map((tk) => {
                      const t = THEMES[tk];
                      const active = selectedTheme === tk;
                      return (
                        <button
                          type="button"
                          key={tk}
                          onClick={() => handleThemeChange(tk)}
                          className={`flex flex-col items-center p-1.5 rounded-xl border transition-all ${
                            active
                              ? 'border-pink-500 bg-pink-100/60 font-bold scale-105 shadow-2xs'
                              : 'border-slate-100 hover:border-pink-200 bg-white'
                          }`}
                          title={t.name}
                        >
                          <span className="text-base">{t.icon}</span>
                          <span className="text-[9px] text-slate-600 truncate w-full text-center mt-0.5">
                            {t.name.split(' ')[0]}
                          </span>
                        </button>
                      );
                    })}
                </div>
              </>
            )}
          </div>

          {/* --- Mochi Background Pattern Selector --- */}
          <div className="p-3.5 bg-pink-50/40 rounded-3xl border border-pink-100 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <span>Chat Design</span>
              </label>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
              {(Object.keys(CHAT_PATTERNS) as ChatPattern[]).map((pKey) => {
                const pat = CHAT_PATTERNS[pKey];
                const isSelected = selectedPattern === pKey;
                return (
                  <button
                    type="button"
                    key={pKey}
                    onClick={() => handlePatternChange(pKey)}
                    className={`flex flex-col p-2.5 rounded-2xl border text-left transition-all relative overflow-hidden ${
                      isSelected
                        ? 'border-rose-400 bg-rose-50/90 shadow-xs ring-2 ring-rose-300'
                        : 'border-slate-200/80 hover:border-pink-200 bg-white hover:bg-pink-50/30'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-lg">{pat.icon}</span>
                      {isSelected && (
                        <span className="w-2 h-2 rounded-full bg-rose-500" />
                      )}
                    </div>
                    <span className="text-xs font-bold text-slate-800 block truncate leading-tight">
                      {pat.name}
                    </span>
                    <span className="text-[10px] text-slate-400 font-normal block truncate mt-0.5">
                      {pat.description}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowProfileModal(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 rounded-2xl hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-1.5 px-5 py-2 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white rounded-2xl text-xs font-bold shadow-md shadow-pink-200 transition-transform active:scale-95 disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{savedSuccess ? 'Saved! ✨' : isSaving ? 'Saving...' : 'Save Profile & Theme'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
