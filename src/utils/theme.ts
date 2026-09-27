import { ThemeColor, ChatPattern } from '../types/chat';

export interface ThemeStyles {
  name: string;
  icon: string;
  bodyBg: string;
  sidebarBg: string;
  accent: string;
  accentHover: string;
  accentText: string;
  accentLight: string;
  accentBorder: string;
  userBubble: string;
  userBubbleText: string;
  ring: string;
  tagBg: string;
}

export const THEMES: Record<ThemeColor, ThemeStyles> = {
  strawberry: {
    name: 'Simi Rose',
    icon: '🌸',
    bodyBg: '#FFF7F9',
    sidebarBg: '#FFF0F4',
    accent: '#F43F5E',
    accentHover: '#E11D48',
    accentText: '#BE123C',
    accentLight: '#FFE4E6',
    accentBorder: '#FECDD3',
    userBubble: 'bg-gradient-to-r from-rose-500 via-pink-500 to-rose-400 text-white shadow-md shadow-pink-200/50',
    userBubbleText: 'text-white',
    ring: 'focus:ring-pink-300',
    tagBg: 'bg-pink-100/70 text-pink-800',
  },
  matcha: {
    name: 'Matcha Latte',
    icon: '🍵',
    bodyBg: '#F3FAF5',
    sidebarBg: '#ECFDF3',
    accent: '#4ADE80',
    accentHover: '#22C55E',
    accentText: '#166534',
    accentLight: '#DCFCE7',
    accentBorder: '#BBF7D0',
    userBubble: 'bg-gradient-to-r from-emerald-400 to-teal-400 text-white shadow-emerald-200/50',
    userBubbleText: 'text-white',
    ring: 'focus:ring-emerald-300',
    tagBg: 'bg-emerald-100/70 text-emerald-800',
  },
  vanilla: {
    name: 'Honey Vanilla',
    icon: '🍯',
    bodyBg: '#FFFDF5',
    sidebarBg: '#FEFCE8',
    accent: '#F59E0B',
    accentHover: '#D97706',
    accentText: '#92400E',
    accentLight: '#FEF3C7',
    accentBorder: '#FDE68A',
    userBubble: 'bg-gradient-to-r from-amber-400 to-yellow-400 text-amber-950 shadow-amber-200/50',
    userBubbleText: 'text-amber-950',
    ring: 'focus:ring-amber-300',
    tagBg: 'bg-amber-100/70 text-amber-900',
  },
  lavender: {
    name: 'Lavender Mist',
    icon: '💜',
    bodyBg: '#FBF8FF',
    sidebarBg: '#F5EEFD',
    accent: '#A855F7',
    accentHover: '#9333EA',
    accentText: '#6B21A8',
    accentLight: '#F3E8FF',
    accentBorder: '#E9D5FF',
    userBubble: 'bg-gradient-to-r from-purple-400 to-fuchsia-400 text-white shadow-purple-200/50',
    userBubbleText: 'text-white',
    ring: 'focus:ring-purple-300',
    tagBg: 'bg-purple-100/70 text-purple-900',
  },
  sky: {
    name: 'Soda Cloud',
    icon: '🫧',
    bodyBg: '#F4FAFF',
    sidebarBg: '#EBF6FE',
    accent: '#38BDF8',
    accentHover: '#0284C7',
    accentText: '#075985',
    accentLight: '#E0F2FE',
    accentBorder: '#BAE6FD',
    userBubble: 'bg-gradient-to-r from-sky-400 to-cyan-400 text-white shadow-sky-200/50',
    userBubbleText: 'text-white',
    ring: 'focus:ring-sky-300',
    tagBg: 'bg-sky-100/70 text-sky-900',
  },
  midnight: {
    name: 'Midnight Simi',
    icon: '⚡',
    bodyBg: '#0B0F17',
    sidebarBg: '#111827',
    accent: '#3B82F6',
    accentHover: '#2563EB',
    accentText: '#60A5FA',
    accentLight: '#1E293B',
    accentBorder: '#1E3A8A',
    userBubble: 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-lg shadow-blue-950/40',
    userBubbleText: 'text-white',
    ring: 'focus:ring-blue-500',
    tagBg: 'bg-blue-950/80 text-blue-300 border border-blue-800/50',
  },
};

