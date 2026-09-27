import { SocialFeedPost, HighlightItem, MediaHubItem } from '../types/chat';

// Curated aesthetic feminine photography matching the reference image
export const FEMALE_COVER_URL = 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=1200&auto=format&fit=crop&q=80';
export const FEMALE_HERO_LAKE_URL = 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=900&auto=format&fit=crop&q=80';
export const FEMALE_AVATAR_URL = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80';

export const FEMALE_PROFILE_DEFAULT = {
  name: 'Maya Islam',
  username: 'maya07',
  bio: 'Good people, good chats, good vibes 💖\nExploring new places, stories and connections. ✨',
  location: 'Dhaka, Bangladesh',
  joinedDate: 'Joined Jan 2024',
  stats: {
    posts: 128,
    friends: '2.4K',
    followers: 356,
    following: 92,
  },
  coverUrl: FEMALE_COVER_URL,
};

export const FEMALE_HIGHLIGHTS: HighlightItem[] = [
  {
    id: 'fh1',
    title: 'Travel ✈️',
    emoji: '✈️',
    coverImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=300&auto=format&fit=crop&q=80',
  },
  {
    id: 'fh2',
    title: 'Food 🥞',
    emoji: '🥞',
    coverImage: 'https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?w=300&auto=format&fit=crop&q=80',
  },
  {
    id: 'fh3',
    title: 'Nature 🌿',
    emoji: '🌿',
    coverImage: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=300&auto=format&fit=crop&q=80',
  },
  {
    id: 'fh4',
    title: 'Moments 📸',
    emoji: '📸',
    coverImage: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=300&auto=format&fit=crop&q=80',
  },
  {
    id: 'fh5',
    title: 'Lifestyle 🌸',
    emoji: '🌸',
    coverImage: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=300&auto=format&fit=crop&q=80',
  },
];

export const FEMALE_DEMO_POSTS: SocialFeedPost[] = [
  {
    id: 'fpost_1',
    authorId: 'maya_islam',
    authorName: 'Maya Islam',
    authorAvatar: 'bunny',
    authorCustomAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    createdAt: Date.now() - 2 * 3600 * 1000,
    timeAgo: '2h ago',
    location: 'Dhaka',
    isPublic: true,
    content: 'Sunsets always feel like a new beginning 🌅\nGrateful for today 🌸💖',
    images: [
      'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=900&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=900&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=900&auto=format&fit=crop&q=80',
    ],
    likes: 1240,
    commentsCount: 86,
    sharesCount: 42,
    isLiked: false,
    isSaved: false,
  },
  {
    id: 'fpost_2',
    authorId: 'riya_islam',
    authorName: 'Riya Islam',
    authorAvatar: 'cat',
    authorCustomAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
    createdAt: Date.now() - 5 * 3600 * 1000,
    timeAgo: '5h ago',
    location: 'Gulshan',
    isPublic: true,
    content: 'Coffee, conversations and calm mornings ☕✨ Wishing everyone a gentle and peaceful day 💗',
    images: [
      'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=900&auto=format&fit=crop&q=80',
    ],
    likes: 980,
    commentsCount: 54,
    sharesCount: 31,
    isLiked: true,
    isSaved: true,
  },
  {
    id: 'fpost_3',
    authorId: 'sadia_islam',
    authorName: 'Sadia Islam',
    authorAvatar: 'fox',
    authorCustomAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80',
    createdAt: Date.now() - 9 * 3600 * 1000,
    timeAgo: '9h ago',
    location: 'Banani',
    isPublic: true,
    content: 'Little moments, big memories 💗 Exploring secret flower spots in the city 🌸',
    images: [
      'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=900&auto=format&fit=crop&q=80',
    ],
    likes: 890,
    commentsCount: 42,
    sharesCount: 20,
    isLiked: false,
    isSaved: false,
  },
];

export const FEMALE_DEMO_ONLINE_FRIENDS = [
  { id: 'u_f_maya', name: 'Maya', username: 'maya07', avatar: 'bunny', customAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80', online: true },
  { id: 'u_f_riya', name: 'Riya', username: 'riya_i', avatar: 'cat', customAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=160&auto=format&fit=crop&q=80', online: true },
  { id: 'u_f_tania', name: 'Tania', username: 'tania_r', avatar: 'bear', customAvatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=160&auto=format&fit=crop&q=80', online: true },
  { id: 'u_f_nusrat', name: 'Nusrat', username: 'nusrat_j', avatar: 'bunny', customAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=160&auto=format&fit=crop&q=80', online: true },
  { id: 'u_f_anika', name: 'Anika', username: 'anika_k', avatar: 'panda', customAvatar: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=160&auto=format&fit=crop&q=80', online: true },
];

export const FEMALE_DEMO_SUGGESTED_USERS = [
  { id: 'u_sug_sadia', name: 'Sadia Islam', username: 'sadia07', mutualFriends: 12, avatar: 'fox', customAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80' },
  { id: 'u_sug_faria', name: 'Faria Khan', username: 'faria.k', mutualFriends: 8, avatar: 'cat', customAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=160&auto=format&fit=crop&q=80' },
  { id: 'u_sug_pranto', name: 'Pranto Das', username: 'pranto01', mutualFriends: 6, avatar: 'falcon', customAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&auto=format&fit=crop&q=80' },
  { id: 'u_sug_rimjhim', name: 'Rimjhim', username: 'rim_22', mutualFriends: 5, avatar: 'bunny', customAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=160&auto=format&fit=crop&q=80' },
];

export const FEMALE_DEMO_MEDIA_ITEMS: MediaHubItem[] = [
  {
    id: 'fm1',
    type: 'video',
    title: 'Sunset over Lake',
    url: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=600&auto=format&fit=crop&q=80',
    duration: '0:28',
    timestamp: Date.now() - 3600000,
  },
  {
    id: 'fm2',
    type: 'photo',
    title: 'Pink Cherry Blossoms',
    url: 'https://images.unsplash.com/photo-1522383225653-ed111181a951?w=600&auto=format&fit=crop&q=80',
    timestamp: Date.now() - 7200000,
  },
  {
    id: 'fm3',
    type: 'photo',
    title: 'Girl Looking Out',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80',
    timestamp: Date.now() - 10800000,
  },
  {
    id: 'fm4',
    type: 'photo',
    title: 'Lake Sunset Boat',
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80',
    timestamp: Date.now() - 14400000,
  },
  {
    id: 'fm5',
    type: 'photo',
    title: 'Summer Garden Hat',
    url: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=600&auto=format&fit=crop&q=80',
    timestamp: Date.now() - 18000000,
  },
  {
    id: 'fm6',
    type: 'photo',
    title: 'Cozy Fluffy Cat',
    url: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600&auto=format&fit=crop&q=80',
    timestamp: Date.now() - 21600000,
  },
  {
    id: 'fm7',
    type: 'photo',
    title: 'Coffee and Calm Morning',
    url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&auto=format&fit=crop&q=80',
    timestamp: Date.now() - 25200000,
  },
  {
    id: 'fm8',
    type: 'photo',
    title: 'Dreamy Sunset Clouds',
    url: 'https://images.unsplash.com/photo-1534067783941-51c9c23ecefd?w=600&auto=format&fit=crop&q=80',
    timestamp: Date.now() - 28800000,
  },
  {
    id: 'fm9',
    type: 'video',
    title: 'Twilight City Skyline',
    url: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=600&auto=format&fit=crop&q=80',
    duration: '0:36',
    timestamp: Date.now() - 32400000,
  },
];
