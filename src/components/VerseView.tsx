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
  } = useChat();

  const isMidnight = theme === 'midnight';
  const [activeStoryIndex, setActiveStoryIndex] = useState<number | null>(null);

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

  return (
    <div className={`flex-1 flex flex-col h-full overflow-y-auto select-none ${
      isMidnight ? 'bg-[#0B0F14] text-slate-100' : 'bg-pink-50/30 text-slate-800'
    }`}>
      {/* 1. Header: App Name 'Simi' */}
      <div className={`px-4 py-3.5 border-b flex items-center justify-between shrink-0 sticky top-0 z-20 backdrop-blur-md ${
        isMidnight ? 'bg-[#111821]/95 border-slate-800' : 'bg-white/95 border-pink-100'
      }`}>
        <div className="flex items-center gap-2.5">
          <img
            src="/simi-logo.png"
            alt="Simi Logo"
            className="w-9 h-9 rounded-2xl object-cover shadow-md ring-2 ring-purple-400/30"
          />
          <div>
            <h1 className={`text-lg font-black tracking-tight bg-clip-text text-transparent ${
              isMidnight
                ? 'bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-200'
                : 'bg-gradient-to-r from-pink-600 via-rose-500 to-amber-500'
            }`}>
              Simi
            </h1>
            <span className={`text-[10px] font-bold tracking-wider uppercase block -mt-1 ${
              isMidnight ? 'text-blue-400' : 'text-rose-500'
            }`}>
              Verse
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              sounds.playClick();
              setShowFindBuddyModal(true);
            }}
            className={`p-2 rounded-2xl transition-colors ${
              isMidnight ? 'bg-slate-800 text-blue-400 hover:bg-slate-700' : 'bg-pink-50 hover:bg-pink-100 text-rose-600'
            }`}
            title="Find User / Buddy"
          >
            <UserPlus className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="p-4 sm:p-6 space-y-5 max-w-xl mx-auto w-full">
        {/* 2. Friends' Stories Bar */}
        <div className={`p-4 rounded-3xl border shadow-2xs space-y-3 ${
          isMidnight ? 'bg-[#111821] border-slate-800' : 'bg-white/95 border-pink-100'
        }`}>
          <div className="flex items-center justify-between px-1">
            <span className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
              isMidnight ? 'text-slate-300' : 'text-slate-700'
            }`}>
              <Sparkles className={`w-3.5 h-3.5 ${isMidnight ? 'text-blue-400' : 'text-rose-500'}`} />
              <span>Friends' Stories</span>
            </span>
            <span className="text-[10px] font-semibold text-slate-400">
              {friendList.length} active
            </span>
          </div>

          <div className="flex items-center gap-3.5 overflow-x-auto scrollbar-none py-1">
            {friendList.length === 0 ? (
              <p className="text-xs text-slate-400 py-2">No active friend stories available.</p>
            ) : (
              friendList.map((buddy) => {
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
                        className={`p-0.5 rounded-full transition-all ${
                          allViewed
                            ? isMidnight ? 'border-2 border-slate-800' : 'border-2 border-slate-200'
                            : isMidnight
                            ? 'bg-gradient-to-tr from-blue-600 via-cyan-500 to-indigo-600 p-[2.5px] shadow-xs ring-1 ring-blue-500/30'
                            : 'bg-gradient-to-tr from-pink-500 via-rose-500 to-amber-400 p-[2.5px] shadow-xs ring-1 ring-pink-200'
                        }`}
                      >
                        <CuteAvatar
                          id={latestStory.userAvatar || buddy.avatarId || 'bunny'}
                          customUrl={latestStory.userCustomAvatar || buddy.customAvatarUrl}
                          size="md"
                          className={isMidnight ? 'border-2 border-slate-900' : 'border-2 border-white'}
                        />
                      </div>
                      {buddy.moodEmoji && (
                        <span className={`absolute -bottom-0.5 -right-0.5 text-[11px] rounded-full shadow-2xs px-0.5 ${
                          isMidnight ? 'bg-slate-900 border border-slate-700 text-slate-200' : 'bg-white border border-pink-100'
                        }`}>
                          {buddy.moodEmoji}
                        </span>
                      )}
                    </div>
                    <span className={`text-[10px] mt-1 max-w-[62px] truncate text-center ${
                      allViewed
                        ? isMidnight ? 'text-slate-500 font-medium' : 'text-slate-400 font-medium'
                        : isMidnight ? 'text-slate-200 font-bold' : 'text-slate-800 font-bold'
                    }`}>
                      {buddy.name}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* 3. Add to My Story Action Section */}
        <div className={`p-4 rounded-3xl border shadow-md flex items-center justify-between gap-3 ${
          isMidnight
            ? 'bg-gradient-to-r from-slate-900 via-blue-950/60 to-slate-900 border-slate-800'
            : 'bg-gradient-to-r from-rose-50 via-pink-50/80 to-rose-50 border-pink-200/80'
        }`}>
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative shrink-0">
              <CuteAvatar
                id={currentUser.avatarId}
                customUrl={currentUser.customAvatarUrl}
                size="md"
                className={isMidnight ? 'ring-2 ring-blue-500/50' : 'ring-2 ring-pink-300'}
              />
              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  setShowCreateStoryModal(true);
                }}
                className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center border-2 shadow-xs transition-transform active:scale-90 ${
                  isMidnight ? 'bg-blue-600 text-white border-slate-900' : 'bg-rose-500 text-white border-white'
                }`}
                title="Add Story"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
              </button>
            </div>

            <div className="min-w-0">
              <h3 className={`text-xs sm:text-sm font-bold truncate ${isMidnight ? 'text-slate-100' : 'text-slate-800'}`}>
                Add to my story
              </h3>
              <p className={`text-[11px] truncate ${isMidnight ? 'text-slate-400' : 'text-slate-500'}`}>
                {ownStories.length > 0 ? `${ownStories.length} active story posted` : 'Share photos & text vibes for 24 hours'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {ownStories.length > 0 && (
              <button
                type="button"
                onClick={() => handleOpenUserStory(currentUser.id)}
                className={`p-2 rounded-2xl border text-xs font-bold transition-colors ${
                  isMidnight ? 'bg-slate-800 border-slate-700 text-blue-400 hover:bg-slate-700' : 'bg-white border-pink-200 text-rose-600 hover:bg-pink-50'
                }`}
                title="View My Story"
              >
                <Eye className="w-4 h-4" />
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                setShowCreateStoryModal(true);
              }}
              className={`px-3.5 py-2 rounded-2xl text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all active:scale-95 ${
                isMidnight
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500'
                  : 'bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600'
              }`}
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Add Story</span>
            </button>
          </div>
        </div>

        {/* 4. Verse Feed / Friends Activity Dashboard */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className={`text-xs font-bold uppercase tracking-wider ${
              isMidnight ? 'text-slate-400' : 'text-slate-600'
            }`}>
              Active Buddies & Vibes
            </span>
          </div>

          <div className="grid grid-cols-1 gap-2.5">
            {buddies.length === 0 ? (
              <div className={`p-8 text-center rounded-3xl border ${
                isMidnight ? 'bg-[#111821] border-slate-800 text-slate-300' : 'bg-white border-pink-100 text-slate-700'
              }`}>
                <div className="w-12 h-12 rounded-2xl bg-pink-100/80 text-rose-500 flex items-center justify-center mx-auto mb-2">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h4 className="text-xs font-bold">Your Verse is quiet</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Add buddies to see their live stories and active vibes here.
                </p>
                <button
                  onClick={() => setShowFindBuddyModal(true)}
                  className={`mt-3 px-3.5 py-1.5 rounded-2xl text-white text-xs font-bold transition-transform active:scale-95 ${
                    isMidnight ? 'bg-blue-600' : 'bg-rose-500'
                  }`}
                >
                  + Add Buddies
                </button>
              </div>
            ) : (
              buddies.map((buddy) => {
                const presence = getUserPresence(buddy, false, isOnline, currentUser, activeUsers);
                return (
                  <div
                    key={buddy.id}
                    className={`p-3.5 rounded-3xl border flex items-center justify-between gap-3 shadow-2xs transition-all ${
                      isMidnight
                        ? 'bg-[#111821] border-slate-800 hover:border-slate-700 text-slate-100'
                        : 'bg-white/95 border-pink-100 hover:border-pink-200 text-slate-800'
                    }`}
                  >
                    <div
                      onClick={() => handleViewProfile(buddy)}
                      className="flex items-center gap-3 min-w-0 cursor-pointer group"
                    >
                      <div className="relative shrink-0">
                        <CuteAvatar id={buddy.avatarId} customUrl={buddy.customAvatarUrl} size="md" />
                        {presence.isOnline && (
                           <span className="absolute -top-0.5 -left-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white animate-pulse" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h4 className={`text-xs font-bold truncate group-hover:underline ${
                            isMidnight ? 'text-slate-100' : 'text-slate-800'
                          }`}>
                            {buddy.name}
                          </h4>
                          <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
                            presence.isOnline
                              ? isMidnight ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-emerald-100 text-emerald-700'
                              : 'bg-slate-200/60 text-slate-500'
                          }`}>
                            {presence.isOnline ? 'Online' : 'Offline'}
                          </span>
                        </div>
                        <p className={`text-[11px] truncate mt-0.5 ${
                          isMidnight ? 'text-blue-400 font-medium' : 'text-rose-500 font-medium'
                        }`}>
                          {buddy.moodText || 'Available'}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => startDirectMessage(buddy)}
                      className={`p-2 rounded-2xl text-white text-xs font-bold shrink-0 transition-transform active:scale-95 ${
                        isMidnight ? 'bg-blue-600 hover:bg-blue-500' : 'bg-rose-500 hover:bg-rose-600'
                      }`}
                      title={`Chat with ${buddy.name}`}
                    >
                      <MessageCircle className="w-4 h-4" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
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
