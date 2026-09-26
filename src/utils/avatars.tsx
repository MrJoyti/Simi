import React from 'react';

export interface AvatarMeta {
  id: string;
  name: string;
  bgColor: string;
  badge: string;
}

export const AVATAR_LIST: AvatarMeta[] = [
  { id: 'bunny', name: 'Mochi Bunny', bgColor: '#FFE4E6', badge: '🐰 Soft & Sweet' },
  { id: 'kitten', name: 'Strawberry Cat', bgColor: '#FEF3C7', badge: '🍓 Purrfect' },
  { id: 'bear', name: 'Teddy Hugs', bgColor: '#E0F2FE', badge: '🧸 Cozy Friend' },
  { id: 'puppy', name: 'Boba Pup', bgColor: '#EDE9FE', badge: '🐶 High Energy' },
  { id: 'fox', name: 'Peachy Fox', bgColor: '#FFEDD5', badge: '🦊 Playful' },
  { id: 'panda', name: 'Bamboo Panda', bgColor: '#DCFCE7', badge: '🐼 Calm Vibes' },
  { id: 'hamster', name: 'Cheeky Hammy', bgColor: '#FCE7F3', badge: '🐹 Snacking' },
  { id: 'penguin', name: 'Pip Penguin', bgColor: '#E0E7FF', badge: '🐧 Waddle Cool' },
  { id: 'wolf', name: 'Stealth Wolf', bgColor: '#1E293B', badge: '🐺 Alpha Vibe' },
  { id: 'falcon', name: 'Cyber Falcon', bgColor: '#0F172A', badge: '🦅 High Precision' },
  { id: 'dragon', name: 'Forge Dragon', bgColor: '#172554', badge: '⚡ Unstoppable' },
];

interface AvatarProps {
  id?: string;
  customUrl?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  xs: 'w-6 h-6',
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-14 h-14',
  xl: 'w-20 h-20',
};

