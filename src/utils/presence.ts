import { UserProfile, PrivacyVisibility } from '../types/chat';

export interface PresenceInfo {
  state: 'online' | 'idle' | 'offline';
  isOnline: boolean;
  isIdle: boolean;
  label: string; // e.g. "Active now", "Idle", "Last seen 12m ago", "Last seen today at 10:42 PM", "Last seen yesterday at 8:15 PM"
  shortLabel: string; // e.g. "Active", "Idle", "12m ago", "Yesterday", "Offline"
  lastSeenAt: string; // Formatted string representation of last seen
  formattedLastSeen: string;
  dotClass: string; // Tailwind color & ring dot class
}

/**
 * Checks if a viewer is allowed to access/view a target user's stories, active status, and profile info
 * based on targetUser.privacyVisibility ('only_me' | 'buddies' | 'buddies_of_buddies' | 'public').
 */
export function canViewerAccessUserContent(
  targetUser?: UserProfile | null,
  viewerUser?: UserProfile | null,
  allUsers: UserProfile[] = []
): boolean {
  if (!targetUser) return false;
  if (!viewerUser) return false;
  if (targetUser.id === viewerUser.id) return true; // Owner can always view own details

  const visibility: PrivacyVisibility = targetUser.privacyVisibility || 'buddies';

  if (visibility === 'only_me') {
    return false;
  }

  const targetBuddyIds = targetUser.buddyIds || [];
  const viewerBuddyIds = viewerUser.buddyIds || [];

  const isDirectBuddy =
    targetBuddyIds.includes(viewerUser.id) ||
    viewerBuddyIds.includes(targetUser.id);

  if (visibility === 'buddies') {
    return isDirectBuddy;
  }

  if (visibility === 'buddies_of_buddies') {
    if (isDirectBuddy) return true;

    // Check direct intersection in buddy lists
    const directIntersection = targetBuddyIds.some((id) => viewerBuddyIds.includes(id));
    if (directIntersection) return true;

    // Check all users for mutual buddy links
    const isMutual = allUsers.some((u) => {
      if (u.id === targetUser.id || u.id === viewerUser.id) return false;
      const uBuddies = u.buddyIds || [];
      const uKnowsTarget = targetBuddyIds.includes(u.id) || uBuddies.includes(targetUser.id);
      const uKnowsViewer = viewerBuddyIds.includes(u.id) || uBuddies.includes(viewerUser.id);
      return uKnowsTarget && uKnowsViewer;
    });

    return isMutual;
  }

  if (visibility === 'public') {
    return true;
  }

  return isDirectBuddy;
}

/**
 * Calculates a clean relative "Last seen ..." string for offline users.
 * Strictly avoids awkward phrasing like "Last seen at Last seen..." or "Last seen at recently".
 */
export function formatLastSeenAt(timestamp?: number): string {
  if (!timestamp || timestamp <= 0) {
    return 'Last seen unavailable';
  }

  const now = new Date();
  const dateObj = new Date(timestamp);
  const diffMs = Math.max(0, now.getTime() - timestamp);
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);

  if (diffSec < 60) {
    return 'Last seen just now';
  }

  if (diffMin < 60) {
    return `Last seen ${diffMin}m ago`;
  }

  const timeStr = dateObj.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  const isToday = now.toDateString() === dateObj.toDateString();

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = yesterday.toDateString() === dateObj.toDateString();

  if (isToday) {
    return `Last seen today at ${timeStr}`;
  }

  if (isYesterday) {
    return `Last seen yesterday at ${timeStr}`;
  }

  const sameYear = now.getFullYear() === dateObj.getFullYear();
  if (sameYear) {
    const dateStr = dateObj.toLocaleDateString([], { month: 'short', day: 'numeric' });
    return `Last seen ${dateStr} at ${timeStr}`;
  }

  const dateStr = dateObj.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  return `Last seen ${dateStr} at ${timeStr}`;
}

/**
 * Calculates a compact short label for tight UI spaces (e.g. sidebars or member lists).
 */
