import React from 'react';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  isTyping?: boolean;
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

// Salon/Duel Types
export interface DuelCandidate {
  name: string;
  image: string;
  description: string;
}

export interface Duel {
  id: string;
  title: string;
  candidateA: DuelCandidate;
  candidateB: DuelCandidate;
  isActive: boolean;
  createdAt: Date;
  createdBy: string;
  votesA: number;
  votesB: number;
}

export interface DuelVote {
  id: string;
  duelId: string;
  userId: string;
  candidate: 'A' | 'B';
  createdAt: Date;
}

export interface DuelComment {
  id: string;
  duelId: string;
  userId: string;
  authorName: string;
  text: string;
  createdAt: Date;
}