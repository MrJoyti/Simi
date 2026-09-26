import React, { useState } from 'react';
import { useChat } from '../context/ChatContext';
import { CUTE_STICKERS, POPULAR_REACTION_EMOJIS } from '../utils/stickers';
import { StickerItem } from '../types/chat';
import { Sparkles, Heart, Smile, Coffee, PawPrint, X, Search } from 'lucide-react';
import { sounds } from '../utils/sound';

interface StickerPickerProps {
  onSelectSticker: (sticker: StickerItem) => void;
  onSelectEmoji: (emoji: string) => void;
  onClose: () => void;
}

export const StickerPicker: React.FC<StickerPickerProps> = ({
  onSelectSticker,
  onSelectEmoji,
  onClose,
}) => {
  const { theme } = useChat();
  const isMale = theme === 'midnight';

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchFilter, setSearchFilter] = useState<string>('');

  const filteredStickers = CUTE_STICKERS.filter((s) => {
    const matchesCategory = activeCategory === 'all' || s.category === activeCategory;
    const matchesSearch =
      !searchFilter.trim() ||
      s.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      s.category.toLowerCase().includes(searchFilter.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const categories = [
    { id: 'all', label: 'All', icon: Sparkles },
    { id: 'cute', label: isMale ? 'Emojis' : 'Mochi', icon: Heart },
    { id: 'reactions', label: 'Reactions', icon: Smile },
    { id: 'vibes', label: isMale ? 'Vibes' : 'Cozy', icon: Coffee },
    { id: 'animals', label: isMale ? 'Avatars' : 'Critters', icon: PawPrint },
  ];

  return (
    <div className={`absolute bottom-16 left-2 sm:left-4 z-50 w-80 sm:w-96 rounded-3xl shadow-2xl border p-3.5 flex flex-col gap-2.5 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-md ${
      isMale ? 'bg-slate-900/95 border-slate-800 text-slate-100' : 'bg-white/95 border-pink-200/80 text-slate-800'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs ${
            isMale ? 'bg-slate-800 text-blue-400' : 'bg-pink-100'
          }`}>
            {isMale ? '⚡' : '🍡'}
          </div>
          <div>
            <span className={`text-xs font-bold tracking-tight block ${isMale ? 'text-white' : 'text-slate-800'}`}>
              {isMale ? 'Stickers & Reactions' : 'Animated Mochi Stickers'}
            </span>
            <span className={`text-[10px] font-medium block ${isMale ? 'text-blue-400' : 'text-pink-500'}`}>
              Tap to send bouncy stickers
            </span>
          </div>
        </div>
        <button
          onClick={() => {
            sounds.playClick();
            onClose();
          }}
          className={`p-1 rounded-full transition-colors ${
            isMale ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
          }`}
          title="Close stickers"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Quick Emoji Bar */}
      <div className={`flex items-center justify-between rounded-2xl p-1 px-2 border ${
        isMale ? 'bg-slate-950 border-slate-800' : 'bg-pink-50/70 border-pink-100/80'
      }`}>
        <span className={`text-[10px] font-bold uppercase tracking-wider mr-1 ${
          isMale ? 'text-blue-400' : 'text-pink-400'
        }`}>
          Quick:
        </span>
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-0.5">
          {POPULAR_REACTION_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              onClick={() => {
                sounds.playReaction();
                onSelectEmoji(emoji);
              }}
              className="w-7 h-7 shrink-0 flex items-center justify-center text-base hover:scale-130 transition-transform active:scale-95"
              title={`Insert ${emoji}`}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>

      {/* Search Input Filter */}
      <div className="relative flex items-center">
        <Search className={`w-3.5 h-3.5 absolute left-3 pointer-events-none ${isMale ? 'text-slate-500' : 'text-slate-400'}`} />
        <input
          type="text"
          value={searchFilter}
          onChange={(e) => setSearchFilter(e.target.value)}
          placeholder={isMale ? 'Search stickers...' : 'Search mochi stickers...'}
          className={`w-full pl-8 pr-3 py-1.5 rounded-xl text-xs focus:outline-none transition-all ${
            isMale
              ? 'bg-slate-950 border border-slate-800 focus:border-blue-500 text-white placeholder-slate-500'
              : 'bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200/80 focus:border-pink-300 focus:ring-1 focus:ring-pink-200 text-slate-800 placeholder-slate-400'
          }`}
        />
        {searchFilter && (
          <button
            onClick={() => setSearchFilter('')}
            className={`absolute right-2.5 text-xs ${isMale ? 'text-slate-400 hover:text-white' : 'text-slate-400 hover:text-slate-600'}`}
          >
            ×
          </button>
        )}
      </div>

      {/* Categories Tabs */}
      <div className={`flex items-center gap-1 p-1 rounded-2xl ${
        isMale ? 'bg-slate-950/80' : 'bg-slate-100/70'
      }`}>
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => {
                sounds.playClick();
                setActiveCategory(cat.id);
              }}
              className={`flex-1 flex items-center justify-center gap-1 py-1 px-1.5 rounded-xl text-[11px] font-semibold transition-all ${
                isActive
                  ? isMale
                    ? 'bg-blue-600 text-white shadow-2xs font-bold'
                    : 'bg-white text-rose-600 shadow-2xs font-bold'
                  : isMale
                  ? 'text-slate-400 hover:text-white'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Icon className="w-3 h-3" />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Animated Stickers Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-56 overflow-y-auto p-1 pr-1.5 scrollbar-thin">
        {filteredStickers.length === 0 ? (
          <div className="col-span-full py-8 text-center text-xs text-slate-400">
            No stickers matching "{searchFilter}"
          </div>
        ) : (
          filteredStickers.map((sticker) => (
            <button
              key={sticker.id}
              onClick={() => {
                sounds.playReaction();
                onSelectSticker(sticker);
              }}
              className={`group relative flex flex-col items-center justify-center p-2 rounded-2xl border transition-all hover:scale-105 active:scale-95 shadow-2xs ${
                isMale
                  ? 'bg-slate-950 border-slate-800 hover:border-blue-500 hover:bg-slate-800/80'
                  : 'bg-white hover:bg-gradient-to-b hover:from-pink-50/80 hover:to-rose-50/60 border-slate-100 hover:border-pink-300'
              }`}
              title={`Send ${sticker.name}`}
            >
              <div
                className="w-14 h-14 pointer-events-none drop-shadow-xs transition-transform group-hover:scale-110"
                dangerouslySetInnerHTML={{ __html: sticker.svg }}
              />
              <span className={`text-[10px] mt-1 truncate max-w-full font-bold ${
                isMale
                  ? 'text-slate-400 group-hover:text-blue-400'
                  : 'text-slate-600 group-hover:text-rose-600'
              }`}>
                {sticker.name}
              </span>
            </button>
          ))
        )}
      </div>
    </div>
  );
};

