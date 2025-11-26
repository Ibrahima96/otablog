import { supabase } from './supabaseClient';
import { CommunityPost, PostType, MarketplaceItem } from '../types';

export interface CreatePostParams {
    type: PostType;
    caption: string;
    mediaFile?: File;
    imageUrl?: string;
    marketplaceItem?: Omit<MarketplaceItem, 'currency'>;
}

export interface PostFilters {
    type?: PostType;
    limit?: number;
    offset?: number;
}

/**
 * Upload media file to Supabase Storage
 */
export const uploadMedia = async (file: File, userId: string): Promise<string> => {
    try {
        // Create unique filename with user ID folder structure
        const fileExt = file.name.split('.').pop();
        const fileName = `${userId}/${Date.now()}.${fileExt}`;

        const { data, error } = await supabase.storage
            .from('community-media')
            .upload(fileName, file, {
                cacheControl: '3600',
                upsert: false
            });

        if (error) throw error;

        // Get public URL
        const { data: urlData } = supabase.storage
            .from('community-media')
            .getPublicUrl(data.path);

        return urlData.publicUrl;
    } catch (error) {
        console.error('Error uploading media:', error);
        throw new Error('Échec de l\'upload du fichier');
    }
};

/**
 * Create a new community post
 */
export const createPost = async (params: CreatePostParams, userId: string, username?: string): Promise<CommunityPost> => {
    console.log('🚀 [createPost] Starting with params:', {
        type: params.type,
        hasFile: !!params.mediaFile,
        hasMarketplaceItem: !!params.marketplaceItem,
        userId
    });

    try {
        let mediaUrl: string | null = null;

        // Upload media if provided
        if (params.mediaFile) {
            console.log('📤 [createPost] Uploading media file...');
            mediaUrl = await uploadMedia(params.mediaFile, userId);
            console.log('✅ [createPost] Media uploaded:', mediaUrl);
        } else if (params.imageUrl) {
            // Use provided URL directly
            console.log('🔗 [createPost] Using provided image URL:', params.imageUrl);
            mediaUrl = params.imageUrl;
        }

        // Insert post
        console.log('💾 [createPost] Inserting post into database...');
        const insertData = {
            user_id: userId,
            username: username || 'Utilisateur',
            type: params.type,
            caption: params.caption,
            media_url: mediaUrl
        };
        console.log('📝 [createPost] Insert data:', insertData);

        const { data: postData, error: postError } = await supabase
            .from('posts')
            .insert(insertData)
            .select('*')
            .single();

        if (postError) {
            console.error('❌ [createPost] Post insert error:', postError);
            throw postError;
        }

        console.log('✅ [createPost] Post created successfully:', postData);

        // If marketplace item, insert it
        if (params.type === 'marketplace' && params.marketplaceItem) {
            console.log('🛒 [createPost] Inserting marketplace item...');
            const marketplaceData = {
                post_id: postData.id,
                title: params.marketplaceItem.title,
                description: params.marketplaceItem.description,
                price: params.marketplaceItem.price,
                category: params.marketplaceItem.category,
                currency: 'EUR'
            };
            console.log('📝 [createPost] Marketplace data:', marketplaceData);

            const { error: marketplaceError } = await supabase
                .from('marketplace_items')
                .insert(marketplaceData);

            if (marketplaceError) {
                console.error('❌ [createPost] Marketplace insert error:', marketplaceError);
                throw marketplaceError;
            }
            console.log('✅ [createPost] Marketplace item created');
        }

        // Fetch complete post
        console.log('🔄 [createPost] Fetching complete post data...');
        const completePost = await getPostById(postData.id);
        console.log('✅ [createPost] Complete! Final post:', completePost);
        return completePost;
    } catch (error: any) {
        console.error('❌ [createPost] Fatal error:', error);
        console.error('Error details:', {
            message: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint
        });
        throw new Error(`Échec de la création du post: ${error.message || 'Erreur inconnue'}`);
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
            marketplaceItem: data.marketplace_item ? {
                title: data.marketplace_item.title,
                description: data.marketplace_item.description,
                price: parseFloat(data.marketplace_item.price),
                currency: data.marketplace_item.currency,
                category: data.marketplace_item.category
            } : undefined
        },
        createdAt: new Date(data.created_at),
        likes: data.likes_count || 0,
        comments: data.comments_count || 0
    };
}
