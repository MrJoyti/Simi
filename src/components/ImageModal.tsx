import React from 'react';
import { X, Download } from 'lucide-react';

interface ImageModalProps {
  imageUrl: string;
  onClose: () => void;
}

export const ImageModal: React.FC<ImageModalProps> = ({ imageUrl, onClose }) => {
  return (
    <div
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative max-w-3xl max-h-[85vh] bg-white rounded-3xl overflow-hidden shadow-2xl p-2 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
          <a
            href={imageUrl}
            download="mochichat-image"
            className="p-2 rounded-full bg-black/50 hover:bg-black/75 text-white transition-colors backdrop-blur-xs"
            title="Download image"
          >
            <Download className="w-4 h-4" />
          </a>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-black/50 hover:bg-black/75 text-white transition-colors backdrop-blur-xs"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <img
          src={imageUrl}
          alt="Shared in chat"
          referrerPolicy="no-referrer"
          className="max-h-[80vh] w-auto object-contain rounded-2xl"
        />
      </div>
    </div>
  );
};
