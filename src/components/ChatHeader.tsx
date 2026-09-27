import React from 'react';
import { useChat } from '../context/ChatContext';
import { CuteAvatar } from '../utils/avatars';
import { UserProfile } from '../types/chat';
import {
  ArrowLeft,
  Video,
  Phone,
  MoreVertical,
  WifiOff,
} from 'lucide-react';
import { sounds } from '../utils/sound';
import { getUserPresence } from '../utils/presence';
import { canViewProfile, canCallUser } from '../utils/privacy';

interface ChatHeaderProps {
  onToggleSidebarMobile?: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({ onToggleSidebarMobile }) => {
  const {
    currentRoom,
    setCurrentRoomId,
    activeUsers,
    currentUser,
    theme,
    typingUsers,
    startVideoCall,
    startAudioCall,
    activeCall,
    isOnline,
    setActiveMobileTab,
    showConversationInfoDrawer,
    setShowConversationInfoDrawer,
    setShowProfileModal,
    setSelectedProfileUser,
    isBlocked,
  } = useChat();

  if (!currentRoom || !currentUser) return null;

  const isMale = currentUser?.gender ? currentUser.gender === 'male' : theme === 'midnight';
  const isMidnight = isMale;
  const isDirect = currentRoom.type === 'direct' || currentRoom.isDirect;

  // Direct DM Buddy
  const directBuddy: UserProfile | undefined = (() => {
    if (!isDirect) return undefined;
    const buddyId = currentRoom.participantIds?.find((id) => id !== currentUser.id);
    if (!buddyId) return undefined;
    return activeUsers.find((u) => u.id === buddyId);
  })();

  const buddyPresence = directBuddy
    ? getUserPresence(directBuddy, false, isOnline, currentUser, activeUsers)
    : null;

  const userBlocked = directBuddy ? isBlocked(directBuddy.id) : false;

  // Typing string
  const typingText =
    typingUsers.length === 1
      ? `${typingUsers[0].userName} is typing...`
      : typingUsers.length === 2
      ? `${typingUsers[0].userName} and ${typingUsers[1].userName} are typing...`
      : typingUsers.length > 2
      ? 'Several people are typing...'
      : null;

  // Back button handler
  const handleBack = () => {
    sounds.playClick();
    setShowConversationInfoDrawer(false);
    setCurrentRoomId('');
    setActiveMobileTab('chats');
  };

  // Center header click handler -> view profile
  const handleCenterClick = () => {
    if (!directBuddy) return;
    sounds.playClick();
    if (canViewProfile(directBuddy, currentUser, activeUsers)) {
      setSelectedProfileUser(directBuddy);
      setShowProfileModal(true);
    } else {
      alert(`@${directBuddy.username}'s profile is private.`);
    }
  };

  // Video call
  const handleVideoCall = () => {
    if (!directBuddy || userBlocked) return;
    sounds.playClick();
    startVideoCall(directBuddy);
  };

  // Audio call
  const handleAudioCall = () => {
    if (!directBuddy || userBlocked) return;
    sounds.playClick();
    startAudioCall(directBuddy);
  };

  // Toggle More Info Drawer
  const handleToggleDrawer = () => {
    sounds.playClick();
    setShowConversationInfoDrawer(!showConversationInfoDrawer);
  };

  return (
    <header className={`sticky top-0 z-30 flex items-center justify-between px-3 sm:px-5 h-14 border-b shrink-0 select-none ${
      isMidnight
        ? 'bg-[#0B0F17]/95 backdrop-blur-xl border-slate-800/80 text-slate-100'
        : 'bg-white/90 backdrop-blur-md border-pink-100 text-slate-800'
    }`}>
      {/* LEFT: Back Button */}
      <div className="flex items-center gap-1.5 shrink-0">
        <button
          onClick={handleBack}
          className={`p-2 rounded-2xl transition-colors flex items-center gap-1 font-bold text-xs ${
            isMidnight ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-pink-50 text-slate-600'
          }`}
          title="Back to Chats list"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="hidden sm:inline">Chats</span>
        </button>
      </div>

      {/* CENTER: Profile Avatar + Name + Presence / Typing Status */}
      <div
        onClick={handleCenterClick}
        className="flex items-center gap-2.5 min-w-0 max-w-xs sm:max-w-md cursor-pointer group px-2 py-1 rounded-2xl hover:bg-slate-500/5 transition-colors"
        title={isDirect && directBuddy ? `View ${directBuddy.name}'s profile` : currentRoom.name}
      >
        {isDirect && directBuddy ? (
          <div className="relative shrink-0">
            <CuteAvatar
              id={directBuddy.avatarId}
              customUrl={directBuddy.customAvatarUrl}
              size="sm"
              className={isMidnight ? 'ring-2 ring-blue-500/40' : 'ring-2 ring-pink-200'}
            />
            {buddyPresence?.isOnline && (
              <span className="absolute -top-0.5 -left-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-slate-900 ring-1 ring-emerald-300 animate-pulse" />
            )}
          </div>
        ) : (
          <div className="w-9 h-9 rounded-2xl bg-slate-800 flex items-center justify-center text-xl shrink-0 border border-slate-700">
            {currentRoom.icon}
          </div>
        )}

        <div className="min-w-0 text-left">
          <div className="flex items-center gap-1.5">
            <h1 className={`text-xs sm:text-sm font-bold truncate transition-colors ${
              isMidnight ? 'text-slate-100 group-hover:text-cyan-400' : 'text-slate-800 group-hover:text-pink-600'
            }`}>
              {isDirect && directBuddy ? directBuddy.name : currentRoom.name}
            </h1>
            {userBlocked && (
              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-rose-100 text-rose-700 shrink-0">
                Blocked
              </span>
            )}
          </div>

          <div className="text-[11px] truncate flex items-center gap-1">
            {typingText ? (
              <span className={`${isMidnight ? 'text-cyan-400' : 'text-rose-500'} font-semibold animate-pulse`}>
                {typingText}
              </span>
            ) : isDirect && buddyPresence ? (
              <span className={`font-medium ${buddyPresence.isOnline ? 'text-emerald-400 font-semibold' : 'text-slate-400'}`}>
                {buddyPresence.label}
              </span>
            ) : (
              <span className="text-slate-400">
                {currentRoom.participantIds?.length || 1} members
              </span>
            )}
          </div>
        </div>
      </div>

      {/* RIGHT: Audio Call | Video Call | More ⋮ */}
      <div className="flex items-center gap-1 shrink-0">
        {/* Audio Call */}
        {isDirect && directBuddy && (
          <button
            onClick={handleAudioCall}
            disabled={Boolean(activeCall) || userBlocked}
            className={`p-2 rounded-2xl transition-all ${
              userBlocked
                ? 'opacity-40 cursor-not-allowed text-slate-400'
                : isMidnight
                ? 'text-cyan-400 hover:bg-slate-800'
                : 'text-rose-500 hover:bg-pink-50'
            }`}
            title={userBlocked ? 'Cannot call blocked user' : `Audio Call ${directBuddy.name}`}
          >
            <Phone className="w-4 h-4" />
          </button>
        )}

        {/* Video Call */}
        {isDirect && directBuddy && (
          <button
            onClick={handleVideoCall}
            disabled={Boolean(activeCall) || userBlocked}
            className={`p-2 rounded-2xl transition-all ${
              userBlocked
                ? 'opacity-40 cursor-not-allowed text-slate-400'
                : isMidnight
                ? 'text-blue-400 hover:bg-slate-800'
                : 'text-rose-500 hover:bg-pink-50'
            }`}
            title={userBlocked ? 'Cannot call blocked user' : `Video Call ${directBuddy.name}`}
          >
            <Video className="w-4 h-4" />
          </button>
        )}

        {/* More ⋮ Button */}
        <button
          onClick={handleToggleDrawer}
          className={`p-2 rounded-2xl transition-colors ${
            showConversationInfoDrawer
              ? isMidnight ? 'bg-slate-800 text-cyan-400 font-bold' : 'bg-pink-100 text-rose-700 font-bold'
              : isMidnight
              ? 'text-slate-300 hover:bg-slate-800'
              : 'text-slate-600 hover:bg-pink-50'
          }`}
          title="Conversation Info"
        >
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
};
