import React, { useState, useMemo } from 'react';
import { useChat } from '../context/ChatContext';
import { CuteAvatar } from '../utils/avatars';
import { StoryViewerModal } from './StoryViewerModal';
import { Plus } from 'lucide-react';
import { sounds } from '../utils/sound';
import { canViewerAccessUserContent } from '../utils/presence';
import type { UserProfile, StoryItem } from '../types/chat';

// Friendly starter buddies in case the app has no other registered users yet
const STARTER_BUDDIES: UserProfile[] = [
  {
    id: 'starter_mochi_rabbit',
    name: 'Mochi Rabbit',
    username: 'mochirabbit',
    email: 'mochirabbit@example.com',
    avatarId: 'bunny',
    bio: 'Loving pastel skies & warm mochi',
    theme: 'strawberry',
    soundEnabled: true,
    status: 'online',
    moodEmoji: '🌸',
    moodText: 'Cozy vibes & sweet pastel stories!',
    createdAt: Date.now() - 86400000 * 3,
    lastSeen: Date.now() - 60000,
  },
  {
    id: 'starter_sakura_cat',
    name: 'Sakura Kitty',
    username: 'sakuracat',
    email: 'sakuracat@example.com',
    avatarId: 'cat',
    bio: 'Chasing blossoms in the spring breeze',
    theme: 'lavender',
    soundEnabled: true,
    status: 'online',
    moodEmoji: '✨',
    moodText: 'Enjoying cherry blossoms in the breeze!',
    createdAt: Date.now() - 86400000 * 2,
    lastSeen: Date.now() - 120000,
  },
  {
    id: 'starter_boba_bear',
    name: 'Boba Bear',
    username: 'bobabear',
    email: 'bobabear@example.com',
    avatarId: 'bear',
    bio: 'Always down for brown sugar boba',
    theme: 'vanilla',
    soundEnabled: true,
    status: 'idle',
    moodEmoji: '🧋',
    moodText: 'Brown sugar boba time with friends!',
    createdAt: Date.now() - 86400000,
    lastSeen: Date.now() - 300000,
  },
];

