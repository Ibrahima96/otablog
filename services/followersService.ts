import { supabase } from './supabaseClient';

export interface FollowUser {
    id: string;
    username: string;
    avatar_url: string | null;
    level: number;
    followed_at: string;
}

/**
 * Follow a user
 */
export const followUser = async (followerId: string, followingId: string): Promise<boolean> => {
    try {
        if (followerId === followingId) {
            throw new Error('Vous ne pouvez pas vous suivre vous-même');
        }

        const { error } = await supabase
            .from('followers')
            .insert({
                follower_id: followerId,
                following_id: followingId
            });

        if (error) throw error;
        return true;
    } catch (error: any) {
        console.error('Error following user:', error);
        // Handle duplicate follow gracefully
        if (error.code === '23505') {
            return true; // Already following
        }
        throw error;
    }
};

/**
 * Unfollow a user
 */
export const unfollowUser = async (followerId: string, followingId: string): Promise<boolean> => {
    try {
        const { error } = await supabase
            .from('followers')
            .delete()
            .eq('follower_id', followerId)
            .eq('following_id', followingId);

        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Error unfollowing user:', error);
        throw error;
    }
};

/**
 * Check if user is following another user
 */
export const isFollowing = async (followerId: string, followingId: string): Promise<boolean> => {
    try {
        const { data, error } = await supabase
            .rpc('is_following', {
                p_follower_id: followerId,
                p_following_id: followingId
            });

        if (error) {
            // Fallback to direct query
            const { data: follow } = await supabase
                .from('followers')
                .select('id')
                .eq('follower_id', followerId)
                .eq('following_id', followingId)
                .single();

            return !!follow;
        }

        return data || false;
    } catch (error) {
        console.error('Error checking follow status:', error);
        return false;
    }
};

/**
 * Get followers of a user
 */
export const getFollowers = async (userId: string): Promise<FollowUser[]> => {
    try {
        const { data, error } = await supabase
            .rpc('get_followers', { p_user_id: userId });

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error fetching followers:', error);
        return [];
    }
};

/**
 * Get users that a user is following
 */
export const getFollowing = async (userId: string): Promise<FollowUser[]> => {
    try {
        const { data, error } = await supabase
            .rpc('get_following', { p_user_id: userId });

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error fetching following:', error);
        return [];
    }
};

/**
 * Get follow counts for a user
 */
export const getFollowCounts = async (userId: string): Promise<{ followers: number; following: number }> => {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('followers_count, following_count')
            .eq('id', userId)
            .single();

        if (error) throw error;
        return {
            followers: data?.followers_count || 0,
            following: data?.following_count || 0
        };
    } catch (error) {
        console.error('Error fetching follow counts:', error);
        return { followers: 0, following: 0 };
    }
};

/**
 * Toggle follow status
 */
export const toggleFollow = async (followerId: string, followingId: string): Promise<boolean> => {
    const following = await isFollowing(followerId, followingId);

    if (following) {
        await unfollowUser(followerId, followingId);
        return false;
    } else {
        await followUser(followerId, followingId);
        return true;
    }
};

export const followersService = {
    followUser,
    unfollowUser,
    isFollowing,
    getFollowers,
    getFollowing,
    getFollowCounts,
    toggleFollow
};
