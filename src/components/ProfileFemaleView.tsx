import React, { useState } from 'react';
import { CuteAvatar } from '../utils/avatars';
import { UserProfile, SocialFeedPost } from '../types/chat';
import {
  ArrowLeft,
  Camera,
  MoreHorizontal,
  CheckCircle2,
  MapPin,
  Calendar,
  Edit3,
  Share2,
  QrCode,
  Plus,
  Play,
  Copy,
  Check,
  Sparkles,
} from 'lucide-react';
import { sounds } from '../utils/sound';
import {
  FEMALE_COVER_URL,
  FEMALE_HIGHLIGHTS,
  FEMALE_DEMO_MEDIA_ITEMS,
  FEMALE_PROFILE_DEFAULT,
} from '../utils/femaleDemoData';

interface ProfileFemaleViewProps {
  currentUser: UserProfile;
  buddies: UserProfile[];
  feedPosts: SocialFeedPost[];
  handleCoverUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleCopyId: () => void;
  copiedId: boolean;
  setActiveMobileTab: (tab: 'chats' | 'spaces' | 'friends' | 'profile') => void;
  setShowSettingsModal: (show: boolean) => void;
  setShowProfileModal: (show: boolean) => void;
  setShowCreateStoryModal: (show: boolean) => void;
  startDirectMessage: (targetUser: UserProfile) => Promise<void>;
  triggerConfetti: () => void;
}

