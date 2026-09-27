import React, { useState } from 'react';
import { useChat } from '../context/ChatContext';
import { CuteAvatar } from '../utils/avatars';
import { THEMES, CHAT_PATTERNS } from '../utils/theme';
import { ChatPattern, ChatMessage, UserProfile } from '../types/chat';
import {
  X,
  Image as ImageIcon,
  FileText,
  Link as LinkIcon,
  Palette,
  Clock,
  Star,
  Pin,
  UserPlus,
  Ban,
  ChevronRight,
  Sparkles,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';
import { sounds } from '../utils/sound';
import { getUserPresence } from '../utils/presence';
import { canViewProfile } from '../utils/privacy';

interface ConversationInfoDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenImageModal?: (imageUrl: string) => void;
}

export const ConversationInfoDrawer: React.FC<ConversationInfoDrawerProps> = ({
  isOpen,
  onClose,
  onOpenImageModal,
}) => {
  const {
    currentRoom,
    messages,
    currentUser,
    activeUsers,
    groupRooms,
    isOnline,
    theme,
    togglePinRoom,
    toggleFavoriteRoom,
    isRoomPinned,
    isRoomFavorite,
    setRoomTheme,
    setRoomTemporaryChat,
    toggleBlockUser,
    isBlocked,
    setShowProfileModal,
    setSelectedProfileUser,
    simiTheme,
    showToast,
  } = useChat();

  const [activeTab, setActiveTab] = useState<'info' | 'media' | 'docs' | 'links' | 'theme'>('info');

  if (!isOpen || !currentRoom || !currentUser) return null;

  const isMidnight = simiTheme.isMale;
  const isDirect = currentRoom.type === 'direct' || currentRoom.isDirect;

  // Direct DM Target user
  const targetUserId = isDirect
    ? currentRoom.participantIds?.find((id) => id !== currentUser.id)
    : undefined;

  const targetUser: UserProfile | undefined = targetUserId
    ? activeUsers.find((u) => u.id === targetUserId)
    : undefined;

  const presence = targetUser
    ? getUserPresence(targetUser, false, isOnline, currentUser, activeUsers)
    : null;

  const userBlocked = targetUserId ? isBlocked(targetUserId) : false;
  const isPinned = isRoomPinned(currentRoom.id);
  const isFavorite = isRoomFavorite(currentRoom.id);

  // Active room conversation theme
  const customRoomTheme = currentRoom.chatThemeByUser?.[currentUser.id] as ChatPattern | undefined;

  // Filter messages for current room (exclude expired messages)
  const now = Date.now();
  const roomMessages = messages.filter((m) => {
    if (m.roomId !== currentRoom.id) return false;
    if (m.expiresAt && now > m.expiresAt) return false;
    return true;
  });

  // 1. Media messages (Image type or has attachmentUrl)
  const mediaMessages = roomMessages.filter(
    (m) => m.type === 'image' || (m.attachmentUrl && m.attachmentUrl.match(/\.(jpeg|jpg|gif|png|webp)/i))
  );

  // 2. Doc messages (Doc type or non-image attachments)
  const docMessages = roomMessages.filter(
    (m) => m.type === 'doc' || (m.attachmentUrl && !m.attachmentUrl.match(/\.(jpeg|jpg|gif|png|webp)/i))
  );

  // 3. Link messages (Regex search inside content)
  const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/gi;
  const linkMessages: { message: ChatMessage; url: string }[] = [];
  roomMessages.forEach((m) => {
    if (m.content) {
      const matches = m.content.match(urlRegex);
      if (matches) {
        matches.forEach((u) => linkMessages.push({ message: m, url: u }));
      }
    }
  });

  const handleOpenProfile = () => {
    if (!targetUser) return;
    sounds.playClick();
    if (canViewProfile(targetUser, currentUser, activeUsers)) {
      setSelectedProfileUser(targetUser);
      setShowProfileModal(true);
    } else {
      showToast(`@${targetUser.username}'s profile is private.`, 'info');
    }
  };

  const handleTogglePin = async () => {
    sounds.playClick();
    await togglePinRoom(currentRoom.id);
  };

  const handleToggleFavorite = async () => {
    sounds.playClick();
    await toggleFavoriteRoom(currentRoom.id);
  };

  const handleToggleBlock = async () => {
    if (!targetUser) return;
    sounds.playClick();
    const actionName = userBlocked ? 'unblock' : 'block';
    if (window.confirm(`Are you sure you want to ${actionName} ${targetUser.name}?`)) {
      await toggleBlockUser(targetUser.id);
    }
  };

  const handleSelectChatTheme = async (patKey: ChatPattern) => {
    sounds.playReaction();
    await setRoomTheme(currentRoom.id, patKey);
  };

  const handleSetTemporaryChat = async (durationSec: number) => {
    sounds.playClick();
    const enabled = durationSec > 0;
    await setRoomTemporaryChat(currentRoom.id, enabled, durationSec);
  };

  const currentTempDuration = currentRoom.temporaryChat?.enabled
    ? currentRoom.temporaryChat.durationSeconds || 86400
    : 0;

  return (
    <div className={`fixed inset-y-0 right-0 z-50 w-full sm:w-96 shadow-2xl border-l flex flex-col animate-in slide-in-from-right duration-200 ${
      isMidnight ? 'bg-[#111821] border-slate-800 text-slate-100' : 'bg-white border-pink-100 text-slate-800'
    }`}>
      {/* Header */}
      <div className={`p-4 border-b flex items-center justify-between shrink-0 ${
        isMidnight ? 'bg-slate-900 border-slate-800 text-white' : 'bg-pink-50/70 border-pink-100 text-slate-800'
      }`}>
        <div className="flex items-center gap-2">
          <h3 className="font-extrabold text-sm tracking-tight">Conversation Info</h3>
        </div>
        <button
          onClick={() => {
            sounds.playClick();
            onClose();
          }}
          className={`p-1.5 rounded-full transition-colors ${
            isMidnight ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-slate-200/50 text-slate-600'
          }`}
          title="Close drawer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Drawer Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 scrollbar-thin">
        {/* User / Group Overview Card */}
        <div className={`p-4 rounded-3xl border flex flex-col items-center text-center relative overflow-hidden ${
          isMidnight ? 'bg-slate-900/90 border-slate-800 text-slate-100' : 'bg-slate-50/90 border-slate-200/80 text-slate-800'
        }`}>
          {isDirect && targetUser ? (
            <>
              <div
                onClick={handleOpenProfile}
                className="relative cursor-pointer group mb-2"
                title="View Profile"
              >
                <CuteAvatar
                  id={targetUser.avatarId}
                  customUrl={targetUser.customAvatarUrl}
                  size="lg"
                  className="ring-4 ring-pink-200 shadow-md transition-transform group-hover:scale-105"
                />
                {presence?.isOnline && (
                  <span className="absolute -top-1 -left-1 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-2 ring-white animate-pulse" />
                )}
              </div>
              <h4
                onClick={handleOpenProfile}
                className={`font-bold text-sm cursor-pointer transition-colors ${
                  isMidnight ? 'text-slate-100 hover:text-blue-400' : 'text-slate-800 hover:text-pink-600'
                }`}
              >
                {targetUser.name}
              </h4>
              <p className="text-xs text-slate-400">@{targetUser.username}</p>
              <span className={`mt-2 text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                presence?.isOnline
                  ? isMidnight ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-emerald-100 text-emerald-700'
                  : isMidnight ? 'bg-slate-800 text-slate-400' : 'bg-slate-200 text-slate-600'
              }`}>
                {presence?.label || 'Offline'}
              </span>
            </>
          ) : (
            <>
              <div className="w-16 h-16 rounded-3xl bg-pink-100 flex items-center justify-center text-3xl mb-2 shadow-inner border border-pink-200">
                {currentRoom.icon}
              </div>
              <h4 className={`font-bold text-sm ${isMidnight ? 'text-slate-100' : 'text-slate-800'}`}>{currentRoom.name}</h4>
              <p className="text-xs text-slate-400 mt-0.5">{currentRoom.description || 'Group Conversation'}</p>
              <span className={`mt-2 text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                isMidnight ? 'bg-blue-950 text-blue-300 border border-blue-800' : 'bg-pink-100 text-pink-700'
              }`}>
                {currentRoom.participantIds?.length || 0} Members
              </span>
            </>
          )}
        </div>

        {/* Navigation Tabs */}
        <div className={`grid grid-cols-4 gap-1 p-1 rounded-2xl text-xs font-bold ${
          isMidnight ? 'bg-slate-900 text-slate-300 border border-slate-800' : 'bg-slate-100 text-slate-600'
        }`}>
          <button
            onClick={() => setActiveTab('info')}
            className={`py-1.5 rounded-xl transition-all ${
              activeTab === 'info'
                ? isMidnight ? 'bg-slate-800 text-blue-400 shadow-2xs' : 'bg-white text-slate-900 shadow-2xs'
                : isMidnight ? 'hover:bg-slate-800/50 text-slate-400' : 'hover:bg-slate-200/60'
            }`}
          >
            Options
          </button>
          <button
            onClick={() => setActiveTab('media')}
            className={`py-1.5 rounded-xl transition-all ${
              activeTab === 'media'
                ? isMidnight ? 'bg-slate-800 text-blue-400 shadow-2xs' : 'bg-white text-slate-900 shadow-2xs'
                : isMidnight ? 'hover:bg-slate-800/50 text-slate-400' : 'hover:bg-slate-200/60'
            }`}
          >
            Media ({mediaMessages.length})
          </button>
          <button
            onClick={() => setActiveTab('docs')}
            className={`py-1.5 rounded-xl transition-all ${
              activeTab === 'docs'
                ? isMidnight ? 'bg-slate-800 text-blue-400 shadow-2xs' : 'bg-white text-slate-900 shadow-2xs'
                : isMidnight ? 'hover:bg-slate-800/50 text-slate-400' : 'hover:bg-slate-200/60'
            }`}
          >
            Docs ({docMessages.length})
          </button>
          <button
            onClick={() => setActiveTab('links')}
            className={`py-1.5 rounded-xl transition-all ${
              activeTab === 'links'
                ? isMidnight ? 'bg-slate-800 text-blue-400 shadow-2xs' : 'bg-white text-slate-900 shadow-2xs'
                : isMidnight ? 'hover:bg-slate-800/50 text-slate-400' : 'hover:bg-slate-200/60'
            }`}
          >
            Links ({linkMessages.length})
          </button>
        </div>

        {/* Tab 1: Options & Actions */}
        {activeTab === 'info' && (
          <div className="space-y-4">
            {/* Quick Actions Card */}
            <div className={`p-3 rounded-3xl space-y-2 shadow-2xs border ${
              isMidnight ? 'bg-slate-900/90 border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-700'
            }`}>
              <button
                onClick={handleTogglePin}
                className={`w-full flex items-center justify-between p-2.5 rounded-2xl transition-colors text-xs font-semibold ${
                  isMidnight ? 'hover:bg-slate-800 text-slate-200' : 'hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Pin className={`w-4 h-4 ${isPinned ? 'text-amber-500 fill-amber-500' : 'text-slate-400'}`} />
                  <span>{isPinned ? 'Unpin Conversation' : 'Pin Conversation'}</span>
                </div>
                {isPinned && <span className="text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full">Pinned</span>}
              </button>

              <button
                onClick={handleToggleFavorite}
                className={`w-full flex items-center justify-between p-2.5 rounded-2xl transition-colors text-xs font-semibold ${
                  isMidnight ? 'hover:bg-slate-800 text-slate-200' : 'hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Star className={`w-4 h-4 ${isFavorite ? 'text-amber-500 fill-amber-500' : 'text-slate-400'}`} />
                  <span>{isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}</span>
                </div>
                {isFavorite && <span className="text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full">Favorite</span>}
              </button>
            </div>

            {/* Conversation Theme Selector */}
            <div className={`p-3 rounded-3xl space-y-2 shadow-2xs border ${
              isMidnight ? 'bg-slate-900/90 border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-700'
            }`}>
              <span className={`text-xs font-bold flex items-center gap-1.5 px-1 ${
                isMidnight ? 'text-slate-100' : 'text-slate-800'
              }`}>
                <Palette className="w-4 h-4 text-pink-500" />
                <span>Chat Design</span>
              </span>

              <div className="grid grid-cols-2 gap-1.5 pt-1">
                {(Object.keys(CHAT_PATTERNS) as ChatPattern[]).slice(0, 6).map((patKey) => {
                  const pat = CHAT_PATTERNS[patKey];
                  const isSelected = customRoomTheme === patKey;
                  return (
                    <button
                      key={patKey}
                      onClick={() => handleSelectChatTheme(patKey)}
                      className={`p-2 rounded-2xl border text-left flex items-center gap-2 transition-all ${
                        isSelected ? 'border-pink-500 bg-pink-50 text-pink-700 font-bold' : 'border-slate-100 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <span className="text-base">{pat.icon}</span>
                      <span className="text-[11px] truncate">{pat.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Temporary Chat Settings */}
            <div className="p-3 bg-white border border-slate-200 rounded-3xl space-y-2 shadow-2xs">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-pink-500" />
                  <span>Temporary Chat</span>
                </span>
                {currentTempDuration > 0 && (
                  <span className="text-[10px] font-bold text-pink-700 bg-pink-50 px-2 py-0.5 rounded-full">
                    Active
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-1.5 pt-1">
                {[
                  { sec: 0, label: 'Off' },
                  { sec: 3600, label: '1 Hour' },
                  { sec: 86400, label: '24 Hours' },
                  { sec: 604800, label: '7 Days' },
                ].map((opt) => (
                  <button
                    key={opt.sec}
                    onClick={() => handleSetTemporaryChat(opt.sec)}
                    className={`p-2 rounded-2xl border text-xs font-semibold transition-all ${
                      currentTempDuration === opt.sec
                        ? 'border-pink-500 bg-pink-50 text-pink-700 font-bold'
                        : 'border-slate-100 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Destructive Section: Block User */}
            {isDirect && targetUser && (
              <div className="p-3 bg-rose-50/50 border border-rose-100 rounded-3xl space-y-2">
                <span className="text-xs font-bold text-rose-700 flex items-center gap-1.5 px-1">
                  <ShieldAlert className="w-4 h-4 text-rose-500" />
                  <span>Privacy & Controls</span>
                </span>

                <button
                  onClick={handleToggleBlock}
                  className={`w-full flex items-center justify-center gap-2 p-2.5 rounded-2xl text-xs font-bold transition-all ${
                    userBlocked
                      ? 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-sm'
                      : 'bg-rose-500 text-white hover:bg-rose-600 shadow-sm'
                  }`}
                >
                  <Ban className="w-4 h-4" />
                  <span>{userBlocked ? `Unblock ${targetUser.name}` : `Block ${targetUser.name}`}</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Media */}
        {activeTab === 'media' && (
          <div className="space-y-3">
            {mediaMessages.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                <ImageIcon className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-500">No media shared in this chat yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {mediaMessages.map((msg) => (
                  <div
                    key={msg.id}
                    onClick={() => {
                      if (onOpenImageModal && (msg.attachmentUrl || msg.content)) {
                        onOpenImageModal(msg.attachmentUrl || msg.content);
                      }
                    }}
                    className="aspect-square rounded-2xl overflow-hidden border border-slate-200 cursor-pointer hover:opacity-90 transition-opacity bg-slate-100"
                  >
                    <img
                      src={msg.attachmentUrl || msg.content}
                      alt="Media attachment"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Docs */}
        {activeTab === 'docs' && (
          <div className="space-y-2">
            {docMessages.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-500">No documents shared in this chat yet.</p>
              </div>
            ) : (
              docMessages.map((msg) => (
                <a
                  key={msg.id}
                  href={msg.attachmentUrl || '#'}
                  target="_blank"
                  rel="noreferrer"
                  className="p-3 bg-white border border-slate-200 rounded-2xl flex items-center justify-between hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <FileText className="w-5 h-5 text-pink-500 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate">{msg.fileName || 'Document'}</p>
                      <p className="text-[10px] text-slate-400">
                        {new Date(msg.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-slate-400 shrink-0" />
                </a>
              ))
            )}
          </div>
        )}

        {/* Tab 4: Links */}
        {activeTab === 'links' && (
          <div className="space-y-2">
            {linkMessages.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                <LinkIcon className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-500">No web links shared in this chat yet.</p>
              </div>
            ) : (
              linkMessages.map((item, idx) => (
                <a
                  key={idx}
                  href={item.url.startsWith('http') ? item.url : `https://${item.url}`}
                  target="_blank"
                  rel="noreferrer"
                  className="p-3 bg-white border border-slate-200 rounded-2xl flex items-center justify-between hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <LinkIcon className="w-5 h-5 text-blue-500 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-blue-600 truncate">{item.url}</p>
                      <p className="text-[10px] text-slate-400">
                        Shared by {item.message.senderName} · {new Date(item.message.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-slate-400 shrink-0" />
                </a>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
