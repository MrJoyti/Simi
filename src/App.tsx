/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ChatProvider, useChat } from './context/ChatContext';
import { Sidebar } from './components/Sidebar';
import { ChatHeader } from './components/ChatHeader';
import { MessageList } from './components/MessageList';
import { ChatInput } from './components/ChatInput';
import { MembersPanel } from './components/MembersPanel';
import { ProfileModal } from './components/ProfileModal';
import { CreateRoomModal } from './components/CreateRoomModal';
import { FindBuddyModal } from './components/FindBuddyModal';
import { CreateStoryModal } from './components/CreateStoryModal';
import { VideoCallModal } from './components/VideoCallModal';
import { StoriesBar } from './components/StoriesBar';
import { MobileNavigation } from './components/MobileNavigation';
import { FriendsView } from './components/FriendsView';
import { ProfileView } from './components/ProfileView';
import { MobileChannelsList } from './components/MobileChannelsList';
import { VerseView } from './components/VerseView';
import { AuthModal } from './components/AuthModal';
import { ConversationInfoDrawer } from './components/ConversationInfoDrawer';
import { THEMES } from './utils/theme';

const ChatInterface: React.FC = () => {
  const {
    theme,
    activeMobileTab,
    currentRoomId,
    authUser,
    currentUser,
    isAuthLoading,
    setUserProfileDirectly,
    handleSignOut,
    showConversationInfoDrawer,
    setShowConversationInfoDrawer,
  } = useChat();

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const activeTheme = THEMES[theme] || THEMES.strawberry;

  // Loading state
  if (isAuthLoading) {
    const isMaleTheme = theme === 'midnight';
    return (
      <div
        className="flex h-screen w-screen items-center justify-center transition-colors duration-300"
        style={{ backgroundColor: activeTheme.bodyBg }}
      >
        <div className="flex flex-col items-center gap-3">
          <img
            src="/simi-logo.png"
            alt="Simi Logo"
            className="w-14 h-14 rounded-3xl object-cover shadow-lg animate-bounce ring-4 ring-purple-400/30"
          />
          <p className={`text-xs font-bold ${isMaleTheme ? 'text-blue-300' : 'text-slate-600'}`}>
            Loading Simi {isMaleTheme ? 'Midnight' : 'Cozy'}...
          </p>
        </div>
      </div>
    );
  }

  // Show AuthModal if user hasn't registered, logged in, or is missing gender
  if (!currentUser || !currentUser.gender) {
    return (
      <AuthModal
        onSuccess={(profile) => setUserProfileDirectly(profile)}
        unverifiedUser={authUser && authUser.email && !authUser.emailVerified && !authUser.isAnonymous ? authUser : null}
        onSignOut={handleSignOut}
        existingProfileMissingGender={currentUser && !currentUser.gender ? currentUser : null}
      />
    );
  }

  const isMaleTheme = theme === 'midnight';

  return (
    <div
      className={`flex flex-col md:flex-row h-screen w-screen overflow-hidden transition-colors duration-300 font-sans select-none ${isMaleTheme ? 'text-slate-100' : 'text-slate-800'}`}
      style={{ backgroundColor: activeTheme.bodyBg }}
    >
      {/* Desktop Persistent Sidebar */}
      <div className="hidden md:flex h-full shrink-0">
        <Sidebar />
      </div>

      {/* Mobile Drawer (if opened via top hamburger) */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="relative z-10 h-full animate-in slide-in-from-left duration-200">
            <Sidebar onCloseMobile={() => setMobileSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col h-full min-w-0 backdrop-blur-xs relative overflow-hidden transition-colors duration-300 ${isMaleTheme ? 'bg-[#0B0F14]/90' : 'bg-white/70'}`}>
        {/* On Mobile: Render Active Tab View */}
        <div className="md:hidden flex-1 flex flex-col h-full min-w-0 overflow-hidden">
          {activeMobileTab === 'chats' && (
            currentRoomId ? (
              <>
                <ChatHeader onToggleSidebarMobile={() => setMobileSidebarOpen(true)} />
                <MessageList />
                <ChatInput />
              </>
            ) : (
              <MobileChannelsList />
            )
          )}
          {activeMobileTab === 'spaces' && (
            <VerseView />
          )}
          {activeMobileTab === 'friends' && (
            <div className="flex flex-col h-full overflow-hidden">
              <div className="flex-1 overflow-y-auto">
                <FriendsView />
              </div>
            </div>
          )}
          {activeMobileTab === 'profile' && <ProfileView />}
        </div>

        {/* On Desktop: Standard full chat flow with StoriesBar header */}
        <div className="hidden md:flex flex-1 flex-col h-full min-w-0">
          <ChatHeader onToggleSidebarMobile={() => setMobileSidebarOpen(true)} />
          <StoriesBar />
          <MessageList />
          <ChatInput />
        </div>

        {/* Mobile Native App Bottom Navigation */}
        <MobileNavigation />
      </div>

      {/* Desktop Members & Details Right Panel */}
      <div className="hidden lg:block h-full shrink-0">
        <MembersPanel />
      </div>

      {/* Global Modals & Drawers */}
      <ProfileModal />
      <CreateRoomModal />
      <FindBuddyModal />
      <CreateStoryModal />
      <VideoCallModal />
      <ConversationInfoDrawer
        isOpen={showConversationInfoDrawer}
        onClose={() => setShowConversationInfoDrawer(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <ChatProvider>
      <ChatInterface />
    </ChatProvider>
  );
}
