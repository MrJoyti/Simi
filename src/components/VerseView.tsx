import React, { useState, useMemo } from 'react';
import { useChat } from '../context/ChatContext';
import { CuteAvatar } from '../utils/avatars';
import { StoryViewerModal } from './StoryViewerModal';
import { StoryItem, UserProfile } from '../types/chat';
import {
  Sparkles,
  Plus,
  UserPlus,
  MessageCircle,
  Eye,
  Camera,
  Heart,
  Smile,
  Compass,
  Search,
  Bell,
  Share2,
  Bookmark,
  MoreHorizontal,
  Globe,
} from 'lucide-react';
import { sounds } from '../utils/sound';
import { getUserPresence, canViewerAccessUserContent } from '../utils/presence';
import { canViewProfile } from '../utils/privacy';

export const VerseView: React.FC = () => {
  const {
    currentUser,
    stories,
    buddies,
    activeUsers,
    setShowCreateStoryModal,
    setShowFindBuddyModal,
    setShowProfileModal,
    setSelectedProfileUser,
    startDirectMessage,
    isOnline,
    theme,
    feedPosts,
    toggleLikePost,
    toggleSavePost,
    setShowCreatePostModal,
  } = useChat();

  const isMale = currentUser?.gender ? currentUser.gender === 'male' : theme === 'midnight';
  const isMidnight = isMale;
  const [activeStoryIndex, setActiveStoryIndex] = useState<number | null>(null);
  const [verseTab, setVerseTab] = useState<'for_you' | 'following' | 'explore'>('for_you');

  // Local viewed stories tracking for immediate instant ring update
  const [viewedStoryIds, setViewedStoryIds] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('mochichat_viewed_stories') || '[]');
    } catch {
      return [];
    }
  });

  const markStoryAsViewedLocally = (storyId: string) => {
    setViewedStoryIds((prev) => {
      if (prev.includes(storyId)) return prev;
      const updated = [...prev, storyId];
      try {
        localStorage.setItem('mochichat_viewed_stories', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  // Group real stories by user
  const groupedByUser = useMemo(() => {
    return stories.reduce((acc, story) => {
      if (!acc[story.userId]) {
        acc[story.userId] = [];
      }
      acc[story.userId].push(story);
      return acc;
    }, {} as Record<string, StoryItem[]>);
  }, [stories]);

  const ownStories = currentUser ? groupedByUser[currentUser.id] || [] : [];

  // Filter friends' stories
  const { friendList, buddyStoriesByUser } = useMemo(() => {
    if (!currentUser) return { friendList: [], buddyStoriesByUser: {} };

    const candidatesMap = new Map<string, UserProfile>();
    buddies.forEach((b) => candidatesMap.set(b.id, b));
    activeUsers.forEach((u) => {
      if (u.id !== currentUser.id && !candidatesMap.has(u.id)) {
        candidatesMap.set(u.id, u);
      }
    });

    const allCandidates = Array.from(candidatesMap.values()).filter((buddy) =>
      canViewerAccessUserContent(buddy, currentUser, activeUsers)
    );
    const storiesMap: Record<string, StoryItem[]> = {};

    allCandidates.forEach((buddy) => {
      if (groupedByUser[buddy.id] && groupedByUser[buddy.id].length > 0) {
        storiesMap[buddy.id] = groupedByUser[buddy.id];
      } else {
        // Generate active buddy story from profile mood
        const storyId = `buddy_story_${buddy.id}`;
        const gradientBg =
          buddy.gender === 'male'
            ? 'from-slate-900 via-blue-950 to-slate-900'
            : buddy.avatarId === 'cat'
            ? 'from-purple-400 via-pink-400 to-rose-300'
            : buddy.avatarId === 'bear'
            ? 'from-amber-400 via-orange-300 to-rose-300'
            : 'from-pink-500 via-rose-400 to-amber-300';

        const storyText = buddy.moodText
          ? buddy.moodText
          : 'Active on Simi today';

        storiesMap[buddy.id] = [
          {
            id: storyId,
            userId: buddy.id,
            userName: buddy.name,
            userAvatar: buddy.avatarId || 'bunny',
            userCustomAvatar: buddy.customAvatarUrl,
            text: storyText,
            gradientBg,
            createdAt: buddy.lastSeen || Date.now() - 3600000,
            expiresAt: Date.now() + 86400000,
            viewers: [],
            reactions: {},
          },
        ];
      }
    });

    return { friendList: allCandidates, buddyStoriesByUser: storiesMap };
  }, [currentUser, buddies, activeUsers, groupedByUser]);

  if (!currentUser) return null;

  // Flatten stories list for sequential full-screen viewing
  const allStoriesList: StoryItem[] = [
    ...ownStories,
    ...friendList.flatMap((f) => buddyStoriesByUser[f.id] || []),
  ];

  const handleOpenUserStory = (userId: string) => {
    sounds.playClick();
    const userStoryList = userId === currentUser.id ? ownStories : buddyStoriesByUser[userId];
    if (userStoryList && userStoryList.length > 0) {
      userStoryList.forEach((s) => markStoryAsViewedLocally(s.id));
    }
    const firstIdx = allStoriesList.findIndex((s) => s.userId === userId);
    if (firstIdx >= 0) {
      setActiveStoryIndex(firstIdx);
    }
  };

  const handleViewProfile = (user: UserProfile) => {
    sounds.playClick();
    if (canViewProfile(user, currentUser, activeUsers)) {
      setSelectedProfileUser(user);
      setShowProfileModal(true);
    } else {
      alert(`@${user.username}'s profile is private.`);
    }
  };

  // Male Experience (Screen 1 - VERSE) matching reference design
  if (isMidnight) {
    return (
      <div className="flex-1 flex flex-col h-full overflow-y-auto select-none bg-[#0B0F17] text-slate-100 pb-16">
        {/* Top Header: Logo 'Simi' in glowing font + Search + Notification Bell */}
        <div className="px-4 pt-3.5 pb-2.5 border-b border-slate-800/80 bg-[#0B0F17]/95 backdrop-blur-xl shrink-0 sticky top-0 z-20">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-2xl font-black italic tracking-wider bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-300 bg-clip-text text-transparent drop-shadow-[0_0_12px_rgba(59,130,246,0.5)]">
              Simi
            </h1>
            <div className="flex items-center gap-2">
              <button
                onClick={() => sounds.playClick()}
                className="p-2 rounded-2xl bg-slate-900/80 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-colors"
              >
                <Search className="w-4 h-4" />
              </button>
              <button
                onClick={() => sounds.playClick()}
                className="p-2 rounded-2xl bg-slate-900/80 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-colors relative"
              >
                <Bell className="w-4 h-4" />
                <span className="w-2 h-2 rounded-full bg-cyan-400 absolute top-1.5 right-1.5 shadow-[0_0_6px_#06b6d4]" />
              </button>
            </div>
          </div>

          {/* Tab Selector: For You | Following | Explore */}
          <div className="flex items-center gap-2">
            {[
              { id: 'for_you', label: 'For You' },
              { id: 'following', label: 'Following' },
              { id: 'explore', label: 'Explore' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  sounds.playClick();
                  setVerseTab(tab.id as any);
                }}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  verseTab === tab.id
                    ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 text-white shadow-md shadow-blue-950/60 glow-cyan-blue'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Stories Horizontal Tray */}
        <div className="px-4 py-3.5 border-b border-slate-800/60 overflow-x-auto scrollbar-none flex items-center gap-4 bg-[#0E1522]/50">
          {/* Your Story Avatar */}
          <div
            onClick={() => {
              sounds.playClick();
              setShowCreateStoryModal(true);
            }}
            className="flex flex-col items-center shrink-0 cursor-pointer group active:scale-95 transition-transform"
          >
            <div className="relative">
              <div className="p-0.5 rounded-full border-2 border-dashed border-cyan-400/60">
                <CuteAvatar
                  id={currentUser.avatarId}
                  customUrl={currentUser.customAvatarUrl}
                  size="md"
                  className="border-2 border-slate-900"
                />
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 border-2 border-slate-900 flex items-center justify-center text-white shadow-md">
                <Plus className="w-3 h-3 stroke-[3]" />
              </div>
            </div>
            <span className="text-[10px] mt-1.5 font-bold text-slate-300">Your Story</span>
          </div>

          {/* Friends' Stories */}
          {friendList.map((buddy) => {
            const buddyStories = buddyStoriesByUser[buddy.id] || [];
            if (buddyStories.length === 0) return null;
            const latestStory = buddyStories[0];
            const allViewed = buddyStories.every(
              (s) => s.viewers.includes(currentUser.id) || viewedStoryIds.includes(s.id)
            );

            return (
              <div
                key={buddy.id}
                onClick={() => handleOpenUserStory(buddy.id)}
                className="flex flex-col items-center shrink-0 cursor-pointer group active:scale-95 transition-transform"
              >
                <div className="relative">
                  <div
                    className={`p-[2.5px] rounded-full transition-all ${
                      allViewed
                        ? 'border-2 border-slate-800'
                        : 'bg-gradient-to-tr from-purple-500 via-blue-500 to-cyan-400 shadow-[0_0_12px_rgba(59,130,246,0.45)]'
                    }`}
                  >
                    <CuteAvatar
                      id={latestStory.userAvatar || buddy.avatarId || 'bunny'}
                      customUrl={latestStory.userCustomAvatar || buddy.customAvatarUrl}
                      size="md"
                      className="border-2 border-slate-900"
                    />
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-slate-900" />
                </div>
                <span
                  className={`text-[10px] mt-1.5 max-w-[64px] truncate text-center ${
                    allViewed ? 'text-slate-500 font-medium' : 'text-slate-200 font-bold'
                  }`}
                >
                  {buddy.name}
                </span>
              </div>
            );
          })}
        </div>

        {/* Cinematic Feed Posts */}
        <div className="p-4 sm:p-6 max-w-xl mx-auto w-full space-y-5">
          {feedPosts.map((post) => (
            <div
              key={post.id}
              className="rounded-3xl border border-slate-800/80 bg-[#111827]/80 backdrop-blur-xl overflow-hidden shadow-xl"
            >
              {/* Post Header */}
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CuteAvatar
                    id={post.authorAvatar}
                    customUrl={post.authorCustomAvatar}
                    size="sm"
                    className="ring-2 ring-blue-500/30"
                  />
                  <div>
                    <h3 className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                      <span>{post.authorName}</span>
                    </h3>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400">
                      <span>{post.timeAgo}</span>
                      <span>•</span>
                      <span className="flex items-center gap-0.5 text-blue-400">
                        <Globe className="w-2.5 h-2.5" />
                        <span>Public</span>
                      </span>
                    </div>
                  </div>
                </div>

                <button className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>

              {/* Post Content / Caption */}
              {post.content && (
                <p className="px-4 pb-3 text-xs leading-relaxed text-slate-200">
                  {post.content}
                </p>
              )}

              {/* Cinematic Post Image Card */}
              {post.images && post.images.length > 0 && (
                <div className="relative aspect-[16/10] w-full bg-slate-900 overflow-hidden">
                  <img
                    src={post.images[0]}
                    alt="Post Visual"
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  {post.images.length > 1 && (
                    <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-mono font-bold text-white border border-white/20">
                      1/{post.images.length}
                    </span>
                  )}
                </div>
              )}

              {/* Interaction Bar: Heart, Comment, Share, Bookmark */}
              <div className="p-3 px-4 flex items-center justify-between border-t border-slate-800/60 bg-slate-900/40">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => {
                      sounds.playReaction();
                      toggleLikePost(post.id);
                    }}
                    className={`flex items-center gap-1.5 text-xs font-bold transition-all active:scale-90 ${
                      post.isLiked ? 'text-rose-500' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${post.isLiked ? 'fill-rose-500' : ''}`} />
                    <span>{post.likes}</span>
                  </button>

                  <button
                    onClick={() => sounds.playClick()}
                    className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>{post.commentsCount}</span>
                  </button>

                  <button
                    onClick={() => sounds.playClick()}
                    className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>{post.sharesCount}</span>
                  </button>
                </div>

                <button
                  onClick={() => {
                    sounds.playClick();
                    toggleSavePost(post.id);
                  }}
                  className={`p-1.5 rounded-xl transition-colors ${
                    post.isSaved ? 'text-cyan-400' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Bookmark className={`w-4 h-4 ${post.isSaved ? 'fill-cyan-400' : ''}`} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Full Screen Story Viewer Modal */}
        {activeStoryIndex !== null && (
          <StoryViewerModal
            stories={allStoriesList}
            initialIndex={activeStoryIndex}
            onClose={() => setActiveStoryIndex(null)}
          />
        )}
      </div>
    );
  }

  // Female Experience (Screen 1 - VERSE) matching reference design
  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto select-none bg-female-canvas text-slate-800 pb-16">
      {/* 1. Top Header: 'Simi' cursive branding + Subtitle + Search + Bell with badge (3) + Pink (+) button */}
      <div className="px-4 pt-3.5 pb-2.5 border-b border-pink-100/80 bg-white/85 backdrop-blur-xl shrink-0 sticky top-0 z-20 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-2xl font-black italic tracking-wide bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 bg-clip-text text-transparent drop-shadow-[0_1px_4px_rgba(244,63,94,0.25)]">
              Simi
            </h1>
            <p className="text-[10px] text-pink-400 font-medium -mt-0.5 flex items-center gap-1">
              <span>Share Moments, Stay Closer</span>
              <Sparkles className="w-2.5 h-2.5 text-amber-400 fill-amber-300" />
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                sounds.playClick();
                setShowFindBuddyModal(true);
              }}
              className="p-2 rounded-full bg-pink-50/80 border border-pink-100 text-slate-600 hover:text-rose-500 hover:bg-pink-100 transition-colors"
              title="Search"
            >
              <Search className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                sounds.playClick();
                alert('You have 3 new notifications from Maya and Riya!');
              }}
              className="p-2 rounded-full bg-pink-50/80 border border-pink-100 text-slate-600 hover:text-rose-500 hover:bg-pink-100 transition-colors relative"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="w-4 h-4 rounded-full bg-rose-500 text-[9px] font-bold text-white flex items-center justify-center absolute -top-1 -right-1 shadow-sm">
                3
              </span>
            </button>

            <button
              onClick={() => {
                sounds.playClick();
                setShowCreatePostModal(true);
              }}
              className="w-8 h-8 rounded-full bg-gradient-to-tr from-pink-500 to-rose-500 text-white flex items-center justify-center shadow-md shadow-pink-500/30 hover:scale-105 active:scale-95 transition-all"
              title="Create Post"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
            </button>
          </div>
        </div>

        {/* Category Pills: For You | Following | Explore */}
        <div className="flex items-center gap-2">
          {[
            { id: 'for_you', label: 'For You' },
            { id: 'following', label: 'Following' },
            { id: 'explore', label: 'Explore' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                sounds.playClick();
                setVerseTab(tab.id as any);
              }}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                verseTab === tab.id
                  ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-sm shadow-pink-500/25'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Stories Horizontal Tray */}
      <div className="px-4 py-3.5 border-b border-pink-100/60 overflow-x-auto scrollbar-none flex items-center gap-4 bg-white/60 backdrop-blur-md">
        {/* Add Story (+) */}
        <div
          onClick={() => {
            sounds.playClick();
            setShowCreateStoryModal(true);
          }}
          className="flex flex-col items-center shrink-0 cursor-pointer group active:scale-95 transition-transform"
        >
          <div className="relative">
            <div className="p-0.5 rounded-full border-2 border-dashed border-rose-300">
              <CuteAvatar
                id={currentUser.avatarId}
                customUrl={currentUser.customAvatarUrl}
                size="md"
                className="border-2 border-white"
              />
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-tr from-pink-500 to-rose-500 border-2 border-white flex items-center justify-center text-white shadow-sm">
              <Plus className="w-3 h-3 stroke-[3]" />
            </div>
          </div>
          <span className="text-[10px] mt-1.5 font-bold text-slate-700">Add Story</span>
        </div>

        {/* Your Story */}
        <div
          onClick={() => {
            if (ownStories.length > 0) {
              handleOpenUserStory(currentUser.id);
            } else {
              setShowCreateStoryModal(true);
            }
          }}
          className="flex flex-col items-center shrink-0 cursor-pointer group active:scale-95 transition-transform"
        >
          <div className="relative">
            <div className="story-ring-female">
              <CuteAvatar
                id={currentUser.avatarId}
                customUrl={currentUser.customAvatarUrl}
                size="md"
                className="border-2 border-white"
              />
            </div>
          </div>
          <span className="text-[10px] mt-1.5 font-bold text-slate-700">Your Story</span>
        </div>

        {/* Friends' Stories */}
        {friendList.map((buddy) => {
          const buddyStories = buddyStoriesByUser[buddy.id] || [];
          if (buddyStories.length === 0) return null;
          const latestStory = buddyStories[0];
          const allViewed = buddyStories.every(
            (s) => s.viewers.includes(currentUser.id) || viewedStoryIds.includes(s.id)
          );

          return (
            <div
              key={buddy.id}
              onClick={() => handleOpenUserStory(buddy.id)}
              className="flex flex-col items-center shrink-0 cursor-pointer group active:scale-95 transition-transform"
            >
              <div className="relative">
                <div
                  className={`transition-all ${
                    allViewed
                      ? 'p-0.5 rounded-full border-2 border-slate-200'
                      : 'story-ring-female'
                  }`}
                >
                  <CuteAvatar
                    id={latestStory.userAvatar || buddy.avatarId || 'bunny'}
                    customUrl={latestStory.userCustomAvatar || buddy.customAvatarUrl}
                    size="md"
                    className="border-2 border-white"
                  />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-white" />
              </div>
              <span
                className={`text-[10px] mt-1.5 max-w-[64px] truncate text-center ${
                  allViewed ? 'text-slate-400 font-medium' : 'text-slate-800 font-bold'
                }`}
              >
                {buddy.name}
              </span>
            </div>
          );
        })}
      </div>

      {/* 3. Aesthetic Social Feed Posts */}
      <div className="p-4 sm:p-6 max-w-xl mx-auto w-full space-y-5">
        {feedPosts.map((post) => (
          <div
            key={post.id}
            className="rounded-3xl border border-pink-100/90 bg-white/90 backdrop-blur-xl overflow-hidden shadow-md shadow-pink-100/30"
          >
            {/* Post Header */}
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-0.5 rounded-full ring-2 ring-pink-300">
                  <CuteAvatar
                    id={post.authorAvatar}
                    customUrl={post.authorCustomAvatar}
                    size="sm"
                    className="border border-white"
                  />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <span>{post.authorName}</span>
                  </h3>
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                    <span>{post.timeAgo}</span>
                    <span>•</span>
                    <span className="flex items-center gap-0.5 text-rose-500">
                      <span>{post.location || 'Dhaka'}</span>
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => sounds.playClick()}
                className="p-1.5 rounded-full hover:bg-pink-50 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>

            {/* Caption */}
            {post.content && (
              <p className="px-4 pb-3 text-xs leading-relaxed text-slate-700 whitespace-pre-line font-medium">
                {post.content}
              </p>
            )}

            {/* Post Media Image Card */}
            {post.images && post.images.length > 0 && (
              <div className="relative aspect-[16/10] w-full bg-pink-100 overflow-hidden">
                <img
                  src={post.images[0]}
                  alt="Post visual"
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-[1.02]"
                  loading="lazy"
                />
                {post.images.length > 1 && (
                  <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-white/80 backdrop-blur-md text-[10px] font-bold text-slate-700 border border-white/40 shadow-xs">
                    1/{post.images.length}
                  </span>
                )}
              </div>
            )}

            {/* Interaction Bar: Heart, Comment, Share, Bookmark */}
            <div className="p-3 px-4 flex items-center justify-between border-t border-pink-100/60 bg-pink-50/20">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => {
                    sounds.playReaction();
                    toggleLikePost(post.id);
                  }}
                  className={`flex items-center gap-1.5 text-xs font-bold transition-all active:scale-90 ${
                    post.isLiked ? 'text-rose-500' : 'text-slate-500 hover:text-rose-500'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${post.isLiked ? 'fill-rose-500' : ''}`} />
                  <span>{post.likes}</span>
                </button>

                <button
                  onClick={() => sounds.playClick()}
                  className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>{post.commentsCount}</span>
                </button>

                <button
                  onClick={() => sounds.playClick()}
                  className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                  <span>{post.sharesCount}</span>
                </button>
              </div>

              <button
                onClick={() => {
                  sounds.playClick();
                  toggleSavePost(post.id);
                }}
                className={`p-1.5 rounded-xl transition-colors ${
                  post.isSaved ? 'text-rose-500' : 'text-slate-400 hover:text-rose-500'
                }`}
              >
                <Bookmark className={`w-4 h-4 ${post.isSaved ? 'fill-rose-500' : ''}`} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Full Screen Story Viewer Modal */}
      {activeStoryIndex !== null && (
        <StoryViewerModal
          stories={allStoriesList}
          initialIndex={activeStoryIndex}
          onClose={() => setActiveStoryIndex(null)}
        />
      )}
    </div>
  );
};

