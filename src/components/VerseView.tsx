import React, { useState, useMemo } from 'react';
import { useChat } from '../context/ChatContext';
import { CuteAvatar } from '../utils/avatars';
import { StoryViewerModal } from './StoryViewerModal';
import { StoryItem, UserProfile } from '../types/chat';
import {
  Sparkles,
  Plus,
  MessageCircle,
  Heart,
  Search,
  Bell,
  Share2,
  Bookmark,
  MoreHorizontal,
  Image as ImageIcon,
} from 'lucide-react';
import { sounds } from '../utils/sound';
import { canViewerAccessUserContent } from '../utils/presence';
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
    feedPosts,
    toggleLikePost,
    toggleSavePost,
    setShowCreatePostModal,
    showToast,
    simiTheme,
  } = useChat();

  const isMale = simiTheme.isMale;
  const [activeStoryIndex, setActiveStoryIndex] = useState<number | null>(null);
  const [verseTab, setVerseTab] = useState<'for_you' | 'following' | 'explore'>('for_you');

  // Local viewed stories tracking for immediate ring update
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

  // Filter friends' real stories
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
      showToast(`@${user.username}'s profile is private.`, 'info');
    }
  };

  const handleSharePost = async (post: any) => {
    sounds.playClick();
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Post by ${post.authorName} on Simi`,
          text: post.content,
          url: window.location.href,
        });
        return;
      } catch {
        // User cancelled
      }
    }
    navigator.clipboard.writeText(post.content || window.location.href);
    showToast('Post copied to clipboard!', 'success');
  };

  return (
    <div className={`flex-1 flex flex-col h-full overflow-y-auto select-none pb-16 transition-colors duration-200 ${
      isMale ? 'bg-[#0B0F17] text-slate-100' : 'bg-female-canvas text-slate-800'
    }`}>
      {/* 1. Shared Header: Branding + Tagline + Actions */}
      <div className={`px-4 pt-3.5 pb-2.5 border-b shrink-0 sticky top-0 z-20 backdrop-blur-xl ${
        isMale
          ? 'bg-[#0B0F17]/95 border-slate-800/80 shadow-lg shadow-black/20'
          : 'bg-white/85 border-pink-100/80 shadow-xs'
      }`}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className={`text-2xl font-black italic tracking-wider ${
              isMale
                ? 'bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-300 bg-clip-text text-transparent drop-shadow-[0_0_12px_rgba(59,130,246,0.5)]'
                : 'bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 bg-clip-text text-transparent drop-shadow-[0_1px_4px_rgba(244,63,94,0.25)]'
            }`}>
              Simi
            </h1>
            <p className={`text-[10px] font-medium -mt-0.5 flex items-center gap-1 ${
              isMale ? 'text-slate-400' : 'text-pink-400'
            }`}>
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
              className={`p-2 rounded-full transition-colors ${
                isMale
                  ? 'bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
                  : 'bg-pink-50/80 border border-pink-100 text-slate-600 hover:text-rose-500 hover:bg-pink-100'
              }`}
              title="Find Buddy"
            >
              <Search className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                sounds.playClick();
                showToast('You are up to date on all notifications.', 'info');
              }}
              className={`p-2 rounded-full transition-colors relative ${
                isMale
                  ? 'bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
                  : 'bg-pink-50/80 border border-pink-100 text-slate-600 hover:text-rose-500 hover:bg-pink-100'
              }`}
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                sounds.playClick();
                setShowCreatePostModal(true);
              }}
              className={`p-2 rounded-full text-white transition-all shadow-md active:scale-95 ${
                isMale
                  ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 shadow-blue-900/40 glow-cyan-blue'
                  : 'bg-gradient-to-r from-rose-500 to-pink-500 shadow-rose-200'
              }`}
              title="Create Post"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 2. Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
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
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 ${
                verseTab === tab.id ? simiTheme.tabActive : simiTheme.tabInactive
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Horizontal Story Tray */}
      <div className={`px-4 py-3.5 border-b shrink-0 ${
        isMale ? 'border-slate-800/80 bg-slate-950/40' : 'border-pink-100/60 bg-white/40'
      }`}>
        <div className="flex items-center gap-3.5 overflow-x-auto scrollbar-none py-1">
          {/* Add story item */}
          <div
            onClick={() => {
              sounds.playClick();
              setShowCreateStoryModal(true);
            }}
            className="flex flex-col items-center shrink-0 cursor-pointer group active:scale-95 transition-transform"
          >
            <div className="relative">
              <div className={`p-[2px] rounded-full ${simiTheme.storyRing}`}>
                <CuteAvatar
                  id={currentUser.avatarId}
                  customUrl={currentUser.customAvatarUrl}
                  size="md"
                  className={`border-2 ${isMale ? 'border-slate-900 bg-slate-800' : 'border-white bg-pink-100'}`}
                />
              </div>
              <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-white border-2 ${
                isMale ? 'bg-cyan-500 border-slate-900' : 'bg-rose-500 border-white'
              }`}>
                <Plus className="w-3 h-3 stroke-[3]" />
              </div>
            </div>
            <span className={`text-[11px] mt-1.5 font-bold max-w-[56px] truncate text-center ${
              isMale ? 'text-slate-300' : 'text-slate-700'
            }`}>
              Your Story
            </span>
          </div>

          {/* Friends with real stories */}
          {friendList
            .filter((buddy) => (buddyStoriesByUser[buddy.id] || []).length > 0)
            .map((buddy) => {
              const buddyStories = buddyStoriesByUser[buddy.id] || [];
              const hasUnviewed = buddyStories.some((s) => !viewedStoryIds.includes(s.id));
              return (
                <div
                  key={buddy.id}
                  onClick={() => handleOpenUserStory(buddy.id)}
                  className="flex flex-col items-center shrink-0 cursor-pointer group active:scale-95 transition-transform"
                >
                  <div className={`p-[2px] rounded-full ${hasUnviewed ? simiTheme.storyRing : 'border-2 border-slate-600'}`}>
                    <CuteAvatar
                      id={buddy.avatarId}
                      customUrl={buddy.customAvatarUrl}
                      size="md"
                      className={`border-2 ${isMale ? 'border-slate-900' : 'border-white'}`}
                    />
                  </div>
                  <span className={`text-[11px] mt-1.5 font-bold max-w-[56px] truncate text-center ${
                    isMale ? 'text-slate-300' : 'text-slate-700'
                  }`}>
                    {buddy.name}
                  </span>
                </div>
              );
            })}
        </div>
      </div>

      {/* 4. Feed Posts (Real user posts or clean empty state) */}
      <div className="flex-1 p-4 sm:p-6 max-w-lg mx-auto w-full space-y-4">
        {feedPosts.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-center">
            <div className={`w-14 h-14 rounded-3xl flex items-center justify-center mb-3 ${simiTheme.emptyIconBg}`}>
              <ImageIcon className="w-7 h-7 opacity-75" />
            </div>
            <h3 className={`text-sm font-bold ${simiTheme.textPrimary}`}>
              The Verse is quiet
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-xs leading-relaxed">
              Share your thoughts, photos, or moments with friends on Simi.
            </p>
            <button
              onClick={() => {
                sounds.playClick();
                setShowCreatePostModal(true);
              }}
              className={`mt-4 px-5 py-2 rounded-2xl text-xs font-bold text-white transition-all shadow-md active:scale-95 ${
                simiTheme.accentGradient
              }`}
            >
              Create First Post
            </button>
          </div>
        ) : (
          feedPosts.map((post) => (
            <div
              key={post.id}
              className={`rounded-3xl border overflow-hidden shadow-lg transition-all ${
                isMale
                  ? 'border-slate-800/80 bg-slate-900/60 shadow-black/30'
                  : 'border-pink-100/90 bg-white shadow-rose-100/50'
              }`}
            >
              {/* Post Header */}
              <div className="p-3.5 px-4 flex items-center justify-between">
                <div
                  className="flex items-center gap-3 cursor-pointer group"
                  onClick={() => {
                    const author = activeUsers.find((u) => u.id === post.authorId);
                    if (author) handleViewProfile(author);
                  }}
                >
                  <CuteAvatar
                    id={post.authorAvatar}
                    customUrl={post.authorCustomAvatar}
                    size="md"
                    className={`border ${isMale ? 'border-slate-800' : 'border-pink-200'}`}
                  />
                  <div>
                    <h4 className={`text-xs font-bold ${
                      isMale ? 'text-slate-100 group-hover:text-blue-400' : 'text-slate-800 group-hover:text-rose-600'
                    }`}>
                      {post.authorName}
                    </h4>
                    <p className="text-[10px] text-slate-400 font-medium">{post.timeAgo}</p>
                  </div>
                </div>

                <button
                  onClick={() => sounds.playClick()}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-200 transition-colors"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>

              {/* Post Content */}
              {post.content && (
                <div className="px-4 pb-3">
                  <p className={`text-xs leading-relaxed ${isMale ? 'text-slate-200' : 'text-slate-700'}`}>
                    {post.content}
                  </p>
                </div>
              )}

              {/* Post Image (if any) */}
              {post.images && post.images.length > 0 && (
                <div className="relative aspect-video w-full bg-black/40 overflow-hidden">
                  <img
                    src={post.images[0]}
                    alt="Post attachment"
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              )}

              {/* Interaction Bar */}
              <div className={`p-3 px-4 flex items-center justify-between border-t ${
                isMale ? 'border-slate-800/60 bg-slate-900/40' : 'border-pink-100/70 bg-[#FFF7F9]/60'
              }`}>
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
                    <Heart className={`w-4 h-4 ${post.isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
                    <span>{post.likes}</span>
                  </button>

                  <button
                    onClick={() => {
                      sounds.playClick();
                      showToast('Comments coming soon!', 'info');
                    }}
                    className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>{post.commentsCount}</span>
                  </button>

                  <button
                    onClick={() => handleSharePost(post)}
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
                    showToast(post.isSaved ? 'Removed from saved' : 'Post saved!', 'info');
                  }}
                  className={`p-1.5 rounded-xl transition-colors ${
                    post.isSaved
                      ? isMale ? 'text-cyan-400' : 'text-rose-500'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Bookmark className={`w-4 h-4 ${post.isSaved ? (isMale ? 'fill-cyan-400' : 'fill-rose-500') : ''}`} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 5. Full Screen Story Viewer Modal */}
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
