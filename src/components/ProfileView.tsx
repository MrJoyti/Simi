import React, { useState, useMemo } from 'react';
import { useChat } from '../context/ChatContext';
import { CuteAvatar } from '../utils/avatars';
import {
  ArrowLeft,
  Camera,
  CheckCircle2,
  MapPin,
  Calendar,
  Edit3,
  Share2,
  Copy,
  Check,
  Plus,
  Play,
  Settings,
  Sparkles,
  Shield,
  MessageCircle,
  Image as ImageIcon,
  Heart,
  Users,
} from 'lucide-react';
import { sounds } from '../utils/sound';
import { uploadImageToCloudinary } from '../utils/cloudinary';
import { StoryViewerModal } from './StoryViewerModal';

export const ProfileView: React.FC = () => {
  const {
    currentUser,
    updateProfile,
    triggerConfetti,
    setShowProfileModal,
    setShowSettingsModal,
    setShowCreateStoryModal,
    setActiveMobileTab,
    feedPosts,
    buddies,
    stories,
    startDirectMessage,
    showToast,
    simiTheme,
  } = useChat();

  const [copiedId, setCopiedId] = useState(false);
  const [activeTab, setActiveTab] = useState<'posts' | 'moments' | 'about' | 'friends' | 'media'>('posts');
  const [activeStoryIndex, setActiveStoryIndex] = useState<number | null>(null);

  const isMale = simiTheme.isMale;

  // Real user posts
  const myPosts = useMemo(() => {
    if (!currentUser) return [];
    return feedPosts.filter((p) => p.authorId === currentUser.id);
  }, [feedPosts, currentUser?.id]);

  // Real user media (extracted from user's posts)
  const myMediaUrls = useMemo(() => {
    return myPosts.flatMap((p) => p.images || []);
  }, [myPosts]);

  // Real user stories
  const myStories = useMemo(() => {
    if (!currentUser) return [];
    return stories.filter((s) => s.userId === currentUser.id);
  }, [stories, currentUser?.id]);

  // Formatted joined date from real createdAt
  const formattedJoinedDate = useMemo(() => {
    if (!currentUser?.createdAt) return 'Recently';
    try {
      const date = new Date(currentUser.createdAt);
      return date.toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
    } catch {
      return 'Recently';
    }
  }, [currentUser?.createdAt]);

  if (!currentUser) return null;

  const handleCopyId = () => {
    navigator.clipboard.writeText(currentUser.id);
    sounds.playClick();
    setCopiedId(true);
    showToast('User ID copied to clipboard!', 'success');
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleShareProfile = async () => {
    sounds.playClick();
    const shareData = {
      title: `${currentUser.name} on Simi`,
      text: `Connect with ${currentUser.name} (@${currentUser.username}) on Simi!`,
      url: window.location.origin,
    };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        return;
      } catch {
        // User cancelled or unsupported
      }
    }

    navigator.clipboard.writeText(`${window.location.origin}/user/${currentUser.username}`);
    showToast('Profile link copied to clipboard!', 'success');
  };

  const [isUploadingCover, setIsUploadingCover] = useState(false);

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      showToast('Please choose an image under 8MB.', 'warning');
      return;
    }
    setIsUploadingCover(true);
    showToast('Uploading cover photo...', 'info');
    try {
      const url = await uploadImageToCloudinary(file, 'mochichat_test/covers');
      await updateProfile({ coverUrl: url });
      sounds.playClick();
      showToast('Cover photo updated!', 'success');
    } catch (err) {
      console.error('Failed to upload cover photo:', err);
      showToast('Failed to upload cover photo. Please try again.', 'error');
    } finally {
      setIsUploadingCover(false);
      if (e.target) e.target.value = '';
    }
  };

  // Total likes on real posts
  const totalLikes = myPosts.reduce((acc, p) => acc + (p.likes || 0), 0);

  return (
    <div className={`flex-1 overflow-y-auto pb-20 select-none transition-colors duration-200 ${
      isMale ? 'bg-[#0B0F17] text-slate-100' : 'bg-female-canvas text-slate-800'
    }`}>
      {/* 1. Cover Photo & 2. Top Navigation */}
      <div className={`relative w-full h-48 sm:h-56 overflow-hidden ${
        isMale ? 'bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900' : 'bg-gradient-to-r from-rose-200 via-pink-200 to-purple-200'
      }`}>
        {currentUser.coverUrl ? (
          <img
            src={currentUser.coverUrl}
            alt="Cover"
            className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center opacity-40">
            <Sparkles className={`w-12 h-12 ${isMale ? 'text-blue-400' : 'text-rose-400'}`} />
          </div>
        )}

        <div className={`absolute inset-0 bg-gradient-to-b ${
          isMale ? 'from-black/60 via-transparent to-[#0B0F17]' : 'from-black/30 via-transparent to-[#FFF7F9]/80'
        }`} />

        {/* Top Bar Navigation */}
        <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between z-10">
          <button
            onClick={() => {
              sounds.playClick();
              setActiveMobileTab('spaces');
            }}
            className={`p-2 rounded-2xl backdrop-blur-md transition-colors ${
              isMale
                ? 'bg-black/40 hover:bg-black/60 text-white'
                : 'bg-white/70 hover:bg-white/90 text-slate-700 border border-pink-100/70 shadow-2xs'
            }`}
            title="Back to Verse"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            <label
              className={`p-2 rounded-2xl backdrop-blur-md cursor-pointer transition-all active:scale-95 ${
                isMale
                  ? 'bg-black/40 hover:bg-black/60 text-white'
                  : 'bg-white/70 hover:bg-white/90 text-slate-700 border border-pink-100/70 shadow-2xs'
              }`}
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
              className={`p-2 rounded-2xl backdrop-blur-md transition-colors ${
                isMale
                  ? 'bg-black/40 hover:bg-black/60 text-white'
                  : 'bg-white/70 hover:bg-white/90 text-slate-700 border border-pink-100/70 shadow-2xs'
              }`}
              title="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 3-9. Profile Identity, Status, Name, Bio, Metadata overlapping cover */}
      <div className="px-4 sm:px-6 -mt-14 relative z-10 space-y-4 max-w-xl mx-auto">
        <div className="flex items-end justify-between">
          <div className="relative">
            <div className={`p-[3px] rounded-full ${
              isMale
                ? 'bg-gradient-to-tr from-purple-500 via-blue-500 to-cyan-400 shadow-[0_0_20px_rgba(59,130,246,0.5)]'
                : 'bg-gradient-to-tr from-rose-400 via-pink-400 to-fuchsia-400 shadow-[0_0_18px_rgba(244,63,94,0.35)]'
            }`}>
              <CuteAvatar
                id={currentUser.avatarId}
                customUrl={currentUser.customAvatarUrl}
                size="lg"
                className={`border-4 ${isMale ? 'border-[#0B0F17]' : 'border-white'} shadow-2xl`}
              />
            </div>
            {/* 4. Online Status Indicator */}
            <span className={`absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 ${
              isMale ? 'border-[#0B0F17]' : 'border-white'
            } shadow-md`} />
          </div>

          {/* 10. Main Actions */}
          <div className="flex items-center gap-2 pb-1">
            <button
              onClick={() => {
                sounds.playClick();
                setShowProfileModal(true);
              }}
              className={`px-4 sm:px-5 py-2 rounded-2xl text-xs font-bold text-white flex items-center gap-1.5 transition-transform active:scale-95 ${
                isMale
                  ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:opacity-95 shadow-md shadow-blue-900/40 glow-cyan-blue'
                  : 'bg-gradient-to-r from-rose-500 via-pink-500 to-rose-400 hover:opacity-95 shadow-md shadow-rose-200/60'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Profile</span>
            </button>

            <button
              onClick={handleShareProfile}
              className={`p-2 rounded-2xl transition-colors ${
                isMale
                  ? 'bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
                  : 'bg-white border border-pink-200/80 text-rose-600 hover:bg-pink-50 shadow-2xs'
              }`}
              title="Share Profile"
            >
              <Share2 className="w-4 h-4" />
            </button>

            <button
              onClick={handleCopyId}
              className={`p-2 rounded-2xl transition-colors ${
                isMale
                  ? 'bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
                  : 'bg-white border border-pink-200/80 text-rose-600 hover:bg-pink-50 shadow-2xs'
              }`}
              title={copiedId ? 'Copied ID' : 'Copy User ID'}
            >
              {copiedId ? (
                <Check className="w-4 h-4 text-emerald-500" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* 5-9. Name, Verification, Username, Bio, Metadata */}
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <h2 className={`text-lg font-black tracking-tight ${isMale ? 'text-slate-100' : 'text-slate-800'}`}>
              {currentUser.name}
            </h2>
            {currentUser.emailVerified && (
              <CheckCircle2 className={`w-4 h-4 ${isMale ? 'text-blue-400 fill-blue-400/20' : 'text-rose-500 fill-rose-500/20'}`} />
            )}
          </div>
          <p className="text-xs font-medium text-slate-400">@{currentUser.username}</p>

          {currentUser.bio && (
            <p className={`text-xs leading-relaxed pt-1 whitespace-pre-line ${
              isMale ? 'text-slate-300' : 'text-slate-700'
            }`}>
              {currentUser.bio}
            </p>
          )}

          <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-1.5 flex-wrap">
            {currentUser.location && (
              <span className="flex items-center gap-1">
                <MapPin className={`w-3.5 h-3.5 ${isMale ? 'text-blue-400' : 'text-rose-500'}`} />
                <span>{currentUser.location}</span>
              </span>
            )}
            <span className="flex items-center gap-1">
              <Calendar className={`w-3.5 h-3.5 ${isMale ? 'text-blue-400' : 'text-rose-500'}`} />
              <span>Joined {formattedJoinedDate}</span>
            </span>
          </div>
        </div>

        {/* 11. Real Social Stats (No Fake 2.4K!) */}
        <div className={`grid grid-cols-3 gap-2 py-3 rounded-2xl px-2 text-center border ${
          isMale
            ? 'border-slate-800/80 bg-slate-900/30'
            : 'border-pink-100/90 bg-white/90 shadow-2xs'
        }`}>
          <div>
            <span className={`text-sm font-black block ${isMale ? 'text-slate-100' : 'text-slate-800'}`}>
              {myPosts.length}
            </span>
            <span className="text-[10px] text-slate-400 font-medium">Posts</span>
          </div>
          <div>
            <span className={`text-sm font-black block ${isMale ? 'text-slate-100' : 'text-slate-800'}`}>
              {buddies.length}
            </span>
            <span className="text-[10px] text-slate-400 font-medium">Buddies</span>
          </div>
          <div>
            <span className={`text-sm font-black block ${isMale ? 'text-slate-100' : 'text-slate-800'}`}>
              {totalLikes}
            </span>
            <span className="text-[10px] text-slate-400 font-medium">Likes</span>
          </div>
        </div>

        {/* 12. Story Highlights */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-0.5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Highlights</span>
            <button
              onClick={() => {
                sounds.playClick();
                setShowCreateStoryModal(true);
              }}
              className={`text-[11px] font-bold ${isMale ? 'text-cyan-400' : 'text-rose-500'} hover:underline`}
            >
              + Add Story
            </button>
          </div>

          <div className="flex items-center gap-3.5 overflow-x-auto scrollbar-none py-1">
            {/* Add highlight button */}
            <div
              onClick={() => {
                sounds.playClick();
                setShowCreateStoryModal(true);
              }}
              className="flex flex-col items-center shrink-0 cursor-pointer group active:scale-95 transition-transform"
            >
              <div className={`w-14 h-14 rounded-full border-2 border-dashed flex items-center justify-center transition-colors ${
                isMale
                  ? 'border-slate-700 group-hover:border-cyan-400 text-slate-400 group-hover:text-cyan-400'
                  : 'border-pink-300 group-hover:border-rose-400 text-pink-400 group-hover:text-rose-500 bg-white/70'
              }`}>
                <Plus className="w-5 h-5" />
              </div>
              <span className="text-[10px] mt-1 text-slate-400 font-medium">New</span>
            </div>

            {/* Real user stories preview */}
            {myStories.map((story, idx) => (
              <div
                key={story.id}
                onClick={() => {
                  sounds.playClick();
                  setActiveStoryIndex(idx);
                }}
                className="flex flex-col items-center shrink-0 cursor-pointer group active:scale-95 transition-transform"
              >
                <div className={`p-[2px] rounded-full ${isMale ? 'story-ring-male' : 'story-ring-female'}`}>
                  <div className={`w-13 h-13 rounded-full overflow-hidden border-2 ${
                    isMale ? 'border-slate-900 bg-slate-800' : 'border-white bg-pink-100'
                  }`}>
                    {story.imageUrl ? (
                      <img src={story.imageUrl} alt="Story" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs">✨</div>
                    )}
                  </div>
                </div>
                <span className={`text-[10px] mt-1 font-bold max-w-[54px] truncate text-center ${
                  isMale ? 'text-slate-300' : 'text-slate-700'
                }`}>
                  {story.text ? story.text.slice(0, 10) : 'Story'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 13. Content Tabs */}
        <div className={`flex items-center justify-around border-b ${
          isMale ? 'border-slate-800/80' : 'border-pink-100/90'
        } pt-2`}>
          {(['posts', 'moments', 'about', 'friends', 'media'] as const).map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => {
                  sounds.playClick();
                  setActiveTab(tab);
                }}
                className={`pb-2.5 text-xs font-bold capitalize transition-colors relative ${
                  isActive
                    ? isMale
                      ? 'text-cyan-400'
                      : 'text-rose-600'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>{tab}</span>
                {isActive && (
                  <span className={`absolute bottom-0 left-0 right-0 h-0.5 rounded-full ${
                    isMale ? 'bg-cyan-400' : 'bg-rose-500'
                  }`} />
                )}
              </button>
            );
          })}
        </div>

        {/* 14-17. Tab Contents */}
        <div className="pt-2">
          {/* Posts Tab */}
          {activeTab === 'posts' && (
            myPosts.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-center">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-2.5 ${
                  isMale ? 'bg-slate-900 text-blue-400' : 'bg-pink-100 text-rose-500'
                }`}>
                  <ImageIcon className="w-6 h-6 opacity-60" />
                </div>
                <p className="text-xs font-bold text-slate-400">No posts shared yet</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Your shared moments will appear here</p>
              </div>
            ) : (
              <div className="space-y-3">
                {myPosts.map((post) => (
                  <div
                    key={post.id}
                    className={`p-3.5 rounded-2xl border transition-all ${
                      isMale ? 'border-slate-800/80 bg-slate-900/50' : 'border-pink-100/90 bg-white shadow-2xs'
                    }`}
                  >
                    <p className={`text-xs leading-relaxed ${isMale ? 'text-slate-200' : 'text-slate-800'}`}>
                      {post.content}
                    </p>
                    {post.images && post.images.length > 0 && (
                      <div className="mt-2.5 rounded-xl overflow-hidden max-h-56">
                        <img src={post.images[0]} alt="Post" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="flex items-center gap-3 mt-2.5 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <Heart className="w-3.5 h-3.5 text-rose-500" />
                        <span>{post.likes}</span>
                      </span>
                      <span>·</span>
                      <span>{post.timeAgo}</span>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {/* Moments Tab */}
          {activeTab === 'moments' && (
            myStories.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-center">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-2.5 ${
                  isMale ? 'bg-slate-900 text-cyan-400' : 'bg-pink-100 text-rose-500'
                }`}>
                  <Play className="w-6 h-6 opacity-60" />
                </div>
                <p className="text-xs font-bold text-slate-400">No active moments</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Post a story to capture daily moments</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2.5">
                {myStories.map((story, idx) => (
                  <div
                    key={story.id}
                    onClick={() => {
                      sounds.playClick();
                      setActiveStoryIndex(idx);
                    }}
                    className={`aspect-video rounded-2xl overflow-hidden border relative cursor-pointer active:scale-95 transition-transform ${
                      isMale ? 'border-slate-800/80 bg-slate-900' : 'border-pink-100/90 bg-white shadow-2xs'
                    }`}
                  >
                    {story.imageUrl ? (
                      <img src={story.imageUrl} alt="Moment" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center p-2 text-center text-xs">
                        {story.text}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )
          )}

          {/* About Tab */}
          {activeTab === 'about' && (
            <div className={`p-4 rounded-2xl border space-y-3 ${
              isMale ? 'border-slate-800/80 bg-slate-900/50' : 'border-pink-100/90 bg-white shadow-2xs'
            }`}>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Username</span>
                <span className="font-mono font-bold">@{currentUser.username}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Privacy</span>
                <span className="font-bold capitalize">{currentUser.privacyVisibility || 'Public'}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Account ID</span>
                <span className="font-mono text-[10px] text-slate-400 truncate max-w-[160px]">{currentUser.id}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Email Status</span>
                <span className={`font-bold ${currentUser.emailVerified ? 'text-emerald-500' : 'text-amber-500'}`}>
                  {currentUser.emailVerified ? 'Verified' : 'Unverified'}
                </span>
              </div>
            </div>
          )}

          {/* Friends Tab */}
          {activeTab === 'friends' && (
            buddies.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-center">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-2.5 ${
                  isMale ? 'bg-slate-900 text-blue-400' : 'bg-pink-100 text-rose-500'
                }`}>
                  <Users className="w-6 h-6 opacity-60" />
                </div>
                <p className="text-xs font-bold text-slate-400">No buddies added yet</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Find people and connect on Simi</p>
              </div>
            ) : (
              <div className="space-y-2">
                {buddies.map((buddy) => (
                  <div
                    key={buddy.id}
                    className={`flex items-center justify-between p-3 rounded-2xl border ${
                      isMale ? 'border-slate-800/80 bg-slate-900/50' : 'border-pink-100/90 bg-white shadow-2xs'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <CuteAvatar
                        id={buddy.avatarId}
                        customUrl={buddy.customAvatarUrl}
                        size="md"
                      />
                      <div>
                        <h4 className="text-xs font-bold">{buddy.name}</h4>
                        <p className="text-[10px] text-slate-400">@{buddy.username}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        sounds.playClick();
                        startDirectMessage(buddy);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        isMale
                          ? 'bg-blue-600 hover:bg-blue-500 text-white'
                          : 'bg-rose-500 hover:bg-rose-600 text-white'
                      }`}
                    >
                      Message
                    </button>
                  </div>
                ))}
              </div>
            )
          )}

          {/* Media Tab */}
          {activeTab === 'media' && (
            myMediaUrls.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-center">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-2.5 ${
                  isMale ? 'bg-slate-900 text-blue-400' : 'bg-pink-100 text-rose-500'
                }`}>
                  <ImageIcon className="w-6 h-6 opacity-60" />
                </div>
                <p className="text-xs font-bold text-slate-400">No media uploaded yet</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Photos and videos from your posts appear here</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {myMediaUrls.map((url, idx) => (
                  <div
                    key={idx}
                    className="aspect-square rounded-xl overflow-hidden border border-slate-800/60 bg-black/20"
                  >
                    <img src={url} alt="User media" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </div>

      {/* Full Screen Story Viewer Modal */}
      {activeStoryIndex !== null && myStories.length > 0 && (
        <StoryViewerModal
          stories={myStories}
          initialIndex={activeStoryIndex}
          onClose={() => setActiveStoryIndex(null)}
        />
      )}
    </div>
  );
};
