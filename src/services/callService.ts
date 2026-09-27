import { db } from '../firebase';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  runTransaction,
} from 'firebase/firestore';
import { CallSession, CallType, UserProfile } from '../types/chat';

// Production STUN/TURN configuration
export const getIceServers = (): RTCConfiguration => {
  const iceServers: RTCIceServer[] = [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' },
  ];

  const turnUrl = import.meta.env.VITE_TURN_URL;
  const turnUsername = import.meta.env.VITE_TURN_USERNAME;
  const turnCredential = import.meta.env.VITE_TURN_CREDENTIAL;

  if (turnUrl) {
    const server: RTCIceServer = { urls: turnUrl };
    if (turnUsername) server.username = turnUsername;
    if (turnCredential) server.credential = turnCredential;
    iceServers.push(server);
  }

  return {
    iceServers,
    iceCandidatePoolSize: 10,
  };
};

export interface ActiveCallLock {
  callId: string;
  peerId: string;
  status: 'calling' | 'connected';
  startedAt: number;
}

/**
 * Checks if a user is currently in an ongoing call.
 * Uses a 2-minute staleness threshold to auto-heal abandoned locks.
 */
export async function isUserInActiveCall(userId: string): Promise<boolean> {
  if (!userId) return false;
  try {
    const lockRef = doc(db, 'activeCalls', userId);
    const snap = await getDoc(lockRef);
    if (!snap.exists()) return false;
    const data = snap.data() as ActiveCallLock;
    // If lock is older than 2 minutes and not refreshed, consider it stale
    if (Date.now() - (data.startedAt || 0) > 120000) {
      deleteDoc(lockRef).catch(() => {});
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[CALL_SERVICE] Error checking active call lock:', err);
    return false;
  }
}

/**
 * Initiates a call with concurrency locks for both caller and receiver.
 * Returns { success: true, callSession } or { success: false, reason: 'busy' | 'error' }
 */
export async function initiateCallWithLock(
  caller: UserProfile,
  receiver: UserProfile,
  callType: CallType = 'video',
  roomId: string = ''
): Promise<{ success: boolean; callSession?: CallSession; reason?: 'busy' | 'blocked' | 'error' }> {
  if (!caller?.id || !receiver?.id) {
    return { success: false, reason: 'error' };
  }

  // Check if target receiver is already in a call
  const receiverBusy = await isUserInActiveCall(receiver.id);
  if (receiverBusy) {
    return { success: false, reason: 'busy' };
  }

  const callId = `call_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  const callSession: CallSession = {
    id: callId,
    roomId: roomId || `dm_${[caller.id, receiver.id].sort().join('_')}`,
    callType,
    callerId: caller.id,
    callerName: caller.name,
    callerAvatar: caller.avatarId,
    callerCustomAvatar: caller.customAvatarUrl,
    receiverId: receiver.id,
    receiverName: receiver.name,
    receiverAvatar: receiver.avatarId,
    receiverCustomAvatar: receiver.customAvatarUrl,
    status: 'calling',
    participantIds: [caller.id, receiver.id],
    createdAt: Date.now(),
  };

  try {
    // Acquire locks atomically
    const callerLockRef = doc(db, 'activeCalls', caller.id);
    const receiverLockRef = doc(db, 'activeCalls', receiver.id);
    const callDocRef = doc(db, 'calls', callId);

    const lockDataCaller: ActiveCallLock = {
      callId,
      peerId: receiver.id,
      status: 'calling',
      startedAt: Date.now(),
    };

    const lockDataReceiver: ActiveCallLock = {
      callId,
      peerId: caller.id,
      status: 'calling',
      startedAt: Date.now(),
    };

    await Promise.all([
      setDoc(callerLockRef, lockDataCaller),
      setDoc(receiverLockRef, lockDataReceiver),
      setDoc(callDocRef, callSession),
    ]);

    return { success: true, callSession };
  } catch (err) {
    console.error('[CALL_SERVICE] Error initiating call with lock:', err);
    // Cleanup any partial locks
    releaseCallLocks(callId, caller.id, receiver.id).catch(() => {});
    return { success: false, reason: 'error' };
  }
}

/**
 * Releases call locks for both participants safely.
 */
export async function releaseCallLocks(
  callId: string,
  callerId?: string,
  receiverId?: string
): Promise<void> {
  const promises: Promise<void>[] = [];

  if (callerId) {
    const callerLockRef = doc(db, 'activeCalls', callerId);
    promises.push(
      getDoc(callerLockRef).then((snap) => {
        if (snap.exists() && snap.data()?.callId === callId) {
          return deleteDoc(callerLockRef);
        }
      }).catch(() => {})
    );
  }

  if (receiverId) {
    const receiverLockRef = doc(db, 'activeCalls', receiverId);
    promises.push(
      getDoc(receiverLockRef).then((snap) => {
        if (snap.exists() && snap.data()?.callId === callId) {
          return deleteDoc(receiverLockRef);
        }
      }).catch(() => {})
    );
  }

  await Promise.allSettled(promises);
}

/**
 * Terminates a call session in Firestore and removes locks.
 */
export async function terminateCallSession(
  callId: string,
  status: 'ended' | 'rejected' | 'busy' | 'failed',
  callerId?: string,
  receiverId?: string
): Promise<void> {
  try {
    const callRef = doc(db, 'calls', callId);
    await updateDoc(callRef, {
      status,
      endedAt: Date.now(),
    }).catch(() => {});
  } finally {
    await releaseCallLocks(callId, callerId, receiverId);
  }
}
