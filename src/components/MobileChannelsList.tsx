import React, { useState } from 'react';
import { useChat } from '../context/ChatContext';
import { CuteAvatar } from '../utils/avatars';
import { ChatRoom, UserProfile } from '../types/chat';
import {
  Search,
  Pin,
  Star,
  Clock,
  MessageCircle,
  Plus,
  UserPlus,
  Users,
  Phone,
  SlidersHorizontal,
  Camera,
  Mic,
} from 'lucide-react';
import { sounds } from '../utils/sound';
import { getUserPresence } from '../utils/presence';

export const MobileChannelsList: React.FC = () => {
  const {
    currentUser,
    rooms,
    currentRoomId,
    setCurrentRoomId,
    setShowCreateRoomModal,
    setShowFindBuddyModal,
    activeUsers,
    isOnline,
    theme,
    isRoomPinned,
    isRoomFavorite,
    typingUsers,
    setActiveMobileTab,
  } = useChat();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'direct' | 'group' | 'unread'>('all');

  if (!currentUser) return null;

  const isMale = currentUser?.gender ? currentUser.gender === 'male' : theme === 'midnight';
  const isMidnight = isMale;

  const totalUnreadCount = rooms.reduce((acc, r) => acc + (r.unreadCount || 0), 0);

  // Filter & Search rooms
  const filteredRooms = rooms.filter((room) => {
    if (filterType === 'direct' && room.type !== 'direct') return false;
    if (filterType === 'group' && room.type !== 'group') return false;
    if (filterType === 'unread' && (!room.unreadCount || room.unreadCount <= 0)) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = room.name.toLowerCase().includes(q);
      const matchMsg = room.lastMessage?.toLowerCase().includes(q);
      return matchName || matchMsg;
    }
    return true;
  });

  // Specification #6: Sorting order
  // 1. Pinned conversations
  // 2. Unread conversations
  // 3. Most recent timestamp
  const sortedRooms = [...filteredRooms].sort((a, b) => {
    const aPinned = isRoomPinned(a.id);
    const bPinned = isRoomPinned(b.id);
    if (aPinned && !bPinned) return -1;
    if (!aPinned && bPinned) return 1;

    const aUnread = (a.unreadCount || 0) > 0;
    const bUnread = (b.unreadCount || 0) > 0;
    if (aUnread && !bUnread) return -1;
    if (!aUnread && bUnread) return 1;

    const aTime = a.lastMessageTime || a.createdAt || 0;
    const bTime = b.lastMessageTime || b.createdAt || 0;
    return bTime - aTime;
  });

  const handleSelectRoom = (roomId: string) => {
    sounds.playClick();
    setCurrentRoomId(roomId);
    setActiveMobileTab('chats');
  };

  return (
    <div className={`flex-1 flex flex-col h-full overflow-hidden select-none ${
      isMidnight ? 'bg-[#0B0F17] text-slate-100' : 'bg-female-canvas text-slate-800'
    }`}>
      {/* 1. Main Chats Header */}
      <div className={`px-4 py-3.5 border-b flex items-center justify-between shrink-0 z-10 ${
        isMidnight ? 'bg-[#0B0F17]/95 border-slate-800/80 backdrop-blur-xl' : 'bg-white/90 border-pink-100/80 backdrop-blur-xl'
      }`}>
        <h2 className={`text-xl font-black tracking-tight ${
          isMidnight ? 'text-slate-100' : 'text-slate-800'
        }`}>
          Chats
        </h2>

        <div className="flex items-center gap-2">
          {isMidnight ? (
            <>
              <button
                onClick={() => {
                  sounds.playClick();
                  setShowFindBuddyModal(true);
                }}
                className="w-9 h-9 rounded-2xl bg-slate-900/80 border border-slate-800 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
                title="Start Call"
              >
                <Phone className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  sounds.playClick();
                  setShowCreateRoomModal(true);
                }}
                className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 text-white flex items-center justify-center shadow-md shadow-blue-900/40 active:scale-95 transition-transform"
                title="New Chat"
              >
                <Plus className="w-5 h-5 stroke-[2.5]" />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => {
                  sounds.playClick();
                  setShowFindBuddyModal(true);
                }}
                className="w-9 h-9 rounded-full bg-pink-50/80 border border-pink-100 text-slate-600 hover:text-rose-500 hover:bg-pink-100 flex items-center justify-center transition-colors"
                title="Start Audio/Video Call"
              >
                <Phone className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  sounds.playClick();
                  setShowCreateRoomModal(true);
                }}
                className="w-9 h-9 rounded-full bg-gradient-to-tr from-pink-500 to-rose-500 text-white flex items-center justify-center shadow-md shadow-pink-500/30 active:scale-95 transition-all"
                title="New Chat / Group"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* 2. Search & Filter Bar */}
      <div className="p-3 pb-1 space-y-2.5">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 absolute left-3.5 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search conversations..."
            className={`w-full pl-9 pr-4 py-2 rounded-2xl text-xs font-medium focus:outline-none transition-all ${
              isMidnight
                ? 'bg-[#111827]/80 border border-slate-800 text-slate-100 placeholder-slate-500 focus:border-cyan-500 shadow-inner'
                : 'bg-white/85 border border-pink-100/90 focus:border-rose-400 text-slate-800 placeholder-slate-400 shadow-2xs'
            }`}
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          {[
            { id: 'all', label: 'All' },
            { id: 'direct', label: 'Direct' },
            { id: 'group', label: 'Groups' },
            { id: 'unread', label: totalUnreadCount > 0 ? `Unread (${totalUnreadCount})` : 'Unread' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                sounds.playClick();
                setFilterType(tab.id as any);
              }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 ${
                filterType === tab.id
                  ? isMidnight
                    ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 text-white shadow-md shadow-blue-950/60 glow-cyan-blue'
                    : 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-xs'
                  : isMidnight
                  ? 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800/80'
                  : 'bg-white/80 text-slate-600 border border-pink-100/70 hover:bg-pink-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Conversation List Content */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-thin">
        {sortedRooms.length === 0 ? (
          /* Specification #7: Empty State */
          <div className={`py-16 px-6 text-center rounded-3xl border my-4 shadow-2xs ${
            isMidnight ? 'bg-slate-900/90 border-slate-800 text-slate-100' : 'bg-white/60 border-pink-100/80 text-slate-800'
          }`}>
            <div className={`w-14 h-14 rounded-3xl flex items-center justify-center text-2xl mx-auto mb-3 shadow-inner ${
              isMidnight ? 'bg-slate-800 text-blue-400' : 'bg-pink-100 text-rose-500'
            }`}>
              💬
            </div>
            <h3 className={`text-sm font-bold ${isMidnight ? 'text-slate-100' : 'text-slate-800'}`}>No chats yet</h3>
            <p className={`text-xs mt-1 max-w-xs mx-auto ${isMidnight ? 'text-slate-400' : 'text-slate-500'}`}>
              Start a conversation from any user profile.
            </p>
            <button
              onClick={() => {
                sounds.playClick();
                setShowFindBuddyModal(true);
              }}
              className={`mt-4 px-4 py-2 text-white text-xs font-bold rounded-2xl shadow-sm hover:opacity-95 transition-transform active:scale-95 ${
                isMidnight ? 'bg-gradient-to-r from-blue-600 to-cyan-600' : 'bg-gradient-to-r from-pink-500 to-rose-500'
              }`}
            >
              Find User to Chat
            </button>
          </div>
        ) : (
          sortedRooms.map((room) => {
            const isSelected = room.id === currentRoomId;
            const isDirect = room.type === 'direct' || room.isDirect;
            const isPinned = isRoomPinned(room.id);
            const isFav = isRoomFavorite(room.id);
            const isTempActive = room.temporaryChat?.enabled;

            // Direct partner target
            const directTarget: UserProfile | undefined = isDirect
              ? activeUsers.find((u) => u.id === room.participantIds?.find((id) => id !== currentUser.id))
              : undefined;

            const targetPresence = directTarget
              ? getUserPresence(directTarget, false, isOnline, currentUser, activeUsers)
              : null;

            // Typing status
            const roomTyping = typingUsers.filter((u) => u.userId !== currentUser.id);
            const isTyping = roomTyping.length > 0;

            const timeString = room.lastMessageTime
              ? new Date(room.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : '';

            return (
              <div
                key={room.id}
                onClick={() => handleSelectRoom(room.id)}
                className={`w-full flex items-center justify-between p-3.5 rounded-3xl border transition-all cursor-pointer relative overflow-hidden ${
                  isSelected
                    ? isMidnight
                      ? 'bg-slate-900 border-blue-800/80 shadow-md ring-1 ring-blue-900'
                      : 'bg-rose-50/90 border-rose-200/90 shadow-xs ring-1 ring-rose-200'
                    : isMidnight
                    ? 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-800/80'
                    : 'bg-white/85 border-pink-100/80 hover:bg-white shadow-2xs'
                }`}
              >
                {/* Left: Avatar / Group Icon + Room Info */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="relative shrink-0">
                    {isDirect && directTarget ? (
                      <>
                        <div className={isMidnight ? '' : 'p-0.5 rounded-full ring-2 ring-pink-200'}>
                          <CuteAvatar
                            id={directTarget.avatarId}
                            customUrl={directTarget.customAvatarUrl}
                            size="md"
                            className={isMidnight ? 'ring-2 ring-blue-500/30' : 'border border-white'}
                          />
                        </div>
                        {targetPresence?.isOnline && (
                          <span className="absolute -top-0.5 -left-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-white ring-1 ring-emerald-200" />
                        )}
                      </>
                    ) : (
                      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl shadow-2xs ${
                        isMidnight ? 'bg-slate-800 border border-slate-700' : 'bg-pink-100/80 border border-pink-200/60'
                      }`}>
                        {room.icon || '💬'}
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1 text-left">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <h4 className={`text-xs font-bold truncate ${
                          isMidnight ? 'text-slate-100' : 'text-slate-800'
                        }`}>
                          {isDirect && directTarget ? directTarget.name : room.name}
                        </h4>

                        {/* Badges */}
                        {isPinned && (
                          <Pin className="w-3 h-3 text-amber-500 fill-amber-500 shrink-0" />
                        )}
                        {isFav && (
                          <Star className="w-3 h-3 text-amber-500 fill-amber-500 shrink-0" />
                        )}
                        {isTempActive && (
                          <span className="text-[10px] shrink-0" title="Temporary Chat Active">⏳</span>
                        )}
                      </div>

                      {timeString && (
                        <span className="text-[10px] font-medium shrink-0 ml-1 text-slate-400">
                          {timeString}
                        </span>
                      )}
                    </div>

                    {/* Preview Text / Typing indicator */}
                    <div className="flex items-center justify-between gap-2">
                      {isTyping ? (
                        <span className={`text-[11px] font-semibold animate-pulse truncate ${
                          isMidnight ? 'text-cyan-400' : 'text-rose-500'
                        }`}>
                          Typing...
                        </span>
                      ) : (
                        <p className={`text-[11px] truncate leading-tight ${
                          isMidnight ? 'text-slate-400 font-normal' : 'text-slate-500'
                        }`}>
                          {room.lastMessage || (isDirect ? `Start chatting` : room.description)}
                        </p>
                      )}

                      {/* Unread badge */}
                      {(room.unreadCount || 0) > 0 && (
                        <span className={`shrink-0 min-w-5 h-5 px-1.5 rounded-full text-[10px] font-bold flex items-center justify-center shadow-sm ${
                          isMidnight
                            ? 'bg-blue-600 text-white shadow-blue-900/60 ring-1 ring-cyan-400/40'
                            : 'bg-rose-500 text-white shadow-xs'
                        }`}>
                          {room.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
