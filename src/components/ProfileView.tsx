import React, { useState } from 'react';
import { useChat } from '../context/ChatContext';
import { CuteAvatar } from '../utils/avatars';
import { THEMES, CHAT_PATTERNS } from '../utils/theme';
import { ThemeColor, ChatPattern, PrivacyVisibility } from '../types/chat';
import {
  Sparkles,
  Volume2,
  VolumeX,
  LogOut,
  Edit3,
  Copy,
  Check,
  UserPlus,
  Palette,
  ChevronDown,
  Shield,
  Camera,
  Image as ImageIcon,
  ArrowLeft,
  MoreHorizontal,
  CheckCircle2,
  MapPin,
  Calendar,
  QrCode,
  Share2,
  Plus,
  Play,
  Mic,
  Settings,
} from 'lucide-react';
import { sounds } from '../utils/sound';
import { MALE_COVER_URL, MALE_HIGHLIGHTS, MALE_DEMO_MEDIA_ITEMS } from '../utils/maleDemoData';

export const ProfileView: React.FC = () => {
  const {
    currentUser,
    updateProfile,
    handleSignOut,
    triggerConfetti,
    setShowProfileModal,
    setShowFindBuddyModal,
    setShowSettingsModal,
    setShowCreateStoryModal,
    setActiveMobileTab,
    feedPosts,
    buddies,
    theme: currentGlobalTheme,
    setTheme: setGlobalTheme,
    chatPattern: currentGlobalPattern,
    setChatPattern: setGlobalPattern,
  } = useChat();

  const [copiedId, setCopiedId] = useState(false);
  const [isThemeDropdownOpen, setIsThemeDropdownOpen] = useState(false);
  const [isPatternDropdownOpen, setIsPatternDropdownOpen] = useState(false);
  const [maleTab, setMaleTab] = useState<'posts' | 'moments' | 'about' | 'media'>('posts');

  if (!currentUser) return null;

  const currentTheme = THEMES[currentUser.theme || 'strawberry'] || THEMES.strawberry;

  const handleCopyId = () => {
    navigator.clipboard.writeText(currentUser.id);
    sounds.playClick();
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Please choose an image under 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const url = reader.result as string;
        updateProfile({ coverUrl: url });
        sounds.playClick();
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelectTheme = (newTheme: ThemeColor) => {
    sounds.playReaction();
    setGlobalTheme(newTheme);
    setIsThemeDropdownOpen(false);
  };

  const isMidnight = (currentUser.theme === 'midnight') || (currentUser.gender === 'male');

  // Male Experience (Screen 4 - PROFILE) matching reference design
  if (isMidnight) {
    return (
      <div className="flex-1 overflow-y-auto bg-[#0B0F17] text-slate-100 pb-20 select-none">
        {/* Cover Photo with Top Navigation Overlay */}
        <div className="relative w-full h-48 sm:h-56 bg-slate-900 overflow-hidden">
          <img
            src={currentUser.coverUrl || MALE_COVER_URL}
            alt="Cover"
            className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-[#0B0F17]" />

          {/* Top Bar Navigation */}
          <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between z-10">
            <button
              onClick={() => {
                sounds.playClick();
                setActiveMobileTab('spaces');
              }}
              className="p-2 rounded-2xl bg-black/40 hover:bg-black/60 text-white backdrop-blur-md transition-colors"
              title="Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <label
                className="p-2 bg-black/40 hover:bg-black/60 text-white rounded-2xl backdrop-blur-md cursor-pointer transition-all active:scale-95"
                title="Change Cover Photo"
              >
                <Camera className="w-4 h-4" />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleCoverUpload}
                />
              </label>

              <button
                onClick={() => {
                  sounds.playClick();
                  setShowSettingsModal(true);
                }}
                className="p-2 rounded-2xl bg-black/40 hover:bg-black/60 text-white backdrop-blur-md transition-colors"
                title="Settings"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Profile Identity & Details overlapping cover */}
        <div className="px-5 -mt-14 relative z-10 space-y-4 max-w-xl mx-auto">
          {/* Avatar with cyan/purple glowing ring & green online badge */}
          <div className="flex items-end justify-between">
            <div className="relative">
              <div className="p-[3px] rounded-full bg-gradient-to-tr from-purple-500 via-blue-500 to-cyan-400 shadow-[0_0_20px_rgba(59,130,246,0.5)]">
                <CuteAvatar
                  id={currentUser.avatarId}
                  customUrl={currentUser.customAvatarUrl}
                  size="lg"
                  className="border-4 border-[#0B0F17] shadow-2xl"
                />
              </div>
              <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-[#0B0F17] shadow-md" />
            </div>

            <div className="flex items-center gap-2 pb-1">
              <button
                onClick={() => {
                  sounds.playClick();
                  setShowProfileModal(true);
                }}
                className="px-5 py-2 rounded-2xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:opacity-95 shadow-md shadow-blue-900/40 glow-cyan-blue flex items-center gap-1.5 transition-transform active:scale-95"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Profile</span>
              </button>

              <button
                onClick={handleCopyId}
                className="p-2 rounded-2xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-colors"
                title={copiedId ? 'Copied!' : 'Share / Copy ID'}
              >
                {copiedId ? (
                  <Check className="w-4 h-4 text-emerald-400" />
                ) : (
                  <QrCode className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Name, Username, Bio, Meta */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-slate-100 tracking-tight">
                {currentUser.name}
              </h2>
              <CheckCircle2 className="w-4 h-4 text-blue-400 fill-blue-400/20" />
            </div>
            <p className="text-xs font-medium text-slate-400">@{currentUser.username}</p>
            <p className="text-xs text-slate-300 leading-relaxed pt-1 whitespace-pre-line">
              {currentUser.bio || "Good people, good chats, good vibes ✨\nExploring new places, stories and connections."}
            </p>

            <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-1.5">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-blue-400" />
                <span>Dhaka, Bangladesh</span>
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-blue-400" />
                <span>Joined Jan 2024</span>
              </span>
            </div>
          </div>

          {/* Social Stats Row */}
          <div className="grid grid-cols-4 gap-2 py-3 border-y border-slate-800/80 bg-slate-900/30 rounded-2xl px-2 text-center">
            <div>
              <span className="text-sm font-black text-slate-100 block">
                {feedPosts.length > 0 ? feedPosts.length * 42 : 128}
              </span>
              <span className="text-[10px] text-slate-400 font-medium">Posts</span>
            </div>
            <div>
              <span className="text-sm font-black text-slate-100 block">
                {buddies.length > 0 ? `${buddies.length}` : '2.4K'}
              </span>
              <span className="text-[10px] text-slate-400 font-medium">Friends</span>
            </div>
            <div>
              <span className="text-sm font-black text-slate-100 block">356</span>
              <span className="text-[10px] text-slate-400 font-medium">Followers</span>
            </div>
            <div>
              <span className="text-sm font-black text-slate-100 block">92</span>
              <span className="text-[10px] text-slate-400 font-medium">Following</span>
            </div>
          </div>

          {/* Story Highlights Row */}
          <div className="space-y-2">
            <div className="flex items-center gap-3.5 overflow-x-auto scrollbar-none py-1">
              {/* + New Highlight button */}
              <div
                onClick={() => {
                  sounds.playClick();
                  setShowCreateStoryModal(true);
                }}
                className="flex flex-col items-center shrink-0 cursor-pointer group active:scale-95 transition-transform"
              >
                <div className="w-14 h-14 rounded-full border-2 border-dashed border-cyan-400/60 bg-slate-900/60 flex items-center justify-center text-cyan-400 group-hover:border-cyan-300">
                  <Plus className="w-6 h-6 stroke-[2]" />
                </div>
                <span className="text-[10px] mt-1.5 font-bold text-slate-300">New</span>
              </div>

              {/* Highlights */}
              {MALE_HIGHLIGHTS.map((hl) => (
                <div
                  key={hl.id}
                  onClick={() => sounds.playClick()}
                  className="flex flex-col items-center shrink-0 cursor-pointer group active:scale-95 transition-transform"
                >
                  <div className="w-14 h-14 rounded-full p-[2px] bg-gradient-to-tr from-purple-500 via-blue-500 to-cyan-400 shadow-md">
                    <img
                      src={hl.coverImage}
                      alt={hl.title}
                      className="w-full h-full rounded-full object-cover border-2 border-slate-900"
                    />
                  </div>
                  <span className="text-[10px] mt-1.5 font-bold text-slate-300 max-w-[60px] truncate text-center">
                    {hl.title}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Content Tabs Selector: Posts | Moments | About | Media */}
          <div className="flex items-center justify-around border-b border-slate-800/80 pt-2">
            {[
              { id: 'posts', label: 'Posts' },
              { id: 'moments', label: 'Moments' },
              { id: 'about', label: 'About' },
              { id: 'media', label: 'Media' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  sounds.playClick();
                  setMaleTab(tab.id as any);
                }}
                className={`py-2 px-3 text-xs font-bold relative transition-all ${
                  maleTab === tab.id ? 'text-cyan-400' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>{tab.label}</span>
                {maleTab === tab.id && (
                  <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full shadow-[0_0_8px_#06b6d4]" />
                )}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {maleTab === 'posts' && (
            <div className="grid grid-cols-3 gap-1.5 pt-1">
              {feedPosts.flatMap((p) => p.images).map((img, idx) => (
                <div
                  key={idx}
                  onClick={() => sounds.playClick()}
                  className="aspect-square rounded-xl overflow-hidden bg-slate-900 border border-slate-800/60 cursor-pointer group relative"
                >
                  <img
                    src={img}
                    alt="Post thumbnail"
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          )}

          {maleTab === 'moments' && (
            <div className="space-y-3 pt-1">
              {feedPosts.map((post) => (
                <div
                  key={post.id}
                  className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2"
                >
                  <p className="text-xs text-slate-200">{post.content}</p>
                  {post.images && post.images.length > 0 && (
                    <img
                      src={post.images[0]}
                      alt="Moment"
                      className="w-full h-40 object-cover rounded-xl"
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          {maleTab === 'about' && (
            <div className="space-y-3 pt-1 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
                <span className="font-bold text-slate-200 block">Personal Info</span>
                <p className="text-slate-400">Gender: <span className="text-slate-200 capitalize">{currentUser.gender || 'Male'}</span></p>
                <p className="text-slate-400">Email: <span className="text-slate-200">{currentUser.email}</span></p>
                <p className="text-slate-400">ID: <span className="text-slate-200 font-mono text-[11px]">{currentUser.id}</span></p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-200 block">All Settings</span>
                  <span className="text-[11px] text-slate-400">Privacy, Notifications, Storage</span>
                </div>
                <button
                  onClick={() => setShowSettingsModal(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs"
                >
                  Open Settings
                </button>
              </div>
            </div>
          )}

          {maleTab === 'media' && (
            <div className="grid grid-cols-3 gap-1.5 pt-1">
              {MALE_DEMO_MEDIA_ITEMS.map((item) => (
                <div
                  key={item.id}
                  onClick={() => sounds.playClick()}
                  className="aspect-square rounded-xl overflow-hidden bg-slate-900 border border-slate-800/60 cursor-pointer group relative"
                >
                  {item.type === 'voice' ? (
                    <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center bg-indigo-950/40">
                      <Mic className="w-5 h-5 text-cyan-400 mb-1" />
                      <span className="text-[9px] text-slate-300 font-mono">{item.duration}</span>
                    </div>
                  ) : (
                    <>
                      <img
                        src={item.url}
                        alt="Media"
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      {item.type === 'video' && (
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                          <Play className="w-5 h-5 text-white fill-white" />
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Original Female / Default Experience (100% Preserved)
  return (
    <div className={`flex-1 overflow-y-auto p-4 sm:p-6 ${
      isMidnight ? 'bg-[#0B0F14] text-slate-200' : 'bg-pink-50/30'
    }`}>
      <div className="max-w-md mx-auto space-y-4">
        {/* Profile Card with Cover Photo Banner */}
        <div className={`rounded-3xl border shadow-sm flex flex-col items-center text-center overflow-hidden ${
          isMidnight ? 'bg-[#111821] border-slate-800 text-slate-200' : 'bg-white/95 border-pink-100'
        }`}>
          {/* Cover Photo Banner */}
          <div className="w-full h-32 sm:h-36 relative bg-slate-200 overflow-hidden group">
            {currentUser.coverUrl ? (
              <img
                src={currentUser.coverUrl}
                alt="Cover photo"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div
                className="w-full h-full transition-all"
                style={{
                  background: isMidnight
                    ? 'linear-gradient(135deg, #1e293b, #0f172a, #3b82f6)'
                    : `linear-gradient(135deg, ${currentTheme.accent}, ${currentTheme.accentHover}, #f472b6)`,
                }}
              />
            )}
            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors" />

            {/* Change Cover Button */}
            <label
              className="absolute top-2.5 right-2.5 p-2 bg-black/40 hover:bg-black/60 text-white rounded-full backdrop-blur-md cursor-pointer transition-all active:scale-95 shadow-md flex items-center gap-1.5 px-3 text-xs font-bold z-10"
              title="Change Cover Photo"
            >
              <Camera className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cover Photo</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleCoverUpload}
              />
            </label>
          </div>

          {/* Profile Details & Avatar overlapping cover */}
          <div className="p-5 pt-0 w-full flex flex-col items-center">
            <div className="relative -mt-10 mb-3">
              <CuteAvatar
                id={currentUser.avatarId}
                customUrl={currentUser.customAvatarUrl}
                size="lg"
                className={isMidnight ? 'ring-4 ring-[#111821] shadow-xl' : 'ring-4 ring-white shadow-xl'}
              />
              {currentUser.moodEmoji ? (
                <span className="absolute -bottom-1 -right-1 text-2xl">
                  {currentUser.moodEmoji}
                </span>
              ) : null}
              {currentUser.showActiveStatus !== false && (
                <span
                  className="absolute -top-1 -left-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white ring-2 ring-emerald-300 animate-pulse shadow-md z-10"
                  title="Active now"
                />
              )}
            </div>

            <h3 className={`text-base sm:text-lg font-bold ${isMidnight ? 'text-slate-100' : 'text-slate-800'}`}>
              {currentUser.name}
            </h3>
            <p className="text-xs text-slate-400">@{currentUser.username}</p>

            {/* Gender pill */}
            <div className="mt-2">
              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full capitalize ${
                currentUser.gender === 'male' 
                  ? 'bg-blue-950 text-blue-300 border border-blue-800' 
                  : 'bg-pink-100 text-pink-700'
              }`}>
                Gender: {currentUser.gender === 'male' ? 'Male' : 'Female'}
              </span>
            </div>

          {/* User ID copy row */}
          <div className={`mt-3 w-full p-2.5 rounded-2xl border flex items-center justify-between gap-2 ${
            isMidnight ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200/80'
          }`}>
            <div className="text-left min-w-0">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                Your User ID
              </span>
              <span className={`text-xs font-mono font-semibold truncate block ${isMidnight ? 'text-blue-400' : 'text-rose-700'}`}>
                {currentUser.id}
              </span>
            </div>
            <button
              onClick={handleCopyId}
              className={`flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-xl border shadow-2xs transition-colors shrink-0 ${
                isMidnight ? 'bg-slate-800 hover:bg-slate-700 text-blue-400 border-slate-700' : 'bg-white hover:bg-pink-50 text-rose-600 border-pink-200'
              }`}
            >
              {copiedId ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy ID</span>
                </>
              )}
            </button>
          </div>

          {/* Separate Email Address Section */}
          <div className={`mt-2.5 w-full p-2.5 rounded-2xl border flex items-center justify-between gap-2 ${
            isMidnight ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200/80'
          }`}>
            <div className="text-left min-w-0">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                Email Address
              </span>
              <span className={`text-xs font-semibold truncate block ${isMidnight ? 'text-slate-200' : 'text-slate-700'}`}>
                {currentUser.email}
              </span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 shrink-0">
              {currentUser.emailVerified ? 'Verified' : 'Unverified'}
            </span>
          </div>

          <div className="flex items-center gap-2 mt-3 flex-wrap justify-center">
            {currentUser.badge && (
              <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                isMidnight ? 'bg-slate-800 text-blue-300 border border-slate-700' : 'bg-pink-100/80 text-pink-700'
              }`}>
                {currentUser.badge}
              </span>
            )}
            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
              isMidnight ? 'bg-slate-800 text-cyan-300 border border-slate-700' : 'bg-purple-100/80 text-purple-700'
            }`}>
              {buddies.length} {buddies.length === 1 ? 'Buddy' : 'Buddies'}
            </span>
          </div>

          <p className={`mt-3 text-xs border px-4 py-2 rounded-2xl max-w-sm ${
            isMidnight ? 'bg-slate-900/60 border-slate-800 text-slate-300' : 'bg-pink-50/50 border-pink-100/80 text-slate-600'
          }`}>
            "{currentUser.bio || (isMidnight ? 'Operating in Midnight Forge mode.' : 'Loving cozy pastel vibes and sweet chats')}"
          </p>

          <div className="flex items-center gap-2 mt-4 w-full">
            <button
              onClick={() => {
                sounds.playClick();
                setShowProfileModal(true);
              }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-white font-bold text-xs rounded-2xl shadow-sm transition-transform active:scale-95 ${
                isMidnight ? 'bg-gradient-to-r from-blue-600 to-cyan-600' : 'bg-gradient-to-r from-pink-500 to-rose-500'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Profile</span>
            </button>

            <button
              onClick={() => {
                sounds.playClick();
                setShowFindBuddyModal(true);
              }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 font-bold text-xs rounded-2xl border shadow-2xs transition-transform active:scale-95 ${
                isMidnight ? 'bg-slate-800 border-slate-700 text-blue-400 hover:bg-slate-700' : 'bg-white border-pink-200 text-rose-700 hover:bg-pink-50'
              }`}
            >
              <UserPlus className={`w-3.5 h-3.5 ${isMidnight ? 'text-blue-400' : 'text-rose-500'}`} />
              <span>Find Buddy</span>
            </button>
          </div>
        </div>
      </div>

        {/* Preferences & Theme Settings */}
        <div className={`rounded-3xl p-4 border shadow-sm space-y-3 ${
          isMidnight ? 'bg-[#111821] border-slate-800 text-slate-100' : 'bg-white/95 border-pink-100 text-slate-800'
        }`}>
          <h4 className={`text-xs font-bold uppercase tracking-wider px-1 ${
            isMidnight ? 'text-slate-400' : 'text-slate-700'
          }`}>
            Preferences & Vibes
          </h4>

          {/* Theme Switcher Dropdown in Profile View */}
          <div className={`p-3 rounded-2xl border space-y-2 ${
            isMidnight ? 'bg-slate-900/90 border-slate-800' : 'bg-pink-50/40 border-pink-100'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Palette className={`w-4 h-4 ${isMidnight ? 'text-blue-400' : 'text-pink-600'}`} />
                <span className={`text-xs font-bold ${isMidnight ? 'text-slate-100' : 'text-slate-800'}`}>Color Palette</span>
              </div>
            </div>

            {/* Dropdown Button */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsThemeDropdownOpen(!isThemeDropdownOpen)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-2xl shadow-2xs text-left transition-all border ${
                  isMidnight
                    ? 'bg-slate-800 border-slate-700 text-slate-100 hover:bg-slate-700'
                    : 'bg-white border-pink-200 hover:border-pink-300 text-slate-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{currentTheme.icon}</span>
                  <span className={`text-xs font-bold ${isMidnight ? 'text-slate-100' : 'text-slate-800'}`}>{currentTheme.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center -space-x-1">
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-white shadow-2xs"
                      style={{ backgroundColor: currentTheme.accent }}
                    />
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-white shadow-2xs"
                      style={{ backgroundColor: currentTheme.accentHover }}
                    />
                  </div>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isThemeDropdownOpen ? 'rotate-180' : ''}`} />
                </div>
              </button>

              {isThemeDropdownOpen && (
                <div className={`absolute left-0 right-0 mt-1 rounded-2xl shadow-xl p-1.5 z-40 space-y-1 animate-in fade-in duration-100 border ${
                  isMidnight ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-pink-100 text-slate-800'
                }`}>
                  {(Object.keys(THEMES) as ThemeColor[]).map((tk) => {
                    const t = THEMES[tk];
                    const isSelected = (currentUser.theme || 'strawberry') === tk;
                    return (
                      <button
                        key={tk}
                        type="button"
                        onClick={() => handleSelectTheme(tk)}
                        className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                          isSelected
                            ? isMidnight ? 'bg-slate-800 text-blue-400 border border-blue-700' : 'bg-pink-50 text-rose-700 border border-pink-200'
                            : isMidnight ? 'text-slate-300 hover:bg-slate-800/60' : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span>{t.icon}</span>
                          <span>{t.name}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div
                            className="w-3 h-3 rounded-full border border-black/10"
                            style={{ backgroundColor: t.accent }}
                          />
                          {isSelected && <Check className={`w-3.5 h-3.5 ${isMidnight ? 'text-blue-400' : 'text-rose-500'}`} />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Chat Design Background Pattern Switcher */}
          <div className={`p-3 rounded-2xl border space-y-1.5 ${
            isMidnight ? 'bg-slate-900/90 border-slate-800' : 'bg-pink-50/40 border-pink-100'
          }`}>
            <div className="flex items-center justify-between">
              <span className={`text-xs font-bold flex items-center gap-1.5 ${
                isMidnight ? 'text-slate-100' : 'text-slate-800'
              }`}>
                <span>Chat Design</span>
              </span>
            </div>

            <div className="relative">
              <button
                type="button"
                onClick={() => setIsPatternDropdownOpen(!isPatternDropdownOpen)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-2xl shadow-2xs text-left transition-all border ${
                  isMidnight
                    ? 'bg-slate-800 border-slate-700 text-slate-100 hover:bg-slate-700'
                    : 'bg-white border-pink-200 hover:border-pink-300 text-slate-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">
                    {CHAT_PATTERNS[currentUser.chatPattern || 'mochi_dots']?.icon || '🍡'}
                  </span>
                  <div>
                    <span className={`text-xs font-bold block ${isMidnight ? 'text-slate-100' : 'text-slate-800'}`}>
                      {CHAT_PATTERNS[currentUser.chatPattern || 'mochi_dots']?.name || 'Mochi Polka'}
                    </span>
                  </div>
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isPatternDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isPatternDropdownOpen && (
                <div className={`absolute left-0 right-0 mt-1 rounded-2xl shadow-xl p-1.5 z-40 space-y-1 animate-in fade-in duration-100 max-h-60 overflow-y-auto scrollbar-thin border ${
                  isMidnight ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-pink-100 text-slate-800'
                }`}>
                  {(Object.keys(CHAT_PATTERNS) as ChatPattern[]).map((pk) => {
                    const p = CHAT_PATTERNS[pk];
                    const isSelected = (currentUser.chatPattern || 'mochi_dots') === pk;
                    return (
                      <button
                        key={pk}
                        type="button"
                        onClick={() => {
                          sounds.playReaction();
                          setGlobalPattern(pk);
                          setIsPatternDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                          isSelected
                            ? isMidnight ? 'bg-slate-800 text-blue-400 border border-blue-700' : 'bg-rose-50 text-rose-700 border border-rose-200'
                            : isMidnight ? 'text-slate-300 hover:bg-slate-800/60' : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="text-lg shrink-0">{p.icon}</span>
                          <div className="text-left min-w-0">
                            <span className="block font-bold truncate">{p.name}</span>
                          </div>
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5 text-rose-500 shrink-0 ml-1" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Active Status ON / OFF Toggle */}
          <div className="flex items-center justify-between p-2.5 rounded-2xl bg-pink-50/40 border border-pink-100">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-3.5 w-3.5">
                {currentUser.showActiveStatus !== false ? (
                  <>
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500" />
                  </>
                ) : (
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-slate-400" />
                )}
              </span>
              <div>
                <p className="text-xs font-bold text-slate-800">Active Status</p>
                <p className="text-[10px] text-slate-500">
                  {currentUser.showActiveStatus !== false ? 'ON' : 'OFF'}
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                sounds.playClick();
                updateProfile({ showActiveStatus: currentUser.showActiveStatus === false });
              }}
              className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                currentUser.showActiveStatus !== false ? 'bg-emerald-500' : 'bg-slate-300'
              }`}
              title={currentUser.showActiveStatus !== false ? 'Turn OFF Active Status' : 'Turn ON Active Status'}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  currentUser.showActiveStatus !== false ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Privacy & Visibility Settings */}
          <div className="p-3 bg-pink-50/40 rounded-2xl border border-pink-100 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-pink-600" />
                <span>Story & Profile Visibility</span>
              </span>
              <span className="text-[10px] font-semibold text-pink-700 bg-white border border-pink-200 px-2 py-0.5 rounded-full capitalize">
                {(currentUser.privacyVisibility || 'buddies').replace(/_/g, ' ')}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-1.5 pt-1">
              {[
                { id: 'only_me', label: 'Only Me' },
                { id: 'buddies', label: 'Buddy' },
                { id: 'buddies_of_buddies', label: 'Buddy of Buddy' },
                { id: 'public', label: 'Public' },
              ].map((opt) => {
                const isSelected = (currentUser.privacyVisibility || 'buddies') === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      sounds.playClick();
                      updateProfile({ privacyVisibility: opt.id as PrivacyVisibility });
                    }}
                    className={`flex items-center justify-center p-2 rounded-xl border text-xs font-semibold transition-all ${
                      isSelected
                        ? 'bg-pink-100/80 text-rose-700 border-pink-300 font-bold shadow-2xs'
                        : 'bg-white text-slate-700 border-pink-100 hover:bg-pink-50/40'
                    }`}
                  >
                    <span className="truncate">{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sound Effect Toggle */}
          <div className="flex items-center justify-between p-2.5 rounded-2xl bg-pink-50/40 border border-pink-100">
            <div className="flex items-center gap-2.5">
              {currentUser.soundEnabled ? (
                <Volume2 className="w-4 h-4 text-pink-600" />
              ) : (
                <VolumeX className="w-4 h-4 text-slate-400" />
              )}
              <div>
                <p className="text-xs font-bold text-slate-800">Kawaii Sound FX</p>
                <p className="text-[10px] text-slate-500">Sweet chimes & pops</p>
              </div>
            </div>
            <button
              onClick={() => {
                updateProfile({ soundEnabled: !currentUser.soundEnabled });
                if (!currentUser.soundEnabled) sounds.playSend();
              }}
              className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                currentUser.soundEnabled ? 'bg-pink-500' : 'bg-slate-200'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  currentUser.soundEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Confetti button */}
          <button
            onClick={() => {
              sounds.playReaction();
              triggerConfetti();
            }}
            className="w-full flex items-center justify-center gap-2 p-2.5 rounded-2xl bg-amber-50 hover:bg-amber-100/70 border border-amber-200/60 text-amber-800 font-bold text-xs transition-colors"
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Celebrate with Confetti</span>
          </button>

          {/* Sign Out */}
          <button
            onClick={() => {
              sounds.playClick();
              handleSignOut();
            }}
            className={`w-full flex items-center justify-center gap-2 p-2.5 rounded-2xl font-bold text-xs transition-all active:scale-98 border ${
              isMidnight
                ? 'bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border-rose-900/40'
                : 'bg-rose-50 hover:bg-rose-100/80 text-rose-700 border-rose-200/60'
            }`}
          >
            <LogOut className="w-4 h-4 text-rose-400" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};
