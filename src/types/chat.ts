export type UserGender = 'female' | 'male';

export type ThemeColor = 'strawberry' | 'matcha' | 'vanilla' | 'lavender' | 'sky' | 'midnight';

export type ChatPattern =
  | 'none'
  | 'mochi_dots'
  | 'bouncing_mochi'
  | 'sakura_blossom'
  | 'matcha_grid'
  | 'starry_sparkles'
  | 'boba_clouds'
  | 'midnight_grid'
  | 'carbon_grid'
  | 'blueprint'
  | 'nocturne';

export type PrivacyVisibility = 'public' | 'only_me' | 'buddies' | 'buddies_of_buddies';

export type RelationshipState =
  | 'NONE'
  | 'OUTGOING_PENDING'
  | 'INCOMING_PENDING'
  | 'FRIENDS'
  | 'BLOCKED_BY_ME'
  | 'BLOCKED_BY_OTHER';

export type BuddyRequestState =
  | 'none'
  | 'requestSent'
  | 'incomingRequest'
  | 'buddy'
  | 'declined'
  | 'blocked_by_me'
  | 'blocked_by_other';

export interface BuddyRequest {
  id: string;
  fromUserId: string;
  fromUserName: string;
  fromUserAvatar: string;
  toUserId: string;
  toUserName: string;
  toUserAvatar: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: number;
  updatedAt: number;
}

export interface UserProfile {
  id: string; // User ID / Firebase Auth UID
  name: string;
  username: string;
  email: string;
  gender?: UserGender;
  emailVerified?: boolean;
  avatarId: string;
  customAvatarUrl?: string;
  coverUrl?: string; // Cover photo banner image URL
  location?: string; // User location
  joinedDate?: string; // Join date
  bio: string;
  moodEmoji: string;
  moodText: string;
  theme: ThemeColor;
  chatPattern?: ChatPattern; // Mochi-themed chat area background pattern
  status: 'online' | 'idle' | 'offline';
  showActiveStatus?: boolean; // Active status ON/OFF toggle (default true)
  privacyVisibility?: PrivacyVisibility; // Privacy visibility setting (only_me | buddies | buddies_of_buddies | public)
  blockedUserIds?: string[]; // Array of user IDs blocked by current user
  badge?: string;
  soundEnabled: boolean;
  createdAt: number;
  lastSeen?: number | any;
  buddyIds?: string[]; // Array of added buddy user IDs
  lastReadTimestamps?: Record<string, number>; // roomId -> last-read timestamp
}

export type MessageType = 'text' | 'sticker' | 'image' | 'voice' | 'doc';

export interface ReactionItem {
  emoji: string;
  users: string[]; // user IDs
  count: number;
}

export interface MessageReplyTo {
  id: string;
  senderName: string;
  text: string;
  type: MessageType;
}

export interface ChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  senderCustomAvatar?: string;
  senderBadge?: string;
  senderTheme?: ThemeColor;
  type: MessageType;
  content: string; // text or sticker ID or base64 / audio URL
  attachmentUrl?: string;
  fileName?: string;
  fileSize?: number;
  fileType?: string;
  audioDuration?: number; // for voice notes in seconds
  reactions: Record<string, string[]>; // emoji -> array of user IDs
  replyTo?: MessageReplyTo;
  isPinned?: boolean;
  timestamp: number;
  expiresAt?: number; // Expiry timestamp for Temporary Chat messages
  readBy?: string[]; // Array of user IDs who have viewed/read this message
  readAt?: number; // Timestamp when first read by direct chat recipient
}

export type RoomType = 'direct' | 'group';

export interface ChatRoom {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: RoomType; // 'direct' (Direct Chat) | 'group' (Group Chat)
  isDirect?: boolean; // backwards-compatible flag
  createdBy?: string; // user ID who created the room
  participantIds: string[]; // user IDs allowed in this chat
  unreadCount?: number;
  lastMessage?: string;
  lastMessageTime?: number;
  lastSenderId?: string;
  lastSenderName?: string;
  createdAt?: number;
  isPinnedBy?: string[]; // user IDs who pinned this chat room
  isFavoriteBy?: string[]; // user IDs who favorited this chat room
  chatThemeByUser?: Record<string, string>; // userId -> conversation theme override (pattern or theme)
  temporaryChat?: {
    enabled: boolean;
    durationSeconds?: number;
    updatedAt?: number;
  };
}

export interface StickerItem {
  id: string;
  name: string;
  emoji: string;
  svg: string;
  category: 'cute' | 'reactions' | 'vibes' | 'animals';
}

export interface StoryItem {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  userCustomAvatar?: string;
  imageUrl?: string;
  text?: string;
  gradientBg?: string; // CSS gradient for text-only story
  createdAt: number;
  expiresAt: number; // 24 hours expiry
  viewers: string[]; // array of user IDs who viewed this story
  reactions?: Record<string, string[]>; // emoji -> array of user IDs
}

export type CallType = 'audio' | 'video';

export type CallStatus =
  | 'idle'
  | 'calling'
  | 'ringing'
  | 'connecting'
  | 'connected'
  | 'reconnecting'
  | 'ended'
  | 'failed'
  | 'rejected'
  | 'busy';

export interface CallSession {
  id: string;
  roomId: string;
  callType?: CallType; // 'audio' | 'video' (defaults to 'video')
  callerId: string;
  callerName: string;
  callerAvatar: string;
  callerCustomAvatar?: string;
  receiverId: string;
  receiverName: string;
  receiverAvatar: string;
  receiverCustomAvatar?: string;
  status: CallStatus;
  participantIds?: string[];
  offer?: RTCSessionDescriptionInit;
  answer?: RTCSessionDescriptionInit;
  createdAt: number;
  endedAt?: number;
}

export interface ScheduledMessage {
  id: string;
  roomId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  senderCustomAvatar?: string;
  senderBadge?: string;
  senderTheme?: ThemeColor;
  type: MessageType;
  content: string;
  attachmentUrl?: string;
  audioDuration?: number;
  scheduledFor: number; // Unix timestamp in ms
  status: 'scheduled' | 'sent' | 'cancelled';
  createdAt: number;
  sentAt?: number;
  replyTo?: MessageReplyTo;
}

export interface PostComment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  authorCustomAvatar?: string;
  content: string;
  createdAt: number;
}

export interface SocialFeedPost {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  authorCustomAvatar?: string;
  createdAt: number;
  updatedAt?: number;
  timeAgo: string;
  location?: string;
  isPublic?: boolean;
  content: string;
  images: string[];
  likes: number;
  commentsCount: number;
  sharesCount: number;
  isLiked?: boolean;
  isSaved?: boolean;
  comments?: PostComment[];
}

export interface HighlightItem {
  id: string;
  title: string;
  coverImage: string;
  emoji?: string;
}

export interface MediaHubItem {
  id: string;
  type: 'photo' | 'video' | 'voice' | 'file';
  url: string;
  thumbnailUrl?: string;
  title?: string;
  duration?: string;
  timestamp: number;
  size?: string;
}

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

