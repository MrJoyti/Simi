import { StickerItem } from '../types/chat';

export const CUTE_STICKERS: StickerItem[] = [
  // 1. Mochi Bouncing Joy
  {
    id: 'mochi_bounce',
    name: 'Bouncy Mochi',
    emoji: '🍡',
    category: 'cute',
    svg: `<svg viewBox="0 0 100 100" class="w-full h-full animate-[bounce_1.5s_infinite]">
      <ellipse cx="50" cy="58" rx="34" ry="26" fill="#FFF0F5" stroke="#F472B6" stroke-width="3"/>
      <!-- Soft Strawberry Powder Top -->
      <path d="M 28 50 Q 50 35 72 50 Q 50 42 28 50" fill="#FDA4AF" opacity="0.6"/>
      <!-- Sparkle on head -->
      <polygon points="50,18 53,26 62,28 54,31 51,39 47,31 39,28 47,26" fill="#F43F5E"/>
      <!-- Blushing Cheeks -->
      <ellipse cx="30" cy="62" rx="5" ry="3.5" fill="#FB7185" opacity="0.8"/>
      <ellipse cx="70" cy="62" rx="5" ry="3.5" fill="#FB7185" opacity="0.8"/>
      <!-- Happy Eyes -->
      <path d="M 36 54 Q 41 48 46 54" fill="none" stroke="#881337" stroke-width="3.5" stroke-linecap="round"/>
      <path d="M 54 54 Q 59 48 64 54" fill="none" stroke="#881337" stroke-width="3.5" stroke-linecap="round"/>
      <!-- Cute Open Smile -->
      <path d="M 45 61 Q 50 68 55 61" fill="#F43F5E" stroke="#881337" stroke-width="2" stroke-linecap="round"/>
      <!-- Little Feet -->
      <ellipse cx="36" cy="80" rx="8" ry="4.5" fill="#FECDD3"/>
      <ellipse cx="64" cy="80" rx="8" ry="4.5" fill="#FECDD3"/>
    </svg>`
  },

  // 2. Matcha Mochi Savoring Drink
  {
    id: 'mochi_matcha',
    name: 'Matcha Sip',
    emoji: '🍵',
    category: 'vibes',
    svg: `<svg viewBox="0 0 100 100" class="w-full h-full animate-[pulse_2s_ease-in-out_infinite]">
      <!-- Matcha Mochi Body -->
      <ellipse cx="50" cy="56" rx="33" ry="26" fill="#DCFCE7" stroke="#4ADE80" stroke-width="3"/>
      <ellipse cx="50" cy="38" rx="6" ry="6" fill="#22C55E"/>
      <!-- Matcha Leaf on Head -->
      <path d="M 50 36 C 40 20 60 16 50 36" fill="#16A34A"/>
      <!-- Tea Cup Held -->
      <rect x="38" y="60" width="24" height="20" rx="6" fill="#FEF08A" stroke="#CA8A04" stroke-width="2"/>
      <path d="M 42 60 Q 50 65 58 60" fill="#22C55E"/>
      <!-- Steam -->
      <path d="M 46 54 Q 44 46 48 40" fill="none" stroke="#94A3B8" stroke-width="2" stroke-linecap="round"/>
      <path d="M 54 54 Q 56 46 52 40" fill="none" stroke="#94A3B8" stroke-width="2" stroke-linecap="round"/>
      <!-- Content Eyes -->
      <path d="M 33 50 Q 38 45 42 50" fill="none" stroke="#14532D" stroke-width="3" stroke-linecap="round"/>
      <path d="M 58 50 Q 62 45 67 50" fill="none" stroke="#14532D" stroke-width="3" stroke-linecap="round"/>
      <!-- Cheeks -->
      <ellipse cx="30" cy="56" rx="4" ry="2.5" fill="#86EFAC"/>
      <ellipse cx="70" cy="56" rx="4" ry="2.5" fill="#86EFAC"/>
    </svg>`
  },

  // 3. Mochi Love Sparkles / Love Attack
  {
    id: 'mochi_love',
    name: 'Mochi Heart',
    emoji: '💖',
    category: 'cute',
    svg: `<svg viewBox="0 0 100 100" class="w-full h-full animate-[bounce_1.8s_infinite]">
      <ellipse cx="50" cy="60" rx="32" ry="24" fill="#FFF1F2" stroke="#FB7185" stroke-width="3"/>
      <!-- Giant Floating Heart in Hands -->
      <path d="M 50 36 C 38 18 18 34 36 50 L 50 64 L 64 50 C 82 34 62 18 50 36 Z" fill="#F43F5E"/>
      <ellipse cx="38" cy="30" rx="3.5" ry="6" fill="#FFF" opacity="0.6" transform="rotate(-25 38 30)"/>
      <!-- Sparkles -->
      <polygon points="18,22 21,28 28,30 22,33 20,40 16,33 10,30 16,28" fill="#FBBF24"/>
      <polygon points="82,24 84,29 90,30 85,33 83,38 80,33 74,30 80,29" fill="#FBBF24"/>
      <!-- Happy Face -->
      <circle cx="34" cy="62" r="3" fill="#881337"/>
      <circle cx="66" cy="62" r="3" fill="#881337"/>
      <ellipse cx="28" cy="67" rx="4" ry="2.5" fill="#FDA4AF"/>
      <ellipse cx="72" cy="67" rx="4" ry="2.5" fill="#FDA4AF"/>
    </svg>`
  },

  // 4. Mochi Boba Sips
  {
    id: 'mochi_boba',
    name: 'Boba Mochi',
    emoji: '🧋',
    category: 'vibes',
    svg: `<svg viewBox="0 0 100 100" class="w-full h-full">
      <!-- Mochi Body -->
      <ellipse cx="50" cy="58" rx="33" ry="25" fill="#FFFBEB" stroke="#FBBF24" stroke-width="3"/>
      <!-- Boba Cup Held -->
      <rect x="36" y="44" width="28" height="36" rx="8" fill="#FEF3C7" stroke="#D97706" stroke-width="2"/>
      <line x1="50" y1="24" x2="50" y2="52" stroke="#EC4899" stroke-width="5" stroke-linecap="round"/>
      <rect x="34" y="42" width="32" height="6" rx="3" fill="#F472B6"/>
      <!-- Pearls -->
      <circle cx="43" cy="70" r="3" fill="#3B1C0B"/>
      <circle cx="50" cy="72" r="3" fill="#3B1C0B"/>
      <circle cx="57" cy="69" r="3" fill="#3B1C0B"/>
      <circle cx="46" cy="64" r="3" fill="#3B1C0B"/>
      <circle cx="54" cy="65" r="3" fill="#3B1C0B"/>
      <!-- Eyes blinking with joy -->
      <path d="M 28 55 Q 32 50 36 55" fill="none" stroke="#78350F" stroke-width="3" stroke-linecap="round"/>
      <path d="M 64 55 Q 68 50 72 55" fill="none" stroke="#78350F" stroke-width="3" stroke-linecap="round"/>
      <ellipse cx="26" cy="62" rx="4" ry="2.5" fill="#FDE68A"/>
      <ellipse cx="74" cy="62" rx="4" ry="2.5" fill="#FDE68A"/>
    </svg>`
  },

  // 5. Mochi Tears of Joy / Crying Hug
  {
    id: 'mochi_cry_happy',
    name: 'Emotional Mochi',
    emoji: '🥹',
    category: 'reactions',
    svg: `<svg viewBox="0 0 100 100" class="w-full h-full animate-[pulse_1.5s_infinite]">
      <ellipse cx="50" cy="58" rx="34" ry="26" fill="#FDF4FF" stroke="#C084FC" stroke-width="3"/>
      <!-- Big Sparkly Eyes -->
      <circle cx="36" cy="52" r="6" fill="#3B0764"/>
      <circle cx="64" cy="52" r="6" fill="#3B0764"/>
      <circle cx="38" cy="50" r="2.5" fill="#FFF"/>
      <circle cx="66" cy="50" r="2.5" fill="#FFF"/>
      <!-- Waterfall Tears -->
      <path d="M 30 58 C 24 72 32 78 30 84" fill="none" stroke="#38BDF8" stroke-width="4" stroke-linecap="round"/>
      <path d="M 70 58 C 76 72 68 78 70 84" fill="none" stroke="#38BDF8" stroke-width="4" stroke-linecap="round"/>
      <!-- Blushing -->
      <ellipse cx="26" cy="62" rx="5" ry="3" fill="#F472B6" opacity="0.8"/>
      <ellipse cx="74" cy="62" rx="5" ry="3" fill="#F472B6" opacity="0.8"/>
      <!-- Wavy Cute Mouth -->
      <path d="M 44 65 Q 47 62 50 65 Q 53 68 56 65" fill="none" stroke="#581C87" stroke-width="2.5" stroke-linecap="round"/>
    </svg>`
  },

  // 6. Sleepy Snuggle Mochi
  {
    id: 'mochi_sleepy',
    name: 'Sleepy Zzz',
    emoji: '😴',
    category: 'vibes',
    svg: `<svg viewBox="0 0 100 100" class="w-full h-full">
      <ellipse cx="50" cy="60" rx="35" ry="24" fill="#F8FAFC" stroke="#94A3B8" stroke-width="3"/>
      <!-- Nightcap with fluffy ball -->
      <path d="M 30 46 C 40 18 78 22 80 44 Z" fill="#A855F7"/>
      <circle cx="82" cy="46" r="6" fill="#FDE047"/>
      <!-- Sleeping Curved Eyes -->
      <path d="M 34 58 Q 40 64 46 58" fill="none" stroke="#475569" stroke-width="3" stroke-linecap="round"/>
      <path d="M 54 58 Q 60 64 66 58" fill="none" stroke="#475569" stroke-width="3" stroke-linecap="round"/>
      <ellipse cx="28" cy="64" rx="4" ry="2.5" fill="#FDA4AF" opacity="0.8"/>
      <ellipse cx="72" cy="64" rx="4" ry="2.5" fill="#FDA4AF" opacity="0.8"/>
      <!-- Floating Zzz -->
      <text x="68" y="32" font-family="sans-serif" font-weight="900" font-size="14" fill="#6366F1">Z</text>
      <text x="78" y="20" font-family="sans-serif" font-weight="900" font-size="11" fill="#818CF8">z</text>
    </svg>`
  },

  // 7. Bunny Ear Mochi / Hi Bestie
  {
    id: 'mochi_bunny',
    name: 'Bunny Mochi',
    emoji: '🐰',
    category: 'animals',
    svg: `<svg viewBox="0 0 100 100" class="w-full h-full animate-[bounce_2s_infinite]">
      <!-- Bunny Ears -->
      <ellipse cx="38" cy="30" rx="8" ry="18" fill="#FFF1F2" stroke="#FB7185" stroke-width="2.5"/>
      <ellipse cx="38" cy="32" rx="4" ry="12" fill="#FDA4AF"/>
      <ellipse cx="62" cy="30" rx="8" ry="18" fill="#FFF1F2" stroke="#FB7185" stroke-width="2.5"/>
      <ellipse cx="62" cy="32" rx="4" ry="12" fill="#FDA4AF"/>
      <!-- Round Mochi Face -->
      <ellipse cx="50" cy="62" rx="34" ry="26" fill="#FFF1F2" stroke="#FB7185" stroke-width="3"/>
      <!-- Cheerful Face -->
      <circle cx="38" cy="56" r="3.5" fill="#881337"/>
      <circle cx="62" cy="56" r="3.5" fill="#881337"/>
      <circle cx="39" cy="54.5" r="1.2" fill="#FFF"/>
      <circle cx="63" cy="54.5" r="1.2" fill="#FFF"/>
      <polygon points="48,62 52,62 50,65" fill="#E11D48"/>
      <path d="M 46 66 Q 50 69 54 66" fill="none" stroke="#881337" stroke-width="2" stroke-linecap="round"/>
      <ellipse cx="28" cy="63" rx="4.5" ry="3" fill="#FDA4AF" opacity="0.9"/>
      <ellipse cx="72" cy="63" rx="4.5" ry="3" fill="#FDA4AF" opacity="0.9"/>
    </svg>`
  },

  // 8. Bear Mochi with Honey Pot
  {
    id: 'mochi_bear',
    name: 'Honey Bear',
    emoji: '🧸',
    category: 'animals',
    svg: `<svg viewBox="0 0 100 100" class="w-full h-full">
      <!-- Bear Ears -->
      <circle cx="28" cy="38" r="11" fill="#FDE68A" stroke="#D97706" stroke-width="2.5"/>
      <circle cx="28" cy="38" r="6" fill="#FEF3C7"/>
      <circle cx="72" cy="38" r="11" fill="#FDE68A" stroke="#D97706" stroke-width="2.5"/>
      <circle cx="72" cy="38" r="6" fill="#FEF3C7"/>
      <!-- Bear Head -->
      <ellipse cx="50" cy="60" rx="34" ry="26" fill="#FEF08A" stroke="#D97706" stroke-width="3"/>
      <!-- Snout -->
      <ellipse cx="50" cy="65" rx="11" ry="8" fill="#FFF"/>
      <ellipse cx="50" cy="62" rx="4" ry="2.5" fill="#78350F"/>
      <path d="M 47 67 Q 50 70 53 67" fill="none" stroke="#78350F" stroke-width="1.8" stroke-linecap="round"/>
      <!-- Eyes -->
      <circle cx="36" cy="54" r="3" fill="#78350F"/>
      <circle cx="64" cy="54" r="3" fill="#78350F"/>
      <ellipse cx="26" cy="62" rx="4" ry="2.5" fill="#FCA5A5"/>
      <ellipse cx="74" cy="62" rx="4" ry="2.5" fill="#FCA5A5"/>
    </svg>`
  },

  // 9. Mochi Party / Celebration
  {
    id: 'mochi_party',
    name: 'Party Time!',
    emoji: '🎉',
    category: 'reactions',
    svg: `<svg viewBox="0 0 100 100" class="w-full h-full animate-[bounce_1.4s_infinite]">
      <ellipse cx="50" cy="62" rx="33" ry="25" fill="#EFF6FF" stroke="#3B82F6" stroke-width="3"/>
      <!-- Party Hat -->
      <polygon points="50,14 36,44 64,44" fill="#F43F5E"/>
      <circle cx="50" cy="14" r="4.5" fill="#FDE047"/>
      <path d="M 38 34 Q 50 38 62 34" stroke="#FFF" stroke-width="2.5" fill="none"/>
      <!-- Confetti specks -->
      <circle cx="20" cy="28" r="3" fill="#FBBF24"/>
      <rect x="75" y="24" width="4" height="6" rx="1" fill="#A855F7" transform="rotate(25 77 27)"/>
      <circle cx="82" cy="48" r="2.5" fill="#EC4899"/>
      <!-- Big Excited Face -->
      <circle cx="36" cy="58" r="3.5" fill="#1E3A8A"/>
      <circle cx="64" cy="58" r="3.5" fill="#1E3A8A"/>
      <path d="M 43 64 Q 50 74 57 64 Z" fill="#F43F5E" stroke="#1E3A8A" stroke-width="1.8"/>
      <ellipse cx="26" cy="64" rx="4" ry="2.5" fill="#93C5FD"/>
      <ellipse cx="74" cy="64" rx="4" ry="2.5" fill="#93C5FD"/>
    </svg>`
  },

  // 10. Mochi Sparkle Star
  {
    id: 'mochi_sparkle',
    name: 'Sparkle Star',
    emoji: '✨',
    category: 'cute',
    svg: `<svg viewBox="0 0 100 100" class="w-full h-full animate-[pulse_1.8s_infinite]">
      <!-- Star Shaped Aura -->
      <polygon points="50,6 55,24 74,24 59,35 65,54 50,42 35,54 41,35 26,24 45,24" fill="#FEF08A" opacity="0.6"/>
      <ellipse cx="50" cy="60" rx="33" ry="25" fill="#FEF9C3" stroke="#EAB308" stroke-width="3"/>
      <!-- Sparkles in eyes -->
      <polygon points="36,46 38,52 44,53 39,56 41,62 36,58 31,62 33,56 28,53 34,52" fill="#854D0E"/>
      <polygon points="64,46 66,52 72,53 67,56 69,62 64,58 59,62 61,56 56,53 62,52" fill="#854D0E"/>
      <ellipse cx="26" cy="64" rx="4" ry="2.5" fill="#FCA5A5"/>
      <ellipse cx="74" cy="64" rx="4" ry="2.5" fill="#FCA5A5"/>
      <path d="M 46 64 Q 50 68 54 64" fill="none" stroke="#854D0E" stroke-width="2.5" stroke-linecap="round"/>
    </svg>`
  },

  // 11. Flower Crown Mochi
  {
    id: 'mochi_flower',
    name: 'Flower Crown',
    emoji: '🌸',
    category: 'cute',
    svg: `<svg viewBox="0 0 100 100" class="w-full h-full">
      <!-- Mochi Body -->
      <ellipse cx="50" cy="62" rx="34" ry="25" fill="#FFF1F2" stroke="#F472B6" stroke-width="3"/>
      <!-- Flower Crown -->
      <circle cx="34" cy="40" r="7" fill="#F472B6"/>
      <circle cx="34" cy="40" r="3" fill="#FDE047"/>
      <circle cx="50" cy="36" r="8" fill="#FB7185"/>
      <circle cx="50" cy="36" r="3.5" fill="#FFF"/>
      <circle cx="66" cy="40" r="7" fill="#F472B6"/>
      <circle cx="66" cy="40" r="3" fill="#FDE047"/>
      <!-- Cheerful Face -->
      <circle cx="38" cy="58" r="3" fill="#881337"/>
      <circle cx="62" cy="58" r="3" fill="#881337"/>
      <path d="M 46 64 Q 50 68 54 64" fill="none" stroke="#881337" stroke-width="2" stroke-linecap="round"/>
      <ellipse cx="28" cy="64" rx="4.5" ry="3" fill="#FDA4AF"/>
      <ellipse cx="72" cy="64" rx="4.5" ry="3" fill="#FDA4AF"/>
    </svg>`
  },

  // 12. Kitty Mochi Paws
  {
    id: 'mochi_cat',
    name: 'Mochi Neko',
    emoji: '🐾',
    category: 'animals',
    svg: `<svg viewBox="0 0 100 100" class="w-full h-full">
      <!-- Cat Ears -->
      <polygon points="26,44 32,22 46,38" fill="#FFF7ED" stroke="#FB923C" stroke-width="2.5"/>
      <polygon points="30,40 34,26 42,36" fill="#FDBA74"/>
      <polygon points="74,44 68,22 54,38" fill="#FFF7ED" stroke="#FB923C" stroke-width="2.5"/>
      <polygon points="70,40 66,26 58,36" fill="#FDBA74"/>
      <!-- Mochi Head -->
      <ellipse cx="50" cy="60" rx="34" ry="26" fill="#FFF7ED" stroke="#FB923C" stroke-width="3"/>
      <!-- Whiskers -->
      <line x1="18" y1="56" x2="30" y2="58" stroke="#7C2D12" stroke-width="1.8" stroke-linecap="round"/>
      <line x1="18" y1="64" x2="30" y2="62" stroke="#7C2D12" stroke-width="1.8" stroke-linecap="round"/>
      <line x1="82" y1="56" x2="70" y2="58" stroke="#7C2D12" stroke-width="1.8" stroke-linecap="round"/>
      <line x1="82" y1="64" x2="70" y2="62" stroke="#7C2D12" stroke-width="1.8" stroke-linecap="round"/>
      <!-- Eyes & Mouth -->
      <circle cx="38" cy="56" r="3" fill="#7C2D12"/>
      <circle cx="62" cy="56" r="3" fill="#7C2D12"/>
      <path d="M 45 62 Q 48 65 50 62 Q 52 65 55 62" fill="none" stroke="#7C2D12" stroke-width="2" stroke-linecap="round"/>
      <ellipse cx="28" cy="62" rx="4" ry="2.5" fill="#FDA4AF"/>
      <ellipse cx="72" cy="62" rx="4" ry="2.5" fill="#FDA4AF"/>
    </svg>`
  }
];

export const POPULAR_REACTION_EMOJIS = ['🍡', '💖', '✨', '🍵', '🧋', '🌸', '🐰', '🧸', '🎉', '🐾'];
