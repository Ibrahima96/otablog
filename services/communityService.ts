import { supabase } from './supabaseClient';

import { CommunityPost, PostFilters } from '../types';

/**
 * Create a new post
 */
export const createPost = async (
    userId: string,
    type: 'image' | 'video' | 'marketplace',
    caption: string,
    file: File | null,
    marketplaceData?: {
        title: string;
        description: string;
        price: number;
        currency: string;
        category: string;
    }
): Promise<CommunityPost | null> => {
    try {
        let mediaUrl = '';

        // Upload media if present
        if (file) {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `${userId}/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('community-media')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data } = supabase.storage
                .from('community-media')
                .getPublicUrl(filePath);

            mediaUrl = data.publicUrl;
        }

        // Create post
        const { data: post, error: postError } = await supabase
            .from('posts')
            .insert({
                user_id: userId,
                type,
                caption,
                media_url: mediaUrl
            })
            .select()
            .single();

        if (postError) throw postError;

        // Create marketplace item if applicable
        if (type === 'marketplace' && marketplaceData) {
            const { error: marketError } = await supabase
                .from('marketplace_items')
                .insert({
                    post_id: post.id,
                    ...marketplaceData
                });

            if (marketError) throw marketError;
        }

        // Return complete post
        return await getPostById(post.id);
    } catch (error) {
        console.error('Error creating post:', error);
        throw new Error('Échec de la création du post');
    }
};

/**
 * Get a single post by ID
 */
export const getPostById = async (postId: string): Promise<CommunityPost> => {
    const { data, error } = await supabase
        .from('posts')
        .select(`
      *,
      marketplace_item:marketplace_items (
        title,
        description,
        price,
        currency,
        category
      )
    `)
        .eq('id', postId)
        .single();

    if (error) throw error;

    return transformPostData(data);
};

/**
 * Get posts with optional filters and pagination
 */
export const getPosts = async (filters: PostFilters = {}): Promise<CommunityPost[]> => {
    try {
        let query = supabase
            .from('posts')
            .select(`
        *,
        marketplace_item:marketplace_items (
          title,
          description,
          price,
          currency,
          category
        )
      `)
            .order('created_at', { ascending: false });

        // Apply filters
        if (filters.type) {
            query = query.eq('type', filters.type);
        }

        if (filters.limit) {
            query = query.limit(filters.limit);
        }

        if (filters.offset) {
            query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
        }

        const { data, error } = await query;

        if (error) throw error;

        return (data || []).map(transformPostData);
    } catch (error) {
        console.error('Error fetching posts:', error);
        throw new Error('Échec du chargement des posts');
    }
};

/**
 * Toggle like on a post
 */
export const toggleLike = async (postId: string, userId: string): Promise<boolean> => {
    try {
        // Check if already liked
        const { data: existingLike } = await supabase
            .from('post_likes')
            .select('id')
            .eq('post_id', postId)
            .eq('user_id', userId)
            .single();

        if (existingLike) {
            // Unlike
            const { error } = await supabase
                .from('post_likes')
                .delete()
                .eq('id', existingLike.id);

            if (error) throw error;
            return false; // unliked
        } else {
            // Like
            const { error } = await supabase
                .from('post_likes')
                .insert({
                    post_id: postId,
                    user_id: userId
                });

            if (error) throw error;
            return true; // liked
        }
    } catch (error) {
        console.error('Error toggling like:', error);
        throw new Error('Échec de l\'action like');
    }
};

/**
 * Check if user has liked a post
 */
export const hasUserLikedPost = async (postId: string, userId: string): Promise<boolean> => {
    const { data } = await supabase
        .from('post_likes')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', userId)
        .single();

    return !!data;
};

/**
 * Delete a post (user can only delete their own posts)
 */
export const deletePost = async (postId: string, userId: string): Promise<void> => {
    try {
        // Verify ownership
        const { data: post } = await supabase
            .from('posts')
            .select('user_id, media_url')
            .eq('id', postId)
            .single();

        if (!post || post.user_id !== userId) {
            throw new Error('Non autorisé');
        }

        // Delete media from storage if exists
        if (post.media_url) {
            const path = post.media_url.split('/community-media/')[1];
            if (path) {
                await supabase.storage
                    .from('community-media')
                    .remove([path]);
            }
        }

        // Delete post (cascade will handle marketplace_items, likes, comments)
        const { error } = await supabase
            .from('posts')
            .delete()
            .eq('id', postId);

        if (error) throw error;
    } catch (error) {
        console.error('Error deleting post:', error);
        throw new Error('Échec de la suppression du post');
    }
};

/**
 * Get posts by user
 */
export const getPostsByUser = async (userId: string): Promise<CommunityPost[]> => {
    const { data, error } = await supabase
        .from('posts')
        .select(`
      *,
      marketplace_item:marketplace_items (
        title,
        description,
        price,
        currency,
        category
      )
    `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map(transformPostData);
};

/**
 * Transform database post data to CommunityPost type
 */
function transformPostData(data: any): CommunityPost {
    return {
        id: data.id,
        type: data.type,
        author: {
            id: data.user_id,
            username: data.username || 'Utilisateur',
            email: ''
        },
        content: {
            mediaUrl: data.media_url,
            caption: data.caption,
            marketplaceItem: (() => {
                const item = Array.isArray(data.marketplace_item)
                    ? data.marketplace_item[0]
                    : data.marketplace_item;

                if (!item) return undefined;

                return {
                    title: item.title,
                    description: item.description,
                    price: typeof item.price === 'string' ? parseFloat(item.price) : Number(item.price),
                    currency: item.currency,
                    category: item.category
                };
            })()
        },
        createdAt: new Date(data.created_at),
        likes: data.likes_count || 0,
        comments: data.comments_count || 0
    };
}

/**
 * Get comments for a post
 */
export const getCommentsByPost = async (postId: string): Promise<any[]> => {
    try {
        const { data, error } = await supabase
            .from('post_comments')
            .select(`
                *,
                profiles:user_id (
                    username,
                    avatar_url
                )
            `)
            .eq('post_id', postId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        return (data || []).map(comment => ({
            id: comment.id,
            text: comment.text,
            created_at: comment.created_at,
            username: comment.profiles?.username || 'Utilisateur',
            avatar_url: comment.profiles?.avatar_url
        }));
    } catch (error) {
        console.error('Error fetching comments:', error);
        return [];
    }
};

/**
 * Add a comment to a post
 */
export const addComment = async (postId: string, userId: string, text: string): Promise<any> => {
    try {
        const { data, error } = await supabase
            .from('post_comments')
            .insert({
                post_id: postId,
                user_id: userId,
                text
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error adding comment:', error);
        throw new Error('Échec de l\'ajout du commentaire');
    }
};
