import { supabase } from './supabaseClient';
import { Duel, DuelComment } from '../types';
import { getUserById } from './userService';

interface DuelRow {
    id: string;
    title: string;
    candidate_a_name: string;
    candidate_a_image: string;
    candidate_a_desc: string;
    candidate_b_name: string;
    candidate_b_image: string;
    candidate_b_desc: string;
    is_active: boolean;
    created_at: string;
    created_by: string;
}

/**
 * Fetch the currently active duel with vote counts
 */
export async function getActiveDuel(): Promise<Duel | null> {
    try {
        // Get the active duel
        const { data: duelData, error: duelError } = await supabase
            .from('duels')
            .select('*')
            .eq('is_active', true)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (duelError) {
            console.error('Error fetching duel:', duelError);
            return null;
        }

        if (!duelData) return null;

        const duel = duelData as DuelRow;

        // Get vote counts
        const { data: votesData, error: votesError } = await supabase
            .from('duel_votes')
            .select('candidate')
            .eq('duel_id', duel.id);

        if (votesError) {
            console.error('Error fetching votes:', votesError);
        }

        const votesA = votesData?.filter(v => v.candidate === 'A').length || 0;
        const votesB = votesData?.filter(v => v.candidate === 'B').length || 0;

        return {
            id: duel.id,
            title: duel.title,
            candidateA: {
                name: duel.candidate_a_name,
                image: duel.candidate_a_image,
                description: duel.candidate_a_desc
            },
            candidateB: {
                name: duel.candidate_b_name,
                image: duel.candidate_b_image,
                description: duel.candidate_b_desc
            },
            isActive: duel.is_active,
            createdAt: new Date(duel.created_at),
            createdBy: duel.created_by,
            votesA,
            votesB
        };
    } catch (error) {
        console.error('Unexpected error in getActiveDuel:', error);
        return null;
    }
}

/**
 * Upload an image to Supabase Storage for a duel candidate
 */
export async function uploadDuelImage(file: File, userId: string): Promise<string | null> {
    try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${userId}-${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { data, error } = await supabase.storage
            .from('duel-images')
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false
            });

        if (error) {
            console.error('Error uploading image:', error);
            return null;
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from('duel-images')
            .getPublicUrl(filePath);

        return publicUrl;
    } catch (error) {
        console.error('Unexpected error in uploadDuelImage:', error);
        return null;
    }
}

/**
 * Create a new duel (User1 vs User2)
 */
export async function createDuel(
    player1UserId: string,
    player1Image: File | string,
    player1Desc: string,
    player2UserId: string,
    player2Image: File | string,
    player2Desc: string,
    creatorUserId: string
): Promise<boolean> {
    try {
        // Deactivate current duel
        await supabase
            .from('duels')
            .update({ is_active: false })
            .eq('is_active', true);

        // Get user info
        const [player1, player2] = await Promise.all([
            getUserById(player1UserId),
            getUserById(player2UserId)
        ]);

        if (!player1 || !player2) {
            console.error('Could not fetch player information');
            return false;
        }

        // Upload images if they are File objects
        let player1ImageUrl = typeof player1Image === 'string' ? player1Image : null;
        let player2ImageUrl = typeof player2Image === 'string' ? player2Image : null;

        if (player1Image instanceof File) {
            player1ImageUrl = await uploadDuelImage(player1Image, player1UserId);
        }
        if (player2Image instanceof File) {
            player2ImageUrl = await uploadDuelImage(player2Image, player2UserId);
        }

        if (!player1ImageUrl || !player2ImageUrl) {
            console.error('Image upload failed');
            return false;
        }

        // Create new duel
        const { error } = await supabase
            .from('duels')
            .insert({
                title: `${player1.username} vs ${player2.username}`,
                candidate_a_name: player1.username,
                candidate_a_image: player1ImageUrl,
                candidate_a_desc: player1Desc,
                candidate_a_user_id: player1UserId,
                candidate_b_name: player2.username,
                candidate_b_image: player2ImageUrl,
                candidate_b_desc: player2Desc,
                candidate_b_user_id: player2UserId,
                is_active: true,
                created_by: creatorUserId
            });

        if (error) {
            console.error('Error creating duel:', error);
            return false;
        }

        return true;
    } catch (error) {
        console.error('Unexpected error in createDuel:', error);
        return false;
    }
}

/**
 * Submit a vote for a duel
 */
