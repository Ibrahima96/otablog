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