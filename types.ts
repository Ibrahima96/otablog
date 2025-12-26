import React from 'react';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  isTyping?: boolean;
  data?: {
    type: 'duel_invite';
    payload: any;
  };
}

export interface GalleryItem {
  id: number;
  imageUrl: string;
  title: string;
  category: string;
}

export interface Feature {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

export type PostType = 'image' | 'video' | 'marketplace';

export interface MarketplaceItem {
  title: string;
  description: string;
  price: number;
  category: 'article' | 'vetement' | 'accessoire' | 'autre';
  currency: string;
  whatsappNumber?: string; // Numéro WhatsApp du vendeur pour contact direct
}

export interface CommunityPost {
  id: string;
  type: PostType;
  author: {
    id: string;
    username: string;
    email?: string;
    avatarUrl?: string;
  };
  content: {
    mediaUrl?: string;
    caption: string;
    marketplaceItem?: MarketplaceItem;
  };
  createdAt: Date;
  likes: number;
  comments: number;
}

export interface PostComment {
  id: string;
  postId: string;
  userId: string;
  text: string;
  createdAt: Date;
  username?: string;
  avatarUrl?: string;
}

export interface PostFilters {
  type?: PostType;
  limit?: number;
  offset?: number;
}

// Quiz Types
export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number; // Index 0-3
  category: 'shonen' | 'shojo' | 'seinen' | 'isekai' | 'general' | 'classique' | 'sport' | 'mecha' | 'culture' | 'citation' | string;
  points: number;
}

export interface QuizScore {
  userId: string;
  username: string;
  score: number;
  avatarUrl?: string;
  rank?: number;
}

export interface Badge {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  xpReward: number;
  auraReward: number;
  obtainedAt?: Date; // For UserBadge view
}

export interface UserProfile {
  id: string;
  username: string;
  avatarUrl?: string;
  bio?: string;
  level: number;
  xp: number;
  aura: number;
  title: string;
  duelWins: number;
  duelTotal: number;
  badges?: Badge[];
}