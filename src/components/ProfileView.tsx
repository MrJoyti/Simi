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
import { FEMALE_COVER_URL, FEMALE_HIGHLIGHTS, FEMALE_DEMO_MEDIA_ITEMS, FEMALE_PROFILE_DEFAULT } from '../utils/femaleDemoData';
import { ProfileFemaleView } from './ProfileFemaleView';

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
    startDirectMessage,
    theme: currentGlobalTheme,
    setTheme: setGlobalTheme,
    chatPattern: currentGlobalPattern,
    setChatPattern: setGlobalPattern,
  } = useChat();

  const [copiedId, setCopiedId] = useState(false);
  const [isThemeDropdownOpen, setIsThemeDropdownOpen] = useState(false);
  const [isPatternDropdownOpen, setIsPatternDropdownOpen] = useState(false);
  const [maleTab, setMaleTab] = useState<'posts' | 'moments' | 'about' | 'media'>('posts');
  const [femaleTab, setFemaleTab] = useState<'posts' | 'moments' | 'about' | 'friends' | 'media'>('posts');

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

  const isMale = currentUser.gender ? currentUser.gender === 'male' : currentUser.theme === 'midnight';
  const isMidnight = isMale;

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

  // Female Experience (Screen 4 - PROFILE) matching reference design
  return (
    <ProfileFemaleView
      currentUser={currentUser}
      buddies={buddies}
      feedPosts={feedPosts}
      handleCoverUpload={handleCoverUpload}
      handleCopyId={handleCopyId}
      copiedId={copiedId}
      setActiveMobileTab={setActiveMobileTab}
      setShowSettingsModal={setShowSettingsModal}
      setShowProfileModal={setShowProfileModal}
      setShowCreateStoryModal={setShowCreateStoryModal}
      startDirectMessage={startDirectMessage}
      triggerConfetti={triggerConfetti}
    />
  );
};
