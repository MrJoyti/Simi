import React, { useState } from 'react';
import { useChat } from '../context/ChatContext';
import { X, Plus, Hash, Users, Check } from 'lucide-react';
import { sounds } from '../utils/sound';
import { CuteAvatar } from '../utils/avatars';

const ICON_SUGGESTIONS = ['🌸', '🐾', '☕', '🎮', '🎨', '🧁', '📚', '🌙', '🍓', '🧋', '🧸', '✨'];

export const CreateRoomModal: React.FC = () => {
  const { showCreateRoomModal, setShowCreateRoomModal, createGroupRoom, triggerConfetti, buddies, theme } = useChat();

  const isMidnight = theme === 'midnight';
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('💬');
  const [selectedBuddies, setSelectedBuddies] = useState<string[]>([]);

  if (!showCreateRoomModal) return null;

  const toggleBuddy = (id: string) => {
    sounds.playClick();
    setSelectedBuddies((prev) =>
      prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    sounds.playSend();
    await createGroupRoom(name.trim(), description.trim(), icon, selectedBuddies);
    triggerConfetti();
    setName('');
    setDescription('');
    setSelectedBuddies([]);
    setShowCreateRoomModal(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/55 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={() => setShowCreateRoomModal(false)}
    >
      <div
        className={`relative w-full max-w-md rounded-3xl shadow-2xl border p-6 max-h-[90vh] overflow-y-auto scrollbar-thin animate-modalPop backdrop-blur-xl ${
          isMidnight ? 'bg-[#111821]/95 border-slate-800/80 text-slate-100' : 'bg-white/95 border-pink-100/80'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`flex items-center justify-between pb-3 border-b ${
          isMidnight ? 'border-slate-800' : 'border-pink-50'
        }`}>
          <div className="flex items-center gap-2">
            <span className="text-xl">{icon}</span>
            <div>
              <h2 className={`text-base font-bold tracking-tight ${isMidnight ? 'text-slate-100' : 'text-slate-800'}`}>
                Create Group Chat
              </h2>
              <p className="text-xs text-slate-400">Host a shared group channel for your buddies</p>
            </div>
          </div>
          <button
            onClick={() => setShowCreateRoomModal(false)}
            className={`p-1.5 rounded-full transition-colors ${
              isMidnight ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-400 hover:text-slate-700 hover:bg-pink-50'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className={`block text-xs font-semibold mb-1.5 ${isMidnight ? 'text-slate-300' : 'text-slate-700'}`}>
              Choose Group Icon
            </label>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {(isMidnight ? ['⚡', '⚔️', '🛡️', '🛰️', '🔥', '⚙️', '🌌', '💎', '🚀', '🎯', '🏁', '🌐'] : ICON_SUGGESTIONS).map((ic) => (
                <button
                  type="button"
                  key={ic}
                  onClick={() => {
                    sounds.playClick();
                    setIcon(ic);
                  }}
                  className={`w-9 h-9 flex items-center justify-center text-lg rounded-2xl transition-all ${
                    icon === ic
                      ? isMidnight ? 'bg-slate-800 border-2 border-blue-500 shadow-xs scale-105' : 'bg-pink-100 border-2 border-pink-400 shadow-xs scale-105'
                      : isMidnight ? 'border border-slate-800 hover:bg-slate-800' : 'border border-slate-100 hover:bg-pink-50/60'
                  }`}
                >
                  {ic}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className={`block text-xs font-semibold mb-1 ${isMidnight ? 'text-slate-300' : 'text-slate-700'}`}>
              Group Name
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-xs text-slate-400">#</span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                maxLength={40}
                placeholder="e.g. tech-lounge"
                className={`w-full pl-7 pr-3.5 py-2.5 border rounded-2xl text-xs font-medium focus:outline-none transition-all ${
                  isMidnight
                    ? 'bg-slate-900 border-slate-700 text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-blue-950 focus:border-blue-500'
                    : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-pink-300 focus:bg-white'
                }`}
              />
            </div>
          </div>

          <div>
            <label className={`block text-xs font-semibold mb-1 ${isMidnight ? 'text-slate-300' : 'text-slate-700'}`}>
              Group Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              maxLength={100}
              placeholder="What makes this group channel special?"
              className={`w-full px-3.5 py-2 border rounded-2xl text-xs font-medium focus:outline-none transition-all resize-none ${
                isMidnight
                  ? 'bg-slate-900 border-slate-700 text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-blue-950 focus:border-blue-500'
                  : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-pink-300 focus:bg-white'
              }`}
            />
          </div>

          {/* Add Buddies to Group */}
          <div>
            <label className={`block text-xs font-semibold mb-1.5 flex items-center justify-between ${isMidnight ? 'text-slate-300' : 'text-slate-700'}`}>
              <span>Invite Buddies ({selectedBuddies.length} selected)</span>
              <span className={`text-[10px] font-bold ${isMidnight ? 'text-blue-400' : 'text-pink-600'}`}>{buddies.length} buddies available</span>
            </label>

            {buddies.length === 0 ? (
              <p className={`text-[11px] text-slate-400 p-2.5 rounded-2xl border ${
                isMidnight ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-100'
              }`}>
                You haven't added any buddies yet. You can still create the group and invite them later!
              </p>
            ) : (
              <div className={`space-y-1.5 max-h-36 overflow-y-auto scrollbar-thin p-1 border rounded-2xl ${
                isMidnight ? 'border-slate-800 bg-slate-900/60' : 'border-slate-100 bg-slate-50/50'
              }`}>
                {buddies.map((b) => {
                  const isSelected = selectedBuddies.includes(b.id);
                  return (
                    <button
                      type="button"
                      key={b.id}
                      onClick={() => toggleBuddy(b.id)}
                      className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-all ${
                        isSelected
                          ? isMidnight ? 'bg-slate-800 text-blue-300 font-bold' : 'bg-pink-100/90 text-rose-800 font-bold'
                          : isMidnight ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-white text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <CuteAvatar id={b.avatarId} customUrl={b.customAvatarUrl} size="sm" />
                        <span className="text-xs truncate">{b.name} (@{b.username})</span>
                      </div>
                      <div
                        className={`w-4 h-4 rounded-md border flex items-center justify-center ${
                          isSelected
                            ? isMidnight ? 'bg-blue-600 border-blue-600 text-white' : 'bg-rose-500 border-rose-500 text-white'
                            : isMidnight ? 'border-slate-700 bg-slate-800' : 'border-slate-300 bg-white'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setShowCreateRoomModal(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-5 py-2.5 rounded-2xl text-white font-bold text-xs shadow-md transition-transform active:scale-95 ${
                isMidnight
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 shadow-blue-950/50'
                  : 'bg-gradient-to-r from-pink-500 to-rose-500 shadow-pink-200'
              }`}
            >
              Create Group Chat
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
