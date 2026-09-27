import React from 'react';
import { useChat } from '../context/ChatContext';
import { CuteAvatar } from '../utils/avatars';
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
    triggerConfetti,
  } = useChat();

  if (!isOpen || !currentUser) return null;

  const sections = [
    {
      id: 'account',
      title: 'Account',
      subtitle: 'Profile, username, email',
      icon: User,
      color: 'bg-blue-600/20 text-blue-400 border border-blue-500/30',
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
      color: 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30',
      action: () => {
        const next = currentUser.privacyVisibility === 'buddies' ? 'public' : 'buddies';
        updateProfile({ privacyVisibility: next });
        sounds.playClick();
        alert(`Privacy visibility updated to: ${next}`);
      },
    },
    {
      id: 'notifications',
      title: 'Notifications',
      subtitle: 'Messages, calls, activity',
      icon: Bell,
      color: 'bg-amber-600/20 text-amber-400 border border-amber-500/30',
      action: () => {
        sounds.playClick();
        alert('Push notifications are active for your device!');
      },
    },
    {
      id: 'appearance',
      title: 'Appearance',
      subtitle: 'Theme, color, language',
      icon: Palette,
      color: 'bg-purple-600/20 text-purple-400 border border-purple-500/30',
      action: () => {
        sounds.playClick();
        alert('Simi Male Midnight theme is active with cyan/blue accents.');
      },
    },
    {
      id: 'storage',
      title: 'Data & Storage',
      subtitle: 'Manage media, cache',
      icon: Database,
      color: 'bg-cyan-600/20 text-cyan-400 border border-cyan-500/30',
      action: () => {
        sounds.playClick();
        alert('Cache storage is clean & optimized.');
      },
    },
    {
      id: 'help',
      title: 'Help & Support',
      subtitle: 'Report, feedback, about',
      icon: HelpCircle,
      color: 'bg-pink-600/20 text-pink-400 border border-pink-500/30',
      action: () => {
        sounds.playClick();
        alert('Simi v2.4 (Male Experience) - Built with passion.');
      },
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#0B0F17] text-slate-100 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-center px-4 py-3.5 border-b border-slate-800/80 bg-[#111827]/90 backdrop-blur-xl shrink-0">
        <button
          onClick={() => {
            sounds.playClick();
            onClose();
          }}
          className="p-2 rounded-2xl hover:bg-slate-800 transition-colors text-slate-300 mr-2"
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
          className="p-4 rounded-3xl border border-slate-800/80 bg-slate-900/60 hover:bg-slate-800/80 transition-all flex items-center justify-between cursor-pointer group shadow-lg"
        >
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="relative">
              <CuteAvatar
                id={currentUser.avatarId}
                customUrl={currentUser.customAvatarUrl}
                size="md"
                className="ring-2 ring-blue-500/40"
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-slate-900" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-bold text-slate-100 truncate group-hover:text-blue-400 transition-colors">
                  {currentUser.name}
                </h3>
                {currentUser.emailVerified && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                )}
              </div>
              <p className="text-xs text-slate-400 font-medium">@{currentUser.username}</p>
            </div>
          </div>

          <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all" />
        </div>

        {/* Grouped Settings Rows */}
        <div className="rounded-3xl border border-slate-800/80 bg-slate-900/40 overflow-hidden divide-y divide-slate-800/60 shadow-lg">
          {sections.map((sec) => {
            const Icon = sec.icon;
            return (
              <button
                key={sec.id}
                onClick={sec.action}
                className="w-full flex items-center justify-between p-3.5 px-4 hover:bg-slate-800/60 transition-colors text-left group"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 ${sec.color}`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-slate-200 block group-hover:text-blue-300 transition-colors">
                      {sec.title}
                    </span>
                    <span className="text-[11px] text-slate-400 block truncate">
                      {sec.subtitle}
                    </span>
                  </div>
                </div>

                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-slate-300 group-hover:translate-x-0.5 transition-all shrink-0" />
              </button>
            );
          })}
        </div>

        {/* Sound Effects Toggle */}
        <div className="p-4 rounded-3xl border border-slate-800/80 bg-slate-900/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
              {currentUser.soundEnabled !== false ? (
                <Volume2 className="w-4 h-4" />
              ) : (
                <VolumeX className="w-4 h-4" />
              )}
            </div>
            <div>
              <span className="text-xs font-bold text-slate-200 block">Sound Effects</span>
              <span className="text-[11px] text-slate-400 block">Play gentle UI chimes</span>
            </div>
          </div>
          <button
            onClick={() => {
              sounds.playClick();
              updateProfile({ soundEnabled: currentUser.soundEnabled === false });
            }}
            className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
              currentUser.soundEnabled !== false ? 'bg-blue-600' : 'bg-slate-700'
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
          className="w-full flex items-center justify-center gap-2 p-3.5 rounded-2xl border border-rose-900/50 bg-rose-950/20 hover:bg-rose-950/40 text-rose-400 font-bold text-xs shadow-md transition-all active:scale-98"
        >
          <LogOut className="w-4 h-4" />
          <span>Log Out of Simi</span>
        </button>
      </div>
    </div>
  );
};
