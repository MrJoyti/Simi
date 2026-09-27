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
import { CreatePostModal } from './components/CreatePostModal';
import { MediaHubModal } from './components/MediaHubModal';
import { SettingsModal } from './components/SettingsModal';
import { VideoCallModal } from './components/VideoCallModal';
import { MobileNavigation } from './components/MobileNavigation';
import { FriendsView } from './components/FriendsView';
import { ProfileView } from './components/ProfileView';
import { MobileChannelsList } from './components/MobileChannelsList';
import { VerseView } from './components/VerseView';
import { AuthModal } from './components/AuthModal';
import { ConversationInfoDrawer } from './components/ConversationInfoDrawer';
import { SimiToastContainer } from './components/SimiToast';
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
    showCreatePostModal,
    setShowCreatePostModal,
    showMediaHubModal,
    setShowMediaHubModal,
    showSettingsModal,
    setShowSettingsModal,
    addFeedPost,
    simiTheme,
  } = useChat();

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const activeTheme = simiTheme.styles;

  // Loading state
  if (isAuthLoading) {
    return (
      <div
        className="flex h-[100dvh] w-full items-center justify-center transition-colors duration-300"
        style={{ backgroundColor: activeTheme.bodyBg }}
      >
        <div className="flex items-center justify-center">
          <img
            src="/simi-logo.png"
            alt="Simi Logo"
            className="w-16 h-16 rounded-3xl object-cover shadow-xl animate-bounce ring-4 ring-purple-400/30"
          />
        </div>
      </div>
    );
  }

  // Show AuthModal if user hasn't registered, logged in, or is missing gender
  if (!authUser || !currentUser || !currentUser.gender) {
    return (
      <AuthModal
        onSuccess={(profile) => setUserProfileDirectly(profile)}
        unverifiedUser={authUser && authUser.email && !authUser.emailVerified && !authUser.isAnonymous ? authUser : null}
        onSignOut={handleSignOut}
        existingProfileMissingGender={currentUser && !currentUser.gender ? currentUser : null}
      />
    );
  }

  const isMaleTheme = simiTheme.isMale;

  return (
    <div
      className={`flex flex-col md:flex-row h-[100dvh] w-full max-w-full overflow-hidden transition-colors duration-300 font-sans select-none ${isMaleTheme ? 'text-slate-100' : 'text-slate-800'}`}
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
      <div className={`flex-1 flex flex-col h-full min-h-0 min-w-0 backdrop-blur-xs relative overflow-hidden transition-colors duration-300 ${isMaleTheme ? 'bg-[#0B0F14]/90' : 'bg-white/70'}`}>
        {/* On Mobile: Render Active Tab View */}
        <div className="md:hidden flex-1 flex flex-col h-full min-h-0 min-w-0 overflow-hidden relative">
          {activeMobileTab === 'chats' && (
            currentRoomId ? (
              <div className="flex-1 flex flex-col h-full min-h-0 min-w-0 overflow-hidden">
                <ChatHeader onToggleSidebarMobile={() => setMobileSidebarOpen(true)} />
                <MessageList />
                <ChatInput />
              </div>
            ) : (
              <div className="flex-1 flex flex-col h-full min-h-0 min-w-0 overflow-hidden">
                <MobileChannelsList />
              </div>
            )
          )}
          {activeMobileTab === 'spaces' && (
            <div className="flex-1 flex flex-col h-full min-h-0 min-w-0 overflow-hidden">
              <VerseView />
            </div>
          )}
          {activeMobileTab === 'friends' && (
            <div className="flex-1 flex flex-col h-full min-h-0 min-w-0 overflow-hidden">
              <FriendsView />
            </div>
          )}
          {activeMobileTab === 'profile' && (
            <div className="flex-1 flex flex-col h-full min-h-0 min-w-0 overflow-hidden">
              <ProfileView />
            </div>
          )}
        </div>

        {/* On Desktop: Standard full chat flow */}
        <div className="hidden md:flex flex-1 flex-col h-full min-h-0 min-w-0">
          <ChatHeader onToggleSidebarMobile={() => setMobileSidebarOpen(true)} />
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
      <CreatePostModal
        isOpen={showCreatePostModal}
        onClose={() => setShowCreatePostModal(false)}
        onPostCreated={addFeedPost}
      />
      <MediaHubModal
        isOpen={showMediaHubModal}
        onClose={() => setShowMediaHubModal(false)}
      />
      <SettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
      />
      <VideoCallModal />
      <ConversationInfoDrawer
        isOpen={showConversationInfoDrawer}
        onClose={() => setShowConversationInfoDrawer(false)}
      />
      <SimiToastContainer />
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
