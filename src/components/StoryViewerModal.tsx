import React, { useState, useEffect, useRef } from 'react';
import { useChat } from '../context/ChatContext';
import { StoryItem } from '../types/chat';
import { CuteAvatar } from '../utils/avatars';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Eye,
  Trash2,
  Heart,
  Sparkles,
} from 'lucide-react';
import { sounds } from '../utils/sound';

interface StoryViewerModalProps {
  stories: StoryItem[];
  initialIndex?: number;
  onClose: () => void;
}

const STORY_REACTIONS = ['💖', '🔥', '🌸', '😂', '🥺', '🎉'];
const STORY_DURATION = 6000; // 6 seconds per story

export const StoryViewerModal: React.FC<StoryViewerModalProps> = ({
  stories,
  initialIndex = 0,
  onClose,
}) => {
  const { currentUser, markStoryViewed, reactToStory, deleteStory, theme } = useChat();
  const isMale = theme === 'midnight';

  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showViewersList, setShowViewersList] = useState(false);

  const activeStory = stories[currentIndex];
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Mark active story as viewed
  useEffect(() => {
    if (activeStory) {
      markStoryViewed(activeStory.id);
    }
  }, [activeStory, markStoryViewed]);

  // Story progression timer
  useEffect(() => {
    if (isPaused || !activeStory) return;

    setProgress(0);
    const stepInterval = 50;
    const increment = (stepInterval / STORY_DURATION) * 100;

    timerRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          handleNextStory();
          return 0;
        }
        return prev + increment;
      });
    }, stepInterval);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [currentIndex, isPaused, activeStory]);

  const handleNextStory = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setProgress(0);
    } else {
      onClose();
    }
  };

  const handlePrevStory = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setProgress(0);
    }
  };

  const handleReaction = (emoji: string) => {
    if (!activeStory) return;
    reactToStory(activeStory.id, emoji);
  };

  const handleDeleteActiveStory = async () => {
    if (!activeStory) return;
    if (window.confirm('Delete this story?')) {
      await deleteStory(activeStory.id);
      if (stories.length <= 1) {
        onClose();
      } else {
        handleNextStory();
      }
    }
  };

  if (!activeStory) return null;

  const isOwner = activeStory.userId === currentUser?.id;
  const timeFormatted = new Date(activeStory.createdAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-0 sm:p-4 select-none animate-in fade-in duration-200"
      onMouseDown={() => setIsPaused(true)}
      onMouseUp={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
    >
      {/* Navigation Arrows for Desktop */}
      {currentIndex > 0 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            sounds.playClick();
            handlePrevStory();
          }}
          className="hidden md:flex absolute left-8 p-3 rounded-full bg-white/20 hover:bg-white/30 text-white transition-all hover:scale-110 z-20"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}

      {currentIndex < stories.length - 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            sounds.playClick();
            handleNextStory();
          }}
          className="hidden md:flex absolute right-8 p-3 rounded-full bg-white/20 hover:bg-white/30 text-white transition-all hover:scale-110 z-20"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      )}

      {/* Main Story Container (Instagram/WhatsApp vertical layout) */}
      <div
        className={`relative w-full h-full sm:h-[88vh] sm:max-w-md sm:rounded-3xl overflow-hidden flex flex-col justify-between shadow-2xl transition-all duration-300 ${
          activeStory.imageUrl ? 'bg-black' : `bg-gradient-to-br ${activeStory.gradientBg || 'from-pink-500 to-rose-400'}`
        }`}
      >
        {/* Top Progress Bars (One bar per story) */}
        <div className="flex items-center gap-1.5 p-3.5 pt-4 z-20">
          {stories.map((s, idx) => (
            <div key={s.id} className="flex-1 h-1.5 rounded-full bg-white/30 overflow-hidden">
              <div
                className="h-full bg-white transition-all duration-75"
                style={{
                  width:
                    idx < currentIndex
                      ? '100%'
                      : idx === currentIndex
                      ? `${progress}%`
                      : '0%',
                }}
              />
            </div>
          ))}
        </div>

        {/* Top Author Details Bar */}
        <div className="flex items-center justify-between px-4 z-20">
          <div className="flex items-center gap-2.5 min-w-0">
            <CuteAvatar
              id={activeStory.userAvatar || 'bunny'}
              customUrl={activeStory.userCustomAvatar}
              size="sm"
              className="ring-2 ring-white shadow-md"
            />
            <div className="text-white drop-shadow-md min-w-0">
              <span className="text-xs font-bold block truncate">{activeStory.userName}</span>
              <span className="text-[10px] text-white/80 block">{timeFormatted}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isOwner && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteActiveStory();
                }}
                className="p-1.5 rounded-full bg-black/30 hover:bg-rose-600 text-white transition-colors"
                title="Delete story"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={(e) => {
                e.stopPropagation();
                sounds.playClick();
                onClose();
              }}
              className="p-1.5 rounded-full bg-black/30 hover:bg-black/50 text-white transition-colors"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Story Center Visual Body */}
        <div className="relative flex-1 flex items-center justify-center p-6 text-center select-none overflow-hidden">
          {/* Photo background */}
          {activeStory.imageUrl && (
            <img
              src={activeStory.imageUrl}
              alt=""
              className="absolute inset-0 w-full h-full object-cover z-0"
            />
          )}

          {/* Text Overlay */}
          {activeStory.text && (
            <div
              className={`relative z-10 max-w-sm font-black text-xl sm:text-2xl leading-relaxed drop-shadow-lg break-words ${
                activeStory.imageUrl
                  ? 'bg-black/55 text-white p-4 rounded-3xl backdrop-blur-xs border border-white/20'
                  : 'text-white'
              }`}
            >
              {activeStory.text}
            </div>
          )}

          {/* Left/Right invisible tap areas for quick flipping */}
          <div
            className="absolute left-0 top-0 bottom-0 w-1/3 z-10 cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              handlePrevStory();
            }}
          />
          <div
            className="absolute right-0 top-0 bottom-0 w-1/3 z-10 cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              handleNextStory();
            }}
          />
        </div>

        {/* Bottom Bar: Reactions or Viewers List */}
        <div className="p-4 z-20 flex flex-col gap-2 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
          {/* Story Reaction Emojis for Friends */}
          {!isOwner ? (
            <div className="flex items-center justify-around bg-white/20 backdrop-blur-md rounded-2xl p-1.5 border border-white/20">
              {STORY_REACTIONS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleReaction(emoji);
                  }}
                  className="p-1.5 text-xl hover:scale-130 transition-transform active:scale-95"
                  title={`React ${emoji}`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          ) : (
            /* Creator Insights / Viewers counter */
            <div className="flex items-center justify-between px-2 text-white">
              <div className="flex items-center gap-1.5 text-xs font-bold">
                <Eye className={`w-4 h-4 ${isMale ? 'text-blue-400' : 'text-pink-300'}`} />
                <span>
                  {activeStory.viewers.length} {activeStory.viewers.length === 1 ? 'View' : 'Views'}
                </span>
              </div>

              {/* Show reaction counts if any */}
              {activeStory.reactions && Object.keys(activeStory.reactions).length > 0 && (
                <div className="flex items-center gap-1">
                  {Object.entries(activeStory.reactions).map(([emoji, uids]) => (
                    <span
                      key={emoji}
                      className="px-2 py-0.5 rounded-full bg-white/25 text-xs font-bold flex items-center gap-1"
                    >
                      <span>{emoji}</span>
                      <span>{uids.length}</span>
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