export const femaleTheme = {
  background: '#FFF7F9',
  surface: 'rgba(255, 255, 255, 0.88)',
  surfaceSoft: 'rgba(255, 245, 247, 0.75)',
  primary: '#F43F5E',
  secondary: '#EC4899',
  accent: '#E11D74',
  text: '#1F1625',
  muted: '#7A6E82',
  success: '#10B981',
  danger: '#EF4444',
  gradient: 'linear-gradient(135deg, #F43F5E 0%, #EC4899 50%, #D946EF 100%)',
  shadow: '0 10px 30px -5px rgba(244, 63, 94, 0.1)',
  border: 'rgba(244, 114, 182, 0.25)',
  radius: '1.25rem',
};

export const maleTheme = {
  background: '#0B0F17',
  surface: 'rgba(17, 24, 39, 0.78)',
  surfaceSoft: 'rgba(17, 24, 39, 0.65)',
  primary: '#3B82F6',
  secondary: '#06B6D4',
  accent: '#60A5FA',
  text: '#F1F5F9',
  muted: '#94A3B8',
  success: '#10B981',
  danger: '#EF4444',
  gradient: 'linear-gradient(135deg, #A855F7 0%, #3B82F6 50%, #06B6D4 100%)',
  shadow: '0 10px 35px -5px rgba(0, 0, 0, 0.5)',
  border: 'rgba(59, 130, 246, 0.16)',
  radius: '1.25rem',
};

export interface SimiThemeResolution {
  isMale: boolean;
  isFemale: boolean;
  theme: ThemeColor;
  styles: ThemeStyles;
  // Common visual tokens for components (Section 26 & 28):
  bgCanvas: string;
  surface: string;
  surfaceGlass: string;
  surfaceBorder: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  accentPrimary: string;
  accentGradient: string;
  accentShadow: string;
  userBubble: string;
  otherBubble: string;
  storyRing: string;
  tabActive: string;
  tabInactive: string;
  emptyIconBg: string;
  emptyIconColor: string;
  modalBg: string;
  modalBorder: string;
  modalHeaderBg: string;
  actionPillActive: string;
  actionPillInactive: string;
}

export function resolveSimiTheme(user?: { gender?: string; theme?: ThemeColor } | null, activeThemeName?: ThemeColor): SimiThemeResolution {
  // Gender-based theme rule: Female users must NEVER receive male theme; Male users must NEVER receive female theme.
  let isMale = false;
  if (user?.gender === 'female') {
    isMale = false;
  } else if (user?.gender === 'male') {
    isMale = true;
  } else {
    isMale = activeThemeName === 'midnight';
  }

  const isFemale = !isMale;
  const effectiveTheme: ThemeColor = isMale
    ? 'midnight'
    : (user?.theme && user.theme !== 'midnight' ? user.theme : (activeThemeName && activeThemeName !== 'midnight' ? activeThemeName : 'strawberry'));

  const styles = THEMES[effectiveTheme] || THEMES.strawberry;

  return {
    isMale,
    isFemale,
    theme: effectiveTheme,
    styles,
    bgCanvas: isMale ? 'bg-[#0B0F17]' : 'bg-female-canvas',
    surface: isMale ? 'bg-[#111827]' : 'bg-white',
    surfaceGlass: isMale ? 'glass-panel-male' : 'glass-panel-female',
    surfaceBorder: isMale ? 'border-slate-800/80' : 'border-pink-100/90',
    textPrimary: isMale ? 'text-slate-100' : 'text-slate-800',
    textSecondary: isMale ? 'text-slate-300' : 'text-slate-600',
    textMuted: isMale ? 'text-slate-400' : 'text-slate-400',
    accentPrimary: isMale ? '#3B82F6' : '#F43F5E',
    accentGradient: isMale
      ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500'
      : 'bg-gradient-to-r from-rose-500 via-pink-500 to-rose-400',
    accentShadow: isMale ? 'shadow-md shadow-blue-950/60 glow-cyan-blue' : 'shadow-md shadow-rose-200/60',
    userBubble: isMale
      ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-lg shadow-blue-950/40 rounded-br-xs font-medium'
      : 'bg-gradient-to-r from-rose-500 via-pink-500 to-rose-400 text-white shadow-sm shadow-rose-200/60 rounded-br-xs font-medium',
    otherBubble: isMale
      ? 'bg-[#131B2E]/90 text-slate-100 border border-slate-800/80 rounded-bl-xs shadow-sm backdrop-blur-md'
      : 'bg-white text-slate-800 border border-pink-100/90 rounded-bl-xs shadow-2xs',
    storyRing: isMale ? 'story-ring-male' : 'story-ring-female',
    tabActive: isMale
      ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 text-white shadow-md shadow-blue-950/60 glow-cyan-blue'
      : 'bg-gradient-to-r from-rose-500 via-pink-500 to-rose-400 text-white shadow-xs',
    tabInactive: isMale
      ? 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800/80'
      : 'bg-white/80 text-slate-600 border border-pink-100/70 hover:bg-pink-50',
    emptyIconBg: isMale ? 'bg-slate-800/80 text-blue-400' : 'bg-pink-100/80 text-rose-500',
    emptyIconColor: isMale ? 'text-blue-400' : 'text-rose-500',
    modalBg: isMale ? 'bg-[#111827] text-slate-100 border-slate-800' : 'bg-white text-slate-800 border-pink-100',
    modalBorder: isMale ? 'border-slate-800/80' : 'border-pink-100/80',
    modalHeaderBg: isMale ? 'bg-slate-900/60 border-slate-800/80' : 'bg-[#FFF7F9]/95 border-pink-100/80',
    actionPillActive: isMale
      ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 text-white'
      : 'bg-gradient-to-r from-rose-500 via-pink-500 to-rose-400 text-white',
    actionPillInactive: isMale
      ? 'bg-slate-900/60 hover:bg-slate-800/80 border-slate-800/80 text-slate-200'
      : 'bg-white hover:bg-pink-50/70 border-pink-100/90 text-slate-700 shadow-2xs',
  };
}

