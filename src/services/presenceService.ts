import { rtdb, db } from '../firebase';
import {
  ref as rtdbRef,
  onValue as rtdbOnValue,
  set as rtdbSet,
  onDisconnect as rtdbOnDisconnect,
  serverTimestamp as rtdbServerTimestamp,
} from 'firebase/database';
import { doc, updateDoc, serverTimestamp as firestoreServerTimestamp } from 'firebase/firestore';

export interface PresenceRecord {
  state: 'online' | 'idle' | 'offline' | 'hidden';
  lastSeen: number | any;
}

/**
 * Realtime Database & Firestore Canonical Presence Service.
 * Ensures:
 * 1. onDisconnect() handles browser close, network drop, refresh, tab unload safely on the server side.
 * 2. Profile updates NEVER touch or overwrite presence or lastSeen.
 * 3. showActiveStatus = false cleanly masks user presence as offline.
 */
class PresenceService {
  private currentUserId: string | null = null;
  private showActiveStatus: boolean = true;
  private unsubRtdb: (() => void) | null = null;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private lastFirestoreWrite: number = 0;
  private currentStatus: 'online' | 'idle' | 'offline' = 'online';

  public initialize(userId: string, showActiveStatus: boolean = true) {
    if (this.currentUserId === userId && this.showActiveStatus === showActiveStatus) {
      return;
    }
    this.cleanup();
    this.currentUserId = userId;
    this.showActiveStatus = showActiveStatus;

    if (!userId) return;

    // 1. Firebase Realtime Database Presence (Canonical)
    if (rtdb) {
      try {
        const connectedRef = rtdbRef(rtdb, '.info/connected');
        const userStatusRef = rtdbRef(rtdb, `/status/${userId}`);

        this.unsubRtdb = rtdbOnValue(connectedRef, (snapshot) => {
          if (snapshot.val() === true) {
            // Register server-side onDisconnect trigger before writing online
            rtdbOnDisconnect(userStatusRef)
              .set({
                state: 'offline',
                lastSeen: rtdbServerTimestamp(),
              })
              .then(() => {
                const targetState = this.showActiveStatus ? 'online' : 'offline';
                rtdbSet(userStatusRef, {
                  state: targetState,
                  lastSeen: rtdbServerTimestamp(),
                });
              })
              .catch((err) => {
                console.warn('[Presence] RTDB onDisconnect note:', err);
              });
          }
        });
      } catch (err) {
        console.warn('[Presence] RTDB connection setup note:', err);
      }
    }

    // 2. Initial state synchronization
    if (navigator.onLine) {
      this.writeFirestorePresence(this.showActiveStatus ? 'online' : 'offline');
    }

    // 3. Heartbeat for Firestore presence fallback (every 30s while active)
    this.heartbeatInterval = setInterval(() => {
      if (navigator.onLine && document.visibilityState === 'visible') {
        const target = this.showActiveStatus ? this.currentStatus : 'offline';
        this.writeFirestorePresence(target);
      }
    }, 30000);

    // 4. Attach window events
    window.addEventListener('online', this.handleOnline);
    window.addEventListener('offline', this.handleOffline);
    document.addEventListener('visibilitychange', this.handleVisibility);
    window.addEventListener('pagehide', this.handleUnload);
  }

  public setActivityState(status: 'online' | 'idle') {
    if (!this.currentUserId) return;
    this.currentStatus = status;
    const target = this.showActiveStatus ? status : 'offline';
    this.writeFirestorePresence(target);

    if (rtdb) {
      try {
        const userStatusRef = rtdbRef(rtdb, `/status/${this.currentUserId}`);
        rtdbSet(userStatusRef, {
          state: target,
          lastSeen: rtdbServerTimestamp(),
        }).catch(() => {});
      } catch {
        // ignore
      }
    }
  }

  private handleOnline = () => {
    this.setActivityState('online');
  };

  private handleOffline = () => {
    this.currentStatus = 'offline';
    this.writeFirestorePresence('offline');
  };

  private handleVisibility = () => {
    if (!navigator.onLine) return;
    if (document.visibilityState === 'visible') {
      this.setActivityState('online');
    } else {
      // Switched away: transition to idle if inactive for more than 45s
      setTimeout(() => {
        if (document.visibilityState !== 'visible') {
          this.setActivityState('idle');
        }
      }, 45000);
    }
  };

  private handleUnload = () => {
    if (!this.currentUserId) return;
    try {
      const userRef = doc(db, 'users', this.currentUserId);
      updateDoc(userRef, {
        status: 'offline',
        lastSeen: firestoreServerTimestamp(),
      }).catch(() => {});
    } catch {
      // ignore
    }
  };

  private async writeFirestorePresence(status: 'online' | 'idle' | 'offline') {
    if (!this.currentUserId) return;
    const now = Date.now();
    // Throttle writes: at most once every 15s unless changing to offline
    if (status !== 'offline' && now - this.lastFirestoreWrite < 15000) {
      return;
    }
    this.lastFirestoreWrite = now;

    try {
      const userRef = doc(db, 'users', this.currentUserId);
      // ONLY update status and lastSeen, NEVER touch profile bio, avatar, or buddyIds
      await updateDoc(userRef, {
        status,
        lastSeen: firestoreServerTimestamp(),
      });
    } catch {
      // Ignore background presence update failures
    }
  }

  public subscribeToUserPresence(
    targetUserId: string,
    callback: (presence: PresenceRecord | null) => void
  ): () => void {
    if (!targetUserId) {
      callback(null);
      return () => {};
    }

    if (rtdb) {
      const statusRef = rtdbRef(rtdb, `/status/${targetUserId}`);
      const unsub = rtdbOnValue(statusRef, (snapshot) => {
        if (snapshot.exists()) {
          callback(snapshot.val() as PresenceRecord);
        } else {
          callback(null);
        }
      });
      return () => unsub();
    }

    return () => {};
  }

  public cleanup() {
    if (this.unsubRtdb) {
      this.unsubRtdb();
      this.unsubRtdb = null;
    }
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
    window.removeEventListener('online', this.handleOnline);
    window.removeEventListener('offline', this.handleOffline);
    document.removeEventListener('visibilitychange', this.handleVisibility);
    window.removeEventListener('pagehide', this.handleUnload);

    if (this.currentUserId) {
      this.writeFirestorePresence('offline');
    }
    this.currentUserId = null;
  }
}

export const presenceService = new PresenceService();

export function initializeRealtimePresence(
  userId: string,
  currentUser?: { showActiveStatus?: boolean } | null
): () => void {
  presenceService.initialize(userId, currentUser?.showActiveStatus !== false);
  return () => presenceService.cleanup();
}

export function teardownRealtimePresence(userId?: string): void {
  presenceService.cleanup();
}

export async function updateUserPresenceStatus(
  userId: string,
  status: 'online' | 'idle' | 'offline',
  showActiveStatus: boolean = true
): Promise<void> {
  presenceService.setActivityState(status === 'offline' ? 'idle' : status);
}

export function subscribeToUserPresence(
  targetUserId: string,
  callback: (presence: PresenceRecord | null) => void
): () => void {
  return presenceService.subscribeToUserPresence(targetUserId, callback);
}
