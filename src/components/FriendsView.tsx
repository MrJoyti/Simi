import React, { useState } from 'react';
import { useChat } from '../context/ChatContext';
import { CuteAvatar } from '../utils/avatars';
import { THEMES } from '../utils/theme';
import {
  MessageCircle,
  UserPlus,
  UserMinus,
  Search,
  CheckCircle2,
  Copy,
  Check,
  Users,
  Bell,
  Inbox,
} from 'lucide-react';
import { sounds } from '../utils/sound';
import { getUserPresence } from '../utils/presence';
import { MALE_DEMO_ONLINE_FRIENDS } from '../utils/maleDemoData';

export const FriendsView: React.FC = () => {
  const {
    activeUsers,
    currentUser,
    startDirectMessage,
    buddies,
    addBuddy,
    removeBuddy,
    isBuddy,
    getBuddyRequestState,
    sendBuddyRequest,
    acceptBuddyRequest,
    declineBuddyRequest,
    cancelBuddyRequest,
    buddyRequests,
    setShowFindBuddyModal,
    isOnline,
    theme,
  } = useChat();

  const isMidnight = theme === 'midnight';

  const incomingRequests = buddyRequests.filter(
    (r) => r.toUserId === currentUser?.id && r.status === 'pending'
  );
  const sentRequests = buddyRequests.filter(
    (r) => r.fromUserId === currentUser?.id && r.status === 'pending'
  );

  const [filterTab, setFilterTab] = useState<'buddies' | 'requests' | 'explore'>(() =>
    incomingRequests.length > 0 ? 'requests' : 'buddies'
  );
  const [filterQuery, setFilterQuery] = useState('');
  const [copiedId, setCopiedId] = useState(false);

  const copyMyId = () => {
    if (!currentUser) return;
    sounds.playClick();
    navigator.clipboard.writeText(currentUser.id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const displayedUsers = (
    filterTab === 'buddies'
      ? buddies
      : activeUsers.filter((u) => u.id !== currentUser?.id)
  ).filter(
    (u) =>
      u.name.toLowerCase().includes(filterQuery.toLowerCase()) ||
      u.username.toLowerCase().includes(filterQuery.toLowerCase()) ||
      (isBuddy(u.id) && u.id.toLowerCase().includes(filterQuery.toLowerCase()))
  );

  const onlineBuddies = activeUsers.filter((u) => {
    if (u.id === currentUser?.id) return false;
    const p = getUserPresence(u, false, isOnline, currentUser, activeUsers);
    return p.isOnline;
  });

  return (
    <div
      className={`flex-1 flex flex-col h-full overflow-y-auto p-4 sm:p-6 ${
        isMidnight ? 'bg-[#0B0F17] text-slate-100 pb-20' : 'bg-white/70'
      }`}
    >
      {/* 1. Header Bar */}
      <div className="flex items-center justify-between gap-3 mb-3.5">
        <h2
          className={`text-xl font-black tracking-tight ${
            isMidnight ? 'text-slate-100' : 'text-slate-800'
          }`}
        >
          {isMidnight ? 'Friends' : 'Buddies & Friend Requests'}
        </h2>

        <div className="flex items-center gap-2">
          {currentUser && !isMidnight && (
            <button
              onClick={copyMyId}
              className="flex items-center gap-1.5 px-3 py-1.5 border rounded-2xl text-xs font-bold shadow-2xs transition-all bg-white hover:bg-pink-50 border-pink-200 text-rose-600"
            >
              {copiedId ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
              <span>{copiedId ? 'Copied!' : 'Copy ID'}</span>
            </button>
          )}

          <button
            onClick={() => {
              sounds.playClick();
              setShowFindBuddyModal(true);
            }}
            className={`flex items-center gap-1.5 p-2 rounded-2xl text-xs font-bold shadow-xs hover:opacity-95 transition-transform active:scale-95 ${
              isMidnight
                ? 'bg-slate-900 border border-slate-800 text-slate-300 hover:text-white'
                : 'bg-gradient-to-r from-pink-500 to-rose-500 text-white px-3.5 py-1.5'
            }`}
            title="Find User by ID"
          >
            <UserPlus className="w-4 h-4" />
            {!isMidnight && <span>Find Buddy by ID</span>}
          </button>
        </div>
      </div>

      {/* 2. Search Field */}
      <div className="relative mb-3">
        <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400 pointer-events-none" />
        <input
          type="text"
          value={filterQuery}
          onChange={(e) => setFilterQuery(e.target.value)}
          placeholder={isMidnight ? "Search friends or @username..." : "Search by name or @username..."}
          className={`w-full pl-9 pr-4 py-2 rounded-2xl text-xs font-medium focus:outline-none transition-all ${
            isMidnight
              ? 'bg-[#111827]/80 border border-slate-800 text-slate-100 placeholder-slate-500 focus:border-cyan-500 shadow-inner'
              : 'bg-white border-slate-200 text-slate-800 focus:ring-2 focus:ring-pink-300'
          }`}
        />
      </div>

      {/* 3. Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none mb-4">
        {[
          { id: 'buddies', label: `All (${buddies.length})` },
          { id: 'explore', label: `Online (${onlineBuddies.length || MALE_DEMO_ONLINE_FRIENDS.length})` },
          { id: 'requests', label: incomingRequests.length > 0 ? `Requests (${incomingRequests.length})` : 'Requests' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              sounds.playClick();
              setFilterTab(tab.id as any);
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
              filterTab === tab.id
                ? isMidnight
                  ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 text-white shadow-md shadow-blue-950/60 glow-cyan-blue'
                  : 'bg-rose-500 text-white shadow-2xs'
                : isMidnight
                ? 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800/80'
                : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 4. For Male Experience: Online Now Horizontal Row */}
      {isMidnight && filterTab !== 'requests' && (
        <div className="mb-5 space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Online Now
            </h3>
            <button
              onClick={() => sounds.playClick()}
              className="text-[11px] font-bold text-cyan-400 hover:underline"
            >
              See All
            </button>
          </div>

          <div className="flex items-center gap-3.5 overflow-x-auto scrollbar-none py-1">
            {(onlineBuddies.length > 0 ? onlineBuddies : MALE_DEMO_ONLINE_FRIENDS).map((buddy: any) => (
              <div
                key={buddy.id}
                onClick={() => {
                  sounds.playClick();
                  startDirectMessage(buddy);
                }}
                className="flex flex-col items-center shrink-0 cursor-pointer group active:scale-95 transition-transform"
              >
                <div className="relative">
                  <CuteAvatar
                    id={buddy.avatarId || buddy.avatar || 'bunny'}
                    customUrl={buddy.customAvatarUrl || buddy.customAvatar}
                    size="md"
                    className="border-2 border-slate-800 ring-2 ring-blue-500/30 group-hover:ring-cyan-400 transition-all"
                  />
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[#0B0F17] shadow-sm" />
                </div>
                <span className="text-[10px] mt-1.5 font-bold text-slate-300 max-w-[56px] truncate text-center">
                  {buddy.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Requests Section View */}
      {filterTab === 'requests' ? (
        <div className="space-y-6">
          {/* Incoming Requests */}
          <div>
            <h3
              className={`text-xs font-bold uppercase tracking-wider mb-2.5 flex items-center gap-2 ${
                isMidnight ? 'text-slate-300' : 'text-slate-700'
              }`}
            >
              <Users className="w-4 h-4 text-pink-500" />
              <span>Incoming Requests ({incomingRequests.length})</span>
            </h3>

            {incomingRequests.length === 0 ? (
              <div
                className={`p-8 text-center rounded-3xl border flex flex-col items-center ${
                  isMidnight ? 'bg-[#111821] border-slate-800' : 'bg-white border-pink-100'
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-2 ${
                    isMidnight ? 'bg-slate-800 text-blue-400' : 'bg-pink-50 text-rose-500'
                  }`}
                >
                  <Inbox className="w-6 h-6" />
                </div>
                <p className={`text-xs font-semibold ${isMidnight ? 'text-slate-300' : 'text-slate-700'}`}>
                  No pending incoming friend requests
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  When someone sends you a buddy request, it will appear here so you can accept or decline!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {incomingRequests.map((req) => (
                  <div
                    key={req.id}
                    className={`p-4 rounded-3xl border shadow-2xs flex items-center justify-between gap-3 ${
                      isMidnight
                        ? 'bg-[#111821] border-slate-800 text-slate-200'
                        : 'bg-white/95 border-pink-100 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <CuteAvatar id={req.fromUserAvatar || 'bunny'} size="md" />
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold truncate">{req.fromUserName}</h4>
                        <p className="text-[10px] text-slate-400">Sent you a buddy request</p>
                        <p className="text-[9px] text-slate-400 italic mt-0.5">
                          Email & ID hidden until accepted
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => {
                          sounds.playSend();
                          acceptBuddyRequest(req.id, req.fromUserId);
                        }}
                        className="px-3 py-1.5 rounded-2xl text-xs font-bold text-white bg-emerald-500 hover:bg-emerald-600 shadow-2xs transition-transform active:scale-95"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => {
                          sounds.playClick();
                          declineBuddyRequest(req.fromUserId);
                        }}
                        className="px-2.5 py-1.5 rounded-2xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sent Requests */}
          <div>
            <h3
              className={`text-xs font-bold uppercase tracking-wider mb-2.5 flex items-center gap-2 ${
                isMidnight ? 'text-slate-300' : 'text-slate-700'
              }`}
            >
              <UserPlus className="w-4 h-4 text-blue-500" />
              <span>Sent Requests ({sentRequests.length})</span>
            </h3>

            {sentRequests.length === 0 ? (
              <div
                className={`p-6 text-center rounded-3xl border ${
                  isMidnight ? 'bg-[#111821] border-slate-800 text-slate-400' : 'bg-white border-pink-100 text-slate-500'
                }`}
              >
                <p className="text-xs">No sent pending requests.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {sentRequests.map((req) => (
                  <div
                    key={req.id}
                    className={`p-4 rounded-3xl border shadow-2xs flex items-center justify-between gap-3 ${
                      isMidnight
                        ? 'bg-[#111821] border-slate-800 text-slate-200'
                        : 'bg-white/95 border-pink-100 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <CuteAvatar id={req.toUserAvatar || 'bunny'} size="md" />
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold truncate">{req.toUserName}</h4>
                        <span className="text-[10px] font-semibold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full inline-block mt-0.5">
                          Pending Acceptance
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        sounds.playClick();
                        cancelBuddyRequest(req.toUserId);
                      }}
                      className="px-3 py-1.5 rounded-2xl text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors"
                    >
                      Cancel Request
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : displayedUsers.length === 0 ? (
        <div
          className={`p-10 text-center rounded-3xl border flex flex-col items-center ${
            isMidnight ? 'bg-[#111821] border-slate-800' : 'bg-white border-pink-100'
          }`}
        >
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-2 ${
              isMidnight ? 'bg-slate-800 text-blue-400' : 'bg-pink-50 text-rose-500'
            }`}
          >
            <Users className="w-7 h-7" />
          </div>
          <h3 className={`text-sm font-bold ${isMidnight ? 'text-slate-200' : 'text-slate-800'}`}>
            {filterTab === 'buddies' ? 'No buddies added yet!' : 'No matching users found.'}
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm">
            {filterTab === 'buddies'
              ? 'Find friends by their User ID or explore active registered members to add them to your buddy circle.'
              : 'Try searching with another keyword or invite a friend with your User ID.'}
          </p>
          {filterTab === 'buddies' && (
            <button
              onClick={() => setShowFindBuddyModal(true)}
              className={`mt-4 px-4 py-2 rounded-2xl text-white text-xs font-bold shadow-xs transition-transform active:scale-95 ${
                isMidnight ? 'bg-blue-600 hover:bg-blue-700' : 'bg-pink-500 hover:bg-pink-600'
              }`}
            >
              + Find & Add Buddy
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {displayedUsers.map((user) => {
            const added = isBuddy(user.id);
            const isSelf = user.id === currentUser?.id;
            const presence = getUserPresence(user, isSelf, isOnline, currentUser, activeUsers);
            return (
              <div
                key={user.id}
                className={`flex items-center justify-between p-3.5 rounded-3xl border shadow-2xs transition-all ${
                  isMidnight
                    ? 'bg-[#111821] border-slate-800 hover:border-slate-700 text-slate-200'
                    : 'bg-white/95 border-pink-100 hover:border-pink-200 text-slate-800'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative">
                    <CuteAvatar id={user.avatarId} customUrl={user.customAvatarUrl} size="md" />
                    <span
                      className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 border-2 rounded-full ${
                        isMidnight ? 'border-slate-900' : 'border-white'
                      } ${
                        presence.isOnline
                          ? 'bg-emerald-500 ring-2 ring-emerald-400 animate-pulse'
                          : presence.isIdle
                          ? 'bg-amber-400'
                          : 'bg-slate-500'
                      }`}
                      title={presence.label}
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span
                        className={`text-xs font-bold truncate ${
                          isMidnight ? 'text-slate-100' : 'text-slate-800'
                        }`}
                      >
                        {user.name}
                      </span>
                      {user.emailVerified && (
                        <span title="Email Verified" className="inline-flex">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                        </span>
                      )}
                      {presence.isOnline ? (
                        <span
                          className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold flex items-center gap-0.5 shrink-0 ${
                            isMidnight
                              ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/50'
                              : 'bg-emerald-100 text-emerald-700'
                          }`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          <span>Active</span>
                        </span>
                      ) : (
                        <span
                          className={`px-1.5 py-0.5 rounded-full text-[9px] font-medium border shrink-0 ${
                            isMidnight
                              ? 'bg-slate-800/60 text-slate-400 border-slate-700'
                              : 'bg-slate-100 text-slate-500 border-slate-200/60'
                          }`}
                        >
                          {presence.label}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 truncate">@{user.username}</p>
                    {added || isSelf ? (
                      <>
                        <p className="text-[10px] text-slate-500 font-mono truncate">ID: {user.id}</p>
                        <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
                      </>
                    ) : (
                      <p className="text-[10px] text-slate-400 italic truncate">
                        ID & Email hidden (Add buddy to view)
                      </p>
                    )}
                    {user.moodText && !['active now', 'available'].includes(user.moodText.toLowerCase().trim()) && (
                      <p
                        className={`text-[11px] font-medium truncate mt-0.5 ${
                          isMidnight ? 'text-blue-400' : 'text-rose-500'
                        }`}
                      >
                        {user.moodText}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {added ? (
                    <>
                      <button
                        onClick={() => startDirectMessage(user)}
                        className={`px-3 py-1.5 rounded-2xl text-white text-xs font-bold flex items-center gap-1 shadow-xs transition-transform active:scale-95 ${
                          isMidnight ? 'bg-blue-600 hover:bg-blue-700' : 'bg-pink-500 hover:bg-pink-600'
                        }`}
                        title="Start Direct Chat"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Chat</span>
                      </button>
                      <button
                        onClick={async () => {
                          if (window.confirm(`Remove ${user.name} from your buddies?`)) {
                            sounds.playClick();
                            await removeBuddy(user.id);
                          }
                        }}
                        className={`px-2.5 py-1.5 rounded-2xl text-xs font-bold flex items-center gap-1 transition-colors ${
                          isMidnight
                            ? 'bg-slate-800 hover:bg-rose-950/60 text-slate-300 hover:text-rose-400 border border-slate-700'
                            : 'bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 border border-slate-200/80'
                        }`}
                        title="Delete Friend"
                      >
                        <UserMinus className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Delete Friend</span>
                      </button>
                    </>
                  ) : getBuddyRequestState(user.id) === 'requestSent' ? (
                    <button
                      onClick={() => cancelBuddyRequest(user.id)}
                      className="px-3 py-1.5 rounded-2xl text-xs font-bold text-rose-500 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors"
                      title="Cancel Buddy Request"
                    >
                      Cancel Request
                    </button>
                  ) : getBuddyRequestState(user.id) === 'incomingRequest' ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          const req = buddyRequests.find(
                            (r) => r.fromUserId === user.id && r.toUserId === currentUser?.id && r.status === 'pending'
                          );
                          acceptBuddyRequest(req?.id || user.id, user.id);
                        }}
                        className="px-3 py-1.5 rounded-2xl text-xs font-bold text-white bg-emerald-500 hover:bg-emerald-600 transition-colors shadow-2xs"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => declineBuddyRequest(user.id)}
                        className="px-2.5 py-1.5 rounded-2xl text-xs font-bold text-slate-600 bg-slate-200 hover:bg-slate-300 transition-colors"
                      >
                        Decline
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => sendBuddyRequest(user)}
                      className={`px-4 py-1.5 rounded-2xl text-white text-xs font-bold flex items-center gap-1 shadow-md transition-transform active:scale-95 ${
                        isMidnight
                          ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 shadow-blue-900/40 glow-cyan-blue'
                          : 'bg-gradient-to-r from-pink-500 to-rose-500'
                      }`}
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>{isMidnight ? 'Add' : 'Add Buddy'}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
