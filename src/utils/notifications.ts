// Utilities for Web Push & Browser Notifications

export interface PushNotificationOptions {
  body?: string;
  icon?: string;
  badge?: string;
  tag?: string;
  url?: string;
  force?: boolean;
  requireInteraction?: boolean;
}

// Check if browser notifications are supported
export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

// Get current permission status
export function getNotificationPermission(): NotificationPermission {
  if (!isNotificationSupported()) return 'denied';
  return Notification.permission;
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

// Request permission from user
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!isNotificationSupported()) return 'denied';
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      await registerServiceWorker();
    }
    return permission;
  } catch (err) {
    console.warn('Error requesting notification permission:', err);
    return 'denied';
  }
}

// Display an in-browser push notification
export async function showPushNotification(title: string, options?: PushNotificationOptions) {
  if (!isNotificationSupported()) return;
  if (Notification.permission !== 'granted') return;

  // Unless force is specified, skip if the document is actively focused and visible
  if (!options?.force && typeof document !== 'undefined' && document.hasFocus && document.hasFocus()) {
    return;
  }

  const iconUrl = options?.icon || '/simi-logo.png';
  const badgeUrl = options?.badge || '/simi-logo.png';
  const tag = options?.tag || 'simi-msg';
  const targetUrl = options?.url || '/';

  try {
    if ('serviceWorker' in navigator) {
      try {
        const reg = await navigator.serviceWorker.ready.catch(() => navigator.serviceWorker.getRegistration());
        if (reg && reg.showNotification) {
          await reg.showNotification(title, {
            body: options?.body,
            icon: iconUrl,
            badge: badgeUrl,
            tag,
            requireInteraction: options?.requireInteraction ?? false,
            data: { url: targetUrl },
          });
          return;
        }
      } catch (swErr) {
        console.warn('ServiceWorker showNotification issue, falling back to Notification API:', swErr);
      }
    }

    // Direct Notification API fallback
    if (typeof Notification !== 'undefined') {
      const notification = new Notification(title, {
        body: options?.body,
        icon: iconUrl,
        tag,
        requireInteraction: options?.requireInteraction ?? false,
      });

      notification.onclick = () => {
        window.focus();
        if (targetUrl && targetUrl !== '/') {
          window.location.href = targetUrl;
        }
        notification.close();
      };
    }
  } catch (err) {
    console.warn('Could not show push notification:', err);
  }
}
