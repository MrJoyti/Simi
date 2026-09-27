import React, { useState } from 'react';
import { useChat } from '../context/ChatContext';
import { CuteAvatar } from '../utils/avatars';
import { UserProfile } from '../types/chat';
import {
  Search,
  UserPlus,
  Check,
  MessageCircle,
  X,
  Copy,
  Sparkles,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import { sounds } from '../utils/sound';
import { getUserPresence } from '../utils/presence';

export const FindBuddyModal: React.FC = () => {
  const {
    showFindBuddyModal,
    setShowFindBuddyModal,
    currentUser,
    findUserByIdOrQuery,
    getBuddyRequestState,
    sendBuddyRequest,
    acceptBuddyRequest,
    declineBuddyRequest,
    cancelBuddyRequest,
    buddyRequests,
    startDirectMessage,
    activeUsers,
    isOnline,
    theme,
  } = useChat();

  const isMidnight = theme === 'midnight';
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);
  const [foundUser, setFoundUser] = useState<UserProfile | null>(null);
  const [copiedId, setCopiedId] = useState(false);

  if (!showFindBuddyModal || !currentUser) return null;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearching(true);
    setSearched(true);
    sounds.playClick();

    const user = await findUserByIdOrQuery(searchQuery.trim());
    setFoundUser(user);
    setSearching(false);
  };

  const copyMyId = () => {
    sounds.playClick();
    navigator.clipboard.writeText(currentUser.id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/55 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={() => setShowFindBuddyModal(false)}
    >
      <div
        className={`relative w-full max-w-lg rounded-3xl shadow-2xl border p-6 max-h-[90vh] overflow-y-auto scrollbar-thin animate-modalPop backdrop-blur-xl ${
          isMidnight ? 'bg-[#111821]/95 border-slate-800/80 text-slate-100' : 'bg-white/95 border-pink-100/80'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`flex items-center justify-between pb-4 border-b ${
          isMidnight ? 'border-slate-800' : 'border-pink-50'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-sm ${
              isMidnight ? 'bg-gradient-to-tr from-blue-600 to-cyan-500' : 'bg-gradient-to-tr from-pink-400 to-rose-400'
            }`}>
              <Search className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className={`text-base font-bold tracking-tight ${isMidnight ? 'text-slate-100' : 'text-slate-800'}`}>
                Find & Add Buddy
              </h2>
              <p className="text-xs text-slate-400">Connect by User ID, @username, or email</p>
            </div>
          </div>
          <button
            onClick={() => setShowFindBuddyModal(false)}
            className={`p-1.5 rounded-full transition-colors ${
              isMidnight ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-400 hover:text-slate-700 hover:bg-pink-50'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* My User ID Banner (Easy Sharing) */}
        <div className={`mt-4 p-3 rounded-2xl border flex items-center justify-between gap-2 ${
          isMidnight ? 'bg-slate-900/80 border-slate-800' : 'bg-pink-50/60 border-pink-100'
        }`}>
          <div className="min-w-0">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Your User ID (Share with friends)
            </span>
            <code className={`text-xs font-mono font-semibold truncate block ${isMidnight ? 'text-blue-400' : 'text-rose-700'}`}>
              {currentUser.id}
            </code>
          </div>
          <button
            type="button"
            onClick={copyMyId}
            className={`shrink-0 flex items-center gap-1 px-3 py-1.5 border rounded-xl text-xs font-bold transition-all active:scale-95 shadow-2xs ${
              isMidnight ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-blue-400' : 'bg-white text-rose-600 hover:bg-rose-50 border-pink-200'
            }`}
          >
            {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedId ? 'Copied!' : 'Copy ID'}</span>
          </button>
        </div>

        {/* Incoming Buddy Requests Section */}
        {buddyRequests.filter((r) => r.toUserId === currentUser?.id && r.status === 'pending').length > 0 && (
          <div className={`mt-4 p-3.5 rounded-2xl border space-y-2.5 ${
            isMidnight ? 'bg-emerald-950/40 border-emerald-800/60' : 'bg-emerald-50 border-emerald-200'
          }`}>
            <span className={`text-[11px] font-bold uppercase tracking-wider block ${
              isMidnight ? 'text-emerald-400' : 'text-emerald-700'
            }`}>
              Incoming Buddy Requests ({buddyRequests.filter((r) => r.toUserId === currentUser?.id && r.status === 'pending').length})
            </span>
            <div className="space-y-2">
              {buddyRequests
                .filter((r) => r.toUserId === currentUser?.id && r.status === 'pending')
                .map((req) => (
                  <div
                    key={req.id}
                    className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                      isMidnight ? 'bg-slate-900/90 border-slate-800 text-slate-100' : 'bg-white border-emerald-100 text-slate-800 shadow-2xs'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <CuteAvatar id={req.fromUserAvatar || 'bunny'} size="sm" />
                      <div className="min-w-0">
                        <span className="text-xs font-bold truncate block">{req.fromUserName}</span>
                        <span className="text-[10px] text-slate-400 block truncate">Sent you a friend request</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => {
                          sounds.playSend();
                          acceptBuddyRequest(req.id, req.fromUserId);
                        }}
                        className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-2xs transition-transform active:scale-95"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => {
                          sounds.playClick();
                          declineBuddyRequest(req.fromUserId);
                        }}
                        className="px-2.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-xl transition-colors"
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Search Input Form */}
        <form onSubmit={handleSearch} className="mt-4">
          <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${isMidnight ? 'text-slate-300' : 'text-slate-700'}`}>
            Enter Buddy's User ID, @username, or email
          </label>
          <div className="relative flex items-center">
            <Search className="w-4 h-4 absolute left-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="e.g. usr_c2Nyb2xsa... or @username"
              className={`w-full pl-10 pr-24 py-2.5 border rounded-2xl text-xs font-semibold focus:outline-none transition-all ${
                isMidnight
                  ? 'bg-slate-900 border-slate-700 text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-blue-950 focus:border-blue-500'
                  : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-pink-300 focus:bg-white'
              }`}
            />
            <button
              type="submit"
              disabled={searching || !searchQuery.trim()}
              className={`absolute right-1.5 px-4 py-1.5 text-white rounded-xl text-xs font-bold hover:opacity-95 transition-opacity disabled:opacity-50 ${
                isMidnight ? 'bg-gradient-to-r from-blue-600 to-cyan-600' : 'bg-gradient-to-r from-pink-500 to-rose-500'
              }`}
            >
              {searching ? 'Finding...' : 'Find Buddy'}
            </button>
          </div>
        </form>

        {/* Search Result */}
        {searched && (
          <div className="mt-4">
            {foundUser ? (
              <div className={`p-4 rounded-2xl border shadow-sm flex items-center justify-between gap-3 animate-in fade-in duration-200 ${
                isMidnight ? 'bg-slate-900 border-slate-800' : 'bg-white border-pink-200'
              }`}>
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative">
                    <CuteAvatar id={foundUser.avatarId} customUrl={foundUser.customAvatarUrl} size="md" />
                    {getUserPresence(foundUser, false, isOnline, currentUser, activeUsers).isOnline && (
                      <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white ring-1 ring-emerald-300 rounded-full animate-pulse" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h4 className={`text-xs font-bold truncate ${isMidnight ? 'text-slate-100' : 'text-slate-800'}`}>{foundUser.name}</h4>
                      {foundUser.id === currentUser.id && (
                        <span className={`text-[10px] px-1.5 py-0.2 rounded-md font-bold ${
                          isMidnight ? 'bg-slate-800 text-blue-400' : 'bg-pink-100 text-pink-600'
                        }`}>
                          (You)
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 truncate">@{foundUser.username}</p>
                    {getBuddyRequestState(foundUser.id) === 'buddy' || foundUser.id === currentUser.id ? (
                      <>
                        <p className="text-[10px] text-slate-500 font-mono truncate">ID: {foundUser.id}</p>
                        <p className="text-[10px] text-slate-500 truncate">{foundUser.email}</p>
                      </>
                    ) : (
                      <p className="text-[10px] text-slate-400 italic truncate">ID & Email hidden (Buddies only)</p>
                    )}
                  </div>
                </div>

                {foundUser.id !== currentUser.id && (
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => {
                        startDirectMessage(foundUser);
                        setShowFindBuddyModal(false);
                      }}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-transform active:scale-95 ${
                        isMidnight ? 'bg-slate-800 text-blue-400 hover:bg-slate-700' : 'bg-pink-100 text-pink-700 hover:bg-pink-200'
                      }`}
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>Message</span>
                    </button>

                    {getBuddyRequestState(foundUser.id) === 'buddy' ? (
                      <span className="px-2.5 py-1 text-xs font-bold text-emerald-600 bg-emerald-50 rounded-xl border border-emerald-200">Buddy</span>
                    ) : getBuddyRequestState(foundUser.id) === 'requestSent' ? (
                      <button
                        onClick={() => cancelBuddyRequest(foundUser.id)}
                        className="px-2.5 py-1 text-xs font-bold text-rose-500 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors"
                        title="Cancel Buddy Request"
                      >
                        Cancel Request
                      </button>
                    ) : getBuddyRequestState(foundUser.id) === 'incomingRequest' ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => acceptBuddyRequest(foundUser.id, foundUser.id)}
                          className="px-2.5 py-1 text-xs font-bold text-white bg-emerald-500 hover:bg-emerald-600 rounded-xl transition-colors shadow-2xs"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => declineBuddyRequest(foundUser.id)}
                          className="px-2 py-1 text-xs font-bold text-slate-600 bg-slate-200 hover:bg-slate-300 rounded-xl transition-colors"
                        >
                          Decline
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => sendBuddyRequest(foundUser)}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-white text-xs font-bold shadow-xs hover:opacity-95 transition-transform active:scale-95 ${
                          isMidnight ? 'bg-gradient-to-r from-blue-600 to-cyan-600' : 'bg-gradient-to-r from-pink-500 to-rose-500'
                        }`}
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Add Buddy</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className={`p-4 rounded-2xl border text-center ${
                isMidnight ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <AlertCircle className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                <p className={`text-xs font-semibold ${isMidnight ? 'text-slate-300' : 'text-slate-700'}`}>No user found with that ID</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Double check the User ID or ask your buddy to copy their User ID from this modal.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Suggested Registered Users to Add */}
        <div className="mt-6">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2 px-1">
            Registered Users ({activeUsers.filter((u) => u.id !== currentUser.id).length})
          </span>
          <div className="space-y-2 max-h-52 overflow-y-auto scrollbar-thin">
            {activeUsers
              .filter((u) => u.id !== currentUser.id)
              .map((user) => {
                const reqState = getBuddyRequestState(user.id);
                return (
                  <div
                    key={user.id}
                    className={`flex items-center justify-between p-2.5 rounded-2xl border transition-colors ${
                      isMidnight ? 'bg-slate-900/60 border-slate-800 hover:bg-slate-800' : 'bg-slate-50/70 hover:bg-pink-50/50 border-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <CuteAvatar id={user.avatarId} customUrl={user.customAvatarUrl} size="sm" />
                      <div className="min-w-0">
                        <span className={`text-xs font-bold block truncate ${isMidnight ? 'text-slate-200' : 'text-slate-800'}`}>
                          {user.name}
                        </span>
                        <span className="text-[10px] text-slate-400 truncate block">
                          @{user.username} · {reqState === 'buddy' ? `ID: ${user.id.slice(0, 10)}...` : 'ID & Email hidden'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => {
                          startDirectMessage(user);
                          setShowFindBuddyModal(false);
                        }}
                        className={`px-2.5 py-1 rounded-xl text-[11px] font-bold flex items-center gap-1 ${
                          isMidnight ? 'bg-slate-800 text-blue-400 hover:bg-slate-700' : 'bg-pink-100 text-pink-700 hover:bg-pink-200'
                        }`}
                      >
                        <MessageCircle className="w-3 h-3" />
                        <span>Message</span>
                      </button>

                      {reqState === 'buddy' ? (
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-lg">Buddy</span>
                      ) : reqState === 'requestSent' ? (
                        <button
                          onClick={() => cancelBuddyRequest(user.id)}
                          className="text-[10px] font-bold text-rose-500 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-2 py-0.5 rounded-lg transition-colors"
                          title="Cancel Request"
                        >
                          Cancel
                        </button>
                      ) : reqState === 'incomingRequest' ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => acceptBuddyRequest(user.id, user.id)}
                            className="text-[10px] font-bold text-white bg-emerald-500 hover:bg-emerald-600 px-2 py-0.5 rounded-lg transition-colors"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => declineBuddyRequest(user.id)}
                            className="text-[10px] font-bold text-slate-600 bg-slate-200 hover:bg-slate-300 px-1.5 py-0.5 rounded-lg transition-colors"
                          >
                            Decline
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => sendBuddyRequest(user)}
                          className={`px-2.5 py-1 rounded-xl text-white text-[11px] font-bold flex items-center gap-1 shadow-2xs ${
                            isMidnight ? 'bg-blue-600 hover:bg-blue-700' : 'bg-pink-500 hover:bg-pink-600'
                          }`}
                        >
                          <UserPlus className="w-3 h-3" />
                          <span>Add</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
};
