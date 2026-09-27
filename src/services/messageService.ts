import { db } from '../firebase';
import {
  doc,
  writeBatch,
  runTransaction,
  collection,
  query,
  where,
  getDocs,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { ChatMessage, MessageType, MessageReplyTo, ScheduledMessage, UserProfile } from '../types/chat';

function cleanForFirestore(obj: any): any {
  if (obj === null || obj === undefined) return null;
  if (Array.isArray(obj)) return obj.map(cleanForFirestore);
  if (typeof obj === 'object') {
    const cleaned: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) {
        cleaned[key] = cleanForFirestore(value);
      }
    }
    return cleaned;
  }
  return obj;
}

export interface SendMessageParams {
  roomId: string;
  sender: UserProfile;
  content: string;
  type?: MessageType;
  attachmentUrl?: string;
  audioDuration?: number;
  replyTo?: MessageReplyTo;
  isDm?: boolean;
  dmParticipants?: string[];
}

/**
 * Atomically writes a new message to the room's message subcollection
 * and updates the parent room's metadata in a single Firestore writeBatch.
 */
export async function sendCanonicalMessage({
  roomId,
  sender,
  content,
  type = 'text',
  attachmentUrl,
  audioDuration,
  replyTo,
  isDm,
  dmParticipants,
}: SendMessageParams): Promise<ChatMessage> {
  const newMsgId = 'msg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8);
  const now = Date.now();

  const rawMsg: ChatMessage = {
    id: newMsgId,
    roomId,
    senderId: sender.id,
    senderName: sender.name,
    senderAvatar: sender.avatarId,
    senderCustomAvatar: sender.customAvatarUrl,
    senderBadge: sender.badge,
    senderTheme: sender.theme,
    type,
    content: content.trim(),
    attachmentUrl: attachmentUrl || undefined,
    audioDuration: audioDuration || undefined,
    reactions: {},
    replyTo: replyTo || undefined,
    timestamp: now,
    readBy: [sender.id],
  };

  const firestoreMsg = cleanForFirestore(rawMsg);
  const batch = writeBatch(db);

  // 1. Message Document
  const msgDocRef = doc(db, 'rooms', roomId, 'messages', newMsgId);
  batch.set(msgDocRef, firestoreMsg);

  // 2. Room Metadata
  const roomDocRef = doc(db, 'rooms', roomId);
  let summary = content.trim().slice(0, 40);
  if (type === 'sticker') summary = 'Sticker';
  if (type === 'voice') summary = 'Voice note';
  if (type === 'image') summary = 'Shared a photo';

  const roomUpdate: Record<string, any> = {
    lastMessage: summary,
    lastMessageTime: now,
    lastSenderId: sender.id,
  };

  if (isDm && dmParticipants && dmParticipants.length > 0) {
    roomUpdate.type = 'direct';
    roomUpdate.isDirect = true;
    roomUpdate.participantIds = dmParticipants;
  }

  batch.set(roomDocRef, roomUpdate, { merge: true });

  await batch.commit();
  return rawMsg;
}

/**
 * Idempotently executes due scheduled messages using Firestore transactions.
 * Guarantees that a scheduled message will be sent at most once, even under
 * concurrent checks across multiple tabs or server pollers.
 */
export async function processDueScheduledMessages(
  userId: string,
  onMessageSent?: (msg: ChatMessage) => void
): Promise<number> {
  if (!userId) return 0;
  const now = Date.now();

  try {
    const schedCol = collection(db, 'scheduledMessages');
    const q = query(
      schedCol,
      where('senderId', '==', userId),
      where('status', '==', 'scheduled')
    );

    const snapshot = await getDocs(q);
    let sentCount = 0;

    for (const d of snapshot.docs) {
      const scheduled = d.data() as ScheduledMessage;
      if (scheduled.scheduledFor <= now) {
        // Run idempotent atomic transaction
        const sentMsg = await runTransaction(db, async (transaction) => {
          const schedRef = doc(db, 'scheduledMessages', d.id);
          const currentSchedSnap = await transaction.get(schedRef);

          if (!currentSchedSnap.exists()) return null;
          const currentData = currentSchedSnap.data() as ScheduledMessage;
          if (currentData.status !== 'scheduled') {
            return null; // Already delivered by another worker/tab
          }

          // Mark as sent
          transaction.update(schedRef, {
            status: 'sent',
            sentAt: now,
          });

          // Create the message in room
          const msgDocRef = doc(db, 'rooms', scheduled.roomId, 'messages', d.id);
          const rawMsg: ChatMessage = {
            id: d.id,
            roomId: scheduled.roomId,
            senderId: scheduled.senderId,
            senderName: scheduled.senderName,
            senderAvatar: scheduled.senderAvatar,
            senderCustomAvatar: scheduled.senderCustomAvatar,
            senderBadge: scheduled.senderBadge,
            senderTheme: scheduled.senderTheme,
            type: scheduled.type,
            content: scheduled.content,
            attachmentUrl: scheduled.attachmentUrl,
            audioDuration: scheduled.audioDuration,
            reactions: {},
            replyTo: scheduled.replyTo,
            timestamp: now,
            readBy: [scheduled.senderId],
          };

          transaction.set(msgDocRef, cleanForFirestore(rawMsg));

          // Update room metadata
          const roomRef = doc(db, 'rooms', scheduled.roomId);
          let summary = scheduled.content.slice(0, 40);
          if (scheduled.type === 'sticker') summary = 'Sticker';
          if (scheduled.type === 'voice') summary = 'Voice note';
          if (scheduled.type === 'image') summary = 'Shared a photo';

          transaction.set(
            roomRef,
            {
              lastMessage: summary,
              lastMessageTime: now,
              lastSenderId: scheduled.senderId,
            },
            { merge: true }
          );

          return rawMsg;
        });

        if (sentMsg) {
          sentCount++;
          if (onMessageSent) {
            onMessageSent(sentMsg);
          }
        }
      }
    }

    return sentCount;
  } catch (err) {
    console.warn('[MESSAGE_SERVICE] Scheduled message execution warning:', err);
    return 0;
  }
}
