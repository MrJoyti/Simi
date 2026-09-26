import React from 'react';
import { useChat } from '../context/ChatContext';
import { MessageSquare, Users, Sparkles, User, Hash, LucideIcon } from 'lucide-react';
import { sounds } from '../utils/sound';

interface TabItem {
  id: 'chats' | 'spaces' | 'friends' | 'profile';
  label: string;
  icon: LucideIcon;
  badge?: number;
}

export const MobileNavigation: React.FC = () => {
  const { activeMobileTab, setActiveMobileTab, rooms, theme } = useChat();
  const isMidnight = theme === 'midnight';

  const totalUnread = rooms.reduce((acc, r) => acc + (r.unreadCount || 0), 0);

  const tabs: TabItem[] = [
    { id: 'spaces', label: 'Verse', icon: Sparkles },
    { id: 'chats', label: 'Chats', icon: MessageSquare, badge: totalUnread > 0 ? totalUnread : undefined },
    { id: 'friends', label: 'Friends', icon: Users },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <nav className={`md:hidden sticky bottom-0 z-40 px-3 py-1 flex items-center justify-around shadow-lg safe-bottom border-t backdrop-blur-lg ${
      isMidnight ? 'bg-[#111821]/95 border-slate-800 text-slate-200' : 'bg-white/95 border-pink-100/90'
    }`}>
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeMobileTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => {
              sounds.playClick();
              setActiveMobileTab(tab.id);
            }}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl relative transition-all active:scale-90 ${
              isActive
                ? isMidnight ? 'text-blue-400 font-bold scale-105' : 'text-rose-600 font-bold scale-105'
                : 'text-slate-400 hover:text-slate-300 font-medium'
            }`}
          >
            <div className="relative">
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
              {Boolean(tab.badge && tab.badge > 0) && (
                <span className={`absolute -top-1 -right-2 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full ring-2 ${
                  isMidnight ? 'bg-blue-600 ring-slate-900' : 'bg-rose-500 ring-white'
                }`}>
                  {tab.badge}
                </span>
              )}
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
