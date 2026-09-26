import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import {
  ChatMessage,
  ChatRoom,
  MessageReplyTo,
  MessageType,
  ThemeColor,
  ChatPattern,
  UserProfile,
  StoryItem,
  CallSession,
  ScheduledMessage,
  BuddyRequest,
  BuddyRequestState,
} from '../types/chat';
import { sounds } from '../utils/sound';
import { THEMES } from '../utils/theme';
import confetti from 'canvas-confetti';
import { db, auth } from '../firebase';
import {
  collection,
  doc,
  setDoc,
  getDoc,
  onSnapshot,
  query,
  orderBy,
  limit,
  deleteDoc,
  updateDoc,
  where,
  or,
} from 'firebase/firestore';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import {
  isNotificationSupported,
  getNotificationPermission,
  requestNotificationPermission,
  registerServiceWorker,
  showPushNotification,
} from '../utils/notifications';

export interface TypingIndicatorUser {
  userId: string;
  userName: string;
  avatarId?: string;
  customAvatarUrl?: string;
  timestamp: number;
}

interface ChatContextType {
  currentUser: UserProfile | null;
  authUser: User | null;
  isAuthLoading: boolean;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  rooms: ChatRoom[];
  groupRooms: ChatRoom[];
  directRooms: ChatRoom[];
  currentRoomId: string;
  currentRoom: ChatRoom | undefined;
  setCurrentRoomId: (id: string) => void;
  markRoomAsRead: (roomId: string) => Promise<void>;
  messages: ChatMessage[];
  sendMessage: (content: string, type?: MessageType, attachmentUrl?: string, audioDuration?: number) => Promise<void>;
  reactToMessage: (messageId: string, emoji: string) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
  togglePinMessage: (messageId: string) => Promise<void>;
  deleteChannel: (roomId: string) => Promise<boolean>;
  activeUsers: UserProfile[];
  buddies: UserProfile[];
  findUserByIdOrQuery: (queryId: string) => Promise<UserProfile | null>;
  addBuddy: (targetUser: UserProfile) => Promise<void>;
  removeBuddy: (targetUserId: string) => Promise<void>;
  isBuddy: (userId: string) => boolean;

  // --- Buddy Request System ---
  buddyRequests: BuddyRequest[];
  getBuddyRequestState: (targetUserId: string) => BuddyRequestState;
  sendBuddyRequest: (targetUser: UserProfile) => Promise<void>;
  acceptBuddyRequest: (requestId: string, fromUserId: string) => Promise<void>;
  declineBuddyRequest: (requestId: string) => Promise<void>;
  cancelBuddyRequest: (requestId: string) => Promise<void>;

  // --- Block System ---
  isBlocked: (targetUserId: string) => boolean;
  toggleBlockUser: (targetUserId: string) => Promise<void>;

  // --- Pin & Favorite Room System ---
  togglePinRoom: (roomId: string) => Promise<void>;
  toggleFavoriteRoom: (roomId: string) => Promise<void>;
  isRoomPinned: (roomId: string) => boolean;
  isRoomFavorite: (roomId: string) => boolean;

  // --- Conversation Theme & Temporary Chat ---
  setRoomTheme: (roomId: string, themePattern: string) => Promise<void>;
  setRoomTemporaryChat: (roomId: string, enabled: boolean, durationSeconds?: number) => Promise<void>;

  // --- Conversation Info Drawer & Profile View ---
  showConversationInfoDrawer: boolean;
  setShowConversationInfoDrawer: (show: boolean) => void;
  selectedProfileUser: UserProfile | null;
  setSelectedProfileUser: (user: UserProfile | null) => void;

  typingUsers: TypingIndicatorUser[];
  sendTyping: (isTyping: boolean) => void;
  createGroupRoom: (name: string, description: string, icon: string, memberIds?: string[]) => Promise<string>;
  startDirectMessage: (targetUser: UserProfile) => Promise<void>;
  replyingTo: MessageReplyTo | null;
  setReplyingTo: (reply: MessageReplyTo | null) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isConnected: boolean;
  isOnline: boolean;
  theme: ThemeColor;
  setTheme: (t: ThemeColor) => void;
  chatPattern: ChatPattern;
  setChatPattern: (pattern: ChatPattern) => void;
  pinnedMessages: ChatMessage[];
  showProfileModal: boolean;
  setShowProfileModal: (show: boolean) => void;
  showCreateRoomModal: boolean;
  setShowCreateRoomModal: (show: boolean) => void;
  showFindBuddyModal: boolean;
  setShowFindBuddyModal: (show: boolean) => void;
  showMembersPanel: boolean;
  setShowMembersPanel: (show: boolean) => void;
  triggerConfetti: () => void;
  activeMobileTab: 'chats' | 'spaces' | 'friends' | 'profile';
  setActiveMobileTab: (tab: 'chats' | 'spaces' | 'friends' | 'profile') => void;
  handleSignOut: () => Promise<void>;
  setUserProfileDirectly: (profile: UserProfile) => void;

  // --- Story Feature state & actions ---
  stories: StoryItem[];
  addStory: (story: { text?: string; imageUrl?: string; gradientBg?: string }) => Promise<void>;
  markStoryViewed: (storyId: string) => Promise<void>;
  reactToStory: (storyId: string, emoji: string) => Promise<void>;
  deleteStory: (storyId: string) => Promise<void>;
  showCreateStoryModal: boolean;
  setShowCreateStoryModal: (show: boolean) => void;

  // --- WebRTC 1-on-1 Video Calling state & actions ---
  activeCall: CallSession | null;
  startVideoCall: (targetBuddy: UserProfile) => Promise<void>;
  answerCall: () => Promise<void>;
  rejectCall: () => Promise<void>;
  endCall: () => Promise<void>;

  // --- Push Notifications state & actions ---
  notificationPermission: NotificationPermission;
  enablePushNotifications: () => Promise<NotificationPermission>;

  // --- Scheduled Messages state & actions ---
  scheduledMessages: ScheduledMessage[];
  scheduleMessage: (
    roomId: string,
    content: string,
    scheduledFor: number,
    options?: {
      type?: MessageType;
      attachmentUrl?: string;
      audioDuration?: number;
    }
  ) => Promise<void>;
  cancelScheduledMessage: (schedId: string) => Promise<void>;
  sendScheduledMessageNow: (schedId: string) => Promise<void>;
}

const ChatContext = createContext<ChatContextType | null>(null);

