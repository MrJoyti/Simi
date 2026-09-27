import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '../context/ChatContext';
import { CuteAvatar } from '../utils/avatars';
import { THEMES, CHAT_PATTERNS, resolveSimiTheme } from '../utils/theme';
import { CUTE_STICKERS } from '../utils/stickers';
import { VoiceNotePlayer } from './VoiceNotePlayer';
import { StickerItem, ChatMessage } from '../types/chat';
import {
  Reply,
  Pin,
  Trash2,
  Check,
  CheckCheck,
  Download,
  X,
  WifiOff,
  Search,
  MessageCircle,
} from 'lucide-react';
import { sounds } from '../utils/sound';

const QUICK_REACTIONS = ['👍', '❤️', '🔥', '🎉', '😊', '👏'];

export const MessageList: React.FC = () => {
  const {
    messages,
    currentUser,
    reactToMessage,
    deleteMessage,
    togglePinMessage,
    replyingTo,
    setReplyingTo,
    searchQuery,
    theme,
    chatPattern,
    currentRoom,
    typingUsers,
    isOnline,
  } = useChat();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const { isFemale, isMale } = resolveSimiTheme(currentUser);
  const activeTheme = isFemale ? THEMES.strawberry : (THEMES[theme] || THEMES.strawberry);
  const activePattern = CHAT_PATTERNS[chatPattern] || CHAT_PATTERNS.mochi_dots;

  // Long press timer ref for mobile touch devices
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const touchMovedRef = useRef<boolean>(false);

  // Auto-scroll to bottom on new messages or typing events
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, typingUsers.length]);

  // Filter messages based on search query
  const filteredMessages = messages.filter((msg) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      msg.content.toLowerCase().includes(q) ||
      msg.senderName.toLowerCase().includes(q)
    );
  });

  const getSticker = (id: string) => CUTE_STICKERS.find((s: StickerItem) => s.id === id);

  // Trigger reply action with sound
  const handleReplyMessage = (msg: ChatMessage) => {
    sounds.playClick();
    setReplyingTo({
      id: msg.id,
      senderName: msg.senderName,
      text:
        msg.type === 'sticker'
          ? 'Sticker'
          : msg.type === 'voice'
          ? 'Voice note'
          : msg.type === 'image'
          ? (msg.content || 'Photo')
          : msg.content,
      type: msg.type,
    });
  };

  // Touch handlers for mobile long-press
  const handleTouchStart = (msg: ChatMessage) => {
    touchMovedRef.current = false;
    longPressTimerRef.current = setTimeout(() => {
      if (!touchMovedRef.current) {
        handleReplyMessage(msg);
        if (navigator.vibrate) {
          navigator.vibrate(40);
        }
      }
    }, 500);
  };

  const handleTouchMove = () => {
    touchMovedRef.current = true;
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const handleTouchEnd = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const isMidnight = isMale && theme === 'midnight';

  return (
    <div
      className="flex-1 overflow-y-auto px-3 sm:px-6 py-4 space-y-3.5 scrollbar-thin transition-all duration-300"
      style={{
        backgroundImage: activePattern.backgroundImage !== 'none' ? activePattern.backgroundImage : undefined,
        backgroundSize: activePattern.backgroundSize || undefined,
        backgroundColor: isFemale ? '#FFF7F9' : activeTheme.bodyBg,
      }}
    >
      {/* Offline Alert Pill */}
      {!isOnline && (
        <div className={`flex items-center justify-center gap-2 p-2 rounded-2xl border text-xs font-medium shadow-2xs backdrop-blur-xs max-w-sm mx-auto mb-2 animate-in fade-in ${
          isMidnight ? 'bg-amber-950/80 border-amber-800 text-amber-300' : 'bg-amber-50/90 border-amber-200/90 text-amber-900'
        }`}>
          <WifiOff className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          <span>Offline · Viewing cached chat history</span>
        </div>
      )}

      {filteredMessages.length === 0 ? (
        <div className="h-full flex flex-col items-center justify-center text-center p-6 select-none opacity-80">
          <div className={`w-16 h-16 rounded-3xl flex items-center justify-center mb-3 shadow-inner ${
            isMidnight ? 'bg-slate-800/80 text-blue-400' : 'bg-pink-100/70 text-rose-500'
          }`}>
            {searchQuery ? <Search className="w-8 h-8" /> : <MessageCircle className="w-8 h-8" />}
          </div>
          <h3 className={`text-sm font-bold ${isMidnight ? 'text-slate-200' : 'text-slate-700'}`}>
            {searchQuery ? 'No matching messages found' : 'The chat is peaceful & quiet'}
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-xs">
            {searchQuery
              ? 'Try searching with a different word or clear your search query.'
              : currentRoom?.type === 'direct'
              ? 'Send the first message to your buddy!'
              : 'Be the first to say hello in this channel!'}
          </p>
        </div>
      ) : (
        filteredMessages.map((msg, index) => {
          const isUser = msg.senderId === currentUser?.id;
          const isSticker = msg.type === 'sticker';
          const stickerObj = isSticker ? getSticker(msg.content) : null;
          const reactionKeys = Object.keys(msg.reactions || {});
          const isCurrentlyBeingRepliedTo = replyingTo?.id === msg.id;

          // In direct chats, check if the recipient has viewed/read this message
          const isDirectChat = currentRoom?.type === 'direct' || Boolean(currentRoom?.isDirect);
          const isReadByRecipient =
            isDirectChat &&
            isUser &&
            Boolean(
              msg.readBy &&
              msg.readBy.some((uid) => uid !== currentUser?.id)
            );

          // Group consecutive messages by same author
          const prevMsg = filteredMessages[index - 1];
          const isFirstFromAuthor =
            !prevMsg ||
            prevMsg.senderId !== msg.senderId ||
            msg.timestamp - prevMsg.timestamp > 300000;

          return (
            <div
              key={msg.id}
              onTouchStart={() => handleTouchStart(msg)}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onContextMenu={(e) => {
                e.preventDefault();
                handleReplyMessage(msg);
              }}
              className={`flex items-start gap-2.5 sm:gap-3 group/msg transition-all duration-200 rounded-3xl p-1 -m-1 ${
                isCurrentlyBeingRepliedTo ? (isMidnight ? 'bg-blue-950/40 ring-2 ring-blue-500 ring-offset-2' : 'bg-pink-100/40 ring-2 ring-pink-300 ring-offset-2') : ''
              } ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar Icon */}
              <div className="shrink-0 mt-0.5">
                {isFirstFromAuthor ? (
                  <CuteAvatar
                    id={msg.senderAvatar || 'bunny'}
                    customUrl={msg.senderCustomAvatar}
                    size="sm"
                  />
                ) : (
                  <div className="w-7 h-7 sm:w-8 sm:h-8" />
                )}
              </div>

              {/* Message Bubble & Metadata container */}
              <div
                className={`flex flex-col max-w-[82%] sm:max-w-[70%] min-w-0 ${
                  isUser ? 'items-end' : 'items-start'
                }`}
              >
                {/* Header (Author, Badge & Timestamp) */}
                {isFirstFromAuthor && (
                  <div
                    className={`flex items-center gap-1.5 mb-1 px-1 text-[11px] ${
                      isUser ? 'flex-row-reverse' : 'flex-row'
                    }`}
                  >
                    <span className={`font-bold truncate max-w-[120px] ${isMidnight ? 'text-slate-300' : 'text-slate-800'}`}>
                      {msg.senderName}
                    </span>
                    {msg.senderBadge && (
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-md font-medium ${
                        isMidnight ? 'bg-slate-800 text-blue-400' : 'bg-pink-100/80 text-pink-700'
                      }`}>
                        {msg.senderBadge}
                      </span>
                    )}
                    <span className="text-[10px] text-slate-400">
                      {new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    {msg.isPinned && (
                      <Pin className="w-2.5 h-2.5 text-amber-500 fill-amber-500" />
                    )}
                  </div>
                )}

                {/* Quoted reply banner if present */}
                {msg.replyTo && (
                  <div
                    className={`text-xs px-3 py-1.5 rounded-2xl mb-1 border max-w-full shadow-2xs ${
                      isUser
                        ? isMidnight ? 'bg-slate-900 text-blue-300 border-slate-700 text-right' : 'bg-rose-50/90 text-rose-800 border-pink-100/80 text-right'
                        : isMidnight ? 'bg-slate-900 text-slate-300 border-slate-800 text-left' : 'bg-slate-50 text-slate-600 border-pink-100/80 text-left'
                    }`}
                  >
                    <span className={`font-semibold block text-[10px] ${isMidnight ? 'text-blue-400' : 'text-pink-600'}`}>
                      Replying to {msg.replyTo.senderName}
                    </span>
                    <p className="truncate text-[11px] opacity-90">{msg.replyTo.text}</p>
                  </div>
                )}

                {/* Bubble / Sticker / Media */}
                <div className="relative group/bubble">
                  {isSticker ? (
                    <div className="relative group/sticker p-2 select-none hover:scale-105 transition-transform cursor-pointer">
                      {stickerObj ? (
                        <div
                          className="w-28 h-28 drop-shadow-md"
                          dangerouslySetInnerHTML={{ __html: stickerObj.svg }}
                        />
                      ) : (
                        <div className="text-4xl">{msg.content}</div>
                      )}
                    </div>
                  ) : msg.type === 'voice' && msg.attachmentUrl ? (
                    <VoiceNotePlayer
                      audioUrl={msg.attachmentUrl}
                      duration={msg.audioDuration}
                      isUser={isUser}
                    />
                  ) : msg.type === 'image' && msg.attachmentUrl ? (
                    <div className="flex flex-col gap-1 max-w-xs sm:max-w-sm">
                      <div className={`rounded-3xl overflow-hidden shadow-sm border ${
                        isMidnight ? 'border-slate-800 bg-slate-900' : 'border-pink-100/90 bg-white'
                      }`}>
                        <img
                          src={msg.attachmentUrl}
                          alt={msg.content || 'Photo'}
                          onClick={() => setSelectedImage(msg.attachmentUrl || null)}
                          className="w-full h-auto max-h-72 object-cover cursor-pointer hover:opacity-95 transition-opacity"
                        />
                      </div>
                      {/* Optional Caption */}
                      {msg.content && msg.content !== 'Shared a photo' && msg.content !== 'Shared a photo 📸' && (
                        <div
                          className={`px-3.5 py-1.5 rounded-2xl text-xs font-medium leading-relaxed ${
                            isUser
                              ? `${activeTheme.userBubble} self-end rounded-br-xs`
                              : isMidnight ? 'bg-slate-900 text-slate-100 border border-slate-800 self-start rounded-bl-xs' : 'bg-white text-slate-800 border border-pink-100/90 self-start rounded-bl-xs'
                          }`}
                        >
                          {msg.content}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div
                      className={`relative px-4 py-2.5 rounded-3xl text-xs sm:text-sm font-normal leading-relaxed break-words shadow-2xs transition-all ${
                        isCurrentlyBeingRepliedTo ? (isMidnight ? 'ring-2 ring-blue-500' : 'ring-2 ring-pink-400') : ''
                      } ${
                        isUser
                          ? isFemale
                            ? 'bg-gradient-to-r from-rose-500 via-pink-500 to-rose-400 text-white shadow-sm shadow-rose-200/60 rounded-br-xs font-medium'
                            : `${activeTheme.userBubble} rounded-br-xs font-medium`
                          : isMidnight
                          ? 'bg-[#131B2E]/90 text-slate-100 border border-slate-800/80 rounded-bl-xs shadow-sm backdrop-blur-md'
                          : isFemale
                          ? 'bg-white text-slate-800 border border-pink-100/90 rounded-bl-xs shadow-2xs'
                          : 'bg-white text-slate-800 border border-pink-100/90 rounded-bl-xs'
                      }`}
                    >
                      {msg.content}
                    </div>
                  )}

                  {/* Read Receipt Status Indicator */}
                  {isUser && isDirectChat && (
                    <div className="flex items-center justify-end gap-1 mt-0.5 px-1.5 select-none">
                      {isReadByRecipient ? (
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-bold drop-shadow-2xs animate-in fade-in duration-200 ${
                            isMidnight ? 'text-cyan-400' : 'text-rose-500'
                          }`}
                          title={`Read by recipient ${
                            msg.readAt
                              ? 'at ' + new Date(msg.readAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                              : ''
                          }`}
                        >
                          <CheckCheck className={`w-3.5 h-3.5 stroke-[2.5] ${isMidnight ? 'text-cyan-400' : 'text-rose-500'}`} />
                          <span className="text-[10px] font-semibold">Read</span>
                        </span>
                      ) : (
                        <span
                          className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-400"
                          title="Delivered to chat"
                        >
                          <Check className="w-3 h-3 stroke-[2] text-slate-400" />
                          <span>Sent</span>
                        </span>
                      )}
                    </div>
                  )}

                  {/* Reactions List */}
                  {reactionKeys.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5 px-0.5">
                      {reactionKeys.map((emoji) => {
                        const count = msg.reactions[emoji].length;
                        const hasReacted = currentUser ? msg.reactions[emoji].includes(currentUser.id) : false;
                        return (
                          <button
                            key={emoji}
                            onClick={() => reactToMessage(msg.id, emoji)}
                            className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium transition-all ${
                              hasReacted
                                ? 'bg-pink-100 border border-pink-300 text-pink-800 scale-105'
                                : 'bg-white hover:bg-pink-50 border border-slate-200 text-slate-700'
                            }`}
                          >
                            <span>{emoji}</span>
                            <span className="text-[10px] font-bold">{count}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Floating Quick Action Bar on Hover */}
                <div
                  className={`opacity-0 group-hover/msg:opacity-100 transition-opacity flex items-center gap-0.5 mt-1 bg-white/95 shadow-md border border-pink-100/90 rounded-2xl px-1.5 py-0.5 z-10 ${
                    isUser ? 'mr-1' : 'ml-1'
                  }`}
                >
                  {/* Quick Reactions */}
                  {QUICK_REACTIONS.slice(0, 3).map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => reactToMessage(msg.id, emoji)}
                      className="p-1 hover:scale-125 transition-transform text-xs"
                      title={`React ${emoji}`}
                    >
                      {emoji}
                    </button>
                  ))}

                  <div className="w-px h-3 bg-pink-200 mx-0.5" />

                  {/* Reply Button */}
                  <button
                    onClick={() => handleReplyMessage(msg)}
                    className="p-1 text-slate-400 hover:text-pink-600 rounded-lg hover:bg-pink-50 transition-colors"
                    title="Reply to message (or long-press)"
                  >
                    <Reply className="w-3.5 h-3.5" />
                  </button>

                  {/* Pin Button */}
                  <button
                    onClick={() => togglePinMessage(msg.id)}
                    className="p-1 text-slate-400 hover:text-amber-500 rounded-lg hover:bg-amber-50 transition-colors"
                    title={msg.isPinned ? 'Unpin' : 'Pin'}
                  >
                    <Pin className={`w-3.5 h-3.5 ${msg.isPinned ? 'fill-amber-500 text-amber-500' : ''}`} />
                  </button>

                  {/* Delete Button (If author) */}
                  {isUser && (
                    <button
                      onClick={() => deleteMessage(msg.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                      title="Delete message"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })
      )}

      {/* Real-Time Typing Bubble in Message Area */}
      {typingUsers.length > 0 && (
        <div className="flex items-center gap-2.5 text-xs text-slate-500 pl-1 pt-1 animate-in fade-in duration-200">
          <div className="flex -space-x-1.5">
            {typingUsers.map((u) => (
              <CuteAvatar
                key={u.userId}
                id={u.avatarId || 'bunny'}
                customUrl={u.customAvatarUrl}
                size="sm"
              />
            ))}
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-pink-100 rounded-2xl shadow-2xs">
            <span className="font-semibold text-rose-600 text-xs">
              {typingUsers.map((u) => u.userName).join(', ')}
            </span>
            <span className="text-[11px] text-slate-400">typing</span>
            <div className="flex items-center gap-1 ml-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        </div>
      )}

      {/* Image Modal Lightbox */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex flex-col items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-full max-h-[85vh] flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
            <img
              src={selectedImage}
              alt="Preview expanded"
              className="max-w-full max-h-[80vh] rounded-3xl object-contain shadow-2xl border border-white/20"
            />
            <div className="flex items-center gap-3 mt-3">
              <a
                href={selectedImage}
                target="_blank"
                rel="noreferrer"
                download="photo"
                className="flex items-center gap-1.5 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-2xl text-xs font-semibold backdrop-blur-md transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Open / Download</span>
              </a>
              <button
                onClick={() => setSelectedImage(null)}
                className="p-2 bg-white/20 hover:bg-white/30 text-white rounded-full backdrop-blur-md transition-colors"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
};
