import { db } from '../firebase';
import {
  doc,
  getDoc,
  setDoc,
  runTransaction,
  collection,
  query,
  where,
  onSnapshot,
  Unsubscribe,
  serverTimestamp,
} from 'firebase/firestore';
import { RelationshipState } from '../types/chat';

export interface RelationshipDoc {
  id: string; // Deterministic pairId
  participantIds: [string, string];
  state: 'pending' | 'friends' | 'blocked';
  requestedBy: string; // UID of user who requested friendship
  blockedBy: string | null; // UID of user who initiated block
  createdAt: number;
  updatedAt: number;
}

/**
 * Creates a deterministic, collision-safe pair ID from two UIDs.
 * Does NOT use fragile string splitting.
 * Orders UIDs lexicographically and encodes them cleanly.
 */
export function getDeterministicPairId(uidA: string, uidB: string): string {
  if (!uidA || !uidB) return '';
  const [first, second] = [uidA, uidB].sort();
  // Safe URI component encoding to handle any arbitrary characters in UIDs
  return `rel_${encodeURIComponent(first)}__${encodeURIComponent(second)}`;
}

/**
 * Decodes the canonical pair ID back to two participant UIDs safely.
 */
export function decodePairId(pairId: string): [string, string] | null {
  if (!pairId.startsWith('rel_')) return null;
  const parts = pairId.substring(4).split('__');
  if (parts.length !== 2) return null;
  try {
    return [decodeURIComponent(parts[0]), decodeURIComponent(parts[1])];
  } catch {
    return null;
  }
}

/**
 * Resolves the application relationship state from current user perspective.
 */
export function resolveRelationshipState(
  currentUid: string,
  targetUid: string,
  relDoc?: RelationshipDoc | null,
  legacyBuddyIds?: string[],
  legacyBlockedIds?: string[]
): RelationshipState {
  if (!currentUid || !targetUid || currentUid === targetUid) return 'NONE';

  // 1. Check canonical relationship document first
  if (relDoc) {
    if (relDoc.state === 'blocked') {
      return relDoc.blockedBy === currentUid ? 'BLOCKED_BY_ME' : 'BLOCKED_BY_OTHER';
    }
    if (relDoc.state === 'friends') {
      return 'FRIENDS';
    }
    if (relDoc.state === 'pending') {
      return relDoc.requestedBy === currentUid ? 'OUTGOING_PENDING' : 'INCOMING_PENDING';
    }
  }

  // 2. Legacy fallback for existing users during migration window
  if (legacyBlockedIds && legacyBlockedIds.includes(targetUid)) {
    return 'BLOCKED_BY_ME';
  }
  if (legacyBuddyIds && legacyBuddyIds.includes(targetUid)) {
    return 'FRIENDS';
  }

  return 'NONE';
}

/**
 * Transaction-safe Friend Request sender.
 * Resolves simultaneous cross-requests deterministically:
 * If A requests B while B already requested A, immediately promotes to 'friends'!
 */
export async function sendCanonicalFriendRequest(
  fromUid: string,
  toUid: string
): Promise<{ success: boolean; state: RelationshipState; error?: string }> {
  if (!fromUid || !toUid || fromUid === toUid) {
    return { success: false, state: 'NONE', error: 'Invalid user parameters' };
  }

  const pairId = getDeterministicPairId(fromUid, toUid);
  const relRef = doc(db, 'relationships', pairId);

  try {
    const finalState = await runTransaction(db, async (transaction) => {
      const snap = await transaction.get(relRef);
      const now = Date.now();
      const participants: [string, string] = [fromUid, toUid].sort() as [string, string];

      if (!snap.exists()) {
        const newRel: RelationshipDoc = {
          id: pairId,
          participantIds: participants,
          state: 'pending',
          requestedBy: fromUid,
          blockedBy: null,
          createdAt: now,
          updatedAt: now,
        };
        transaction.set(relRef, newRel);
        return 'OUTGOING_PENDING' as RelationshipState;
      }

      const current = snap.data() as RelationshipDoc;

      // Cannot request if blocked
      if (current.state === 'blocked') {
        return current.blockedBy === fromUid ? ('BLOCKED_BY_ME' as RelationshipState) : ('BLOCKED_BY_OTHER' as RelationshipState);
      }

      // Already friends
      if (current.state === 'friends') {
        return 'FRIENDS' as RelationshipState;
      }

      // Simultaneous request handling: if other party requested us, promote to friends!
      if (current.state === 'pending') {
        if (current.requestedBy === toUid) {
          transaction.update(relRef, {
            state: 'friends',
            updatedAt: now,
          });
          return 'FRIENDS' as RelationshipState;
        }
        // Already sent by us
        return 'OUTGOING_PENDING' as RelationshipState;
      }

      // Re-requesting after previous rejection or removal
      transaction.update(relRef, {
        state: 'pending',
        requestedBy: fromUid,
        blockedBy: null,
        updatedAt: now,
      });
      return 'OUTGOING_PENDING' as RelationshipState;
    });

    return { success: true, state: finalState };
  } catch (err: any) {
    console.error('[Relationships] sendFriendRequest error:', err);
    return { success: false, state: 'NONE', error: err?.message || 'Transaction failed' };
  }
}

/**
 * Transaction-safe Friend Request acceptor.
 * Only the intended recipient can accept.
 */
