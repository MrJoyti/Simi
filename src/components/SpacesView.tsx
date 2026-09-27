import React from 'react';
import { useChat } from '../context/ChatContext';
import { Hash, Sparkles, Plus } from 'lucide-react';
import { sounds } from '../utils/sound';

export const SpacesView: React.FC = () => {
  const { simiTheme } = useChat();
  const isMidnight = simiTheme.isMale;

  return (
    <div className={`flex-1 flex flex-col h-full overflow-hidden select-none ${
      isMidnight ? 'bg-[#0B0F14] text-slate-100' : 'bg-pink-50/40 text-slate-800'
    }`}>
      {/* Spaces Header */}
      <div className={`px-4 py-3.5 border-b flex items-center justify-between shrink-0 shadow-2xs ${
        isMidnight ? 'bg-[#111821]/95 border-slate-800' : 'bg-white/95 border-pink-100'
      }`}>
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
            isMidnight ? 'bg-blue-900/40 text-blue-400 border border-blue-800/60' : 'bg-pink-100 text-rose-600'
          }`}>
            <Hash className="w-4 h-4" />
          </div>
          <h2 className="text-lg font-extrabold tracking-tight">Spaces</h2>
        </div>
      </div>

      {/* Empty Spaces Content Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className={`w-20 h-20 rounded-3xl flex items-center justify-center text-3xl mb-4 transition-transform hover:scale-105 ${
          isMidnight 
            ? 'bg-slate-900/90 text-blue-400 border border-slate-800/90 shadow-lg shadow-blue-950/20' 
            : 'bg-white text-rose-500 border border-pink-100 shadow-md shadow-pink-100/50'
        }`}>
          <Sparkles className="w-10 h-10 stroke-[1.5]" />
        </div>

        <h3 className={`text-base font-bold mb-1.5 ${isMidnight ? 'text-slate-200' : 'text-slate-800'}`}>
          Spaces is empty
        </h3>
        
        <p className={`text-xs max-w-xs leading-relaxed mb-6 ${isMidnight ? 'text-slate-400' : 'text-slate-500'}`}>
          This area is ready for your new custom plans and features.
        </p>

        <div className={`px-4 py-2.5 rounded-2xl border text-xs font-semibold flex items-center gap-2 ${
          isMidnight 
            ? 'bg-slate-900/60 border-slate-800 text-slate-400' 
            : 'bg-white/80 border-pink-100 text-slate-400'
        }`}>
          <Hash className="w-3.5 h-3.5 opacity-60" />
          <span>Reserved Space</span>
        </div>
      </div>
    </div>
  );
};
