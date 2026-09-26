/**
 * Local draft storage per chat room for offline composition and message recovery.
 */
const DRAFT_PREFIX = 'mochichat_draft_';

export function getRoomDraft(roomId: string): string {
  if (!roomId || typeof window === 'undefined') return '';
  try {
    return localStorage.getItem(DRAFT_PREFIX + roomId) || '';
  } catch {
    return '';
  }
}

export function saveRoomDraft(roomId: string, content: string): void {
  if (!roomId || typeof window === 'undefined') return;
  try {
    if (content.trim()) {
      localStorage.setItem(DRAFT_PREFIX + roomId, content);
    } else {
      localStorage.removeItem(DRAFT_PREFIX + roomId);
    }
  } catch {
    // ignore quota errors
  }
}

export function clearRoomDraft(roomId: string): void {
  if (!roomId || typeof window === 'undefined') return;
  try {
    localStorage.removeItem(DRAFT_PREFIX + roomId);
  } catch {
    // ignore
  }
}
