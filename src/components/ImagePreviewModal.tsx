import React, { useState, useEffect } from 'react';
import { useChat } from '../context/ChatContext';
import {
  X,
  Send,
  Sparkles,
  Image as ImageIcon,
  Loader2,
  AlertCircle,
  FileCheck,
} from 'lucide-react';
import { sounds } from '../utils/sound';

interface ImagePreviewModalProps {
  isOpen: boolean;
  file: File | null;
  previewUrl: string | null;
  onClose: () => void;
  onSend: (caption: string) => Promise<void>;
  isUploading: boolean;
  uploadProgress?: number;
  errorMessage?: string | null;
}

export const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({
  isOpen,
  file,
  previewUrl,
  onClose,
  onSend,
  isUploading,
  uploadProgress,
  errorMessage,
}) => {
  const { simiTheme } = useChat();
  const isMale = simiTheme.isMale;
  const [caption, setCaption] = useState('');

  useEffect(() => {
    if (isOpen) {
      setCaption('');
    }
  }, [isOpen]);

  if (!isOpen || !previewUrl) return null;

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isUploading) return;
    await onSend(caption);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className={`relative w-full max-w-lg rounded-3xl shadow-2xl border overflow-hidden flex flex-col max-h-[92vh] ${
        isMale ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-pink-100 text-slate-800'
      }`}>
        {/* Header */}
        <div className={`p-4 px-5 border-b flex items-center justify-between ${
          isMale
            ? 'bg-slate-950/80 border-slate-800'
            : 'bg-gradient-to-r from-pink-50 via-rose-50 to-pink-50 border-pink-100'
        }`}>
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
              isMale ? 'bg-blue-500/20 text-blue-400' : 'bg-pink-100 text-pink-600'
            }`}>
              <ImageIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className={`text-sm font-bold ${isMale ? 'text-white' : 'text-slate-800'}`}>Preview & Send Image</h3>
              <p className={`text-[11px] ${isMale ? 'text-slate-400' : 'text-slate-500'}`}>
                {file ? `${file.name} (${formatFileSize(file.size)})` : 'Cozy photo'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              if (!isUploading) {
                sounds.playClick();
                onClose();
              }
            }}
            disabled={isUploading}
            className={`p-1.5 rounded-full transition-colors disabled:opacity-40 ${
              isMale
                ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                : 'text-slate-400 hover:text-slate-700 hover:bg-white'
            }`}
            title="Cancel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Image Preview Container */}
        <div className="relative flex-1 bg-slate-950 flex items-center justify-center p-3 sm:p-4 min-h-[220px] max-h-[50vh] overflow-hidden select-none">
          <img
            src={previewUrl}
            alt="Preview"
            className="max-h-[46vh] max-w-full rounded-2xl object-contain shadow-lg"
          />

          {isUploading && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-2xs flex flex-col items-center justify-center gap-3 p-4 text-white animate-in fade-in">
              <Loader2 className={`w-8 h-8 animate-spin ${isMale ? 'text-blue-400' : 'text-pink-400'}`} />
              <div className="text-center">
                <p className="text-sm font-bold">Uploading to Cloud Storage...</p>
                <p className={`text-xs mt-0.5 ${isMale ? 'text-blue-200' : 'text-pink-200'}`}>Storing photo safely in Cloudinary</p>
              </div>
              {uploadProgress !== undefined && (
                <div className="w-48 bg-white/20 rounded-full h-2 overflow-hidden mt-1">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      isMale ? 'bg-gradient-to-r from-blue-500 to-cyan-400' : 'bg-gradient-to-r from-pink-400 to-rose-400'
                    }`}
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Error notice if upload failed */}
        {errorMessage && (
          <div className="px-5 py-2.5 bg-rose-500/10 border-t border-rose-500/30 flex items-center gap-2 text-xs text-rose-400">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span className="flex-1">{errorMessage}</span>
          </div>
        )}

        {/* Footer / Caption Form */}
        <form onSubmit={handleFormSubmit} className={`p-4 px-5 border-t flex flex-col gap-3 ${
          isMale ? 'bg-slate-900 border-slate-800' : 'bg-white border-pink-100'
        }`}>
          <div className="relative">
            <input
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              disabled={isUploading}
              placeholder={isMale ? 'Add a caption (optional)...' : 'Add a sweet caption (optional)...'}
              autoFocus
              className={`w-full px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-medium focus:outline-none transition-all disabled:opacity-50 ${
                isMale
                  ? 'bg-slate-950 border border-slate-700 focus:border-blue-500 text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500/30'
                  : 'bg-pink-50/50 hover:bg-pink-50/80 focus:bg-white border border-pink-200 text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-pink-300'
              }`}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className={`flex items-center gap-1.5 text-[11px] font-medium ${
              isMale ? 'text-slate-400' : 'text-slate-400'
            }`}>
              <FileCheck className={`w-3.5 h-3.5 ${isMale ? 'text-blue-400' : 'text-pink-500'}`} />
              <span>Cloudinary Storage enabled</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  onClose();
                }}
                disabled={isUploading}
                className={`px-4 py-2 text-xs font-semibold rounded-2xl transition-colors disabled:opacity-50 ${
                  isMale
                    ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                }`}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isUploading}
                className={`flex items-center gap-1.5 px-5 py-2 text-white rounded-2xl text-xs font-bold transition-transform active:scale-95 disabled:opacity-50 ${
                  isMale
                    ? 'bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-950'
                    : 'bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 shadow-md shadow-pink-200'
                }`}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Photo</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

