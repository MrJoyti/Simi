import React, { useState } from 'react';
import { useChat } from '../context/ChatContext';
import {
  ArrowLeft,
  Search,
  Play,
  Volume2,
  FileText,
  Image as ImageIcon,
  Film,
  Mic,
  Download,
  Share2,
  X,
} from 'lucide-react';
import { sounds } from '../utils/sound';
import { MALE_DEMO_MEDIA_ITEMS } from '../utils/maleDemoData';
import { MediaHubItem } from '../types/chat';

interface MediaHubModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MediaHubModal: React.FC<MediaHubModalProps> = ({ isOpen, onClose }) => {
  const { theme, currentUser } = useChat();
  const isMidnight = theme === 'midnight' || currentUser?.gender === 'male';

  const [activeTab, setActiveTab] = useState<'all' | 'photos' | 'videos' | 'voice' | 'files'>('all');
  const [selectedItem, setSelectedItem] = useState<MediaHubItem | null>(null);

  if (!isOpen) return null;

  const filteredItems = MALE_DEMO_MEDIA_ITEMS.filter((item) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'photos' && item.type === 'photo') return true;
    if (activeTab === 'videos' && item.type === 'video') return true;
    if (activeTab === 'voice' && item.type === 'voice') return true;
    if (activeTab === 'files' && item.type === 'file') return true;
    return false;
  });

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#0B0F17] text-slate-100 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-800/80 bg-[#111827]/90 backdrop-blur-xl shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className="p-2 rounded-2xl hover:bg-slate-800 transition-colors text-slate-300"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-base font-extrabold tracking-tight">Media</h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => sounds.playClick()}
            className="p-2 rounded-2xl hover:bg-slate-800 text-slate-400"
          >
            <Search className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter Chips Bar */}
      <div className="px-4 py-2.5 flex items-center gap-2 overflow-x-auto scrollbar-none border-b border-slate-800/50 bg-[#0E1522]/80 shrink-0">
        {[
          { id: 'all', label: 'All' },
          { id: 'photos', label: 'Photos' },
          { id: 'videos', label: 'Videos' },
          { id: 'voice', label: 'Voice' },
          { id: 'files', label: 'Files' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              sounds.playClick();
              setActiveTab(tab.id as any);
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-md shadow-blue-900/40 glow-cyan-blue'
                : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800/80'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Media Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        {filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500">
            <ImageIcon className="w-10 h-10 mb-2 opacity-50" />
            <p className="text-xs">No media found in this category</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  sounds.playClick();
                  setSelectedItem(item);
                }}
                className="group relative aspect-square rounded-2xl overflow-hidden border border-slate-800/80 bg-slate-900/80 cursor-pointer transition-all hover:border-blue-500/50 hover:scale-[1.02]"
              >
                {item.type === 'voice' ? (
                  <div className="w-full h-full flex flex-col items-center justify-center p-3 bg-gradient-to-br from-indigo-950/80 via-slate-900 to-blue-950/80 text-center">
                    <div className="w-10 h-10 rounded-full bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-cyan-400 mb-2">
                      <Mic className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-bold text-slate-200 truncate w-full">
                      {item.title}
                    </span>
                    <span className="text-[10px] text-cyan-400 font-mono mt-0.5">
                      {item.duration}
                    </span>
                  </div>
                ) : (
                  <>
                    <img
                      src={item.url}
                      alt={item.title || 'Media item'}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                    {item.type === 'video' && (
                      <div className="absolute inset-0 bg-black/25 flex items-center justify-center">
                        <div className="w-8 h-8 rounded-full bg-black/60 backdrop-blur-xs flex items-center justify-center text-white border border-white/20">
                          <Play className="w-4 h-4 ml-0.5 fill-white" />
                        </div>
                        {item.duration && (
                          <span className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded-md bg-black/70 backdrop-blur-xs text-[10px] font-mono font-bold text-white">
                            {item.duration}
                          </span>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Full Preview Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-60 bg-black/90 flex flex-col items-center justify-center p-4">
          <button
            onClick={() => setSelectedItem(null)}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-white hover:bg-white/20"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="max-w-2xl w-full max-h-[80vh] flex items-center justify-center">
            {selectedItem.type === 'voice' ? (
              <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-4">
                <Mic className="w-12 h-12 text-cyan-400 mx-auto" />
                <h4 className="text-sm font-bold text-slate-100">{selectedItem.title}</h4>
                <p className="text-xs text-slate-400">Duration: {selectedItem.duration}</p>
                <button
                  onClick={() => sounds.playReceive()}
                  className="px-6 py-2.5 rounded-2xl bg-blue-600 text-white font-bold text-xs"
                >
                  Play Voice Note
                </button>
              </div>
            ) : (
              <img
                src={selectedItem.url}
                alt="Selected"
                className="max-w-full max-h-[80vh] rounded-2xl object-contain shadow-2xl"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};
