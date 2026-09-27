import React, { useState } from 'react';
import { useChat } from '../context/ChatContext';
import { CuteAvatar } from '../utils/avatars';
import { THEMES } from '../utils/theme';
import { UserProfile } from '../types/chat';
import {
  Users,
  Plus,
  Heart,
  MessageCircle,
  UserPlus,
  Sparkles,
  Smile,
  Trash2,
  LogOut,
} from 'lucide-react';
import { sounds } from '../utils/sound';
import { getUserPresence } from '../utils/presence';

interface SidebarProps {
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onCloseMobile }) => {
  const {
    currentUser,
    activeUsers,
    rooms,
    groupRooms,
    directRooms,
    currentRoomId,
    setCurrentRoomId,
    buddies,
    startDirectMessage,
    setShowCreateRoomModal,
    setShowFindBuddyModal,
    setShowProfileModal,
    deleteChannel,
    handleSignOut,
    theme,
    isOnline,
    isRoomPinned,
    isRoomFavorite,
    buddyRequests,
  } = useChat();

  const [filterQuery, setFilterQuery] = useState('');
  const activeTheme = THEMES[theme] || THEMES.strawberry;
  const isMidnight = theme === 'midnight';

  const handleSelectRoom = (roomId: string) => {
    sounds.playClick();
    setCurrentRoomId(roomId);
    if (onCloseMobile) onCloseMobile();
  };

  const handleStartDM = async (buddy: UserProfile) => {
    await startDirectMessage(buddy);
    if (onCloseMobile) onCloseMobile();
  };

  const handleDeleteRoom = async (e: React.MouseEvent, roomId: string, roomName: string) => {
    e.stopPropagation();
    if (window.confirm(`Delete channel "${roomName}"? This action cannot be undone.`)) {
      await deleteChannel(roomId);
    }
  };

  return (
    <aside className={`w-full md:w-64 lg:w-72 h-full flex flex-col select-none ${
      isMidnight 
        ? 'bg-[#111821] border-r border-slate-800 text-slate-200' 
        : 'bg-white/90 backdrop-blur-md border-r border-pink-100'
    }`}>
      {/* Brand & App Title Header */}
      <div className={`p-4 flex items-center justify-between ${
        isMidnight ? 'border-b border-slate-800/80' : 'border-b border-pink-100/80'
      }`}>
        <div className="flex items-center gap-2.5">
          <img
            src="/simi-logo.png"
            alt="Simi Logo"
            className="w-9 h-9 rounded-2xl object-cover shadow-md ring-2 ring-purple-400/30"
          />
          <div>
            <h2 className={`text-sm font-extrabold tracking-tight bg-clip-text text-transparent ${
              isMidnight 
                ? 'bg-gradient-to-r from-blue-400 to-cyan-300' 
                : 'bg-gradient-to-r from-pink-600 to-rose-500'
            }`}>
              Simi
            </h2>
            <p className={`text-[10px] font-medium ${isMidnight ? 'text-slate-400' : 'text-pink-400'}`}>
              {isMidnight ? 'Midnight Forge space' : 'Cozy pastel spaces'}
            </p>
          </div>
        </div>

        {/* Current user badge / mood preview */}
        {currentUser && (
          <button
            onClick={() => {
              sounds.playClick();
              setShowProfileModal(true);
            }}
            className={`flex items-center gap-1.5 p-1 rounded-2xl transition-colors ${
              isMidnight ? 'hover:bg-slate-800' : 'hover:bg-pink-50'
            }`}
            title="Your Profile"
          >
            <CuteAvatar id={currentUser.avatarId} customUrl={currentUser.customAvatarUrl} size="sm" />
          </button>
        )}
      </div>

      {/* Quick Add Buddy Action Button */}
      <div className="px-3 pt-3">
        <button
          onClick={() => {
            sounds.playClick();
            setShowFindBuddyModal(true);
          }}
          className={`w-full flex items-center justify-between py-2 px-3 font-bold text-xs rounded-2xl border shadow-2xs transition-all active:scale-98 ${
            isMidnight
              ? 'bg-slate-800/80 hover:bg-slate-800 text-blue-400 border-slate-700/70'
              : 'bg-pink-50 hover:bg-pink-100/70 text-rose-700 border-pink-200/60'
          }`}
        >
          <div className="flex items-center gap-2 min-w-0">
            <UserPlus className={`w-4 h-4 shrink-0 ${isMidnight ? 'text-blue-400' : 'text-pink-500'}`} />
            <span className="truncate">Find & Add Buddy</span>
          </div>
          {buddyRequests.filter((r) => r.toUserId === currentUser?.id && r.status === 'pending').length > 0 && (
            <span className="px-2 py-0.5 text-[10px] font-bold text-white bg-rose-500 rounded-full animate-pulse shrink-0">
              {buddyRequests.filter((r) => r.toUserId === currentUser?.id && r.status === 'pending').length} new
            </span>
          )}
        </button>
      </div>

      {/* Scrollable Groups & DMs */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-5 scrollbar-thin">
        {/* 1. Group Chat Section */}
        <div>
          <div className="flex items-center justify-between px-2 mb-1.5">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" />
              <span>Group Chats ({groupRooms.length})</span>
            </span>
            <button
              onClick={() => {
                sounds.playClick();
                setShowCreateRoomModal(true);
              }}
              className={`p-1 rounded-lg transition-colors ${
                isMidnight 
                  ? 'text-blue-400 hover:text-blue-300 hover:bg-slate-800' 
                  : 'text-pink-600 hover:text-pink-700 hover:bg-pink-50'
              }`}
              title="Create new Group Chat"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-1">
            {groupRooms.length === 0 ? (
              <div className={`p-3 rounded-2xl border text-center ${
                isMidnight ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50/70 border-slate-100'
              }`}>
                <p className="text-[11px] text-slate-400">No group chats yet.</p>
                <button
                  onClick={() => setShowCreateRoomModal(true)}
                  className={`mt-1 text-[11px] font-bold hover:underline ${
                    isMidnight ? 'text-blue-400' : 'text-rose-500'
                  }`}
                >
                  + Create first group
                </button>
              </div>
            ) : (
              groupRooms.map((room) => {
                const isActive = room.id === currentRoomId;
                const hasUnread = Boolean(room.unreadCount && room.unreadCount > 0);

                return (
                  <div
                    key={room.id}
                    onClick={() => handleSelectRoom(room.id)}
                    className={`w-full group flex items-center justify-between px-3 py-2.5 rounded-2xl text-left transition-all cursor-pointer ${
                      isActive
                        ? isMidnight
                          ? 'bg-blue-950/70 text-blue-200 font-bold border border-blue-800/60 shadow-2xs'
                          : 'bg-pink-100/80 text-rose-800 font-bold shadow-2xs'
                        : hasUnread
                        ? isMidnight
                          ? 'bg-slate-900 hover:bg-slate-800 text-slate-100 font-bold border border-blue-700/60 shadow-2xs'
                          : 'bg-white hover:bg-pink-50/60 text-slate-900 font-bold border border-rose-200/70 shadow-2xs'
                        : isMidnight
                          ? 'text-slate-300 hover:text-white hover:bg-slate-800/60 font-medium'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-pink-50/50 font-medium'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-base shrink-0">{room.icon}</span>
                      <div className="min-w-0">
                        <span className={`text-xs truncate block ${
                          isMidnight ? (hasUnread ? 'font-bold text-white' : 'text-slate-200') : (hasUnread ? 'font-bold text-slate-900' : '')
                        }`}>
                          {room.name}
                        </span>
                        {room.lastMessage && (
                          <span className={`text-[10px] truncate block ${
                            hasUnread 
                              ? (isMidnight ? 'text-blue-400 font-semibold' : 'text-rose-600 font-semibold') 
                              : 'text-slate-400 font-normal'
                          }`}>
                            {room.lastMessage}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {/* Counter Badge for Unread Messages */}
                      {hasUnread && (
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] text-white font-extrabold shadow-sm animate-pulse ${
                            isMidnight ? 'bg-gradient-to-r from-blue-600 to-cyan-500' : 'bg-gradient-to-r from-rose-500 to-pink-500'
                          }`}
                          title={`${room.unreadCount} unread message${room.unreadCount === 1 ? '' : 's'}`}
                        >
                          {room.unreadCount! > 99 ? '99+' : room.unreadCount}
                        </span>
                      )}

                      {/* Delete Channel Button */}
                      <button
                        onClick={(e) => handleDeleteRoom(e, room.id, room.name)}
                        className={`opacity-0 group-hover:opacity-100 p-1 rounded-lg transition-all ${
                          isMidnight ? 'text-slate-400 hover:text-rose-400 hover:bg-slate-800' : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                        }`}
                        title="Delete Channel"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* 2. Direct Chats */}
        <div>
          <div className="flex items-center justify-between px-2 mb-1.5">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Direct Chats ({directRooms.length})</span>
            </span>
          </div>

          <div className="space-y-1">
            {directRooms.length === 0 ? (
              <div className={`p-3 rounded-2xl border text-center ${
                isMidnight ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50/70 border-slate-100'
              }`}>
                <p className="text-[11px] text-slate-400">No direct friend chats yet.</p>
                <button
                  onClick={() => setShowFindBuddyModal(true)}
                  className={`mt-1 text-[11px] font-bold hover:underline ${
                    isMidnight ? 'text-blue-400' : 'text-rose-500'
                  }`}
                >
                  Find a buddy to chat
                </button>
              </div>
            ) : (
              directRooms.map((room) => {
                const isActive = room.id === currentRoomId;
                const hasUnread = Boolean(room.unreadCount && room.unreadCount > 0);
                const otherBuddyId = room.participantIds?.find((id) => id !== currentUser?.id);
                const otherBuddy = activeUsers.find((u) => u.id === otherBuddyId);
                const presence = otherBuddy ? getUserPresence(otherBuddy, false, isOnline, currentUser, activeUsers) : null;

                return (
                  <div
                    key={room.id}
                    onClick={() => handleSelectRoom(room.id)}
                    className={`w-full group flex items-center justify-between px-3 py-2 rounded-2xl text-left transition-all cursor-pointer ${
                      isActive
                        ? isMidnight
                          ? 'bg-blue-950/70 text-blue-200 font-bold border border-blue-800/60 shadow-2xs'
                          : 'bg-pink-100/80 text-rose-800 font-bold shadow-2xs'
                        : hasUnread
                        ? isMidnight
                          ? 'bg-slate-900 hover:bg-slate-800 text-slate-100 font-bold border border-blue-700/60 shadow-2xs'
                          : 'bg-white hover:bg-pink-50/60 text-slate-900 font-bold border border-rose-200/70 shadow-2xs'
                        : isMidnight
                          ? 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-pink-50/50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="relative shrink-0">
                        <span className="text-base">{room.icon || '💬'}</span>
                        {presence?.isOnline && (
                          <span
                            className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 border border-slate-900 ring-1 ring-emerald-400 animate-pulse"
                            title="Active now"
                          />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className={`text-xs block truncate ${
                            isMidnight ? 'text-slate-200 font-bold' : (hasUnread ? 'font-bold text-slate-900' : 'font-bold text-slate-800')
                          }`}>
                            {room.name}
                          </span>
                          {presence?.isOnline && (
                            <span className="text-[9px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/50 px-1 py-0.2 rounded-full">
                              Active
                            </span>
                          )}
                        </div>
                        <span className={`text-[10px] truncate block ${
                          hasUnread 
                            ? (isMidnight ? 'text-blue-400 font-semibold' : 'text-rose-600 font-semibold') 
                            : 'text-slate-400'
                        }`}>
                          {room.lastMessage || 'Direct chat'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {/* Counter Badge for Unread Messages in DM */}
                      {hasUnread && (
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] text-white font-extrabold shadow-sm animate-pulse ${
                            isMidnight ? 'bg-gradient-to-r from-blue-600 to-cyan-500' : 'bg-gradient-to-r from-rose-500 to-pink-500'
                          }`}
                          title={`${room.unreadCount} unread message${room.unreadCount === 1 ? '' : 's'}`}
                        >
                          {room.unreadCount! > 99 ? '99+' : room.unreadCount}
                        </span>
                      )}

                      <button
                        onClick={(e) => handleDeleteRoom(e, room.id, room.name)}
                        className={`opacity-0 group-hover:opacity-100 p-1 rounded-lg transition-all ${
                          isMidnight ? 'text-slate-400 hover:text-rose-400 hover:bg-slate-800' : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                        }`}
                        title="Delete Chat"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* 3. My Buddies List */}
        <div>
          <div className="flex items-center justify-between px-2 mb-1.5">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              My Buddies ({buddies.length})
            </span>
            <button
              onClick={() => {
                sounds.playClick();
                setShowFindBuddyModal(true);
              }}
              className={`text-[10px] font-bold hover:underline ${
                isMidnight ? 'text-blue-400' : 'text-pink-600'
              }`}
            >
              + Add
            </button>
          </div>

          <div className="space-y-1">
            {buddies.length === 0 ? (
              <div className={`p-3 rounded-2xl border text-center ${
                isMidnight ? 'bg-slate-900/60 border-slate-800' : 'bg-pink-50/40 border-pink-100/60'
              }`}>
                <p className="text-[11px] text-slate-400">No buddies added yet.</p>
                <button
                  onClick={() => setShowFindBuddyModal(true)}
                  className={`mt-1 text-[11px] font-bold hover:underline ${
                    isMidnight ? 'text-blue-400' : 'text-pink-600'
                  }`}
                >
                  Search with User ID
                </button>
              </div>
            ) : (
              buddies.map((buddy) => {
                const presence = getUserPresence(buddy, false, isOnline, currentUser, activeUsers);
                return (
                  <div
                    key={buddy.id}
                    onClick={() => handleStartDM(buddy)}
                    className={`w-full flex items-center justify-between p-2 rounded-2xl transition-colors cursor-pointer group ${
                      isMidnight ? 'hover:bg-slate-800/80' : 'hover:bg-pink-50/70'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="relative shrink-0">
                        <CuteAvatar
                          id={buddy.avatarId}
                          customUrl={buddy.customAvatarUrl}
                          size="sm"
                        />
                        <span
                          className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 ${
                            isMidnight ? 'border-slate-900' : 'border-white'
                          } ${
                            presence.isOnline
                              ? 'bg-emerald-500 ring-1 ring-emerald-300 animate-pulse'
                              : presence.isIdle
                              ? 'bg-amber-400'
                              : 'bg-slate-400'
                          }`}
                          title={presence.label}
                        />
                      </div>
                      <div className="min-w-0 text-left">
                        <div className="flex items-center gap-1">
                          <span className={`text-xs font-bold truncate ${isMidnight ? 'text-slate-200' : 'text-slate-800'}`}>
                            {buddy.name}
                          </span>
                          <span className="text-[11px]">{buddy.moodEmoji}</span>
                        </div>
                        <span className={`text-[10px] truncate block ${
                          presence.isOnline ? 'text-emerald-400 font-semibold' : 'text-slate-400'
                        }`}>
                          {presence.label}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartDM(buddy);
                      }}
                      className={`p-1.5 rounded-xl text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity ${
                        isMidnight ? 'bg-slate-800 text-blue-400 hover:bg-slate-700' : 'bg-pink-100/60 text-pink-700 hover:bg-pink-200'
                      }`}
                      title="Send Direct Message"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Sidebar Footer User Card & Log Out Button */}
      {currentUser && (
        <div className={`p-3 border-t flex flex-col gap-2 ${
          isMidnight ? 'border-slate-800 bg-slate-900/80' : 'border-pink-100 bg-white/70'
        }`}>
          <div
            onClick={() => {
              sounds.playClick();
              setShowProfileModal(true);
            }}
            className={`flex items-center justify-between p-2 rounded-2xl transition-colors cursor-pointer ${
              isMidnight ? 'hover:bg-slate-800' : 'hover:bg-pink-50'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <CuteAvatar
                id={currentUser.avatarId}
                customUrl={currentUser.customAvatarUrl}
                size="sm"
              />
              <div className="min-w-0 text-left">
                <span className={`text-xs font-bold truncate block ${isMidnight ? 'text-slate-100' : 'text-slate-800'}`}>
                  {currentUser.name}
                </span>
                <span className={`text-[10px] truncate block ${isMidnight ? 'text-blue-400' : 'text-pink-600'}`}>
                  {currentUser.moodEmoji} {currentUser.moodText || 'Chilling'}
                </span>
              </div>
            </div>

            <Sparkles className={`w-3.5 h-3.5 shrink-0 ${isMidnight ? 'text-blue-400' : 'text-pink-400'}`} />
          </div>

          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              if (onCloseMobile) onCloseMobile();
              handleSignOut();
            }}
            className={`w-full flex items-center justify-center gap-2 py-2 px-3 font-bold text-xs rounded-2xl border shadow-2xs transition-all active:scale-98 ${
              isMidnight
                ? 'bg-slate-800/80 hover:bg-rose-950/40 text-rose-400 border-slate-700/60'
                : 'bg-rose-50 hover:bg-rose-100/80 text-rose-700 border-rose-200/60'
            }`}
            title="Log Out of MochiChat"
          >
            <LogOut className="w-3.5 h-3.5 text-rose-400" />
            <span>Log Out</span>
          </button>
        </div>
      )}
    </aside>
  );
};
