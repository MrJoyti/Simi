import React, { useState } from 'react';
import { useChat } from '../context/ChatContext';
import { CuteAvatar } from '../utils/avatars';
import {
  X,
  Bell,
  Check,
  UserPlus,
  Phone,
  Video,
  Clock,
  Settings,
  Sparkles,
  ShieldCheck,
  Volume2,
} from 'lucide-react';
import { sounds } from '../utils/sound';
import { showPushNotification } from '../utils/notifications';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({ isOpen, onClose }) => {
  const {
    currentUser,
    buddyRequests,
    acceptBuddyRequest,
    declineBuddyRequest,
    simiTheme,
    showToast,
    notificationPermission,
    enablePushNotifications,
    activeUsers,
  } = useChat();

  const isMidnight = simiTheme.isMale;
  const [activeTab, setActiveTab] = useState<'all' | 'requests' | 'calls' | 'settings'>('all');

  if (!isOpen || !currentUser) return null;

  // Filter incoming pending buddy requests
  const incomingRequests = buddyRequests.filter(
    (r) => r.toUserId === currentUser.id && r.status === 'pending'
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className={`w-full max-w-lg rounded-3xl overflow-hidden border shadow-2xl flex flex-col max-h-[90dvh] animate-in zoom-in-95 duration-200 ${
          isMidnight
            ? 'bg-[#111827] border-slate-800 text-slate-100'
            : 'bg-white border-pink-100 text-slate-800'
        }`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between px-5 py-3.5 border-b shrink-0 ${
            isMidnight ? 'border-slate-800/80 bg-slate-900/60' : 'border-pink-100/80 bg-[#FFF7F9]'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                isMidnight ? 'bg-blue-600/20 text-blue-400' : 'bg-pink-100 text-rose-500'
              }`}
            >
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold tracking-tight">Notifications</h3>
                {incomingRequests.length > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] font-black bg-rose-500 text-white">
                    {incomingRequests.length}
                  </span>
                )}
              </div>
              <p className="text-[10px] text-slate-400">Activity, requests, and updates</p>
            </div>
          </div>

          <button
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className={`p-2 rounded-2xl transition-colors ${
              isMidnight ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:bg-pink-100/70'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Filters */}
        <div className={`flex items-center gap-1.5 px-4 py-2 border-b shrink-0 overflow-x-auto scrollbar-none ${
          isMidnight ? 'border-slate-800/60 bg-slate-900/30' : 'border-pink-100/60 bg-white'
        }`}>
          {[
            { id: 'all', label: 'All' },
            { id: 'requests', label: `Requests (${incomingRequests.length})` },
            { id: 'calls', label: 'Calls' },
            { id: 'settings', label: 'Settings' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                sounds.playClick();
                setActiveTab(tab.id as any);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                activeTab === tab.id
                  ? isMidnight
                    ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 text-white shadow-xs'
                    : 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-xs'
                  : isMidnight
                  ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  : 'text-slate-600 hover:text-rose-600 hover:bg-pink-50/60'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Notification List Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {/* Push Status Banner */}
          {activeTab !== 'requests' && activeTab !== 'calls' && (
            <div
              className={`p-3.5 rounded-2xl border flex items-center justify-between ${
                notificationPermission === 'granted'
                  ? isMidnight
                    ? 'border-emerald-500/30 bg-emerald-950/20 text-emerald-200'
                    : 'border-emerald-200 bg-emerald-50/70 text-emerald-800'
                  : isMidnight
                  ? 'border-blue-500/30 bg-blue-950/20 text-blue-200'
                  : 'border-pink-200 bg-pink-50/70 text-rose-800'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                  notificationPermission === 'granted'
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'bg-blue-500/20 text-blue-400'
                }`}>
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold block truncate">
                    {notificationPermission === 'granted'
                      ? 'Web Push Notifications Active'
                      : 'Push Notifications Not Enabled'}
                  </span>
                  <span className="text-[10px] opacity-80 block truncate">
                    {notificationPermission === 'granted'
                      ? 'You will receive alerts for new messages & calls'
                      : 'Enable push alerts to never miss a buddy message'}
                  </span>
                </div>
              </div>

              {notificationPermission !== 'granted' ? (
                <button
                  onClick={async () => {
                    sounds.playClick();
                    const res = await enablePushNotifications();
                    if (res === 'granted') {
                      showToast('Notifications enabled!', 'success');
                    } else if (res === 'denied') {
                      showToast('Notifications blocked in browser.', 'warning');
                    }
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold text-white shadow-xs shrink-0 ${
                    isMidnight ? 'bg-blue-600 hover:bg-blue-500' : 'bg-rose-500 hover:bg-rose-600'
                  }`}
                >
                  Enable
                </button>
              ) : (
                <button
                  onClick={async () => {
                    sounds.playClick();
                    await showPushNotification('Simi Test Alert 🔔', {
                      body: 'Notifications are working properly on your device!',
                      force: true,
                    });
                    showToast('Test notification sent!', 'success');
                  }}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border transition-colors shrink-0 ${
                    isMidnight
                      ? 'border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/30'
                      : 'border-emerald-300 text-emerald-700 hover:bg-emerald-100'
                  }`}
                >
                  Test
                </button>
              )}
            </div>
          )}

          {/* Incoming Buddy Requests Section */}
          {(activeTab === 'all' || activeTab === 'requests') && incomingRequests.length > 0 && (
            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block px-1">
                Friend Requests ({incomingRequests.length})
              </span>
              {incomingRequests.map((req) => (
                <div
                  key={req.id}
                  className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 ${
                    isMidnight
                      ? 'bg-slate-900/60 border-slate-800'
                      : 'bg-white border-pink-100 shadow-2xs'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <CuteAvatar
                      id={req.fromUserAvatar || 'bunny'}
                      size="md"
                      className={isMidnight ? 'ring-2 ring-blue-500/20' : 'ring-2 ring-pink-100'}
                    />
                    <div className="min-w-0">
                      <span className="text-xs font-bold block truncate">{req.fromUserName}</span>
                      <span className="text-[10px] text-slate-400 block">Sent you a buddy request</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={async () => {
                        sounds.playClick();
                        await acceptBuddyRequest(req.id, req.fromUserId);
                        showToast(`Connected with ${req.fromUserName}!`, 'success');
                      }}
                      className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold shadow-xs active:scale-95 transition-transform"
                    >
                      Accept
                    </button>
                    <button
                      onClick={async () => {
                        sounds.playClick();
                        await declineBuddyRequest(req.id);
                        showToast('Request declined', 'info');
                      }}
                      className={`p-1.5 rounded-xl border transition-colors ${
                        isMidnight
                          ? 'border-slate-700 text-slate-400 hover:bg-slate-800'
                          : 'border-slate-200 text-slate-500 hover:bg-slate-100'
                      }`}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Calls Activity */}
          {(activeTab === 'all' || activeTab === 'calls') && (
            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block px-1">
                Recent Calls & Media
              </span>
              <div
                className={`p-3.5 rounded-2xl border flex items-center justify-between ${
                  isMidnight
                    ? 'bg-slate-900/60 border-slate-800 text-slate-300'
                    : 'bg-white border-pink-100 text-slate-700 shadow-2xs'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                    isMidnight ? 'bg-cyan-500/10 text-cyan-400' : 'bg-pink-100 text-rose-500'
                  }`}>
                    <Video className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold block">1-on-1 HD Calling Ready</span>
                    <span className="text-[10px] text-slate-400 block">End-to-end encrypted WebRTC audio & video</span>
                  </div>
                </div>
                <Clock className="w-4 h-4 text-slate-400 shrink-0" />
              </div>
            </div>
          )}

          {/* System Welcome Card */}
          {(activeTab === 'all' || activeTab === 'settings') && (
            <div
              className={`p-3.5 rounded-2xl border flex items-center gap-3 ${
                isMidnight
                  ? 'bg-slate-900/40 border-slate-800/80 text-slate-300'
                  : 'bg-[#FFF7F9] border-pink-100/90 text-slate-700'
              }`}
            >
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                isMidnight ? 'bg-purple-500/10 text-purple-400' : 'bg-purple-100 text-purple-600'
              }`}>
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-xs font-bold block">Welcome to Simi Social Verse</span>
                <span className="text-[10px] text-slate-400 block">
                  You are all set to share moments, stories, voice notes, and live chat.
                </span>
              </div>
            </div>
          )}

          {/* Settings Tab Specific */}
          {activeTab === 'settings' && (
            <div className="space-y-3 pt-2">
              <div className={`p-4 rounded-2xl border ${
                isMidnight ? 'border-slate-800 bg-slate-900/50' : 'border-pink-100 bg-white'
              }`}>
                <h4 className="text-xs font-bold mb-2">Notification Preferences</h4>
                <div className="space-y-2 text-xs text-slate-400">
                  <div className="flex items-center justify-between py-1">
                    <span>Message Alerts</span>
                    <span className="font-bold text-emerald-400">Enabled</span>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span>Call Rings</span>
                    <span className="font-bold text-emerald-400">Enabled</span>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span>Friend Requests</span>
                    <span className="font-bold text-emerald-400">Enabled</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Empty Requests State */}
          {activeTab === 'requests' && incomingRequests.length === 0 && (
            <div className="py-14 flex flex-col items-center justify-center text-center">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-2.5 ${
                isMidnight ? 'bg-slate-900 text-slate-400' : 'bg-pink-100 text-rose-500'
              }`}>
                <UserPlus className="w-6 h-6 opacity-60" />
              </div>
              <p className="text-xs font-bold text-slate-300">No pending requests</p>
              <p className="text-[11px] text-slate-500 mt-0.5">When someone sends you a friend request, it appears here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
