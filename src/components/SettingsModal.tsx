import React from 'react';
import { useChat } from '../context/ChatContext';
import { CuteAvatar } from '../utils/avatars';
import { resolveSimiTheme } from '../utils/theme';
import {
  ArrowLeft,
  User,
  Shield,
  Bell,
  Palette,
  Database,
  HelpCircle,
  ChevronRight,
  LogOut,
  CheckCircle2,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { sounds } from '../utils/sound';
import { showPushNotification } from '../utils/notifications';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const {
    currentUser,
    setShowProfileModal,
    handleSignOut,
    updateProfile,
    theme,
    simiTheme,
    showToast,
    enablePushNotifications,
    notificationPermission,
  } = useChat();

  const isMidnight = simiTheme.isMale;
  const isFemale = simiTheme.isFemale;

  if (!isOpen || !currentUser) return null;

  const sections = [
    {
      id: 'account',
      title: 'Account',
      subtitle: 'Profile, username, email',
      icon: User,
      color: isMidnight
        ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
        : 'bg-blue-100/80 text-blue-600 border border-blue-200/60',
      action: () => {
        onClose();
        setShowProfileModal(true);
      },
    },
    {
      id: 'privacy',
      title: 'Privacy',
      subtitle: 'Who can see your content',
      icon: Shield,
      color: isMidnight
        ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30'
        : 'bg-emerald-100/80 text-emerald-600 border border-emerald-200/60',
      action: () => {
        const next = currentUser.privacyVisibility === 'buddies' ? 'public' : 'buddies';
        updateProfile({ privacyVisibility: next });
        sounds.playClick();
        showToast(`Privacy visibility updated to: ${next}`, 'info');
      },
    },
    {
      id: 'notifications',
      title: 'Push Notifications',
      subtitle:
        notificationPermission === 'granted'
          ? 'Active for calls & messages (tap to test)'
          : notificationPermission === 'denied'
          ? 'Blocked in browser site permissions'
          : 'Tap to enable push notifications',
      icon: Bell,
      color: isMidnight
        ? 'bg-amber-600/20 text-amber-400 border border-amber-500/30'
        : 'bg-amber-100/80 text-amber-600 border border-amber-200/60',
      badge: (
        <span
          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
            notificationPermission === 'granted'
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              : notificationPermission === 'denied'
              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
              : 'bg-blue-500/20 text-blue-400 border border-blue-500/30 animate-pulse'
          }`}
        >
          {notificationPermission === 'granted'
            ? 'Active'
            : notificationPermission === 'denied'
            ? 'Blocked'
            : 'Enable'}
        </span>
      ),
      action: async () => {
        sounds.playClick();
        if (notificationPermission === 'granted') {
          await showPushNotification('Simi Notifications Active 🔔', {
            body: 'You are receiving real-time notifications for messages and calls!',
            force: true,
          });
          showToast('Test notification sent to your system!', 'success');
        } else if (notificationPermission === 'denied') {
          showToast('Notifications are blocked. Please allow notifications in your browser address bar/settings.', 'warning', 4000);
        } else {
          const res = await enablePushNotifications();
          if (res === 'granted') {
            showToast('Push notifications successfully enabled!', 'success');
          } else if (res === 'denied') {
            showToast('Notification permission was denied.', 'warning');
          }
        }
      },
    },
    {
      id: 'appearance',
      title: 'Appearance',
      subtitle: 'Theme, color, language',
      icon: Palette,
      color: isMidnight
        ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30'
        : 'bg-purple-100/80 text-purple-600 border border-purple-200/60',
      action: () => {
        sounds.playClick();
        showToast(
          isFemale
            ? 'Simi Rose Blossom theme is active.'
            : 'Simi Male Midnight theme is active with cyan/blue accents.',
          'info'
        );
      },
    },
    {
      id: 'storage',
      title: 'Data & Storage',
      subtitle: 'Manage media, cache',
      icon: Database,
      color: isMidnight
        ? 'bg-cyan-600/20 text-cyan-400 border border-cyan-500/30'
        : 'bg-sky-100/80 text-sky-600 border border-sky-200/60',
      action: () => {
        sounds.playClick();
        showToast('Cache storage is clean & optimized.', 'success');
      },
    },
    {
      id: 'help',
      title: 'Help & Support',
      subtitle: 'Report, feedback, about',
      icon: HelpCircle,
      color: isMidnight
        ? 'bg-pink-600/20 text-pink-400 border border-pink-500/30'
        : 'bg-rose-100/80 text-rose-600 border border-rose-200/60',
      action: () => {
        sounds.playClick();
        showToast(
          isFemale
            ? 'Simi v2.4 (Female Experience) - Crafted with care.'
            : 'Simi v2.4 (Male Experience) - Built with passion.',
          'info'
        );
      },
    },
  ];

  return (
    <div className={`fixed inset-0 z-50 flex flex-col animate-in fade-in duration-200 ${
      isMidnight ? 'bg-[#0B0F17] text-slate-100' : 'bg-[#FFF7F9] text-slate-800'
    }`}>
      {/* Header */}
      <div className={`flex items-center px-4 py-3.5 border-b shrink-0 ${
        isMidnight ? 'border-slate-800/80 bg-[#111827]/90 backdrop-blur-xl' : 'border-pink-100/80 bg-white/95 backdrop-blur-xl'
      }`}>
        <button
          onClick={() => {
            sounds.playClick();
            onClose();
          }}
          className={`p-2 rounded-2xl transition-colors mr-2 ${
            isMidnight ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-pink-50 text-slate-600'
          }`}
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-base font-extrabold tracking-tight">Settings</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 sm:p-6 max-w-lg mx-auto w-full space-y-4">
        {/* Profile Summary Card */}
        <div
          onClick={() => {
            sounds.playClick();
            onClose();
            setShowProfileModal(true);
          }}
          className={`p-4 rounded-3xl border transition-all flex items-center justify-between cursor-pointer group ${
            isMidnight
              ? 'border-slate-800/80 bg-slate-900/60 hover:bg-slate-800/80 shadow-lg'
              : 'border-pink-100/90 bg-white hover:border-rose-200 shadow-2xs hover:shadow-xs'
          }`}
        >
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="relative">
              <CuteAvatar
                id={currentUser.avatarId}
                customUrl={currentUser.customAvatarUrl}
                size="md"
                className={isMidnight ? 'ring-2 ring-blue-500/40' : 'ring-2 ring-rose-300/60'}
              />
              <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 ${
                isMidnight ? 'border-slate-900' : 'border-white'
              }`} />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h3 className={`text-sm font-bold truncate transition-colors ${
                  isMidnight ? 'text-slate-100 group-hover:text-blue-400' : 'text-slate-800 group-hover:text-rose-600'
                }`}>
                  {currentUser.name}
                </h3>
                {currentUser.emailVerified && (
                  <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${isMidnight ? 'text-blue-400' : 'text-rose-500'}`} />
                )}
              </div>
              <p className="text-xs text-slate-400 font-medium">@{currentUser.username}</p>
            </div>
          </div>

          <ChevronRight className={`w-5 h-5 group-hover:translate-x-0.5 transition-all ${
            isMidnight ? 'text-slate-500 group-hover:text-blue-400' : 'text-slate-400 group-hover:text-rose-500'
          }`} />
        </div>

        {/* Grouped Settings Rows */}
        <div className={`rounded-3xl border overflow-hidden divide-y ${
          isMidnight
            ? 'border-slate-800/80 bg-slate-900/40 divide-slate-800/60 shadow-lg'
            : 'border-pink-100/90 bg-white divide-pink-50 shadow-2xs'
        }`}>
          {sections.map((sec) => {
            const Icon = sec.icon;
            return (
              <button
                key={sec.id}
                onClick={sec.action}
                className={`w-full flex items-center justify-between p-3.5 px-4 transition-colors text-left group ${
                  isMidnight ? 'hover:bg-slate-800/60' : 'hover:bg-pink-50/50'
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 ${sec.color}`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className={`text-xs font-bold block transition-colors ${
                      isMidnight ? 'text-slate-200 group-hover:text-blue-300' : 'text-slate-800 group-hover:text-rose-600'
                    }`}>
                      {sec.title}
                    </span>
                    <span className="text-[11px] text-slate-400 block truncate">
                      {sec.subtitle}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {'badge' in sec && sec.badge ? sec.badge : null}
                  <ChevronRight className={`w-4 h-4 group-hover:translate-x-0.5 transition-all shrink-0 ${
                    isMidnight ? 'text-slate-500 group-hover:text-slate-300' : 'text-slate-400 group-hover:text-rose-500'
                  }`} />
                </div>
              </button>
            );
          })}
        </div>

        {/* Sound Effects Toggle */}
        <div className={`p-4 rounded-3xl border flex items-center justify-between ${
          isMidnight ? 'border-slate-800/80 bg-slate-900/40' : 'border-pink-100/90 bg-white shadow-2xs'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-2xl flex items-center justify-center ${
              isMidnight ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30' : 'bg-pink-100/80 text-rose-500 border border-pink-200/50'
            }`}>
              {currentUser.soundEnabled !== false ? (
                <Volume2 className="w-4 h-4" />
              ) : (
                <VolumeX className="w-4 h-4" />
              )}
            </div>
            <div>
              <span className={`text-xs font-bold block ${isMidnight ? 'text-slate-200' : 'text-slate-800'}`}>Sound Effects</span>
              <span className="text-[11px] text-slate-400 block">Play gentle UI chimes</span>
            </div>
          </div>
          <button
            onClick={() => {
              sounds.playClick();
              updateProfile({ soundEnabled: currentUser.soundEnabled === false });
            }}
            className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
              currentUser.soundEnabled !== false
                ? isMidnight ? 'bg-blue-600' : 'bg-gradient-to-r from-rose-500 to-pink-500'
                : isMidnight ? 'bg-slate-700' : 'bg-slate-200'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform ${
                currentUser.soundEnabled !== false ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Log Out Button */}
        <button
          onClick={() => {
            sounds.playClick();
            onClose();
            handleSignOut();
          }}
          className={`w-full flex items-center justify-center gap-2 p-3.5 rounded-2xl border font-bold text-xs shadow-md transition-all active:scale-98 ${
            isMidnight
              ? 'border-rose-900/50 bg-rose-950/20 hover:bg-rose-950/40 text-rose-400'
              : 'border-rose-200 bg-rose-50/80 hover:bg-rose-100 text-rose-600 shadow-rose-100/50'
          }`}
        >
          <LogOut className="w-4 h-4" />
          <span>Log Out of Simi</span>
        </button>
      </div>
    </div>
  );
};
