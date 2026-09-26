import React, { useState } from 'react';
import { useChat } from '../context/ChatContext';
import { CuteAvatar } from '../utils/avatars';
import {
  X,
  Pin,
  Users,
  Image as ImageIcon,
  MessageCircle,
  CheckCircle2,
  Trash2,
  UserPlus,
  UserMinus,
} from 'lucide-react';
import { sounds } from '../utils/sound';
import { getUserPresence } from '../utils/presence';

export const MembersPanel: React.FC = () => {
  const {
    showMembersPanel,
    setShowMembersPanel,
    currentRoom,
    activeUsers,
    messages,
    startDirectMessage,
    currentUser,
    togglePinMessage,
    deleteChannel,
    isBuddy,
    addBuddy,
    removeBuddy,
    isOnline,
    theme,
  } = useChat();

  const isMidnight = theme === 'midnight';
  const [activeTab, setActiveTab] = useState<'members' | 'pinned' | 'media'>('members');

  if (!showMembersPanel) return null;

  const pinnedMessages = messages.filter((m) => m.isPinned);
  const mediaMessages = messages.filter(
    (m) => m.type === 'image' || m.type === 'sticker' || m.type === 'voice'
  );

  const handleDeleteThisRoom = async () => {
    if (!currentRoom) return;
    if (window.confirm(`Delete channel "${currentRoom.name}" and remove all messages?`)) {
      await deleteChannel(currentRoom.id);
      setShowMembersPanel(false);
    }
  };

  return (
    <aside className={`w-80 flex flex-col h-full z-20 shadow-sm animate-in slide-in-from-right-4 duration-200 border-l ${
      isMidnight ? 'bg-[#111821] border-slate-800 text-slate-200' : 'bg-white/95 backdrop-blur-md border-pink-100'
    }`}>
      {/* Header */}
      <div className={`flex items-center justify-between px-4 py-3.5 border-b ${
        isMidnight ? 'border-slate-800' : 'border-pink-100'
      }`}>
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-lg">{currentRoom?.icon || (isMidnight ? '⚡' : '🌸')}</span>
          <div className="min-w-0">
            <h3 className={`text-xs font-bold tracking-tight truncate max-w-[150px] ${
              isMidnight ? 'text-slate-100' : 'text-slate-800'
            }`}>
              {currentRoom?.name || 'Channel Details'}
            </h3>
            <span className={`text-[10px] font-semibold block ${isMidnight ? 'text-blue-400' : 'text-pink-600'}`}>
              {currentRoom?.type === 'direct' ? 'Direct Chat' : 'Group Chat'}
            </span>
          </div>
        </div>
        <button
          onClick={() => setShowMembersPanel(false)}
          className={`p-1 rounded-full transition-colors ${
            isMidnight ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-400 hover:text-slate-700 hover:bg-pink-50'
          }`}
          title="Close details"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Description & Channel Actions */}
      <div className={`px-4 py-2.5 border-b flex items-center justify-between gap-2 ${
        isMidnight ? 'bg-slate-900/60 border-slate-800 text-slate-300' : 'bg-pink-50/40 border-pink-100/60 text-slate-600'
      }`}>
        <p className="text-xs leading-relaxed truncate">
          {currentRoom?.description || 'No description provided'}
        </p>
        {currentRoom && (
          <button
            onClick={handleDeleteThisRoom}
            className={`flex items-center gap-1 px-2 py-1 rounded-xl text-[10px] font-bold shrink-0 transition-colors ${
              isMidnight ? 'bg-slate-800 hover:bg-rose-950/60 text-rose-400 border border-slate-700' : 'bg-white hover:bg-rose-50 text-rose-600 border border-rose-200/80'
            }`}
            title="Delete this channel"
          >
            <Trash2 className="w-3 h-3 text-rose-400" />
            <span>Delete</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className={`flex items-center p-2 border-b gap-1 ${
        isMidnight ? 'bg-slate-900/40 border-slate-800' : 'bg-slate-50/50 border-pink-100'
      }`}>
        <button
          onClick={() => {
            sounds.playClick();
            setActiveTab('members');
          }}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-xl transition-all ${
            activeTab === 'members'
              ? isMidnight ? 'bg-slate-800 text-blue-400 shadow-2xs' : 'bg-white text-rose-600 shadow-2xs'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Members</span>
        </button>

        <button
          onClick={() => {
            sounds.playClick();
            setActiveTab('pinned');
          }}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-xl transition-all ${
            activeTab === 'pinned'
              ? isMidnight ? 'bg-slate-800 text-blue-400 shadow-2xs' : 'bg-white text-rose-600 shadow-2xs'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Pin className="w-3.5 h-3.5" />
          <span>Pins ({pinnedMessages.length})</span>
        </button>

        <button
          onClick={() => {
            sounds.playClick();
            setActiveTab('media');
          }}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-xl transition-all ${
            activeTab === 'media'
              ? isMidnight ? 'bg-slate-800 text-blue-400 shadow-2xs' : 'bg-white text-rose-600 shadow-2xs'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <ImageIcon className="w-3.5 h-3.5" />
          <span>Media</span>
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-3 scrollbar-thin">
        {activeTab === 'members' && (
          <div className="space-y-2">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2">
              Members & Buddies
            </div>
            {activeUsers.map((user) => {
              const isSelf = user.id === currentUser?.id;
              const buddyStatus = isBuddy(user.id);
              const presence = getUserPresence(user, isSelf, isOnline, currentUser, activeUsers);
              return (
                <div
                  key={user.id}
                  className={`flex items-center justify-between p-2 rounded-2xl transition-colors group ${
                    isMidnight ? 'hover:bg-slate-800/80' : 'hover:bg-pink-50/70'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="relative">
                      <CuteAvatar id={user.avatarId} customUrl={user.customAvatarUrl} size="sm" />
                      <span
                        className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 border-2 rounded-full ${
                          isMidnight ? 'border-slate-900' : 'border-white'
                        } ${
                          presence.isOnline
                            ? 'bg-emerald-500 ring-1 ring-emerald-400 animate-pulse'
                            : presence.isIdle
                            ? 'bg-amber-400'
                            : 'bg-slate-500'
                        }`}
                        title={presence.label}
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`text-xs font-bold truncate ${isMidnight ? 'text-slate-200' : 'text-slate-800'}`}>
                          {user.name}
                        </span>
                        {isSelf && (
                          <span className={`text-[10px] font-medium ${isMidnight ? 'text-blue-400' : 'text-pink-600'}`}>(you)</span>
                        )}
                        {user.emailVerified && (
                          <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                        )}
                        {presence.isOnline ? (
                          <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
                            isMidnight ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/60' : 'bg-emerald-50 text-emerald-600 border border-emerald-200/50'
                          }`}>
                            Active
                          </span>
                        ) : !isSelf ? (
                          <span className={`text-[9px] font-medium px-1.5 py-0.2 rounded-full border ${
                            isMidnight ? 'bg-slate-800/80 text-slate-400 border-slate-700' : 'bg-slate-100/80 text-slate-500 border-slate-200/60'
                          }`}>
                            {presence.label}
                          </span>
                        ) : null}
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-slate-400 truncate">
                        <span>{user.moodEmoji}</span>
                        <span className="truncate">@{user.username}</span>
                      </div>
                    </div>
                  </div>

                  {!isSelf && (
                    <div className="flex items-center gap-1 shrink-0">
                      {buddyStatus ? (
                        <button
                          onClick={async () => {
                            if (window.confirm(`Delete ${user.name} from your buddies?`)) {
                              sounds.playClick();
                              await removeBuddy(user.id);
                            }
                          }}
                          className={`p-1.5 rounded-xl ${isMidnight ? 'text-slate-400 hover:text-rose-400 hover:bg-slate-800' : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'}`}
                          title="Delete Friend"
                        >
                          <UserMinus className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <button
                          onClick={() => addBuddy(user)}
                          className={`p-1.5 rounded-xl ${isMidnight ? 'text-blue-400 hover:bg-slate-800' : 'text-rose-500 hover:bg-pink-100'}`}
                          title="Add Buddy"
                        >
                          <UserPlus className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => {
                          sounds.playClick();
                          startDirectMessage(user);
                        }}
                        className={`p-1.5 rounded-xl text-xs flex items-center gap-1 shadow-2xs transition-all ${
                          isMidnight ? 'bg-slate-800 text-blue-400 hover:bg-slate-700' : 'bg-pink-100 text-pink-600 hover:bg-pink-200'
                        }`}
                        title="Direct Chat"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'pinned' && (
          <div className="space-y-2.5">
            {pinnedMessages.length === 0 ? (
              <div className="text-center py-10 px-4">
                <span className="text-2xl">📌</span>
                <p className={`text-xs font-semibold mt-2 ${isMidnight ? 'text-slate-300' : 'text-slate-600'}`}>No pinned messages yet</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Hover over any message and click the pin icon to keep memories saved here.
                </p>
              </div>
            ) : (
              pinnedMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`p-3 border rounded-2xl relative group ${
                    isMidnight ? 'bg-slate-900 border-slate-800 text-slate-200' : 'bg-pink-50/60 border-pink-100/80 text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`text-xs font-bold truncate ${isMidnight ? 'text-slate-100' : 'text-slate-800'}`}>
                      {msg.senderName}
                    </span>
                    <button
                      onClick={() => togglePinMessage(msg.id)}
                      className={`text-[11px] font-medium hover:underline ${isMidnight ? 'text-blue-400' : 'text-rose-500'}`}
                    >
                      Unpin
                    </button>
                  </div>
                  <p className="text-xs leading-snug line-clamp-3">
                    {msg.type === 'sticker' ? '🎨 Sent a sticker' : msg.content}
                  </p>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'media' && (
          <div className="space-y-3">
            {mediaMessages.length === 0 ? (
              <div className="text-center py-10 px-4">
                <span className="text-2xl">🖼️</span>
                <p className={`text-xs font-semibold mt-2 ${isMidnight ? 'text-slate-300' : 'text-slate-600'}`}>No media shared yet</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Send stickers, photos, or voice notes to populate this gallery!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {mediaMessages.map((m) => (
                  <div
                    key={m.id}
                    className={`aspect-square border rounded-2xl overflow-hidden p-2 flex flex-col items-center justify-center shadow-2xs transition-colors ${
                      isMidnight ? 'bg-slate-900 border-slate-800 hover:bg-slate-800' : 'bg-slate-50 border-pink-100 hover:bg-pink-50/50'
                    }`}
                  >
                    {m.type === 'image' && m.attachmentUrl ? (
                      <img
                        src={m.attachmentUrl}
                        alt="attachment"
                        className="w-full h-full object-cover rounded-xl"
                      />
                    ) : m.type === 'sticker' ? (
                      <div className="flex flex-col items-center">
                        <span className="text-2xl">🎨</span>
                        <span className="text-[10px] text-slate-400 font-medium mt-1 truncate max-w-full">
                          {m.content}
                        </span>
                      </div>
                    ) : (
                      <div className={`flex flex-col items-center ${isMidnight ? 'text-blue-400' : 'text-rose-500'}`}>
                        <span className="text-xl">🎙️</span>
                        <span className="text-[10px] font-mono mt-1">{m.audioDuration || 3}s</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
};