export function getUserTheme(user?: { gender?: string; theme?: ThemeColor } | null, activeThemeName?: ThemeColor): SimiThemeResolution {
  return resolveSimiTheme(user, activeThemeName);
}

export interface ChatPatternDefinition {
  id: ChatPattern;
  name: string;
  icon: string;
  description: string;
  previewBg: string;
  // CSS backgroundImage or SVG data URI pattern for chat area
  backgroundImage?: string;
  backgroundSize?: string;
}

export const CHAT_PATTERNS: Record<ChatPattern, ChatPatternDefinition> = {
  none: {
    id: 'none',
    name: 'Clean Solid',
    icon: '✨',
    description: 'Minimalist clean background matching your palette',
    previewBg: 'bg-white border-dashed border-2 border-slate-200',
    backgroundImage: 'none',
  },
  mochi_dots: {
    id: 'mochi_dots',
    name: 'Mochi Polka',
    icon: '🍡',
    description: 'Pastel floating mochi dots pattern',
    previewBg: 'bg-pink-50',
    backgroundImage: `radial-gradient(rgba(244, 63, 94, 0.13) 2.5px, transparent 2.5px), radial-gradient(rgba(251, 191, 36, 0.12) 2px, transparent 2px)`,
    backgroundSize: '36px 36px, 18px 18px',
  },
  bouncing_mochi: {
    id: 'bouncing_mochi',
    name: 'Squishy Mochi',
    icon: '🥟',
    description: 'Cute bouncy mochi silhouette tiles',
    previewBg: 'bg-rose-50',
    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 40c-8 0-14-5-14-11 0-7 6-13 14-13s14 6 14 13c0 6-6 11-14 11z' fill='%23fb7185' fill-opacity='0.12'/%3E%3Cellipse cx='25' cy='28' rx='1.5' ry='2' fill='%23e11d48' fill-opacity='0.25'/%3E%3Cellipse cx='35' cy='28' rx='1.5' ry='2' fill='%23e11d48' fill-opacity='0.25'/%3E%3Ccircle cx='21' cy='32' r='2' fill='%23fda4af' fill-opacity='0.4'/%3E%3Ccircle cx='39' cy='32' r='2' fill='%23fda4af' fill-opacity='0.4'/%3E%3C/svg%3E")`,
    backgroundSize: '60px 60px',
  },
  sakura_blossom: {
    id: 'sakura_blossom',
    name: 'Sakura Petals',
    icon: '🌸',
    description: 'Gentle falling cherry blossom petals',
    previewBg: 'bg-pink-50/80',
    backgroundImage: `url("data:image/svg+xml,%3Csvg width='52' height='52' viewBox='0 0 52 52' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23f472b6' fill-opacity='0.15'%3E%3Cpath d='M26 18c-3-6 3-12 5-6 2 6-5 6-5 6zM26 26c-6-3-12 3-6 5 6 2 6-5 6-5zM26 34c3 6-3 12-5 6-2-6 5-6 5-6zM34 26c6 3 12-3 6-5-6-2-6 5-6 5zM18 26c-6-3-12 3-6 5 6 2 6-5 6-5z'/%3E%3Ccircle cx='26' cy='26' r='2.5' fill='%23fef08a' fill-opacity='0.3'/%3E%3C/g%3E%3C/svg%3E")`,
    backgroundSize: '52px 52px',
  },
  matcha_grid: {
    id: 'matcha_grid',
    name: 'Tatami Grid',
    icon: '🍵',
    description: 'Cozy matcha cross-hatch cafe grid',
    previewBg: 'bg-emerald-50',
    backgroundImage: `linear-gradient(rgba(74, 222, 128, 0.12) 1.5px, transparent 1.5px), linear-gradient(90deg, rgba(74, 222, 128, 0.12) 1.5px, transparent 1.5px)`,
    backgroundSize: '28px 28px',
  },
  starry_sparkles: {
    id: 'starry_sparkles',
    name: 'Magic Sparkles',
    icon: '✨',
    description: 'Whimsical pastel stars and twinkles',
    previewBg: 'bg-purple-50',
    backgroundImage: `url("data:image/svg+xml,%3Csvg width='64' height='64' viewBox='0 0 64 64' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23c084fc' fill-opacity='0.16'%3E%3Cpolygon points='32,10 34,22 46,24 34,26 32,38 30,26 18,24 30,22'/%3E%3Ccircle cx='54' cy='48' r='2' fill='%23fde047' fill-opacity='0.35'/%3E%3Ccircle cx='12' cy='52' r='1.5' fill='%23f472b6' fill-opacity='0.3'/%3E%3Cpolygon points='52,20 53,24 57,25 53,26 52,30 51,26 47,25 51,24' fill='%23f472b6' fill-opacity='0.18'/%3E%3C/g%3E%3C/svg%3E")`,
    backgroundSize: '64px 64px',
  },
  boba_clouds: {
    id: 'boba_clouds',
    name: 'Boba & Clouds',
    icon: '🧋',
    description: 'Floaty fluffy clouds with boba pearls',
    previewBg: 'bg-sky-50',
    backgroundImage: `url("data:image/svg+xml,%3Csvg width='70' height='70' viewBox='0 0 70 70' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M25 45a8 8 0 0 1 14 0 6 6 0 0 1 10 3 5 5 0 0 1-2 7H18a6 6 0 0 1-1-6 8 8 0 0 1 8-4z' fill='%2338bdf8' fill-opacity='0.13'/%3E%3Ccircle cx='52' cy='22' r='3' fill='%2378350f' fill-opacity='0.18'/%3E%3Ccircle cx='60' cy='26' r='2.5' fill='%2378350f' fill-opacity='0.18'/%3E%3Ccircle cx='56' cy='32' r='2.5' fill='%2378350f' fill-opacity='0.18'/%3E%3C/svg%3E")`,
    backgroundSize: '70px 70px',
  },
  midnight_grid: {
    id: 'midnight_grid',
    name: 'Midnight Grid',
    icon: '⚡',
    description: 'Subtle dark technical grid pattern',
    previewBg: 'bg-slate-900',
    backgroundImage: `linear-gradient(rgba(59, 130, 246, 0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(59, 130, 246, 0.12) 1px, transparent 1px)`,
    backgroundSize: '24px 24px',
  },
  carbon_grid: {
    id: 'carbon_grid',
    name: 'Carbon Fiber',
    icon: '🖤',
    description: 'Minimal graphite crosshatch texture',
    previewBg: 'bg-slate-950',
    backgroundImage: `radial-gradient(rgba(148, 163, 184, 0.15) 1.5px, transparent 1.5px)`,
    backgroundSize: '16px 16px',
  },
  blueprint: {
    id: 'blueprint',
    name: 'Dark Blueprint',
    icon: '📐',
    description: 'Dark engineering style blueprint grid',
    previewBg: 'bg-blue-950',
    backgroundImage: `linear-gradient(rgba(56, 189, 248, 0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(56, 189, 248, 0.15) 1px, transparent 1px)`,
    backgroundSize: '32px 32px',
  },
  nocturne: {
    id: 'nocturne',
    name: 'Nocturne Stealth',
    icon: '🌙',
    description: 'Very subtle dark geometric pattern',
    previewBg: 'bg-slate-950',
    backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40' fill='%23334155' fill-opacity='0.12'/%3E%3C/svg%3E")`,
    backgroundSize: '40px 40px',
  },
};
