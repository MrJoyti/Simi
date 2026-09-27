import React from 'react';
import { useChat } from '../context/ChatContext';
import { MessageSquare, Users, Sparkles, User, Plus, LucideIcon } from 'lucide-react';
import { sounds } from '../utils/sound';

interface TabItem {
  id: 'chats' | 'spaces' | 'friends' | 'profile';
  label: string;
  icon: LucideIcon;
  badge?: number;
}

export const MobileNavigation: React.FC = () => {
  const {
    activeMobileTab,
    setActiveMobileTab,
    rooms,
    buddyRequests,
    currentUser,
    setShowCreatePostModal,
    simiTheme,
  } = useChat();

  const isMidnight = simiTheme.isMale;

  const totalUnread = rooms.reduce((acc, r) => acc + (r.unreadCount || 0), 0);
  const pendingRequestsCount = buddyRequests.filter(
    (r) => r.toUserId === currentUser?.id && r.status === 'pending'
  ).length;

  const leftTabs: TabItem[] = [
    { id: 'spaces', label: 'Verse', icon: Sparkles },
    { id: 'chats', label: 'Chats', icon: MessageSquare, badge: totalUnread > 0 ? totalUnread : undefined },
  ];

  const rightTabs: TabItem[] = [
    { id: 'friends', label: 'Friends', icon: Users, badge: pendingRequestsCount > 0 ? pendingRequestsCount : undefined },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  const renderTab = (tab: TabItem) => {
    const Icon = tab.icon;
    const isActive = activeMobileTab === tab.id;
    return (
      <button
        key={tab.id}
        onClick={() => {
          sounds.playClick();
          if (activeMobileTab === tab.id) {
            window.dispatchEvent(new CustomEvent('simi-scroll-to-top'));
          } else {
            setActiveMobileTab(tab.id);
          }
        }}
        className={`flex-1 flex flex-col items-center justify-center py-1 relative transition-all active:scale-95 ${
          isActive
            ? isMidnight
              ? 'text-cyan-400 font-bold'
              : 'text-rose-500 font-bold'
            : isMidnight
            ? 'text-slate-400 hover:text-slate-200'
            : 'text-slate-400 hover:text-slate-600'
        }`}
      >
        <div className="relative">
          <Icon
            className={`w-5 h-5 transition-transform ${
              isActive
                ? isMidnight
                  ? 'scale-110 drop-shadow-[0_0_8px_rgba(6,182,212,0.6)] stroke-[2.5]'
                  : 'scale-110 drop-shadow-[0_1px_4px_rgba(244,63,94,0.3)] stroke-[2.5]'
                : 'stroke-[1.8]'
            }`}
          />
          {Boolean(tab.badge && tab.badge > 0) && (
            <span
              className={`absolute -top-1 -right-2 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full animate-pulse ${
                isMidnight ? 'bg-blue-600 ring-2 ring-slate-900' : 'bg-rose-500 ring-2 ring-white shadow-xs'
              }`}
            >
              {tab.badge}
            </span>
          )}
        </div>
        <span
          className={`text-[10px] mt-1 tracking-tight ${
            isActive
              ? isMidnight
                ? 'text-cyan-400 font-bold'
                : 'text-rose-500 font-bold'
              : 'text-slate-400'
          }`}
        >
          {tab.label}
        </span>
        {isActive && (
          <span
            className={`w-1 h-1 rounded-full mt-0.5 ${
              isMidnight ? 'bg-cyan-400 shadow-[0_0_6px_#06b6d4]' : 'bg-rose-500'
            }`}
          />
        )}
      </button>
    );
  };

  return (
    <nav
      className={`md:hidden shrink-0 sticky bottom-0 z-40 px-3 py-1.5 flex items-center justify-around safe-bottom backdrop-blur-xl ${
        isMidnight
          ? 'shadow-2xl border-t border-slate-800/80 bg-[#0B0F17]/95'
          : 'shadow-lg border-t border-pink-100/80 bg-white/90'
      }`}
    >
      {/* Left Tabs */}
      {leftTabs.map(renderTab)}

      {/* Central Floating (+) FAB */}
      <div className="flex items-center justify-center px-1">
        <button
          onClick={() => {
            sounds.playClick();
            setShowCreatePostModal(true);
          }}
          className={`w-12 h-12 -mt-5 rounded-full flex items-center justify-center text-white border-2 hover:scale-105 active:scale-90 transition-all cursor-pointer group ${
            isMidnight
              ? 'bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 shadow-[0_0_20px_rgba(59,130,246,0.6)] border-[#0B0F17]'
              : 'bg-gradient-to-tr from-pink-500 to-rose-500 shadow-lg shadow-pink-500/35 border-white'
          }`}
          title="Create Post / Story"
        >
          <Plus className="w-6 h-6 stroke-[2.8] group-hover:rotate-90 transition-transform duration-200" />
        </button>
      </div>

      {/* Right Tabs */}
      {rightTabs.map(renderTab)}
    </nav>
  );
};
