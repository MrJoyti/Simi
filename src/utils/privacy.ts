import { UserProfile } from '../types/chat';

/**
 * Evaluates whether a viewer can access/view a target user's profile details.
 * Rule:
 * - Public: anyone can view
 * - Buddies: viewer must be an accepted buddy
 * - Buddies of Buddies: viewer is a buddy or shares at least 1 mutual buddy
 * - Only Me: only target user can view self
 */
export function canViewProfile(
  targetUser: UserProfile | undefined | null,
  viewerUser: UserProfile | undefined | null,
  activeUsers: UserProfile[] = []
): boolean {
  if (!targetUser || !viewerUser) return false;
  if (viewerUser.id === targetUser.id) return true;

  const visibility = targetUser.privacyVisibility || 'buddies';

  switch (visibility) {
    case 'public':
      return true;
    case 'only_me':
      return false;
    case 'buddies':
      return (targetUser.buddyIds || []).includes(viewerUser.id);
    case 'buddies_of_buddies': {
      const isDirectBuddy = (targetUser.buddyIds || []).includes(viewerUser.id);
      if (isDirectBuddy) return true;

      const targetBuddyIds = targetUser.buddyIds || [];
      const viewerBuddyIds = viewerUser.buddyIds || [];
      return targetBuddyIds.some((id) => viewerBuddyIds.includes(id));
    }
    default:
      return true;
  }
}

/**
 * Evaluates whether a viewer can send a direct message to targetUser.
 * Direct Messaging is independent of Profile Privacy.
 * Any authenticated user can start DM unless blocked.
 */
export function canMessageUser(
  targetUser: UserProfile | undefined | null,
  viewerUser: UserProfile | undefined | null
): boolean {
  if (!targetUser || !viewerUser) return false;
  if (viewerUser.id === targetUser.id) return false;

  const viewerBlocked = (viewerUser.blockedUserIds || []).includes(targetUser.id);
  const targetBlocked = (targetUser.blockedUserIds || []).includes(viewerUser.id);
  return !viewerBlocked && !targetBlocked;
}

/**
 * Evaluates whether a viewer can initiate a call to targetUser.
 */
export function canCallUser(
  targetUser: UserProfile | undefined | null,
  viewerUser: UserProfile | undefined | null
): boolean {
  return canMessageUser(targetUser, viewerUser);
}
