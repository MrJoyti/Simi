import React from 'react';
import { useChat } from '../context/ChatContext';
import { resolveSimiTheme } from '../utils/theme';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { ToastItem } from '../types/chat';

export const SimiToastContainer: React.FC = () => {
  const { toasts, dismissToast, currentUser } = useChat();
  const { isMale } = resolveSimiTheme(currentUser);

  if (!toasts || toasts.length === 0) return null;

  return (
    <div
      className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2 max-w-sm w-full px-4 pointer-events-none"
      aria-live="polite"
    >
      {toasts.map((t: ToastItem) => {
        let Icon = CheckCircle2;
        let iconColor = isMale ? 'text-cyan-400' : 'text-rose-500';

        if (t.type === 'error') {
          Icon = AlertCircle;
          iconColor = 'text-rose-500';
        } else if (t.type === 'warning') {
          Icon = AlertTriangle;
          iconColor = 'text-amber-400';
        } else if (t.type === 'info') {
          Icon = Info;
          iconColor = isMale ? 'text-blue-400' : 'text-purple-500';
        }

        return (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 rounded-2xl border shadow-xl backdrop-blur-md animate-toast w-full transition-all ${
              isMale
                ? 'bg-[#111827]/95 border-slate-700/80 text-slate-100 shadow-blue-950/50'
                : 'bg-white/95 border-pink-100/90 text-slate-800 shadow-rose-200/50'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <Icon className={`w-4 h-4 shrink-0 ${iconColor}`} />
              <p className="text-xs font-semibold leading-relaxed truncate">{t.message}</p>
            </div>

            <button
              onClick={() => dismissToast(t.id)}
              className={`p-1 rounded-full transition-colors shrink-0 ${
                isMale
                  ? 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
                  : 'hover:bg-pink-50 text-slate-400 hover:text-slate-700'
              }`}
              title="Dismiss"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
