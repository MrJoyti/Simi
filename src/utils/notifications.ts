// Utilities for Web Push & Browser Notifications

// Check if browser notifications are supported
export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

// Get current permission status
export function getNotificationPermission(): NotificationPermission {
  if (!isNotificationSupported()) return 'denied';
  return Notification.permission;
}

// Request permission from user
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!isNotificationSupported()) return 'denied';
  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (err) {
    console.warn('Error requesting notification permission:', err);
    return 'denied';
  }
}

// Register service worker if available
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return null;
  }

  try {
    const reg = await navigator.serviceWorker.register('/sw.js');
    return reg;
  } catch (err) {
    console.warn('Service worker registration failed:', err);
    return null;
  }
}

// Display an in-browser push notification
export async function showPushNotification(title: string, options?: {
  body?: string;
  icon?: string;
  tag?: string;
  url?: string;
}) {
  if (!isNotificationSupported()) return;
  if (Notification.permission !== 'granted') return;

  // If document is focused and visible, user is already looking at it
  if (typeof document !== 'undefined' && document.hasFocus && document.hasFocus()) {
    return;
  }

  try {
    if ('serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.getRegistration();
      if (reg && reg.showNotification) {
        await reg.showNotification(title, {
          body: options?.body,
          icon: options?.icon || '🌸',
          tag: options?.tag || 'mochichat-msg',
          data: { url: options?.url || '/' },
        });
        return;
      }
    }

    // Direct Notification fallback
    new Notification(title, {
      body: options?.body,
      icon: options?.icon,
      tag: options?.tag,
    });
  } catch (err) {
    console.warn('Could not show push notification:', err);
  }
}
