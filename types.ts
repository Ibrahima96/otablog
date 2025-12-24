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
    email: string;
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
  category: 'shonen' | 'shojo' | 'seinen' | 'isekai' | 'general';
  points: number;
}

export interface QuizScore {
  userId: string;
  username: string;
  score: number;
  avatarUrl?: string;
  rank?: number;
}