export function formatLastSeenShort(timestamp?: number): string {
  if (!timestamp || timestamp <= 0) return 'Offline';
  const now = Date.now();
  const diffMs = Math.max(0, now - timestamp);
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;

  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;

  return new Date(timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' });
}

/**
 * Authoritative real-time presence calculator.
 * Combines profile status with heartbeat timestamp freshness to protect against stale "online" statuses.
 */
export function getUserPresence(
  user?: UserProfile | null,
  isCurrentUser: boolean = false,
  browserOnline: boolean = true,
  viewerUser?: UserProfile | null,
  allUsers: UserProfile[] = []
): PresenceInfo {
  if (!user) {
    return {
      state: 'offline',
      isOnline: false,
      isIdle: false,
      label: 'Offline',
      shortLabel: 'Offline',
      lastSeenAt: 'Last seen unavailable',
      formattedLastSeen: 'Last seen unavailable',
      dotClass: 'bg-slate-400',
    };
  }

  // Active status toggle OFF: Hide presence and present user as Offline
  if (user.showActiveStatus === false) {
    return {
      state: 'offline',
      isOnline: false,
      isIdle: false,
      label: isCurrentUser ? 'Offline (Status Hidden)' : 'Offline',
      shortLabel: 'Offline',
      lastSeenAt: 'Offline',
      formattedLastSeen: 'Offline',
      dotClass: 'bg-slate-400',
    };
  }

  // Privacy Visibility Restriction: If viewer cannot access target user content, present target as Offline
  if (!isCurrentUser && viewerUser && !canViewerAccessUserContent(user, viewerUser, allUsers)) {
    return {
      state: 'offline',
      isOnline: false,
      isIdle: false,
      label: 'Offline',
      shortLabel: 'Offline',
      lastSeenAt: 'Offline',
      formattedLastSeen: 'Offline',
      dotClass: 'bg-slate-400',
    };
  }

  // Current authenticated user presence reacts immediately to local network state
  if (isCurrentUser) {
    if (!browserOnline) {
      return {
        state: 'offline',
        isOnline: false,
        isIdle: false,
        label: 'Offline (Disconnected)',
        shortLabel: 'Offline',
        lastSeenAt: 'Offline (Disconnected)',
        formattedLastSeen: 'Offline (Disconnected)',
        dotClass: 'bg-slate-400',
      };
    }
    return {
      state: 'online',
      isOnline: true,
      isIdle: false,
      label: 'Active now',
      shortLabel: 'Active',
      lastSeenAt: 'Active now',
      formattedLastSeen: 'Active now',
      dotClass: 'bg-emerald-500 ring-2 ring-emerald-300 animate-pulse',
    };
  }

  const now = Date.now();
  const lastSeen = user.lastSeen || 0;
  const diffMs = Math.max(0, now - lastSeen);
  const formattedLastSeen = formatLastSeenAt(lastSeen);
  const shortLabel = formatLastSeenShort(lastSeen);

  // Online freshness threshold: user.status === 'online' AND lastSeen within 75 seconds (~3 heartbeats)
  if (user.status === 'online' && diffMs <= 75000) {
    return {
      state: 'online',
      isOnline: true,
      isIdle: false,
      label: 'Active now',
      shortLabel: 'Active',
      lastSeenAt: 'Active now',
      formattedLastSeen: 'Active now',
      dotClass: 'bg-emerald-500 ring-2 ring-emerald-300 animate-pulse',
    };
  }

  // Idle threshold: user.status === 'idle' or lastSeen within 5 minutes (300,000ms)
  if (user.status === 'idle' && diffMs <= 300000) {
    return {
      state: 'idle',
      isOnline: false,
      isIdle: true,
      label: 'Idle',
      shortLabel: 'Idle',
      lastSeenAt: formattedLastSeen,
      formattedLastSeen,
      dotClass: 'bg-amber-400 ring-2 ring-amber-200',
    };
  }

  // Stale heartbeat or status === 'offline': calculate effective offline state
  return {
    state: 'offline',
    isOnline: false,
    isIdle: false,
    label: formattedLastSeen,
    shortLabel,
    lastSeenAt: formattedLastSeen,
    formattedLastSeen,
    dotClass: 'bg-slate-400',
  };
}