export const CuteAvatar: React.FC<AvatarProps> = ({
  id = 'bunny',
  customUrl,
  size = 'md',
  className = '',
}) => {
  const dimensionClass = sizeClasses[size];

  if (customUrl) {
    return (
      <div
        className={`relative rounded-2xl overflow-hidden shrink-0 shadow-sm border border-black/5 ${dimensionClass} ${className}`}
      >
        <img
          src={customUrl}
          alt="User Avatar"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  // Render SVG based on id
  return (
    <div
      className={`relative rounded-2xl overflow-hidden shrink-0 flex items-center justify-center select-none shadow-xs border border-white/60 ${dimensionClass} ${className}`}
    >
      {renderAvatarSvg(id)}
    </div>
  );
};

function renderAvatarSvg(id: string) {
  switch (id) {
    case 'wolf':
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full bg-[#0F172A]">
          <polygon points="20,40 32,10 46,38" fill="#334155" />
          <polygon points="54,38 68,10 80,40" fill="#334155" />
          <polygon points="26,38 32,18 38,36" fill="#1E293B" />
          <polygon points="62,36 68,18 74,38" fill="#1E293B" />
          <circle cx="50" cy="55" r="32" fill="#475569" />
          <polygon points="35,46 45,46 40,54" fill="#38BDF8" />
          <polygon points="55,46 65,46 60,54" fill="#38BDF8" />
          <polygon points="44,60 56,60 50,72" fill="#090D16" />
        </svg>
      );

    case 'falcon':
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full bg-[#172554]">
          <path d="M 20 40 L 50 15 L 80 40 L 50 85 Z" fill="#1E3A5F" />
          <circle cx="40" cy="42" r="4" fill="#60A5FA" />
          <circle cx="60" cy="42" r="4" fill="#60A5FA" />
          <polygon points="46,48 54,48 50,66" fill="#F59E0B" />
        </svg>
      );

    case 'dragon':
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full bg-[#090D16]">
          <polygon points="25,35 30,12 42,30" fill="#2563EB" />
          <polygon points="58,30 70,12 75,35" fill="#2563EB" />
          <ellipse cx="50" cy="54" rx="30" ry="28" fill="#1E293B" />
          <ellipse cx="38" cy="48" rx="4" ry="6" fill="#60A5FA" />
          <ellipse cx="62" cy="48" rx="4" ry="6" fill="#60A5FA" />
          <polygon points="47,60 53,60 50,68" fill="#3B82F6" />
        </svg>
      );

    case 'kitten':
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full bg-[#FFF3D6]">
          {/* Ears */}
          <polygon points="22,40 34,14 46,38" fill="#F87171" opacity="0.85" />
          <polygon points="54,38 66,14 78,40" fill="#F87171" opacity="0.85" />
          <polygon points="26,38 34,22 42,37" fill="#FECDD3" />
          <polygon points="58,37 66,22 74,38" fill="#FECDD3" />
          {/* Head */}
          <ellipse cx="50" cy="55" rx="36" ry="32" fill="#FFFFFF" />
          {/* Eyes */}
          <circle cx="37" cy="52" r="4.5" fill="#1E293B" />
          <circle cx="63" cy="52" r="4.5" fill="#1E293B" />
          <circle cx="38.5" cy="50" r="1.5" fill="#FFFFFF" />
          <circle cx="64.5" cy="50" r="1.5" fill="#FFFFFF" />
          {/* Blush */}
          <ellipse cx="29" cy="61" rx="5.5" ry="3" fill="#FDA4AF" opacity="0.8" />
          <ellipse cx="71" cy="61" rx="5.5" ry="3" fill="#FDA4AF" opacity="0.8" />
          {/* Nose & Mouth */}
          <polygon points="48,58 52,58 50,61" fill="#F43F5E" />
          <path d="M 45 64 Q 50 68 55 64" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" />
          {/* Strawberry Hat */}
          <path d="M 40 24 C 40 16 60 16 60 24 C 60 27 40 27 40 24" fill="#E11D48" />
          <circle cx="50" cy="14" r="3" fill="#16A34A" />
        </svg>
      );

    case 'bear':
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full bg-[#E0F2FE]">
          {/* Ears */}
          <circle cx="26" cy="30" r="14" fill="#B45309" />
          <circle cx="26" cy="30" r="8" fill="#FED7AA" />
          <circle cx="74" cy="30" r="14" fill="#B45309" />
          <circle cx="74" cy="30" r="8" fill="#FED7AA" />
          {/* Head */}
          <circle cx="50" cy="54" r="34" fill="#D97706" />
          {/* Snout */}
          <ellipse cx="50" cy="62" rx="14" ry="11" fill="#FEF3C7" />
          {/* Eyes */}
          <circle cx="37" cy="49" r="4" fill="#1F2937" />
          <circle cx="63" cy="49" r="4" fill="#1F2937" />
          <circle cx="38" cy="47.5" r="1.3" fill="#FFFFFF" />
          <circle cx="64" cy="47.5" r="1.3" fill="#FFFFFF" />
          {/* Nose */}
          <ellipse cx="50" cy="58" rx="5" ry="3.5" fill="#451A03" />
          <path d="M 50 61.5 L 50 67 M 47 67 Q 50 70 53 67" fill="none" stroke="#451A03" strokeWidth="1.8" strokeLinecap="round" />
          {/* Blush */}
          <ellipse cx="30" cy="59" rx="5" ry="3" fill="#FCA5A5" opacity="0.7" />
          <ellipse cx="70" cy="59" rx="5" ry="3" fill="#FCA5A5" opacity="0.7" />
        </svg>
      );

    case 'puppy':
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full bg-[#EDE9FE]">
          {/* Floppy Ears */}
          <ellipse cx="20" cy="48" rx="10" ry="19" fill="#9333EA" transform="rotate(-15 20 48)" />
          <ellipse cx="80" cy="48" rx="10" ry="19" fill="#9333EA" transform="rotate(15 80 48)" />
          {/* Head */}
          <circle cx="50" cy="52" r="33" fill="#C084FC" />
          {/* Face patch */}
          <ellipse cx="50" cy="60" rx="16" ry="13" fill="#FAF5FF" />
          {/* Eyes */}
          <circle cx="37" cy="46" r="4.5" fill="#1E1B4B" />
          <circle cx="63" cy="46" r="4.5" fill="#1E1B4B" />
          <circle cx="38" cy="44.5" r="1.5" fill="#FFFFFF" />
          <circle cx="64" cy="44.5" r="1.5" fill="#FFFFFF" />
          {/* Nose */}
          <ellipse cx="50" cy="56" rx="5" ry="3.5" fill="#3B0764" />
          {/* Smile & Tongue */}
          <path d="M 45 61 Q 50 66 55 61" fill="none" stroke="#3B0764" strokeWidth="2" strokeLinecap="round" />
          <path d="M 48 64 Q 50 70 52 64" fill="#F43F5E" />
          {/* Blush */}
          <ellipse cx="28" cy="54" rx="5" ry="2.5" fill="#F472B6" opacity="0.75" />
          <ellipse cx="72" cy="54" rx="5" ry="2.5" fill="#F472B6" opacity="0.75" />
        </svg>
      );

    case 'fox':
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full bg-[#FFEDD5]">
          {/* Ears */}
          <polygon points="18,38 32,10 46,36" fill="#EA580C" />
          <polygon points="54,36 68,10 82,38" fill="#EA580C" />
          <polygon points="22,35 32,18 40,34" fill="#1E293B" />
          <polygon points="60,34 68,18 78,35" fill="#1E293B" />
          {/* Head */}
          <path d="M 16 46 C 16 76 50 82 50 82 C 50 82 84 76 84 46 C 84 30 50 32 50 32 C 50 32 16 30 16 46 Z" fill="#FB923C" />
          {/* White Cheeks */}
          <path d="M 22 55 C 32 55 42 66 50 78 C 58 66 68 55 78 55 C 78 72 50 82 50 82 C 50 82 22 72 22 55 Z" fill="#FFFFFF" />
          {/* Eyes */}
          <path d="M 32 50 Q 38 46 42 50" fill="none" stroke="#1F2937" strokeWidth="3" strokeLinecap="round" />
          <path d="M 58 50 Q 62 46 68 50" fill="none" stroke="#1F2937" strokeWidth="3" strokeLinecap="round" />
          {/* Nose */}
          <circle cx="50" cy="74" r="3.5" fill="#1F2937" />
          {/* Blush */}
          <ellipse cx="28" cy="62" rx="4.5" ry="2.5" fill="#FB7185" opacity="0.8" />
          <ellipse cx="72" cy="62" rx="4.5" ry="2.5" fill="#FB7185" opacity="0.8" />
        </svg>
      );

    case 'panda':
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full bg-[#DCFCE7]">
          {/* Ears */}
          <circle cx="24" cy="28" r="12" fill="#1F2937" />
          <circle cx="76" cy="28" r="12" fill="#1F2937" />
          {/* Head */}
          <circle cx="50" cy="54" r="34" fill="#FFFFFF" />
          {/* Eye Patches */}
          <ellipse cx="36" cy="50" rx="9" ry="11" fill="#1F2937" transform="rotate(-15 36 50)" />
          <ellipse cx="64" cy="50" rx="9" ry="11" fill="#1F2937" transform="rotate(15 64 50)" />
          {/* Eyes */}
          <circle cx="36" cy="49" r="3" fill="#FFFFFF" />
          <circle cx="64" cy="49" r="3" fill="#FFFFFF" />
          <circle cx="37" cy="49" r="1.5" fill="#1F2937" />
          <circle cx="65" cy="49" r="1.5" fill="#1F2937" />
          {/* Nose */}
          <ellipse cx="50" cy="63" rx="5" ry="3.5" fill="#1F2937" />
          <path d="M 46 68 Q 50 71 54 68" fill="none" stroke="#1F2937" strokeWidth="2" strokeLinecap="round" />
          {/* Blush */}
          <ellipse cx="24" cy="63" rx="5.5" ry="3" fill="#FDA4AF" opacity="0.8" />
          <ellipse cx="76" cy="63" rx="5.5" ry="3" fill="#FDA4AF" opacity="0.8" />
        </svg>
      );

    case 'hamster':
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full bg-[#FCE7F3]">
          {/* Tiny Ears */}
          <circle cx="26" cy="30" r="9" fill="#FB923C" />
          <circle cx="26" cy="30" r="5" fill="#FED7AA" />
          <circle cx="74" cy="30" r="9" fill="#FB923C" />
          <circle cx="74" cy="30" r="5" fill="#FED7AA" />
          {/* Head / Chubby Cheeks */}
          <ellipse cx="50" cy="56" rx="36" ry="30" fill="#FDBA74" />
          <ellipse cx="50" cy="64" rx="28" ry="18" fill="#FFF7ED" />
          {/* Eyes */}
          <circle cx="36" cy="48" r="4.5" fill="#1E293B" />
          <circle cx="64" cy="48" r="4.5" fill="#1E293B" />
          <circle cx="37.5" cy="46.5" r="1.5" fill="#FFFFFF" />
          <circle cx="65.5" cy="46.5" r="1.5" fill="#FFFFFF" />
          {/* Huge Blush */}
          <ellipse cx="26" cy="60" rx="8" ry="5" fill="#F43F5E" opacity="0.65" />
          <ellipse cx="74" cy="60" rx="8" ry="5" fill="#F43F5E" opacity="0.65" />
          {/* Nose & buck teeth */}
          <polygon points="48,58 52,58 50,61" fill="#EA580C" />
          <rect x="47.5" y="63" width="5" height="4" rx="1" fill="#FFFFFF" stroke="#9A3412" strokeWidth="0.8" />
        </svg>
      );

    case 'penguin':
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full bg-[#E0E7FF]">
          {/* Body */}
          <ellipse cx="50" cy="54" rx="33" ry="34" fill="#1E293B" />
          {/* White Belly */}
          <ellipse cx="50" cy="57" rx="24" ry="26" fill="#F8FAFC" />
          {/* Eyes */}
          <circle cx="40" cy="46" r="4" fill="#0F172A" />
          <circle cx="60" cy="46" r="4" fill="#0F172A" />
          <circle cx="41.5" cy="44.5" r="1.5" fill="#FFFFFF" />
          <circle cx="61.5" cy="44.5" r="1.5" fill="#FFFFFF" />
          {/* Beak */}
          <polygon points="44,53 56,53 50,62" fill="#F59E0B" />
          {/* Blush */}
          <ellipse cx="31" cy="56" rx="4.5" ry="2.5" fill="#FDA4AF" opacity="0.8" />
          <ellipse cx="69" cy="56" rx="4.5" ry="2.5" fill="#FDA4AF" opacity="0.8" />
        </svg>
      );

    case 'bunny':
    default:
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full bg-[#FFE4E6]">
          {/* Ears */}
          <ellipse cx="36" cy="22" rx="9" ry="18" fill="#FFFFFF" />
          <ellipse cx="36" cy="22" rx="5" ry="13" fill="#FECDD3" />
          <ellipse cx="64" cy="22" rx="9" ry="18" fill="#FFFFFF" />
          <ellipse cx="64" cy="22" rx="5" ry="13" fill="#FECDD3" />
          {/* Head */}
          <ellipse cx="50" cy="55" rx="34" ry="30" fill="#FFFFFF" />
          {/* Eyes */}
          <circle cx="37" cy="50" r="4.5" fill="#1E293B" />
          <circle cx="63" cy="50" r="4.5" fill="#1E293B" />
          <circle cx="38.5" cy="48.5" r="1.5" fill="#FFFFFF" />
          <circle cx="64.5" cy="48.5" r="1.5" fill="#FFFFFF" />
          {/* Cheeks */}
          <ellipse cx="28" cy="59" rx="6" ry="3.5" fill="#FDA4AF" opacity="0.85" />
          <ellipse cx="72" cy="59" rx="6" ry="3.5" fill="#FDA4AF" opacity="0.85" />
          {/* Nose and Mouth */}
          <polygon points="48,58 52,58 50,61" fill="#FB7185" />
          <path d="M 45 63 Q 50 67 55 63" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" />
          {/* Tiny Flower Crown */}
          <circle cx="48" cy="30" r="4" fill="#F472B6" />
          <circle cx="56" cy="28" r="3.5" fill="#FDE047" />
          <circle cx="42" cy="31" r="3" fill="#60A5FA" />
        </svg>
      );
  }
}