export const ProfileFemaleView: React.FC<ProfileFemaleViewProps> = ({
  currentUser,
  buddies,
  feedPosts,
  handleCoverUpload,
  handleCopyId,
  copiedId,
  setActiveMobileTab,
  setShowSettingsModal,
  setShowProfileModal,
  setShowCreateStoryModal,
  startDirectMessage,
  triggerConfetti,
}) => {
  const [femaleTab, setFemaleTab] = useState<'posts' | 'moments' | 'about' | 'friends' | 'media'>('posts');

  return (
    <div className="flex-1 overflow-y-auto bg-female-canvas text-slate-800 pb-20 select-none">
      {/* 1. Cover Photo with Top Navigation Overlay */}
      <div className="relative w-full h-48 sm:h-56 bg-pink-100 overflow-hidden">
        <img
          src={currentUser.coverUrl || FEMALE_COVER_URL}
          alt="Cover"
          className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-pink-900/20" />

        {/* Top Bar Navigation */}
        <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between z-10">
          <button
            onClick={() => {
              sounds.playClick();
              setActiveMobileTab('spaces');
            }}
            className="p-2 rounded-full bg-black/35 hover:bg-black/55 text-white backdrop-blur-md transition-colors"
            title="Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            <label
              className="p-2 bg-black/35 hover:bg-black/55 text-white rounded-full backdrop-blur-md cursor-pointer transition-all active:scale-95"
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
              className="p-2 rounded-full bg-black/35 hover:bg-black/55 text-white backdrop-blur-md transition-colors"
              title="Settings"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Profile Identity & Details overlapping cover */}
      <div className="px-5 -mt-14 relative z-10 space-y-4 max-w-xl mx-auto">
        {/* Avatar with rose/pink glowing ring & online pill */}
        <div className="flex items-end justify-between">
          <div className="relative">
            <div className="story-ring-female">
              <CuteAvatar
                id={currentUser.avatarId}
                customUrl={currentUser.customAvatarUrl}
                size="lg"
                className="border-4 border-white shadow-xl"
              />
            </div>
            <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-400 border-2 border-white shadow-sm ring-1 ring-emerald-200" />
          </div>

          {/* Online status indicator pill */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-600 text-xs font-bold shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Online</span>
          </div>
        </div>

        {/* Identity & Verification */}
        <div>
          <div className="flex items-center gap-1.5">
            <h1 className="text-xl font-extrabold text-slate-800 tracking-tight">
              {currentUser.name || FEMALE_PROFILE_DEFAULT.name}
            </h1>
            <CheckCircle2 className="w-4 h-4 text-blue-500 fill-blue-500 text-white shrink-0" />
          </div>
          <p className="text-xs font-semibold text-slate-400 mt-0.5">
            @{currentUser.username || FEMALE_PROFILE_DEFAULT.username}
          </p>
        </div>

        {/* Bio */}
        <p className="text-xs text-slate-700 leading-relaxed font-medium whitespace-pre-line">
          {currentUser.bio || FEMALE_PROFILE_DEFAULT.bio}
        </p>

        {/* Location & Join Date Metadata */}
        <div className="flex items-center gap-4 text-[11px] text-slate-400 flex-wrap">
          <div className="flex items-center gap-1 text-rose-500 font-medium">
            <MapPin className="w-3.5 h-3.5" />
            <span>{currentUser.location || FEMALE_PROFILE_DEFAULT.location}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>{currentUser.joinedDate || FEMALE_PROFILE_DEFAULT.joinedDate}</span>
          </div>
        </div>

        {/* 3. Social Stats Bar (matching reference 128 Posts | 2.4K Friends | 356 Followers | 92 Following) */}
        <div className="grid grid-cols-4 gap-2 py-3 px-2 rounded-2xl bg-white/80 backdrop-blur-md border border-pink-100/90 shadow-2xs text-center">
          <div>
            <span className="text-sm font-black text-slate-800 block">
              {feedPosts.length || FEMALE_PROFILE_DEFAULT.stats.posts}
            </span>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">
              Posts
            </span>
          </div>
          <div className="border-l border-pink-100/80">
            <span className="text-sm font-black text-slate-800 block">
              {buddies.length > 0 ? buddies.length : FEMALE_PROFILE_DEFAULT.stats.friends}
            </span>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">
              Friends
            </span>
          </div>
          <div className="border-l border-pink-100/80">
            <span className="text-sm font-black text-slate-800 block">
              {FEMALE_PROFILE_DEFAULT.stats.followers}
            </span>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">
              Followers
            </span>
          </div>
          <div className="border-l border-pink-100/80">
            <span className="text-sm font-black text-slate-800 block">
              {FEMALE_PROFILE_DEFAULT.stats.following}
            </span>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">
              Following
            </span>
          </div>
        </div>

        {/* 4. Quick Action Buttons: Edit Profile + Share + QR */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              sounds.playClick();
              setShowProfileModal(true);
            }}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-6 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold text-xs shadow-md shadow-pink-500/25 hover:opacity-95 active:scale-95 transition-all"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit Profile</span>
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              if (navigator.share) {
                navigator.share({
                  title: `${currentUser.name} on Simi`,
                  text: `Connect with ${currentUser.name} on Simi!`,
                  url: window.location.href,
                }).catch(() => {});
              } else {
                navigator.clipboard.writeText(window.location.href);
                alert('Profile link copied to clipboard!');
              }
            }}
            className="p-2.5 rounded-full bg-white/90 hover:bg-pink-50 border border-pink-200 text-slate-700 transition-colors shadow-2xs"
            title="Share Profile"
          >
            <Share2 className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              alert(`Scan or Share User ID: ${currentUser.id}`);
            }}
            className="p-2.5 rounded-full bg-white/90 hover:bg-pink-50 border border-pink-200 text-slate-700 transition-colors shadow-2xs"
            title="QR Code"
          >
            <QrCode className="w-4 h-4" />
          </button>
        </div>

        {/* 5. Story Highlights Tray (Travel, Food, Nature, Moments, Lifestyle) */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center gap-3 overflow-x-auto scrollbar-none py-1">
            {/* (+) Add Story Highlight */}
            <div
              onClick={() => {
                sounds.playClick();
                setShowCreateStoryModal(true);
              }}
              className="flex flex-col items-center shrink-0 cursor-pointer group active:scale-95 transition-transform"
            >
              <div className="w-14 h-14 rounded-full border-2 border-dashed border-rose-300 flex items-center justify-center bg-pink-50/60 text-rose-500 hover:bg-pink-100/60 transition-colors">
                <Plus className="w-5 h-5 stroke-[2.5]" />
              </div>
              <span className="text-[10px] mt-1.5 font-bold text-slate-700">Add Story</span>
            </div>

            {/* Curated Highlights */}
            {FEMALE_HIGHLIGHTS.map((hl) => (
              <div
                key={hl.id}
                onClick={() => {
                  sounds.playClick();
                  alert(`Viewing "${hl.title}" highlights!`);
                }}
                className="flex flex-col items-center shrink-0 cursor-pointer group active:scale-95 transition-transform"
              >
                <div className="relative p-0.5 rounded-full border border-pink-200 group-hover:border-rose-400 transition-colors">
                  <div className="w-13 h-13 rounded-full overflow-hidden bg-pink-100">
                    <img
                      src={hl.coverImage}
                      alt={hl.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                </div>
                <span className="text-[10px] mt-1.5 font-bold text-slate-700">
                  {hl.title}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 6. Content Tabs: Posts | Moments | About | Friends | Media */}
        <div className="border-b border-pink-100/80 flex items-center justify-around pt-2">
          {[
            { id: 'posts', label: 'Posts' },
            { id: 'moments', label: 'Moments' },
            { id: 'about', label: 'About' },
            { id: 'friends', label: 'Friends' },
            { id: 'media', label: 'Media' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                sounds.playClick();
                setFemaleTab(tab.id as any);
              }}
              className={`pb-2.5 text-xs font-bold transition-all relative ${
                femaleTab === tab.id ? 'text-rose-500' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <span>{tab.label}</span>
              {femaleTab === tab.id && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full" />
              )}
            </button>
          ))}
        </div>

        {/* 7. Tab Content Panels */}
        {femaleTab === 'posts' && (
          <div className="grid grid-cols-3 gap-1.5 pt-1">
            {FEMALE_DEMO_MEDIA_ITEMS.map((item) => (
              <div
                key={item.id}
                onClick={() => sounds.playClick()}
                className="aspect-square rounded-xl overflow-hidden bg-pink-50 border border-pink-100/80 cursor-pointer group relative"
              >
                <img
                  src={item.url}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                {item.type === 'video' && (
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                    <Play className="w-5 h-5 text-white fill-white" />
                  </div>
                )}
                {item.duration && (
                  <span className="absolute bottom-1 right-1 px-1 py-0.2 rounded-md bg-black/60 text-[9px] font-bold text-white font-mono">
                    {item.duration}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        {femaleTab === 'moments' && (
          <div className="space-y-3 pt-1">
            {feedPosts.slice(0, 2).map((post) => (
              <div
                key={post.id}
                className="p-3.5 rounded-2xl border border-pink-100/90 bg-white/85 backdrop-blur-md shadow-2xs space-y-2"
              >
                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  {post.content}
                </p>
                {post.images && post.images.length > 0 && (
                  <div className="aspect-[16/10] rounded-xl overflow-hidden bg-pink-100">
                    <img src={post.images[0]} alt="Moment" className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                  <span>{post.timeAgo}</span>
                  <span className="text-rose-500 font-bold">♥ {post.likes} likes</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {femaleTab === 'about' && (
          <div className="space-y-3 pt-1">
            <div className="p-4 rounded-2xl bg-white/85 border border-pink-100/90 shadow-2xs space-y-3 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-pink-100/60">
                <span className="text-slate-400 font-medium">Gender</span>
                <span className="font-bold text-rose-600 bg-pink-50 px-2.5 py-0.5 rounded-full">
                  Female 🌸
                </span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-pink-100/60">
                <span className="text-slate-400 font-medium">User ID</span>
                <div className="flex items-center gap-1.5 font-mono font-bold text-rose-600">
                  <span>{currentUser.id}</span>
                  <button onClick={handleCopyId} className="p-1 text-slate-400 hover:text-rose-500">
                    {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-pink-100/60">
                <span className="text-slate-400 font-medium">Email</span>
                <span className="font-semibold text-slate-700">{currentUser.email}</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-slate-400 font-medium">Privacy</span>
                <span className="font-bold text-slate-700 capitalize">
                  {currentUser.privacyVisibility || 'Public'}
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                sounds.playReaction();
                triggerConfetti();
              }}
              className="w-full py-2.5 rounded-full bg-pink-50 hover:bg-pink-100 border border-pink-200 text-rose-600 text-xs font-bold flex items-center justify-center gap-2 transition-colors"
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Celebrate with Sparkles & Confetti</span>
            </button>
          </div>
        )}

        {femaleTab === 'friends' && (
          <div className="space-y-2 pt-1">
            {buddies.length === 0 ? (
              <div className="p-6 text-center rounded-2xl bg-white/80 border border-pink-100 text-slate-400 text-xs">
                No buddies added yet. Find friends to connect!
              </div>
            ) : (
              buddies.map((b) => (
                <div
                  key={b.id}
                  className="p-3 rounded-2xl bg-white/85 border border-pink-100/80 flex items-center justify-between gap-3 shadow-2xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <CuteAvatar id={b.avatarId} customUrl={b.customAvatarUrl} size="sm" />
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-slate-800 block truncate">{b.name}</span>
                      <span className="text-[10px] text-slate-400 block truncate">@{b.username}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => startDirectMessage(b)}
                    className="px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-xs"
                  >
                    Chat
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {femaleTab === 'media' && (
          <div className="grid grid-cols-3 gap-1.5 pt-1">
            {FEMALE_DEMO_MEDIA_ITEMS.map((item) => (
              <div
                key={item.id}
                onClick={() => sounds.playClick()}
                className="aspect-square rounded-xl overflow-hidden bg-pink-50 border border-pink-100/80 cursor-pointer group relative"
              >
                <img
                  src={item.url}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                {item.type === 'video' && (
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                    <Play className="w-5 h-5 text-white fill-white" />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
