import { SocialFeedPost, HighlightItem, MediaHubItem } from '../types/chat';

// Curated high quality cinematic image references with reliable fallbacks
export const MALE_COVER_URL = 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&auto=format&fit=crop&q=80';
export const MALE_HERO_LAKE_URL = 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=900&auto=format&fit=crop&q=80';

export const MALE_PROFILE_DEFAULT = {
  name: 'Joyti Chakraborty',
  username: 'mrjoyti07',
  bio: 'Good people, good chats, good vibes ✨\nExploring new places, stories and connections.',
  location: 'Dhaka, Bangladesh',
  joinedDate: 'Joined Jan 2024',
  stats: {
    posts: 128,
    friends: '2.4K',
    followers: 356,
    following: 92,
  },
  coverUrl: MALE_COVER_URL,
};

export const MALE_HIGHLIGHTS: HighlightItem[] = [
  {
    id: 'h1',
    title: 'Travel ✈️',
    emoji: '✈️',
    coverImage: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=300&auto=format&fit=crop&q=80',
  },
  {
    id: 'h2',
    title: 'Food 🍜',
    emoji: '🍜',
    coverImage: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=300&auto=format&fit=crop&q=80',
  },
  {
    id: 'h3',
    title: 'Nature 🌿',
    emoji: '🌿',
    coverImage: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=300&auto=format&fit=crop&q=80',
  },
  {
    id: 'h4',
    title: 'Moments 📸',
    emoji: '📸',
    coverImage: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=300&auto=format&fit=crop&q=80',
  },
  {
    id: 'h5',
    title: 'Tech 💻',
    emoji: '💻',
    coverImage: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=300&auto=format&fit=crop&q=80',
  },
];

export const MALE_DEMO_POSTS: SocialFeedPost[] = [
  {
    id: 'post_1',
    authorId: 'tanvir_ahmed',
    authorName: 'Tanvir Ahmed',
    authorAvatar: 'wolf',
    authorCustomAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    createdAt: Date.now() - 2 * 3600 * 1000,
    timeAgo: '2h ago',
    isPublic: true,
    content: 'Sometimes the right people make ordinary places feel extraordinary ✨',
    images: [
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=900&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=900&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=900&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=900&auto=format&fit=crop&q=80',
    ],
    likes: 1240,
    commentsCount: 86,
    sharesCount: 42,
    isLiked: false,
    isSaved: false,
  },
  {
    id: 'post_2',
    authorId: 'joyti_chakraborty',
    authorName: 'Joyti Chakraborty',
    authorAvatar: 'falcon',
    authorCustomAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80',
    createdAt: Date.now() - 5 * 3600 * 1000,
    timeAgo: '5h ago',
    isPublic: true,
    content: 'Sunset rides into the mountains. Fresh air, open roads, peaceful mind 🏍️🌄',
    images: [
      'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=900&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=900&auto=format&fit=crop&q=80',
    ],
    likes: 950,
    commentsCount: 64,
    sharesCount: 28,
    isLiked: true,
    isSaved: true,
  },
  {
    id: 'post_3',
    authorId: 'arif_hasan',
    authorName: 'Arif Hasan',
    authorAvatar: 'dragon',
    authorCustomAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    createdAt: Date.now() - 9 * 3600 * 1000,
    timeAgo: '9h ago',
    isPublic: true,
    content: 'Midnight coding & synthwave beats. Building something awesome for Simi 🚀🔥',
    images: [
      'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=900&auto=format&fit=crop&q=80',
    ],
    likes: 820,
    commentsCount: 41,
    sharesCount: 19,
    isLiked: false,
    isSaved: false,
  },
];

export const MALE_DEMO_ONLINE_FRIENDS = [
  { id: 'u_mira', name: 'Mira', username: 'mira_k', avatar: 'cat', customAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=160&auto=format&fit=crop&q=80', online: true },
  { id: 'u_arif', name: 'Arif', username: 'arif_h', avatar: 'dragon', customAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&auto=format&fit=crop&q=80', online: true },
  { id: 'u_nusrat', name: 'Nusrat', username: 'nusrat_j', avatar: 'bunny', customAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=160&auto=format&fit=crop&q=80', online: true },
  { id: 'u_tanvir', name: 'Tanvir', username: 'tanvir_a', avatar: 'wolf', customAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=160&auto=format&fit=crop&q=80', online: true },
  { id: 'u_rafi', name: 'Rafi', username: 'rafi_dev', avatar: 'bear', customAvatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=160&auto=format&fit=crop&q=80', online: true },
  { id: 'u_sadia', name: 'Sadia', username: 'sadia07', avatar: 'fox', customAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80', online: true },
  { id: 'u_pranto', name: 'Pranto', username: 'pranto01', avatar: 'falcon', customAvatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=160&auto=format&fit=crop&q=80', online: true },
];

export const MALE_DEMO_MEDIA_ITEMS: MediaHubItem[] = [
  {
    id: 'm1',
    type: 'video',
    title: 'Sunset over Lake',
    url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&auto=format&fit=crop&q=80',
    duration: '0:28',
    timestamp: Date.now() - 3600000,
  },
  {
    id: 'm2',
    type: 'photo',
    title: 'Portrait in the park',
    url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=600&auto=format&fit=crop&q=80',
    timestamp: Date.now() - 7200000,
  },
  {
    id: 'm3',
    type: 'photo',
    title: 'Cozy cat',
    url: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600&auto=format&fit=crop&q=80',
    timestamp: Date.now() - 10800000,
  },
  {
    id: 'm4',
    type: 'video',
    title: 'Mountain Road Ride',
    url: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=600&auto=format&fit=crop&q=80',
    duration: '0:18',
    timestamp: Date.now() - 14400000,
  },
  {
    id: 'm5',
    type: 'video',
    title: 'Drone footage over lake',
    url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=600&auto=format&fit=crop&q=80',
    duration: '1:20',
    timestamp: Date.now() - 18000000,
  },
  {
    id: 'm6',
    type: 'photo',
    title: 'Lantern festival',
    url: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=600&auto=format&fit=crop&q=80',
    timestamp: Date.now() - 21600000,
  },
  {
    id: 'm7',
    type: 'voice',
    title: 'Voice Note from Joyti',
    url: '',
    duration: '0:24',
    timestamp: Date.now() - 25200000,
  },
];
