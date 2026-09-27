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
import { MediaHubItem } from '../types/chat';

interface MediaHubModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MediaHubModal: React.FC<MediaHubModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, simiTheme, feedPosts, stories, messages } = useChat();
  const isMidnight = simiTheme.isMale;

  const [activeTab, setActiveTab] = useState<'all' | 'photos' | 'videos' | 'voice' | 'files'>('all');
  const [selectedItem, setSelectedItem] = useState<MediaHubItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  if (!isOpen) return null;

  // Extract real media from posts, stories, and chat attachments
  const realItems: MediaHubItem[] = [];

  // Feed posts images
  feedPosts.forEach((post) => {
    post.images?.forEach((img, idx) => {
      realItems.push({
        id: `${post.id}-img-${idx}`,
        type: 'photo',
        url: img,
        title: post.content ? post.content.slice(0, 30) : 'Photo',
        timestamp: post.createdAt,
      });
    });
  });

  // Stories
  stories.forEach((story) => {
    if (story.imageUrl) {
      realItems.push({
        id: story.id,
        type: 'photo',
        url: story.imageUrl,
        title: story.text || 'Story',
        timestamp: story.createdAt,
      });
    }
  });

  // Messages with attachments
  messages.forEach((msg) => {
    if (msg.attachmentUrl) {
      realItems.push({
        id: msg.id,
        type: msg.type === 'voice' ? 'voice' : 'photo',
        url: msg.attachmentUrl,
        title: msg.senderName ? `${msg.senderName}'s shared media` : 'Attachment',
        timestamp: msg.timestamp || Date.now(),
        duration: msg.audioDuration
          ? `${Math.floor(msg.audioDuration / 60)}:${String(Math.floor(msg.audioDuration % 60)).padStart(2, '0')}`
          : undefined,
      });
    }
  });

  const filteredItems = realItems.filter((item) => {
    if (searchQuery.trim()) {
      const match = (item.title || '').toLowerCase().includes(searchQuery.toLowerCase());
      if (!match) return false;
    }
    if (activeTab === 'all') return true;
    if (activeTab === 'photos' && item.type === 'photo') return true;
    if (activeTab === 'videos' && item.type === 'video') return true;
    if (activeTab === 'voice' && item.type === 'voice') return true;
    if (activeTab === 'files' && item.type === 'file') return true;
    return false;
  });

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col animate-in fade-in duration-200 ${
        isMidnight ? 'bg-[#0B0F17] text-slate-100' : 'bg-[#FFF7F9] text-slate-800'
      }`}
    >
      {/* Top Header */}
      <div
        className={`flex items-center justify-between px-4 py-3.5 border-b shrink-0 ${
          isMidnight ? 'border-slate-800/80 bg-[#111827]/90 backdrop-blur-xl' : 'border-pink-100/80 bg-white/95 backdrop-blur-xl'
        }`}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className={`p-2 rounded-2xl transition-colors ${
              isMidnight ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-pink-50 text-slate-600'
            }`}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-base font-extrabold tracking-tight">Media Hub</h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              sounds.playClick();
              setShowSearch((prev) => !prev);
            }}
            className={`p-2 rounded-2xl ${
              isMidnight ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-pink-50 text-slate-500'
            }`}
          >
            <Search className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Optional Search Bar */}
      {showSearch && (
        <div className={`px-4 py-2 border-b shrink-0 ${isMidnight ? 'bg-slate-900 border-slate-800' : 'bg-pink-50/50 border-pink-100'}`}>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search media..."
            className={`w-full px-3 py-1.5 rounded-xl text-xs outline-none transition-all ${
              isMidnight
                ? 'bg-slate-800 text-slate-100 placeholder-slate-500'
                : 'bg-white text-slate-800 placeholder-slate-400 border border-pink-200'
            }`}
            autoFocus
          />
        </div>
      )}

      {/* Filter Chips Bar */}
      <div
        className={`px-4 py-2.5 flex items-center gap-2 overflow-x-auto scrollbar-none border-b shrink-0 ${
          isMidnight ? 'border-slate-800/50 bg-[#0E1522]/80' : 'border-pink-100/70 bg-white/60'
        }`}
      >
        {[
          { id: 'all', label: `All (${realItems.length})` },
          { id: 'photos', label: 'Photos' },
          { id: 'videos', label: 'Videos' },
          { id: 'voice', label: isMidnight ? 'Voice' : 'Audio' },
          { id: 'files', label: 'Files' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              sounds.playClick();
              setActiveTab(tab.id as any);
            }}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 ${
              activeTab === tab.id
                ? isMidnight
                  ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-md shadow-blue-900/40 glow-cyan-blue'
                  : 'bg-gradient-to-r from-rose-500 via-pink-500 to-rose-400 text-white shadow-md shadow-rose-200/60'
                : isMidnight
                ? 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800/80'
                : 'bg-white text-slate-600 hover:text-rose-600 hover:bg-pink-50 border border-pink-100/80 shadow-2xs'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Media Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        {filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-3 ${
                isMidnight ? 'bg-slate-900 text-slate-500 border border-slate-800' : 'bg-pink-50 text-pink-400 border border-pink-100'
              }`}
            >
              <ImageIcon className="w-7 h-7 opacity-75" />
            </div>
            <h3 className={`text-sm font-bold mb-1 ${isMidnight ? 'text-slate-300' : 'text-slate-700'}`}>
              No Media Yet
            </h3>
            <p className="text-xs text-slate-400 text-center max-w-xs">
              Photos, videos, and voice notes shared across your posts, stories, and chats will automatically appear here.
            </p>
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
                className={`group relative aspect-square rounded-2xl overflow-hidden border cursor-pointer transition-all hover:scale-[1.02] ${
                  isMidnight
                    ? 'border-slate-800/80 bg-slate-900/80 hover:border-blue-500/50'
                    : 'border-pink-100/90 bg-white hover:border-rose-300 hover:shadow-md shadow-2xs'
                }`}
              >
                {item.type === 'voice' ? (
                  <div
                    className={`w-full h-full flex flex-col items-center justify-center p-3 text-center ${
                      isMidnight
                        ? 'bg-gradient-to-br from-indigo-950/80 via-slate-900 to-blue-950/80'
                        : 'bg-gradient-to-br from-rose-50 via-pink-50 to-white'
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                        isMidnight ? 'bg-blue-600/30 border border-blue-500/40 text-cyan-400' : 'bg-rose-100 border border-pink-200 text-rose-500'
                      }`}
                    >
                      <Mic className="w-5 h-5" />
                    </div>
                    <span className={`text-[11px] font-bold truncate w-full ${isMidnight ? 'text-slate-200' : 'text-slate-800'}`}>
                      {item.title}
                    </span>
                    {item.duration && (
                      <span className={`text-[10px] font-mono mt-0.5 ${isMidnight ? 'text-cyan-400' : 'text-rose-500 font-semibold'}`}>
                        {item.duration}
                      </span>
                    )}
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
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="max-w-2xl w-full max-h-[80vh] flex items-center justify-center">
            {selectedItem.type === 'voice' ? (
              <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-4">
                <Mic className="w-12 h-12 text-cyan-400 mx-auto" />
                <h4 className="text-sm font-bold text-slate-100">{selectedItem.title}</h4>
                {selectedItem.duration && (
                  <p className="text-xs text-slate-400">Duration: {selectedItem.duration}</p>
                )}
                <audio src={selectedItem.url} controls className="w-full mt-2" />
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
