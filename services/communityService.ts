import { supabase } from './supabaseClient';

import { CommunityPost, PostFilters } from '../types';

/**
 * Create a new post
 */
export const createPost = async (
    postData: {
        type: 'image' | 'video' | 'marketplace';
        caption: string;
        mediaFile?: File;
        imageUrl?: string;
        marketplaceItem?: {
            title: string;
            description: string;
            price: number;
            category: string;
            whatsappNumber?: string;
        }
    },
    userId: string,
    username?: string
): Promise<CommunityPost | null> => {
    try {
        let mediaUrl = postData.imageUrl || '';

        // Upload media if present (File object)
        if (postData.mediaFile) {
            const file = postData.mediaFile;
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
                type: postData.type,
                caption: postData.caption,
                media_url: mediaUrl
            })
            .select()
            .single();

        if (postError) throw postError;

        // Create marketplace item if applicable
        if (postData.type === 'marketplace' && postData.marketplaceItem) {
            const { error: marketError } = await supabase
                .from('marketplace_items')
                .insert({
                    post_id: post.id,
                    ...postData.marketplaceItem
                });

            if (marketError) throw marketError;
        }

        // Return complete post
        return await getPostById(post.id);
    } catch (error: any) {
        console.error('Error creating post:', error);
        throw new Error(error.message || 'Échec de la création du post');
    }
};

/**
 * Get a single post by ID
 */
export const getPostById = async (postId: string): Promise<CommunityPost> => {
    // 1. Fetch Post Detail
    const { data: postData, error: postError } = await supabase
        .from('posts')
        .select(`
            *,
            marketplace_item:marketplace_items (
                title,
                description,
                price,
                currency,
                category,
                whatsapp_number
            )
        `)
        .eq('id', postId)
        .single();

    if (postError) throw postError;

    // 2. Fetch Author Profile Manualy
    const { data: profile } = await supabase
        .from('profiles')
        .select('username, avatar_url')
        .eq('id', postData.user_id)
        .single();

    return transformPostData(postData, profile);
};

/**
 * Get posts with optional filters and pagination
 */
export const getPosts = async (filters: PostFilters = {}): Promise<CommunityPost[]> => {
    try {
        // 1. Fetch Posts
        let query = supabase
            .from('posts')
            .select(`
                *,
                marketplace_item:marketplace_items (
                    title,
                    description,
                    price,
                    currency,
                    category,
                    whatsapp_number
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

        const { data: postsData, error: postsError } = await query;

        if (postsError) throw postsError;
        if (!postsData || postsData.length === 0) return [];

        // 2. Fetch Unique Author Profiles Manually
        const userIds = Array.from(new Set(postsData.map(post => post.user_id)));
        const { data: profiles } = await supabase
            .from('profiles')
            .select('id, username, avatar_url')
            .in('id', userIds);

        // Map profiles for quick access
        const profileMap = (profiles || []).reduce((acc: any, profile: any) => {
            acc[profile.id] = profile;
            return acc;
        }, {});

        // 3. Merge & Transform
        return postsData.map(post => transformPostData(post, profileMap[post.user_id]));
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
    // 1. Fetch Posts
    const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select(`
            *,
            marketplace_item:marketplace_items (
                title,
                description,
                price,
                currency,
                category,
                whatsapp_number
            )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (postsError) throw postsError;
    if (!postsData || postsData.length === 0) return [];

    // 2. Fetch Profile once
    const { data: profile } = await supabase
        .from('profiles')
        .select('username, avatar_url')
        .eq('id', userId)
        .single();

    return postsData.map(post => transformPostData(post, profile));
};

/**
 * Transform database post data to CommunityPost type
 */
function transformPostData(data: any, profile?: any): CommunityPost {
    return {
        id: data.id,
        type: data.type,
        author: {
            id: data.user_id,
            username: profile?.username || 'Utilisateur',
            avatarUrl: profile?.avatar_url || ''
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
                    category: item.category,
                    whatsappNumber: item.whatsapp_number || undefined
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
            user_id: comment.user_id, // Added user_id
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
    } catch (error: any) {
        console.error('Error adding comment:', error);
        throw new Error(error.message || 'Échec de l\'ajout du commentaire');
    }
};

/**
 * Delete a comment
 */
export const deleteComment = async (commentId: string, userId: string): Promise<void> => {
    try {
        // Verify ownership (optional, RLS handles it too but good for UI feedback)
        const { error } = await supabase
            .from('post_comments')
            .delete()
            .eq('id', commentId)
            .eq('user_id', userId); // Ensure user owns it

        if (error) throw error;
    } catch (error: any) {
        console.error('Error deleting comment:', error);
        throw new Error(error.message || 'Échec de la suppression du commentaire');
    }
};

/**
 * Update a comment
 */
export const updateComment = async (commentId: string, userId: string, text: string): Promise<void> => {
    try {
        const { error } = await supabase
            .from('post_comments')
            .update({ text })
            .eq('id', commentId)
            .eq('user_id', userId);

        if (error) throw error;
    } catch (error: any) {
        console.error('Error updating comment:', error);
        throw new Error(error.message || 'Échec de la modification du commentaire');
    }
};
