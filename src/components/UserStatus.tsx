import React from 'react';
import { PresenceInfo } from '../utils/presence';

interface UserStatusProps {
  presence?: PresenceInfo | null;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const UserStatus: React.FC<UserStatusProps> = ({
  presence,
  showText = true,
  size = 'md',
  className = '',
}) => {
  if (!presence) return null;

  const isOnline = presence.isOnline;
  const isIdle = presence.isIdle;

  const dotSize =
    size === 'sm' ? 'w-2 h-2' : size === 'lg' ? 'w-3.5 h-3.5' : 'w-2.5 h-2.5';

  const dotBg = isOnline
    ? 'bg-emerald-500'
    : isIdle
    ? 'bg-amber-400'
    : 'bg-slate-400';

  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      <span
        className={`rounded-full shrink-0 ${dotSize} ${dotBg} ${
          isOnline ? 'ring-2 ring-emerald-500/20' : ''
        }`}
        aria-hidden="true"
      />
      {showText && (
        <span
          className={`text-[11px] font-medium leading-none ${
            isOnline
              ? 'text-emerald-500 font-semibold'
              : isIdle
              ? 'text-amber-500'
              : 'text-slate-400'
          }`}
        >
          {presence.label || (isOnline ? 'Online' : 'Offline')}
        </span>
      )}
    </div>
  );
};