export async function voteDuel(
    duelId: string,
    userId: string,
    candidate: 'A' | 'B'
): Promise<boolean> {
    try {
        const { error } = await supabase
            .from('duel_votes')
            .insert({
                duel_id: duelId,
                user_id: userId,
                candidate
            });

        if (error) {
            // Check if user already voted (unique constraint violation)
            if (error.code === '23505') {
                console.warn('User has already voted');
                return false;
            }
            console.error('Error voting:', error);
            return false;
        }

        return true;
    } catch (error) {
        console.error('Unexpected error in voteDuel:', error);
        return false;
    }
}

/**
 * Check if user has already voted on a duel
 */
export async function hasUserVoted(duelId: string, userId: string): Promise<string | null> {
    try {
        const { data, error } = await supabase
            .from('duel_votes')
            .select('candidate')
            .eq('duel_id', duelId)
            .eq('user_id', userId)
            .maybeSingle();

        if (error) {
            console.error('Error checking vote:', error);
            return null;
        }

        return data?.candidate || null;
    } catch (error) {
        console.error('Unexpected error in hasUserVoted:', error);
        return null;
    }
}

/**
 * Get comments for a duel
 */
export async function getComments(duelId: string): Promise<DuelComment[]> {
    try {
        const { data, error } = await supabase
            .from('duel_comments')
            .select('*')
            .eq('duel_id', duelId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching comments:', error);
            return [];
        }

        return (data || []).map(comment => ({
            id: comment.id,
            duelId: comment.duel_id,
            userId: comment.user_id,
            authorName: comment.author_name,
            text: comment.text,
            createdAt: new Date(comment.created_at)
        }));
    } catch (error) {
        console.error('Unexpected error in getComments:', error);
        return [];
    }
}

/**
 * Add a comment to a duel
 */
export async function addComment(
    duelId: string,
    userId: string,
    authorName: string,
    text: string
): Promise<DuelComment | null> {
    try {
        const { data, error } = await supabase
            .from('duel_comments')
            .insert({
                duel_id: duelId,
                user_id: userId,
                author_name: authorName,
                text: text
            })
            .select()
            .single();

        if (error) {
            console.error('Error adding comment:', error);
            return null;
        }

        return {
            id: data.id,
            duelId: data.duel_id,
            userId: data.user_id,
            authorName: data.author_name,
            text: data.text,
            createdAt: new Date(data.created_at)
        };
    } catch (error) {
        console.error('Unexpected error in addComment:', error);
        return null;
    }
}

/**
 * Delete a comment (only if the user is the author)
 */
export async function deleteComment(
    commentId: string,
    userId: string
): Promise<boolean> {
    try {
        // First verify the user owns this comment
        const { data: comment, error: fetchError } = await supabase
            .from('duel_comments')
            .select('user_id')
            .eq('id', commentId)
            .single();

        if (fetchError || !comment) {
            console.error('Error fetching comment:', fetchError);
            return false;
        }

        // Check ownership
        if (comment.user_id !== userId) {
            console.error('User does not own this comment');
            return false;
        }

        // Delete the comment
        const { error: deleteError } = await supabase
            .from('duel_comments')
            .delete()
            .eq('id', commentId);

        if (deleteError) {
            console.error('Error deleting comment:', deleteError);
            return false;
        }

        return true;
    } catch (error) {
        console.error('Unexpected error in deleteComment:', error);
        return false;
    }
}

/**
 * Get the current champion (winner of the most recent completed duel)
 */
export async function getChampion(): Promise<{
    name: string;
    image: string;
    description: string;
    wins: number;
} | null> {
    try {
        // Get the most recent inactive duel
        const { data: duel, error } = await supabase
            .from('duels')
            .select('*')
            .eq('is_active', false)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (error || !duel) {
            console.error('Error fetching champion duel:', error);
            return null;
        }

        // Count votes for each candidate
        const { data: votes } = await supabase
            .from('duel_votes')
            .select('candidate')
            .eq('duel_id', duel.id);

        const votesA = votes?.filter(v => v.candidate === 'A').length || 0;
        const votesB = votes?.filter(v => v.candidate === 'B').length || 0;

        // Determine winner
        const isAWinner = votesA >= votesB;

        return {
            name: isAWinner ? duel.candidate_a_name : duel.candidate_b_name,
            image: isAWinner ? duel.candidate_a_image : duel.candidate_b_image,
            description: isAWinner ? duel.candidate_a_desc : duel.candidate_b_desc,
            wins: isAWinner ? votesA : votesB
        };
    } catch (error) {
        console.error('Unexpected error in getChampion:', error);
        return null;
    }
}