export const StoriesBar: React.FC = () => {
  const {
    currentUser,
    stories,
    buddies,
    activeUsers,
    setShowCreateStoryModal,
    theme,
  } = useChat();

  const isMale = theme === 'midnight';
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

  // Determine list of buddies / friends to show in stories tray
  const { friendList, buddyStoriesByUser } = useMemo(() => {
    if (!currentUser) {
      return { friendList: [], buddyStoriesByUser: {} };
    }

    // 1. Gather all candidate buddies (added buddies, other registered users, or starter buddies)
    const candidatesMap = new Map<string, UserProfile>();

    // Priority 1: User's added buddies
    buddies.forEach((b) => {
      if (b.id !== currentUser.id) candidatesMap.set(b.id, b);
    });

    // Priority 2: Other active users in the system
    activeUsers.forEach((u) => {
      if (u.id !== currentUser.id && !candidatesMap.has(u.id)) {
        candidatesMap.set(u.id, u);
      }
    });

    // Priority 3: Fallback starter buddies if user has no peers yet
    if (candidatesMap.size === 0) {
      STARTER_BUDDIES.forEach((b) => candidatesMap.set(b.id, b));
    }

    const allCandidates = Array.from(candidatesMap.values()).filter((buddy) =>
      canViewerAccessUserContent(buddy, currentUser, activeUsers)
    );
    const storiesMap: Record<string, StoryItem[]> = {};

    allCandidates.forEach((buddy) => {
      // If buddy already has real active stories from Firestore, use them
      if (groupedByUser[buddy.id] && groupedByUser[buddy.id].length > 0) {
        storiesMap[buddy.id] = groupedByUser[buddy.id];
      } else {
        // Generate an active buddy story using their profile mood and aesthetic
        const storyId = `buddy_story_${buddy.id}`;
        const gradientBg =
          buddy.gender === 'male'
            ? 'from-slate-900 via-blue-950 to-slate-900'
            : buddy.avatarId === 'cat'
            ? 'from-purple-400 via-pink-400 to-rose-300'
            : buddy.avatarId === 'bear'
            ? 'from-amber-400 via-orange-300 to-rose-300'
            : buddy.avatarId === 'panda'
            ? 'from-emerald-400 via-teal-400 to-cyan-400'
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

  return (
    <div className={`px-3 sm:px-4 py-2.5 flex items-center gap-3 overflow-x-auto scrollbar-none select-none shrink-0 border-b ${
      isMale
        ? 'bg-slate-900 border-slate-800 shadow-none'
        : 'bg-white/95 border-pink-100/80 shadow-2xs'
    }`}>
      {/* 1. Add Story Bubble (Own Profile) */}
      <div className="flex flex-col items-center shrink-0">
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              if (ownStories.length > 0) {
                handleOpenUserStory(currentUser.id);
              } else {
                sounds.playClick();
                setShowCreateStoryModal(true);
              }
            }}
            className={`p-0.5 rounded-full transition-all active:scale-95 ${
              ownStories.length > 0
                ? isMale
                  ? 'bg-gradient-to-tr from-blue-600 via-cyan-500 to-indigo-600 ring-2 ring-blue-500/50'
                  : 'bg-gradient-to-tr from-pink-500 via-rose-400 to-amber-300 ring-2 ring-pink-300'
                : isMale
                ? 'border-2 border-dashed border-blue-500/40 p-0.5 hover:border-blue-400'
                : 'border-2 border-dashed border-pink-300 p-0.5 hover:border-pink-500'
            }`}
            title={ownStories.length > 0 ? 'View Your Story' : 'Add Story'}
          >
            <CuteAvatar
              id={currentUser.avatarId}
              customUrl={currentUser.customAvatarUrl}
              size="md"
              className={isMale ? 'border-2 border-slate-900' : 'border-2 border-white'}
            />
          </button>

          {/* Plus Badge */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              sounds.playClick();
              setShowCreateStoryModal(true);
            }}
            className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center border-2 shadow-xs transition-transform active:scale-90 ${
              isMale
                ? 'bg-blue-600 hover:bg-blue-500 text-white border-slate-900'
                : 'bg-rose-500 hover:bg-rose-600 text-white border-white'
            }`}
            title="Create Story"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
          </button>
        </div>
        <span className={`text-[10px] font-bold mt-1 max-w-[64px] truncate text-center ${
          isMale ? 'text-slate-300' : 'text-slate-700'
        }`}>
          {ownStories.length > 0 ? 'Your Story' : 'Add Story'}
        </span>
      </div>

      {/* Vertical separator */}
      <div className={`h-10 w-px shrink-0 ${isMale ? 'bg-slate-800' : 'bg-pink-100/90'}`} />

      {/* 2. Buddies / Friends Stories List */}
      {friendList.map((buddy) => {
        const buddyStories = buddyStoriesByUser[buddy.id] || [];
        if (buddyStories.length === 0) return null;
        const latestStory = buddyStories[0];

        // Check if viewed in Firestore viewers array or local viewed list
        const allViewed = buddyStories.every(
          (s) => s.viewers.includes(currentUser.id) || viewedStoryIds.includes(s.id)
        );

        return (
          <div
            key={buddy.id}
            onClick={() => handleOpenUserStory(buddy.id)}
            className="flex flex-col items-center shrink-0 cursor-pointer group active:scale-95 transition-transform"
            title={`Watch ${buddy.name}'s story`}
          >
            <div className="relative">
              <div
                className={`p-0.5 rounded-full transition-all ${
                  allViewed
                    ? isMale
                      ? 'border-2 border-slate-800'
                      : 'border-2 border-slate-200'
                    : isMale
                    ? 'bg-gradient-to-tr from-blue-600 via-cyan-500 to-indigo-600 p-[2.5px] shadow-xs ring-1 ring-blue-500/30'
                    : 'bg-gradient-to-tr from-pink-500 via-rose-500 to-amber-400 p-[2.5px] shadow-xs ring-1 ring-pink-200'
                }`}
              >
                <CuteAvatar
                  id={latestStory.userAvatar || buddy.avatarId || 'bunny'}
                  customUrl={latestStory.userCustomAvatar || buddy.customAvatarUrl}
                  size="md"
                  className={isMale ? 'border-2 border-slate-900' : 'border-2 border-white'}
                />
              </div>

              {/* Cute mood or presence indicator badge */}
              {buddy.moodEmoji && (
                <span
                  className={`absolute -bottom-0.5 -right-0.5 text-[11px] rounded-full shadow-2xs px-0.5 ${
                    isMale
                      ? 'bg-slate-900 border border-slate-700 text-slate-200'
                      : 'bg-white border border-pink-100'
                  }`}
                  title={buddy.moodText || 'Buddy mood'}
                >
                  {buddy.moodEmoji}
                </span>
              )}
            </div>
            <span
              className={`text-[10px] mt-1 max-w-[62px] truncate text-center ${
                allViewed
                  ? isMale
                    ? 'text-slate-500 font-medium'
                    : 'text-slate-400 font-medium'
                  : isMale
                  ? 'text-slate-200 font-bold'
                  : 'text-slate-800 font-bold'
              }`}
            >
              {buddy.name}
            </span>
          </div>
        );
      })}

      {/* Fullscreen Story Viewer Modal */}
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

