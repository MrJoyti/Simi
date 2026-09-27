import React, { useState, useEffect } from 'react';
import { Download, Sparkles, X, ArrowRight, ShieldCheck } from 'lucide-react';

export const CURRENT_APP_VERSION = '1.0.0';

interface VersionInfo {
  version: string;
  versionCode: number;
  downloadUrl: string;
  releaseNotes: string;
}

export const AppUpdateModal: React.FC = () => {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [versionInfo, setVersionInfo] = useState<VersionInfo | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const checkForUpdates = async () => {
      try {
        // Fetch version from production or local public asset
        const res = await fetch('https://simi-wheat.vercel.app/version.json?t=' + Date.now(), {
          cache: 'no-cache',
        }).catch(() => fetch('/version.json?t=' + Date.now()));

        if (!res.ok) return;
        const data: VersionInfo = await res.json();

        if (data.version && data.version !== CURRENT_APP_VERSION) {
          setVersionInfo(data);
          setUpdateAvailable(true);
        }
      } catch {
        // silent fail
      }
    };

    checkForUpdates();
  }, []);

  if (!updateAvailable || !versionInfo || dismissed) return null;

  const handleUpdate = () => {
    window.open(versionInfo.downloadUrl, '_system');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm bg-slate-900 text-white rounded-3xl p-6 border border-pink-500/30 shadow-2xl animate-modalPop">
        <button
          onClick={() => setDismissed(true)}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-pink-500 to-rose-500 flex items-center justify-center shadow-lg shadow-pink-500/30 mb-4 animate-bounce">
            <Download className="w-8 h-8 text-white" />
          </div>

          <div className="flex items-center gap-1.5 text-pink-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>New Version Ready</span>
          </div>

          <h3 className="text-xl font-extrabold text-white mb-2">Update Simi App</h3>

          <p className="text-xs text-slate-300 leading-relaxed mb-4">
            Version <span className="font-bold text-pink-400">v{versionInfo.version}</span> is available with critical performance fixes and Google login enhancements!
          </p>

          {versionInfo.releaseNotes && (
            <div className="w-full p-3 rounded-2xl bg-slate-800/80 border border-slate-700/60 text-left mb-5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                What's New:
              </span>
              <p className="text-xs text-slate-200 font-medium">{versionInfo.releaseNotes}</p>
            </div>
          )}

          <div className="w-full flex flex-col gap-2">
            <button
              onClick={handleUpdate}
              className="w-full py-3 px-4 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-pink-500/25 flex items-center justify-center gap-2 transition-transform active:scale-95"
            >
              <span>Update Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => setDismissed(true)}
              className="w-full py-2 text-xs font-bold text-slate-400 hover:text-slate-200 transition-colors"
            >
              Remind Me Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
