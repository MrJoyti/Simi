import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '../context/ChatContext';
import { Play, Pause, Volume2 } from 'lucide-react';
import { sounds } from '../utils/sound';

interface VoiceNotePlayerProps {
  audioUrl: string;
  duration?: number;
  isUser: boolean;
}

export const VoiceNotePlayer: React.FC<VoiceNotePlayerProps> = ({
  audioUrl,
  duration = 3,
  isUser,
}) => {
  const { theme } = useChat();
  const isMale = theme === 'midnight';

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio(audioUrl);
    audioRef.current = audio;

    audio.ontimeupdate = () => {
      setCurrentTime(audio.currentTime);
    };

    audio.onended = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    return () => {
      audio.pause();
      audioRef.current = null;
    };
  }, [audioUrl]);

  const togglePlay = () => {
    sounds.playClick();
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(() => {
        setIsPlaying(false);
      });
    }
  };

  const formatSeconds = (sec: number) => {
    const s = Math.floor(sec);
    return `0:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div
      className={`flex items-center gap-3 px-3.5 py-2 rounded-2xl ${
        isUser
          ? isMale
            ? 'bg-blue-500/20 text-white'
            : 'bg-white/20 text-white'
          : isMale
          ? 'bg-slate-800 text-slate-100 border border-slate-700/80'
          : 'bg-pink-50/90 text-slate-800'
      }`}
    >
      <button
        onClick={togglePlay}
        className={`w-8 h-8 rounded-full flex items-center justify-center transition-transform active:scale-90 ${
          isUser
            ? isMale
              ? 'bg-white text-blue-600 hover:bg-slate-100'
              : 'bg-white text-rose-500 hover:bg-rose-50'
            : isMale
            ? 'bg-blue-600 text-white hover:bg-blue-500'
            : 'bg-rose-500 text-white hover:bg-rose-600'
        }`}
        title={isPlaying ? 'Pause' : 'Play voice note'}
      >
        {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current ml-0.5" />}
      </button>

      {/* Waveform graphic */}
      <div className="flex items-center gap-1 h-5 flex-1 min-w-[90px]">
        {[8, 14, 20, 12, 18, 22, 10, 16, 14, 8, 12, 6].map((barHeight, idx) => {
          const progress = duration > 0 ? currentTime / duration : 0;
          const isPassed = idx / 12 <= progress;
          return (
            <div
              key={idx}
              className={`w-1 rounded-full transition-all duration-150 ${
                isUser
                  ? isPassed ? 'bg-white' : 'bg-white/40'
                  : isMale
                  ? isPassed ? 'bg-blue-500' : 'bg-slate-600'
                  : isPassed ? 'bg-rose-500' : 'bg-slate-300'
              }`}
              style={{
                height: isPlaying ? `${Math.max(4, (barHeight * (currentTime * 4 + idx)) % 22)}px` : `${barHeight}px`,
              }}
            />
          );
        })}
      </div>

      <div className="flex items-center gap-1 text-[11px] font-mono opacity-85">
        <Volume2 className="w-3 h-3" />
        <span>{isPlaying ? formatSeconds(currentTime) : formatSeconds(duration)}</span>
      </div>
    </div>
  );
};