export async function acceptCanonicalFriendRequest(
  currentUid: string,
  senderUid: string
): Promise<{ success: boolean; error?: string }> {
  if (!currentUid || !senderUid || currentUid === senderUid) {
    return { success: false, error: 'Invalid parameters' };
  }

  const pairId = getDeterministicPairId(currentUid, senderUid);
  const relRef = doc(db, 'relationships', pairId);

  try {
    await runTransaction(db, async (transaction) => {
      const snap = await transaction.get(relRef);
      if (!snap.exists()) {
        throw new Error('Relationship request not found');
      }

      const current = snap.data() as RelationshipDoc;
      if (current.state === 'blocked') {
        throw new Error('Cannot accept request from blocked relationship');
      }
      if (current.state !== 'pending') {
        // Already accepted or modified
        return;
      }
      if (current.requestedBy !== senderUid) {
        throw new Error('Only the recipient of a friend request can accept it');
      }

      transaction.update(relRef, {
        state: 'friends',
        updatedAt: Date.now(),
      });
    });

    return { success: true };
  } catch (err: any) {
    console.error('[Relationships] acceptFriendRequest error:', err);
    return { success: false, error: err?.message || 'Failed to accept friend request' };
  }
}

/**
 * Rejects or cancels a pending friend request.
 */
export async function declineOrCancelCanonicalRequest(
  currentUid: string,
  targetUid: string
): Promise<{ success: boolean; error?: string }> {
  if (!currentUid || !targetUid) return { success: false, error: 'Invalid parameters' };

  const pairId = getDeterministicPairId(currentUid, targetUid);
  const relRef = doc(db, 'relationships', pairId);

  try {
    await runTransaction(db, async (transaction) => {
      const snap = await transaction.get(relRef);
      if (!snap.exists()) return;
      const current = snap.data() as RelationshipDoc;
      if (current.state === 'blocked') return; // Do not clear blocked state with reject

      transaction.delete(relRef);
    });

    return { success: true };
  } catch (err: any) {
    console.error('[Relationships] declineOrCancelRequest error:', err);
    return { success: false, error: err?.message || 'Failed to update request' };
  }
}

/**
 * Removes an existing friendship consistently from both sides.
 */
export async function removeCanonicalFriend(
  currentUid: string,
  targetUid: string
): Promise<{ success: boolean; error?: string }> {
  if (!currentUid || !targetUid) return { success: false, error: 'Invalid parameters' };

  const pairId = getDeterministicPairId(currentUid, targetUid);
  const relRef = doc(db, 'relationships', pairId);

  try {
    await runTransaction(db, async (transaction) => {
      const snap = await transaction.get(relRef);
      if (!snap.exists()) return;
      const current = snap.data() as RelationshipDoc;
      if (current.state === 'blocked') return;

      transaction.delete(relRef);
    });

    return { success: true };
  } catch (err: any) {
    console.error('[Relationships] removeFriend error:', err);
    return { success: false, error: err?.message || 'Failed to remove friend' };
  }
}

/**
 * Blocks a target user.
 * Overrides friendship, cancels requests, sets state = 'blocked' with blockedBy = currentUid.
 */
export async function blockCanonicalUser(
  currentUid: string,
  targetUid: string
): Promise<{ success: boolean; error?: string }> {
  if (!currentUid || !targetUid || currentUid === targetUid) {
    return { success: false, error: 'Invalid parameters' };
  }

  const pairId = getDeterministicPairId(currentUid, targetUid);
  const relRef = doc(db, 'relationships', pairId);
  const participants: [string, string] = [currentUid, targetUid].sort() as [string, string];
  const now = Date.now();

  try {
    await setDoc(relRef, {
      id: pairId,
      participantIds: participants,
      state: 'blocked',
      requestedBy: currentUid,
      blockedBy: currentUid,
      createdAt: now,
      updatedAt: now,
    });

    return { success: true };
  } catch (err: any) {
    console.error('[Relationships] blockUser error:', err);
    return { success: false, error: err?.message || 'Failed to block user' };
  }
}

/**
 * Unblocks a target user.
 * Returns relationship to 'NONE' (does NOT automatically restore friendship).
 */
export async function unblockCanonicalUser(
  currentUid: string,
  targetUid: string
): Promise<{ success: boolean; error?: string }> {
  if (!currentUid || !targetUid || currentUid === targetUid) {
    return { success: false, error: 'Invalid parameters' };
  }

  const pairId = getDeterministicPairId(currentUid, targetUid);
  const relRef = doc(db, 'relationships', pairId);

  try {
    await runTransaction(db, async (transaction) => {
      const snap = await transaction.get(relRef);
      if (!snap.exists()) return;
      const current = snap.data() as RelationshipDoc;
      if (current.state === 'blocked' && current.blockedBy === currentUid) {
        transaction.delete(relRef);
      }
    });

    return { success: true };
  } catch (err: any) {
    console.error('[Relationships] unblockUser error:', err);
    return { success: false, error: err?.message || 'Failed to unblock user' };
  }
}

/**
 * Subscribes to all canonical relationships involving the current user.
 */
export function subscribeToCanonicalRelationships(
  currentUid: string,
  onUpdate: (relationships: Map<string, RelationshipDoc>) => void
): Unsubscribe {
  if (!currentUid) {
    onUpdate(new Map());
    return () => {};
  }

  const q = query(
    collection(db, 'relationships'),
    where('participantIds', 'array-contains', currentUid)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const relMap = new Map<string, RelationshipDoc>();
      snapshot.forEach((d) => {
        const data = d.data() as RelationshipDoc;
        relMap.set(d.id, { ...data, id: d.id });
      });
      onUpdate(relMap);
    },
    (err) => {
      console.warn('[Relationships] Listener note:', err);
    }
  );
}

export const subscribeUserRelationships = subscribeToCanonicalRelationships;