function cleanForFirestore<T extends Record<string, any>>(obj: T): Partial<T> {
  const cleaned: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
        cleaned[key] = cleanForFirestore(value);
      } else {
        cleaned[key] = value;
      }
    }
  }
  return cleaned as Partial<T>;
}

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const cached = localStorage.getItem('mochichat_profile_cache');
      if (cached) return JSON.parse(cached);
    } catch {
      // ignore
    }
    return null;
  });
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);

  const [rawRooms, setRawRooms] = useState<ChatRoom[]>([]);
  const [roomUnreadCounts, setRoomUnreadCounts] = useState<Record<string, number>>({});
  const [currentRoomId, setCurrentRoomIdState] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [activeUsers, setActiveUsers] = useState<UserProfile[]>([]);
  const [typingUsers, setTypingUsers] = useState<TypingIndicatorUser[]>([]);
  const [replyingTo, setReplyingTo] = useState<MessageReplyTo | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isConnected, setIsConnected] = useState<boolean>(true);
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  });

  // --- Push Notification State ---
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(() => {
    return getNotificationPermission();
  });

  // --- Stories State ---
  const [stories, setStories] = useState<StoryItem[]>([]);
  const [showCreateStoryModal, setShowCreateStoryModal] = useState<boolean>(false);

  // --- WebRTC Video Call State ---
  const [activeCall, setActiveCall] = useState<CallSession | null>(null);

  // --- Scheduled Messages State ---
  const [scheduledMessages, setScheduledMessages] = useState<ScheduledMessage[]>([]);

  // Mobile App Native Experience tabs
  const [activeMobileTab, setActiveMobileTab] = useState<'chats' | 'spaces' | 'friends' | 'profile'>('spaces');

  // Modals & Drawers state
  const [showProfileModal, setShowProfileModal] = useState<boolean>(false);
  const [showCreateRoomModal, setShowCreateRoomModal] = useState<boolean>(false);
  const [showFindBuddyModal, setShowFindBuddyModal] = useState<boolean>(false);
  const [showMembersPanel, setShowMembersPanel] = useState<boolean>(false);

  // Ref to track marked read message IDs
  const markedReadRef = useRef<Set<string>>(new Set());
  // Ref to debounce typing updates to Firestore
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastTypingWriteRef = useRef<number>(0);
  const currentUserRef = useRef<UserProfile | null>(currentUser);
  currentUserRef.current = currentUser;

  // Sound sync
  useEffect(() => {
    if (currentUser) {
      sounds.setEnabled(currentUser.soundEnabled ?? true);
    }
  }, [currentUser]);

  // Register service worker on mount
  useEffect(() => {
    registerServiceWorker();
  }, []);

  // Enable Push Notifications
  const enablePushNotifications = useCallback(async (): Promise<NotificationPermission> => {
    sounds.playClick();
    const result = await requestNotificationPermission();
    setNotificationPermission(result);
    if (result === 'granted') {
      confetti({
        particleCount: 40,
        spread: 50,
        origin: { y: 0.6 },
      });
      showPushNotification('Simi Notifications Active 🌸', {
        body: 'You will now receive notifications when friends message or call you!',
      });
    }
    return result;
  }, []);

  // Firebase Auth State Listener & Local Profile fallback
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setAuthUser(user);
      if (user) {
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const snap = await getDoc(userDocRef);
          if (snap.exists()) {
            const data = snap.data() as UserProfile;
            data.emailVerified = user.emailVerified;
            if (!data.buddyIds) data.buddyIds = [];
            if (!data.lastReadTimestamps) data.lastReadTimestamps = {};
            setCurrentUser(data);
            try {
              localStorage.setItem('mochichat_profile_cache', JSON.stringify(data));
            } catch {
              // ignore
            }
          }
        } catch (err) {
          console.error('Error fetching user profile:', err);
        }
      } else {
        try {
          const storedUid = localStorage.getItem('mochichat_active_user_uid');
          if (storedUid) {
            const userDocRef = doc(db, 'users', storedUid);
            const snap = await getDoc(userDocRef);
            if (snap.exists()) {
              const data = snap.data() as UserProfile;
              if (!data.buddyIds) data.buddyIds = [];
              if (!data.lastReadTimestamps) data.lastReadTimestamps = {};
              setCurrentUser(data);
            }
          }
        } catch {
          // ignore
        }
      }
      setIsAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Ref to track last presence write timestamp to avoid excessive Firestore writes
  const lastPresenceWriteRef = useRef<number>(0);
  const currentPresenceStatusRef = useRef<'online' | 'idle' | 'offline'>('online');
  const prevTypingCountRef = useRef<number>(0);

  // Heartbeat & Online Presence Tracking in Firestore with Activity Tracking
  useEffect(() => {
    if (!currentUser?.id) return;
    const userId = currentUser.id;

    const sendPresenceUpdate = async (status: 'online' | 'idle' | 'offline') => {
      const targetStatus = currentUser.showActiveStatus === false ? 'offline' : status;
      const now = Date.now();
      // Avoid redundant Firestore writes if status hasn't changed and written recently (< 15s)
      if (
        targetStatus === currentPresenceStatusRef.current &&
        now - lastPresenceWriteRef.current < 15000 &&
        targetStatus !== 'offline'
      ) {
        return;
      }

      currentPresenceStatusRef.current = targetStatus;
      lastPresenceWriteRef.current = now;

      try {
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, {
          status: targetStatus,
          lastSeen: now,
        });
      } catch {
        // offline or silent fail
      }
    };

    // Immediate presence signal on login / mount
    if (navigator.onLine) {
      sendPresenceUpdate('online');
    }

    // Idle detection timer (3 minutes inactivity)
    let idleTimer: NodeJS.Timeout | null = null;
    const resetIdleTimer = () => {
      if (idleTimer) clearTimeout(idleTimer);

      if (currentPresenceStatusRef.current === 'idle' && navigator.onLine) {
        sendPresenceUpdate('online');
      }

      idleTimer = setTimeout(() => {
        if (navigator.onLine && document.visibilityState === 'visible') {
          sendPresenceUpdate('idle');
        }
      }, 180000); // 3 minutes
    };

    // User activity listener for throttling updates
    const handleUserActivity = () => {
      resetIdleTimer();
      const now = Date.now();
      if (
        navigator.onLine &&
        document.visibilityState === 'visible' &&
        (currentPresenceStatusRef.current !== 'online' || now - lastPresenceWriteRef.current > 20000)
      ) {
        sendPresenceUpdate('online');
      }
    };

    // Periodic heartbeat every 25 seconds while tab is active
    const heartbeatInterval = setInterval(() => {
      if (navigator.onLine && document.visibilityState === 'visible') {
        sendPresenceUpdate(currentPresenceStatusRef.current === 'idle' ? 'idle' : 'online');
      }
    }, 25000);

    // Tab visibility changes (online vs idle)
    const handleVisibilityChange = () => {
      if (!navigator.onLine) return;
      if (document.visibilityState === 'visible') {
        resetIdleTimer();
        sendPresenceUpdate('online');
      } else {
        if (idleTimer) clearTimeout(idleTimer);
        sendPresenceUpdate('idle');
      }
    };

    // Online / offline network events
    const handleOnline = () => {
      setIsOnline(true);
      resetIdleTimer();
      sendPresenceUpdate('online');
    };
    const handleOffline = () => {
      setIsOnline(false);
      currentPresenceStatusRef.current = 'offline';
    };

    // Unload / pagehide event: best-effort mark offline
    const handleBeforeUnload = () => {
      try {
        const userRef = doc(db, 'users', userId);
        updateDoc(userRef, {
          status: 'offline',
          lastSeen: Date.now(),
        }).catch(() => {});
      } catch {
        // ignore
      }
    };

    resetIdleTimer();

    const activityEvents = ['mousemove', 'keydown', 'touchstart', 'pointerdown', 'scroll'];
    activityEvents.forEach((evt) => window.addEventListener(evt, handleUserActivity, { passive: true }));

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('pagehide', handleBeforeUnload);

    return () => {
      if (idleTimer) clearTimeout(idleTimer);
      clearInterval(heartbeatInterval);
      activityEvents.forEach((evt) => window.removeEventListener(evt, handleUserActivity));
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('pagehide', handleBeforeUnload);
    };
  }, [currentUser?.id]);

  // Listen to real-time rooms
  useEffect(() => {
    if (!currentUser?.id) return;
    const currentUserId = currentUser.id;

    const roomsCol = collection(db, 'rooms');
    const unsub = onSnapshot(roomsCol, (snapshot) => {
      const fetched: ChatRoom[] = [];
      snapshot.forEach((d) => {
        const roomData = d.data() as ChatRoom;
        const isParticipant =
          !roomData.participantIds ||
          roomData.participantIds.length === 0 ||
          roomData.participantIds.includes(currentUserId) ||
          roomData.createdBy === currentUserId;

        if (isParticipant) {
          fetched.push({
            ...roomData,
            id: d.id,
            type: roomData.type || (roomData.isDirect ? 'direct' : 'group'),
            participantIds: roomData.participantIds || [],
          });
        }
      });

      fetched.sort((a, b) => (b.lastMessageTime || b.createdAt || 0) - (a.lastMessageTime || a.createdAt || 0));
      setRawRooms(fetched);

      if (fetched.length > 0) {
        setCurrentRoomIdState((prev) => {
          if (prev && fetched.some((r) => r.id === prev)) return prev;
          return fetched[0].id;
        });
      } else {
        setCurrentRoomIdState('');
      }

      setIsConnected(true);
    }, (err) => {
      console.warn('Room listener issue:', err);
      setIsConnected(false);
    });

    return () => unsub();
  }, [currentUser?.id]);

  // Real-time Stories Listener (24-hour disappearing stories)
  useEffect(() => {
    if (!currentUser?.id) return;

    const storiesCol = collection(db, 'stories');
    const q = query(storiesCol, orderBy('createdAt', 'desc'), limit(50));

    const unsub = onSnapshot(q, (snapshot) => {
      const now = Date.now();
      const validStories: StoryItem[] = [];

      snapshot.forEach((docSnap) => {
        const item = docSnap.data() as StoryItem;
        if (item.expiresAt > now) {
          validStories.push({
            ...item,
            id: docSnap.id,
            viewers: item.viewers || [],
            reactions: item.reactions || {},
          });
        }
      });

      setStories(validStories);
    }, (err) => {
      console.warn('Stories listener issue:', err);
    });

    return () => unsub();
  }, [currentUser?.id]);

  // Real-time Scheduled Messages Listener for Current User
  useEffect(() => {
    if (!currentUser?.id) return;
    const currentUserId = currentUser.id;

    const schedCol = collection(db, 'scheduledMessages');
    const qSched = query(
      schedCol,
      where('senderId', '==', currentUserId),
      where('status', '==', 'scheduled')
    );

    const unsub = onSnapshot(qSched, (snapshot) => {
      const list: ScheduledMessage[] = [];
      snapshot.forEach((d) => {
        list.push({ ...(d.data() as ScheduledMessage), id: d.id });
      });
      list.sort((a, b) => a.scheduledFor - b.scheduledFor);
      setScheduledMessages(list);
    }, (err) => {
      console.warn('Scheduled messages listener note:', err);
    });

    return () => unsub();
  }, [currentUser?.id]);

  // Client-side background trigger tick: checks if any scheduled message is due
  useEffect(() => {
    const interval = setInterval(async () => {
      if (!currentUser?.id) return;
      const due = scheduledMessages.filter(
        (m) => m.status === 'scheduled' && m.scheduledFor <= Date.now()
      );
      if (due.length > 0) {
        try {
          await fetch('/api/triggers/process-scheduled', { method: 'POST' });
        } catch {
          // fallback to client-side trigger directly
          for (const msg of due) {
            try {
              const msgDocRef = doc(db, 'rooms', msg.roomId, 'messages', msg.id);
              await setDoc(msgDocRef, cleanForFirestore({
                id: msg.id,
                roomId: msg.roomId,
                senderId: msg.senderId,
                senderName: msg.senderName,
                senderAvatar: msg.senderAvatar,
                senderCustomAvatar: msg.senderCustomAvatar,
                senderBadge: msg.senderBadge,
                senderTheme: msg.senderTheme,
                type: msg.type,
                content: msg.content,
                attachmentUrl: msg.attachmentUrl,
                audioDuration: msg.audioDuration,
                reactions: {},
                replyTo: msg.replyTo,
                timestamp: Date.now(),
                readBy: [msg.senderId],
              }));
              await updateDoc(doc(db, 'scheduledMessages', msg.id), {
                status: 'sent',
                sentAt: Date.now(),
              });
            } catch (e) {
              console.warn('Fallback send error:', e);
            }
          }
        }
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [currentUser?.id, scheduledMessages]);

  // Real-time Incoming Video Call Listener for Current User (reads calls collection safely)
  useEffect(() => {
    if (!currentUser?.id) return;
    const currentUserId = currentUser.id;

    const callsCol = collection(db, 'calls');
    const qCalls = query(callsCol, orderBy('createdAt', 'desc'), limit(15));

    const unsub = onSnapshot(qCalls, (snapshot) => {
      let activeFound: CallSession | null = null;
      snapshot.forEach((d) => {
        const call = { ...(d.data() as CallSession), id: d.id };
        if (
          (call.receiverId === currentUserId || call.callerId === currentUserId) &&
          (call.status === 'calling' || call.status === 'connected')
        ) {
          if (!activeFound) activeFound = call;
        }
      });

      setActiveCall((prev) => {
        // If incoming call received from a buddy, trigger push notification
        if (activeFound && (!prev || prev.id !== activeFound.id)) {
          if (activeFound.receiverId === currentUserId && activeFound.status === 'calling') {
            showPushNotification(`Incoming Call from ${activeFound.callerName} 📹`, {
              body: 'Tap to open Simi and answer the call!',
              tag: `call-${activeFound.id}`,
            });
          }
        }
        return activeFound;
      });
    }, (err) => {
      console.warn('Calls listener note:', err);
    });

    return () => unsub();
  }, [currentUser?.id]);

  // WebRTC Call Initiation (Caller)
  const startVideoCall = useCallback(
    async (targetBuddy: UserProfile) => {
      const user = currentUserRef.current;
      if (!user) return;
      sounds.playSend();

      const callId = 'call_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6);
      const callData: CallSession = {
        id: callId,
        roomId: currentRoomId,
        callerId: user.id,
        callerName: user.name,
        callerAvatar: user.avatarId,
        callerCustomAvatar: user.customAvatarUrl,
        receiverId: targetBuddy.id,
        receiverName: targetBuddy.name,
        receiverAvatar: targetBuddy.avatarId,
        receiverCustomAvatar: targetBuddy.customAvatarUrl,
        status: 'calling',
        createdAt: Date.now(),
      };

      try {
        const callRef = doc(db, 'calls', callId);
        await setDoc(callRef, cleanForFirestore(callData));
        setActiveCall(callData);
      } catch (err) {
        console.error('Failed to initiate video call:', err);
      }
    },
    [currentRoomId]
  );

  // Answer Call (Receiver)
  const answerCall = useCallback(async () => {
    if (!activeCall) return;
    try {
      const callRef = doc(db, 'calls', activeCall.id);
      await updateDoc(callRef, { status: 'connected' });
      setActiveCall((prev) => (prev ? { ...prev, status: 'connected' } : null));
    } catch (err) {
      console.error('Failed to answer call:', err);
    }
  }, [activeCall]);

  // Reject Call (Receiver)
  const rejectCall = useCallback(async () => {
    if (!activeCall) return;
    try {
      const callRef = doc(db, 'calls', activeCall.id);
      await updateDoc(callRef, { status: 'rejected', endedAt: Date.now() });
      setActiveCall(null);
    } catch (err) {
      console.error('Failed to reject call:', err);
    }
  }, [activeCall]);

  // Schedule a message
  const scheduleMessage = useCallback(
    async (
      roomId: string,
      content: string,
      scheduledFor: number,
      options?: {
        type?: MessageType;
        attachmentUrl?: string;
        audioDuration?: number;
      }
    ) => {
      const user = currentUserRef.current;
      if (!user || !roomId) return;
      if (!content.trim() && !options?.attachmentUrl) return;

      const schedId = 'sched_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);
      const newScheduled: ScheduledMessage = {
        id: schedId,
        roomId,
        senderId: user.id,
        senderName: user.name,
        senderAvatar: user.avatarId,
        senderCustomAvatar: user.customAvatarUrl,
        senderBadge: user.badge,
        senderTheme: user.theme,
        type: options?.type || 'text',
        content: content.trim(),
        attachmentUrl: options?.attachmentUrl,
        audioDuration: options?.audioDuration,
        scheduledFor,
        status: 'scheduled',
        createdAt: Date.now(),
        replyTo: replyingTo || undefined,
      };

      try {
        const schedDocRef = doc(db, 'scheduledMessages', schedId);
        await setDoc(schedDocRef, cleanForFirestore(newScheduled));
        sounds.playSend();
        confetti({
          particleCount: 35,
          spread: 50,
          origin: { y: 0.8 },
        });
        setReplyingTo(null);
      } catch (err) {
        console.error('Failed to schedule message:', err);
      }
    },
    [replyingTo]
  );

  // Cancel scheduled message
  const cancelScheduledMessage = useCallback(async (schedId: string) => {
    sounds.playClick();
    try {
      const schedDocRef = doc(db, 'scheduledMessages', schedId);
      await deleteDoc(schedDocRef);
    } catch (err) {
      console.error('Failed to cancel scheduled message:', err);
    }
  }, []);

  // Send scheduled message immediately
  const sendScheduledMessageNow = useCallback(async (schedId: string) => {
    sounds.playSend();
    try {
      const schedDocRef = doc(db, 'scheduledMessages', schedId);
      await updateDoc(schedDocRef, {
        scheduledFor: Date.now() - 1000,
      });
      fetch('/api/triggers/process-scheduled', { method: 'POST' }).catch(() => {});
    } catch (err) {
      console.error('Failed to trigger immediate send:', err);
    }
  }, []);

  // End Call (Either participant)
  const endCall = useCallback(async () => {
    if (!activeCall) return;
    try {
      const callRef = doc(db, 'calls', activeCall.id);
      await updateDoc(callRef, { status: 'ended', endedAt: Date.now() });
      setActiveCall(null);
    } catch (err) {
      console.error('Failed to end call:', err);
    }
  }, [activeCall]);

  // Add Story to Firestore
  const addStory = useCallback(
    async (storyData: { text?: string; imageUrl?: string; gradientBg?: string }) => {
      const user = currentUserRef.current;
      if (!user) return;
      sounds.playSend();

      const storyId = 'story_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6);
      const now = Date.now();
      const expiresAt = now + 24 * 60 * 60 * 1000; // 24 hours

      const newStory: StoryItem = {
        id: storyId,
        userId: user.id,
        userName: user.name,
        userAvatar: user.avatarId,
        userCustomAvatar: user.customAvatarUrl,
        text: storyData.text?.trim() || undefined,
        imageUrl: storyData.imageUrl || undefined,
        gradientBg: storyData.gradientBg || 'from-pink-500 via-rose-400 to-amber-300',
        createdAt: now,
        expiresAt,
        viewers: [user.id],
        reactions: {},
      };

      try {
        const storyRef = doc(db, 'stories', storyId);
        await setDoc(storyRef, cleanForFirestore(newStory));
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
        });
      } catch (err) {
        console.error('Failed to create story:', err);
      }
    },
    []
  );

  // Mark Story Viewed
  const markStoryViewed = useCallback(
    async (storyId: string) => {
      const user = currentUserRef.current;
      if (!user || !storyId) return;

      const target = stories.find((s) => s.id === storyId);
      if (!target || target.viewers.includes(user.id)) return;

      const updatedViewers = [...target.viewers, user.id];
      try {
        const storyRef = doc(db, 'stories', storyId);
        await updateDoc(storyRef, { viewers: updatedViewers });
      } catch (err) {
        // ignore
      }
    },
    [stories]
  );

  // React to Story
  const reactToStory = useCallback(
    async (storyId: string, emoji: string) => {
      const user = currentUserRef.current;
      if (!user || !storyId) return;
      sounds.playReaction();

      const target = stories.find((s) => s.id === storyId);
      if (!target) return;

      const currentReactions = { ...(target.reactions || {}) };
      const currentList = [...(currentReactions[emoji] || [])];
      const idx = currentList.indexOf(user.id);
      if (idx >= 0) {
        currentList.splice(idx, 1);
        if (currentList.length === 0) delete currentReactions[emoji];
        else currentReactions[emoji] = currentList;
      } else {
        currentList.push(user.id);
        currentReactions[emoji] = currentList;
      }

      try {
        const storyRef = doc(db, 'stories', storyId);
        await updateDoc(storyRef, { reactions: currentReactions });
      } catch (err) {
        console.error('Failed to react to story:', err);
      }
    },
    [stories]
  );

  // Delete Story (if creator)
  const deleteStory = useCallback(
    async (storyId: string) => {
      const user = currentUserRef.current;
      if (!user || !storyId) return;
      sounds.playClick();
      try {
        const storyRef = doc(db, 'stories', storyId);
        await deleteDoc(storyRef);
      } catch (err) {
        console.error('Failed to delete story:', err);
      }
    },
    []
  );

  // Track unread messages across all accessible rooms using user's lastReadTimestamps
  useEffect(() => {
    const user = currentUser;
    if (!user?.id || rawRooms.length === 0) return;

    const unsubs: (() => void)[] = [];

    rawRooms.forEach((room) => {
      const messagesRef = collection(db, 'rooms', room.id, 'messages');
      const q = query(messagesRef, orderBy('timestamp', 'desc'), limit(30));

      const unsub = onSnapshot(q, (snapshot) => {
        if (room.id === currentRoomId) {
          setRoomUnreadCounts((prev) => {
            if (prev[room.id] === 0) return prev;
            return { ...prev, [room.id]: 0 };
          });
          return;
        }

        const lastRead = currentUserRef.current?.lastReadTimestamps?.[room.id] || 0;
        let count = 0;

        snapshot.forEach((docSnap) => {
          const msg = docSnap.data() as ChatMessage;
          if (msg.senderId !== user.id && msg.timestamp > lastRead) {
            count++;
          }
        });

        setRoomUnreadCounts((prev) => {
          if (prev[room.id] === count) return prev;
          return { ...prev, [room.id]: count };
        });
      }, (err) => {
        console.warn(`Unread count note for room ${room.id}:`, err);
      });

      unsubs.push(unsub);
    });

    return () => {
      unsubs.forEach((u) => u());
    };
  }, [currentUser?.id, rawRooms, currentRoomId]);

  // Listen to all registered users from Firestore
  useEffect(() => {
    if (!currentUser?.id) return;
    const currentUserId = currentUser.id;

    const usersCol = collection(db, 'users');
    const unsub = onSnapshot(usersCol, (snapshot) => {
      const list: UserProfile[] = [];
      snapshot.forEach((d) => {
        const u = d.data() as UserProfile;
        list.push({ ...u, id: d.id, buddyIds: u.buddyIds || [] });
      });

      if (!list.some((u) => u.id === currentUserId) && currentUserRef.current) {
        list.push(currentUserRef.current);
      }
      setActiveUsers(list);
    }, (err) => {
      console.warn('Users listener note:', err);
    });

    return () => unsub();
  }, [currentUser?.id]);

  // Mark room as read
  const markRoomAsRead = useCallback(async (roomId: string) => {
    const user = currentUserRef.current;
    if (!user || !roomId) return;

    const now = Date.now();
    const updatedTimestamps = {
      ...(user.lastReadTimestamps || {}),
      [roomId]: now,
    };

    setRoomUnreadCounts((prev) => {
      if (prev[roomId] === 0) return prev;
      return { ...prev, [roomId]: 0 };
    });

    try {
      const userRef = doc(db, 'users', user.id);
      await updateDoc(userRef, {
        [`lastReadTimestamps.${roomId}`]: now,
      });
    } catch {
      try {
        const userRef = doc(db, 'users', user.id);
        await setDoc(userRef, { lastReadTimestamps: updatedTimestamps }, { merge: true });
      } catch (err) {
        // ignore
      }
    }
  }, []);

  // Listen to live messages in currentRoomId from Firestore & mark incoming as READ & trigger Push Notification
  useEffect(() => {
    if (!currentUser?.id || !currentRoomId) {
      setMessages([]);
      return;
    }
    const currentUserId = currentUser.id;

    markRoomAsRead(currentRoomId);

    const messagesRef = collection(db, 'rooms', currentRoomId, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'), limit(200));

    const unsub = onSnapshot(q, (snapshot) => {
      const msgs: ChatMessage[] = [];
      let hasNewFromOther = false;
      let incomingMsg: ChatMessage | null = null;
      const unreadDirectMsgIds: string[] = [];

      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as ChatMessage;
        msgs.push(data);

        if (data.senderId !== currentUserId) {
          if (Date.now() - data.timestamp < 3500) {
            hasNewFromOther = true;
            incomingMsg = data;
          }

          const readByList = data.readBy || [];
          if (!readByList.includes(currentUserId) && !markedReadRef.current.has(data.id)) {
            unreadDirectMsgIds.push(data.id);
          }
        }
      });

      setMessages(msgs);

      if (hasNewFromOther && incomingMsg !== null) {
        sounds.playReceive();
        const latest: ChatMessage = incomingMsg;
        const msgPreview =
          latest.type === 'image'
            ? '📸 Sent an image'
            : latest.type === 'voice'
            ? '🎙️ Sent a voice note'
            : latest.type === 'sticker'
            ? '🎨 Sent a sticker'
            : latest.content;

        showPushNotification(`${latest.senderName} on MochiChat 🌸`, {
          body: msgPreview,
          tag: `msg-${latest.id}`,
        });
      }

      if (unreadDirectMsgIds.length > 0) {
        for (const msgId of unreadDirectMsgIds) {
          markedReadRef.current.add(msgId);
          const msgRef = doc(db, 'rooms', currentRoomId, 'messages', msgId);
          getDoc(msgRef).then((snap) => {
            if (snap.exists()) {
              const currentData = snap.data() as ChatMessage;
              const currentReadBy = currentData.readBy || [];
              if (!currentReadBy.includes(currentUserId)) {
                updateDoc(msgRef, {
                  readBy: [...currentReadBy, currentUserId],
                  readAt: currentData.readAt || Date.now(),
                }).catch(() => {});
              }
            }
          }).catch(() => {});
        }
      }
    }, (err) => {
      console.warn('Messages listener note:', err);
    });

    return () => unsub();
  }, [currentUser?.id, currentRoomId, markRoomAsRead]);

  // Real-time Typing Indicator Listener in Firestore
  useEffect(() => {
    if (!currentUser?.id || !currentRoomId) {
      setTypingUsers([]);
      prevTypingCountRef.current = 0;
      return;
    }
    const currentUserId = currentUser.id;

    const typingCol = collection(db, 'rooms', currentRoomId, 'typing');
    const unsub = onSnapshot(typingCol, (snapshot) => {
      const now = Date.now();
      const activeTyping: TypingIndicatorUser[] = [];

      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as TypingIndicatorUser;
        if (data.userId !== currentUserId && now - data.timestamp < 5000) {
          activeTyping.push(data);
        }
      });

      const prevCount = prevTypingCountRef.current;
      prevTypingCountRef.current = activeTyping.length;

      if (prevCount === 0 && activeTyping.length > 0) {
        sounds.playTyping();
      }

      setTypingUsers(activeTyping);
    }, (err) => {
      console.warn('Typing listener note:', err);
    });

    const interval = setInterval(() => {
      const now = Date.now();
      setTypingUsers((prev) => {
        const filtered = prev.filter((u) => now - u.timestamp < 5000);
        if (prev.length > 0 && filtered.length === 0) {
          prevTypingCountRef.current = 0;
        } else {
          prevTypingCountRef.current = filtered.length;
        }
        return filtered;
      });
    }, 2000);

    return () => {
      unsub();
      clearInterval(interval);
    };
  }, [currentUser?.id, currentRoomId]);

  // Switch Room handler
  const setCurrentRoomId = useCallback((newRoomId: string) => {
    const user = currentUserRef.current;
    if (user && currentRoomId) {
      try {
        const typingDocRef = doc(db, 'rooms', currentRoomId, 'typing', user.id);
        deleteDoc(typingDocRef).catch(() => {});
      } catch {
        // ignore
      }
    }

    setCurrentRoomIdState(newRoomId);
    setSearchQuery('');
    setReplyingTo(null);
    setTypingUsers([]);
    setActiveMobileTab('chats');

    setRoomUnreadCounts((prev) => ({ ...prev, [newRoomId]: 0 }));
    markRoomAsRead(newRoomId);
  }, [currentRoomId, markRoomAsRead]);

  // Update Profile
  const updateProfile = useCallback(async (updates: Partial<UserProfile>) => {
    const current = currentUserRef.current;
    if (!current) return;
    const updated: UserProfile = {
      ...current,
      ...updates,
      buddyIds: updates.buddyIds || current.buddyIds || [],
      lastReadTimestamps: updates.lastReadTimestamps || current.lastReadTimestamps || {},
      lastSeen: Date.now(),
    };
    setCurrentUser(updated);

    try {
      localStorage.setItem('mochichat_profile_cache', JSON.stringify(updated));
      const userRef = doc(db, 'users', current.id);
      await setDoc(userRef, cleanForFirestore(updated), { merge: true });
    } catch (err) {
      console.error('Error updating profile in Firestore:', err);
    }
  }, []);

  // Find buddy by exact User ID or username/email search
  const findUserByIdOrQuery = useCallback(
    async (queryId: string): Promise<UserProfile | null> => {
      const q = queryId.trim();
      if (!q) return null;

      try {
        const userRef = doc(db, 'users', q);
        const snap = await getDoc(userRef);
        if (snap.exists()) {
          const profile = snap.data() as UserProfile;
          return { ...profile, id: snap.id };
        }
      } catch {
        // proceed
      }

      const cleanQ = q.toLowerCase().replace(/^@/, '');
      const found = activeUsers.find(
        (u) =>
          u.id.toLowerCase() === cleanQ ||
          u.username.toLowerCase() === cleanQ ||
          u.email.toLowerCase() === cleanQ ||
          u.name.toLowerCase() === cleanQ
      );

      return found || null;
    },
    [activeUsers]
  );

  // Add Buddy
  const addBuddy = useCallback(
    async (targetUser: UserProfile) => {
      const user = currentUserRef.current;
      if (!user || targetUser.id === user.id) return;
      sounds.playReceive();

      const currentBuddyIds = user.buddyIds || [];
      if (!currentBuddyIds.includes(targetUser.id)) {
        const updatedBuddies = [...currentBuddyIds, targetUser.id];
        await updateProfile({ buddyIds: updatedBuddies });
      }

      try {
        const targetRef = doc(db, 'users', targetUser.id);
        const snap = await getDoc(targetRef);
        if (snap.exists()) {
          const targetData = snap.data() as UserProfile;
          const targetBuddies = targetData.buddyIds || [];
          if (!targetBuddies.includes(user.id)) {
            await updateDoc(targetRef, {
              buddyIds: [...targetBuddies, user.id],
            });
          }
        }
      } catch (e) {
        // ignore
      }

      confetti({
        particleCount: 40,
        spread: 50,
        origin: { y: 0.7 },
      });
    },
    [updateProfile]
  );

  const [buddyRequests, setBuddyRequests] = useState<BuddyRequest[]>([]);
  const [showConversationInfoDrawer, setShowConversationInfoDrawer] = useState(false);
  const [selectedProfileUser, setSelectedProfileUser] = useState<UserProfile | null>(null);

  const knownIncomingReqIdsRef = useRef<Set<string>>(new Set());
  const isReqListenerInitRef = useRef<boolean>(false);

  // Firestore listener for buddyRequests involving currentUser
  useEffect(() => {
    if (!currentUser?.id) {
      setBuddyRequests([]);
      knownIncomingReqIdsRef.current.clear();
      isReqListenerInitRef.current = false;
      return;
    }
    const currentUserId = currentUser.id;

    const qFrom = query(collection(db, 'buddyRequests'), where('fromUserId', '==', currentUserId));
    const qTo = query(collection(db, 'buddyRequests'), where('toUserId', '==', currentUserId));

    const unsubFrom = onSnapshot(qFrom, (snapFrom) => {
      const fromList = snapFrom.docs.map((d) => ({ id: d.id, ...d.data() } as BuddyRequest));
      setBuddyRequests((prev) => {
        const otherList = prev.filter((r) => r.fromUserId !== currentUserId);
        return [...otherList, ...fromList];
      });
    }, (err) => {
      console.warn('Buddy requests from listener note:', err);
    });

    const unsubTo = onSnapshot(qTo, (snapTo) => {
      const toList = snapTo.docs.map((d) => ({ id: d.id, ...d.data() } as BuddyRequest));
      const pendingIncoming = toList.filter((r) => r.status === 'pending');

      if (isReqListenerInitRef.current) {
        pendingIncoming.forEach((req) => {
          if (!knownIncomingReqIdsRef.current.has(req.id)) {
            // Play notification sound
            sounds.playReceive();
            // Show push notification
            showPushNotification('New Buddy Request 🌸', {
              body: `${req.fromUserName} sent you a buddy request!`,
              tag: `buddy-req-${req.id}`,
            });
          }
        });
      } else {
        isReqListenerInitRef.current = true;
      }

      knownIncomingReqIdsRef.current = new Set(pendingIncoming.map((r) => r.id));

      setBuddyRequests((prev) => {
        const otherList = prev.filter((r) => r.toUserId !== currentUserId);
        return [...otherList, ...toList];
      });
    }, (err) => {
      console.warn('Buddy requests to listener note:', err);
    });

    return () => {
      unsubFrom();
      unsubTo();
    };
  }, [currentUser?.id]);

  // Buddy Request Handlers
  const getBuddyRequestState = useCallback(
    (targetUserId: string): BuddyRequestState => {
      const user = currentUserRef.current;
      if (!user) return 'none';
      if ((user.buddyIds || []).includes(targetUserId)) return 'buddy';

      const activeReq = buddyRequests.find(
        (r) =>
          (r.fromUserId === user.id && r.toUserId === targetUserId) ||
          (r.fromUserId === targetUserId && r.toUserId === user.id)
      );

      if (!activeReq) return 'none';
      if (activeReq.status === 'accepted') return 'buddy';
      if (activeReq.status === 'declined') return 'declined';

      if (activeReq.fromUserId === user.id) return 'requestSent';
      if (activeReq.toUserId === user.id) return 'incomingRequest';

      return 'none';
    },
    [buddyRequests]
  );

  const sendBuddyRequest = useCallback(
    async (targetUser: UserProfile) => {
      const user = currentUserRef.current;
      if (!user || user.id === targetUser.id) return;
      sounds.playClick();

      const requestId = `${user.id}_${targetUser.id}`;
      const reqDoc: BuddyRequest = {
        id: requestId,
        fromUserId: user.id,
        fromUserName: user.name,
        fromUserAvatar: user.avatarId,
        toUserId: targetUser.id,
        toUserName: targetUser.name,
        toUserAvatar: targetUser.avatarId,
        status: 'pending',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      // Optimistically update local state immediately
      setBuddyRequests((prev) => [...prev.filter((r) => r.id !== requestId), reqDoc]);

      try {
        await setDoc(doc(db, 'buddyRequests', requestId), cleanForFirestore(reqDoc), { merge: true });
      } catch (e) {
        console.error('Failed to send buddy request:', e);
      }
    },
    []
  );

  const acceptBuddyRequest = useCallback(
    async (requestIdOrFromUserId: string, fromUserIdParam?: string) => {
      const user = currentUserRef.current;
      if (!user) return;
      sounds.playReceive();

      const fromUserId = fromUserIdParam || (requestIdOrFromUserId.includes('_') ? requestIdOrFromUserId.split('_')[0] : requestIdOrFromUserId);
      const targetReq = buddyRequests.find(
        (r) =>
          r.id === requestIdOrFromUserId ||
          (r.fromUserId === fromUserId && r.toUserId === user.id)
      );
      const docId = targetReq ? targetReq.id : requestIdOrFromUserId.includes('_') ? requestIdOrFromUserId : `${fromUserId}_${user.id}`;

      // Optimistically update local state immediately
      setBuddyRequests((prev) =>
        prev.map((r) => (r.id === docId || (r.fromUserId === fromUserId && r.toUserId === user.id) ? { ...r, status: 'accepted' } : r))
      );

      try {
        await setDoc(
          doc(db, 'buddyRequests', docId),
          { status: 'accepted', updatedAt: Date.now() },
          { merge: true }
        );

        const currentBuddies = user.buddyIds || [];
        if (!currentBuddies.includes(fromUserId)) {
          await updateProfile({ buddyIds: [...currentBuddies, fromUserId] });
        }

        const targetRef = doc(db, 'users', fromUserId);
        const snap = await getDoc(targetRef);
        if (snap.exists()) {
          const targetData = snap.data() as UserProfile;
          const targetBuddies = targetData.buddyIds || [];
          if (!targetBuddies.includes(user.id)) {
            await updateDoc(targetRef, {
              buddyIds: [...targetBuddies, user.id],
            });
          }
        }

        confetti({
          particleCount: 40,
          spread: 50,
          origin: { y: 0.7 },
        });
      } catch (e) {
        console.error('Failed to accept buddy request:', e);
      }
    },
    [buddyRequests, updateProfile]
  );

  const declineBuddyRequest = useCallback(
    async (requestIdOrFromUserId: string) => {
      const user = currentUserRef.current;
      sounds.playClick();
      if (!user) return;

      const targetReq = buddyRequests.find(
        (r) =>
          r.id === requestIdOrFromUserId ||
          (r.fromUserId === requestIdOrFromUserId && r.toUserId === user.id) ||
          (r.fromUserId === user.id && r.toUserId === requestIdOrFromUserId)
      );

      const docId = targetReq ? targetReq.id : requestIdOrFromUserId.includes('_') ? requestIdOrFromUserId : `${requestIdOrFromUserId}_${user.id}`;

      setBuddyRequests((prev) =>
        prev.map((r) => (r.id === docId ? { ...r, status: 'declined' } : r))
      );

      try {
        await setDoc(
          doc(db, 'buddyRequests', docId),
          { status: 'declined', updatedAt: Date.now() },
          { merge: true }
        );
      } catch (e) {
        console.error('Failed to decline buddy request:', e);
      }
    },
    [buddyRequests]
  );

  const cancelBuddyRequest = useCallback(
    async (requestIdOrTargetId: string) => {
      const user = currentUserRef.current;
      sounds.playClick();
      if (!user) return;

      const targetReq = buddyRequests.find(
        (r) =>
          r.id === requestIdOrTargetId ||
          (r.fromUserId === user.id && r.toUserId === requestIdOrTargetId) ||
          (r.fromUserId === requestIdOrTargetId && r.toUserId === user.id)
      );

      const docId = targetReq ? targetReq.id : requestIdOrTargetId.includes('_') ? requestIdOrTargetId : `${user.id}_${requestIdOrTargetId}`;

      // Optimistically update local state immediately
      setBuddyRequests((prev) => prev.filter((r) => r.id !== docId && r.fromUserId !== requestIdOrTargetId && r.toUserId !== requestIdOrTargetId));

      try {
        await deleteDoc(doc(db, 'buddyRequests', docId)).catch(() => {});
        const altDocId = `${requestIdOrTargetId}_${user.id}`;
        await deleteDoc(doc(db, 'buddyRequests', altDocId)).catch(() => {});
      } catch (e) {
        console.error('Failed to cancel buddy request:', e);
      }
    },
    [buddyRequests]
  );

  // Block / Unblock User
  const isBlocked = useCallback(
    (targetUserId: string): boolean => {
      const user = currentUserRef.current;
      if (!user) return false;
      return (user.blockedUserIds || []).includes(targetUserId);
    },
    []
  );

  const toggleBlockUser = useCallback(
    async (targetUserId: string) => {
      const user = currentUserRef.current;
      if (!user) return;
      sounds.playClick();

      const currentBlocked = user.blockedUserIds || [];
      const isCurrentlyBlocked = currentBlocked.includes(targetUserId);
      const updatedBlocked = isCurrentlyBlocked
        ? currentBlocked.filter((id) => id !== targetUserId)
        : [...currentBlocked, targetUserId];

      await updateProfile({ blockedUserIds: updatedBlocked });
    },
    [updateProfile]
  );

  // Pin & Favorite Chat Room
  const isRoomPinned = useCallback(
    (roomId: string): boolean => {
      const user = currentUserRef.current;
      if (!user) return false;
      const room = rawRooms.find((r) => r.id === roomId);
      return (room?.isPinnedBy || []).includes(user.id);
    },
    [rawRooms]
  );

  const isRoomFavorite = useCallback(
    (roomId: string): boolean => {
      const user = currentUserRef.current;
      if (!user) return false;
      const room = rawRooms.find((r) => r.id === roomId);
      return (room?.isFavoriteBy || []).includes(user.id);
    },
    [rawRooms]
  );

  const togglePinRoom = useCallback(
    async (roomId: string) => {
      const user = currentUserRef.current;
      if (!user) return;
      sounds.playClick();

      const room = rawRooms.find((r) => r.id === roomId);
      if (!room) return;

      const currentPinnedBy = room.isPinnedBy || [];
      const updatedPinnedBy = currentPinnedBy.includes(user.id)
        ? currentPinnedBy.filter((id) => id !== user.id)
        : [...currentPinnedBy, user.id];

      try {
        await updateDoc(doc(db, 'rooms', roomId), { isPinnedBy: updatedPinnedBy });
      } catch (e) {
        console.error('Failed to toggle pin room:', e);
      }
    },
    [rawRooms]
  );

  const toggleFavoriteRoom = useCallback(
    async (roomId: string) => {
      const user = currentUserRef.current;
      if (!user) return;
      sounds.playClick();

      const room = rawRooms.find((r) => r.id === roomId);
      if (!room) return;

      const currentFavoriteBy = room.isFavoriteBy || [];
      const updatedFavoriteBy = currentFavoriteBy.includes(user.id)
        ? currentFavoriteBy.filter((id) => id !== user.id)
        : [...currentFavoriteBy, user.id];

      try {
        await updateDoc(doc(db, 'rooms', roomId), { isFavoriteBy: updatedFavoriteBy });
      } catch (e) {
        console.error('Failed to toggle favorite room:', e);
      }
    },
    [rawRooms]
  );

  // Conversation-specific Theme
  const setRoomTheme = useCallback(
    async (roomId: string, themePattern: string) => {
      const user = currentUserRef.current;
      if (!user) return;
      sounds.playClick();

      try {
        await updateDoc(doc(db, 'rooms', roomId), {
          [`chatThemeByUser.${user.id}`]: themePattern,
        });
      } catch (e) {
        console.error('Failed to set room theme:', e);
      }
    },
    []
  );

  // Temporary Chat Setting
  const setRoomTemporaryChat = useCallback(
    async (roomId: string, enabled: boolean, durationSeconds = 86400) => {
      sounds.playClick();
      try {
        await updateDoc(doc(db, 'rooms', roomId), {
          temporaryChat: {
            enabled,
            durationSeconds,
            updatedAt: Date.now(),
          },
        });
      } catch (e) {
        console.error('Failed to set temporary chat:', e);
      }
    },
    []
  );

  // Remove Buddy
  const removeBuddy = useCallback(
    async (targetUserId: string) => {
      const user = currentUserRef.current;
      if (!user) return;
      sounds.playClick();
      const updatedBuddies = (user.buddyIds || []).filter((id) => id !== targetUserId);
      await updateProfile({ buddyIds: updatedBuddies });

      try {
        const targetRef = doc(db, 'users', targetUserId);
        const snap = await getDoc(targetRef);
        if (snap.exists()) {
          const targetData = snap.data() as UserProfile;
          const targetBuddies = (targetData.buddyIds || []).filter((id) => id !== user.id);
          await updateDoc(targetRef, { buddyIds: targetBuddies });
        }
      } catch (e) {
        // ignore
      }
    },
    [updateProfile]
  );

  const isBuddy = useCallback(
    (userId: string) => {
      const user = currentUserRef.current;
      if (!user) return false;
      if (user.id === userId) return true;
      const isDirectBuddy = (user.buddyIds || []).includes(userId);
      const isReqBuddy = buddyRequests.some(
        (r) =>
          r.status === 'accepted' &&
          ((r.fromUserId === user.id && r.toUserId === userId) ||
            (r.fromUserId === userId && r.toUserId === user.id))
      );
      return isDirectBuddy || isReqBuddy;
    },
    [buddyRequests]
  );

  // Start Direct Message (DOES NOT call addBuddy!)
  const startDirectMessage = useCallback(
    async (targetUser: UserProfile) => {
      const user = currentUserRef.current;
      if (!user || user.id === targetUser.id) return;
      sounds.playClick();

      const dmId = ['dm', user.id, targetUser.id].sort().join('-');
      const dmRoom: ChatRoom = {
        id: dmId,
        name: targetUser.name,
        description: `Direct chat with @${targetUser.username}`,
        icon: '💬',
        type: 'direct',
        isDirect: true,
        createdBy: user.id,
        participantIds: [user.id, targetUser.id],
        createdAt: Date.now(),
      };

      try {
        const roomDocRef = doc(db, 'rooms', dmId);
        await setDoc(roomDocRef, cleanForFirestore(dmRoom), { merge: true });
        setCurrentRoomId(dmId);
        setActiveMobileTab('chats');
      } catch (err) {
        console.error('Failed to initiate DM:', err);
      }
    },
    [setCurrentRoomId, setActiveMobileTab]
  );

  // Create Group Chat
  const createGroupRoom = useCallback(
    async (name: string, description: string, icon: string, memberIds: string[] = []) => {
      const user = currentUserRef.current;
      if (!user) return '';
      sounds.playSend();

      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const roomId = 'grp_' + (slug || 'space') + '_' + Date.now().toString(36);

      const uniqueParticipants = Array.from(new Set([user.id, ...memberIds]));

      const newRoom: ChatRoom = {
        id: roomId,
        name: name.trim(),
        description: description.trim() || 'A cozy group space for friends 🌸',
        icon: icon || '🌸',
        type: 'group',
        isDirect: false,
        createdBy: user.id,
        participantIds: uniqueParticipants,
        createdAt: Date.now(),
      };

      try {
        const roomDocRef = doc(db, 'rooms', roomId);
        await setDoc(roomDocRef, cleanForFirestore(newRoom));
        setCurrentRoomId(roomId);
        return roomId;
      } catch (e) {
        console.error('Failed to create group channel:', e);
        return '';
      }
    },
    [setCurrentRoomId]
  );

  // Delete Channel
  const deleteChannel = useCallback(
    async (roomId: string): Promise<boolean> => {
      const user = currentUserRef.current;
      if (!user) return false;
      sounds.playClick();

      try {
        const roomDocRef = doc(db, 'rooms', roomId);
        await deleteDoc(roomDocRef);

        setRawRooms((prev) => {
          const remaining = prev.filter((r) => r.id !== roomId);
          if (currentRoomId === roomId) {
            if (remaining.length > 0) {
              setCurrentRoomIdState(remaining[0].id);
            } else {
              setCurrentRoomIdState('');
            }
          }
          return remaining;
        });

        return true;
      } catch (err) {
        console.error('Failed to delete channel:', err);
        return false;
      }
    },
    [currentRoomId]
  );

  // Real-time Firestore typing sync
  const sendTyping = useCallback(
    (isTyping: boolean) => {
      const user = currentUserRef.current;
      if (!user || !currentRoomId) return;

      const typingDocRef = doc(db, 'rooms', currentRoomId, 'typing', user.id);

      if (!isTyping) {
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
          typingTimeoutRef.current = null;
        }
        deleteDoc(typingDocRef).catch(() => {});
        return;
      }

      const now = Date.now();
      if (now - lastTypingWriteRef.current > 2000) {
        lastTypingWriteRef.current = now;
        const typingPayload: TypingIndicatorUser = {
          userId: user.id,
          userName: user.name,
          avatarId: user.avatarId,
          customAvatarUrl: user.customAvatarUrl,
          timestamp: now,
        };
        setDoc(typingDocRef, cleanForFirestore(typingPayload)).catch(() => {});
      }

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      typingTimeoutRef.current = setTimeout(() => {
        deleteDoc(typingDocRef).catch(() => {});
        typingTimeoutRef.current = null;
      }, 3000);
    },
    [currentRoomId]
  );

  // Send Message
  const sendMessage = useCallback(
    async (
      content: string,
      type: MessageType = 'text',
      attachmentUrl?: string,
      audioDuration?: number
    ) => {
      const user = currentUserRef.current;
      if (!user || !currentRoomId) return;
      if (!content.trim() && !attachmentUrl && type === 'text') return;

      sendTyping(false);

      const newMsgId = 'msg_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);
      const rawMsg: ChatMessage = {
        id: newMsgId,
        roomId: currentRoomId,
        senderId: user.id,
        senderName: user.name,
        senderAvatar: user.avatarId,
        senderCustomAvatar: user.customAvatarUrl,
        senderBadge: user.badge,
        senderTheme: user.theme,
        type,
        content: content.trim(),
        attachmentUrl,
        audioDuration,
        reactions: {},
        replyTo: replyingTo || undefined,
        timestamp: Date.now(),
        readBy: [user.id],
      };

      const firestoreMsg = cleanForFirestore(rawMsg);

      sounds.playSend();
      setReplyingTo(null);

      markRoomAsRead(currentRoomId);

      try {
        const msgDocRef = doc(db, 'rooms', currentRoomId, 'messages', newMsgId);
        await setDoc(msgDocRef, firestoreMsg);

        const roomDocRef = doc(db, 'rooms', currentRoomId);
        await updateDoc(roomDocRef, {
          lastMessage: type === 'sticker' ? '🎨 Sticker' : type === 'voice' ? '🎙️ Voice note' : content.slice(0, 35),
          lastMessageTime: Date.now(),
        }).catch(() => {
          setDoc(roomDocRef, {
            id: currentRoomId,
            name: currentRoomId,
            icon: '💬',
            type: 'group',
            participantIds: [user.id],
            lastMessage: content.slice(0, 35),
            lastMessageTime: Date.now(),
          }, { merge: true });
        });
      } catch (err) {
        console.error('Failed to post message to Firestore:', err);
      }
    },
    [currentRoomId, replyingTo, sendTyping, markRoomAsRead]
  );

  // Toggle Reaction in Firestore
  const reactToMessage = useCallback(
    async (messageId: string, emoji: string) => {
      const user = currentUserRef.current;
      if (!user || !currentRoomId) return;
      sounds.playReaction();

      const targetMsg = messages.find((m) => m.id === messageId);
      if (!targetMsg) return;

      const reactions = { ...(targetMsg.reactions || {}) };
      const currentList = [...(reactions[emoji] || [])];
      const idx = currentList.indexOf(user.id);
      if (idx >= 0) {
        currentList.splice(idx, 1);
        if (currentList.length === 0) delete reactions[emoji];
        else reactions[emoji] = currentList;
      } else {
        currentList.push(user.id);
        reactions[emoji] = currentList;
      }

      try {
        const msgRef = doc(db, 'rooms', currentRoomId, 'messages', messageId);
        await updateDoc(msgRef, { reactions });
      } catch (err) {
        console.error('Failed to update reaction:', err);
      }
    },
    [currentRoomId, messages]
  );

  // Delete message in Firestore
  const deleteMessage = useCallback(
    async (messageId: string) => {
      if (!currentRoomId) return;
      sounds.playClick();
      try {
        const msgRef = doc(db, 'rooms', currentRoomId, 'messages', messageId);
        await deleteDoc(msgRef);
      } catch (err) {
        console.error('Failed to delete message:', err);
      }
    },
    [currentRoomId]
  );

  // Toggle Pin in Firestore
  const togglePinMessage = useCallback(
    async (messageId: string) => {
      if (!currentRoomId) return;
      sounds.playClick();
      const targetMsg = messages.find((m) => m.id === messageId);
      if (!targetMsg) return;

      try {
        const msgRef = doc(db, 'rooms', currentRoomId, 'messages', messageId);
        await updateDoc(msgRef, { isPinned: !targetMsg.isPinned });
      } catch (err) {
        console.error('Failed to pin message:', err);
      }
    },
    [currentRoomId, messages]
  );

  // Confetti celebration
  const triggerConfetti = useCallback(() => {
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#FB7185', '#F472B6', '#FDE047', '#A78BFA', '#38BDF8'],
    });
  }, []);

  const handleSignOut = async () => {
    const user = currentUserRef.current;
    if (user?.id) {
      try {
        if (currentRoomId) {
          deleteDoc(doc(db, 'rooms', currentRoomId, 'typing', user.id)).catch(() => {});
        }
        await updateDoc(doc(db, 'users', user.id), {
          status: 'offline',
          lastSeen: Date.now(),
        });
      } catch {
        // silent fail
      }
    }
    try {
      await signOut(auth);
    } catch {
      // ignore
    }
    try {
      localStorage.removeItem('mochichat_active_user_uid');
      localStorage.removeItem('mochichat_profile_cache');
    } catch {
      // ignore
    }
    setCurrentUser(null);
  };

  const setUserProfileDirectly = (profile: UserProfile) => {
    setCurrentUser(profile);
  };

  const rooms: ChatRoom[] = rawRooms.map((room) => ({
    ...room,
    unreadCount: roomUnreadCounts[room.id] || 0,
  }));

  const currentRoom = rooms.find((r) => r.id === currentRoomId);
  const pinnedMessages = messages.filter((m) => m.isPinned);

  const groupRooms = rooms.filter((r) => r.type === 'group' || (!r.isDirect && r.type !== 'direct'));
  const directRooms = rooms.filter((r) => r.type === 'direct' || r.isDirect);

  const buddyIdsList = currentUser?.buddyIds || [];
  const buddies = activeUsers.filter((u) => u.id !== currentUser?.id && buddyIdsList.includes(u.id));

  const theme: ThemeColor = currentUser?.gender === 'male'
    ? 'midnight'
    : (currentUser?.theme || 'strawberry');

  const setTheme = useCallback(
    (t: ThemeColor) => {
      if (currentUser?.gender === 'male') return; // Male theme locked to midnight
      updateProfile({ theme: t });
    },
    [currentUser?.gender, updateProfile]
  );

  const chatPattern: ChatPattern = currentUser?.gender === 'male'
    ? (currentUser?.chatPattern && ['midnight_grid', 'carbon_grid', 'blueprint', 'nocturne', 'none'].includes(currentUser.chatPattern) ? currentUser.chatPattern : 'midnight_grid')
    : (currentUser?.chatPattern || 'mochi_dots');

  const setChatPattern = useCallback(
    (p: ChatPattern) => {
      updateProfile({ chatPattern: p });
    },
    [updateProfile]
  );

  return (
    <ChatContext.Provider
      value={{
        currentUser,
        authUser,
        isAuthLoading,
        updateProfile,
        rooms,
        groupRooms,
        directRooms,
        currentRoomId,
        currentRoom,
        setCurrentRoomId,
        markRoomAsRead,
        messages,
        sendMessage,
        reactToMessage,
        deleteMessage,
        togglePinMessage,
        deleteChannel,
        activeUsers,
        buddies,
        findUserByIdOrQuery,
        addBuddy,
        removeBuddy,
        isBuddy,
        buddyRequests,
        getBuddyRequestState,
        sendBuddyRequest,
        acceptBuddyRequest,
        declineBuddyRequest,
        cancelBuddyRequest,
        isBlocked,
        toggleBlockUser,
        togglePinRoom,
        toggleFavoriteRoom,
        isRoomPinned,
        isRoomFavorite,
        setRoomTheme,
        setRoomTemporaryChat,
        showConversationInfoDrawer,
        setShowConversationInfoDrawer,
        selectedProfileUser,
        setSelectedProfileUser,
        typingUsers,
        sendTyping,
        createGroupRoom,
        startDirectMessage,
        replyingTo,
        setReplyingTo,
        searchQuery,
        setSearchQuery,
        isConnected,
        isOnline,
        theme,
        setTheme,
        chatPattern,
        setChatPattern,
        pinnedMessages,
        showProfileModal,
        setShowProfileModal,
        showCreateRoomModal,
        setShowCreateRoomModal,
        showFindBuddyModal,
        setShowFindBuddyModal,
        showMembersPanel,
        setShowMembersPanel,
        triggerConfetti,
        activeMobileTab,
        setActiveMobileTab,
        handleSignOut,
        setUserProfileDirectly,
        stories,
        addStory,
        markStoryViewed,
        reactToStory,
        deleteStory,
        showCreateStoryModal,
        setShowCreateStoryModal,
        activeCall,
        startVideoCall,
        answerCall,
        rejectCall,
        endCall,
        notificationPermission,
        enablePushNotifications,
        scheduledMessages,
        scheduleMessage,
        cancelScheduledMessage,
        sendScheduledMessageNow,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
