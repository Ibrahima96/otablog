import { supabase } from './supabaseClient';

export interface DailyChallenge {
    id: string;
    title: string;
    description: string;
    type: 'quiz' | 'post' | 'social' | 'streak';
    reward_xp: number;
    difficulty: number;
    icon: string;
    completed: boolean;
    progress: number;
    target: number;
}

/**
 * Get daily challenges with user progress
 */
export const getDailyChallenges = async (userId: string): Promise<DailyChallenge[]> => {
    try {
        const { data, error } = await supabase
            .rpc('get_daily_challenges_with_progress', { p_user_id: userId });

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error fetching daily challenges:', error);

        // Fallback to direct query if RPC fails
        const { data: challenges } = await supabase
            .from('daily_challenges')
            .select('*')
            .eq('is_active', true)
            .order('difficulty', { ascending: true })
            .limit(3);

        return (challenges || []).map(c => ({
            ...c,
            completed: false,
            progress: 0,
            target: 1
        }));
    }
};

/**
 * Complete a challenge and claim reward
 */
export const completeChallenge = async (userId: string, challengeId: string): Promise<{ success: boolean; xpEarned: number }> => {
    try {
        // Call the database function
        const { data, error } = await supabase
            .rpc('complete_challenge', {
                p_user_id: userId,
                p_challenge_id: challengeId
            });

        if (error) throw error;

        // Get the XP reward for feedback
        const { data: challenge } = await supabase
            .from('daily_challenges')
            .select('reward_xp')
            .eq('id', challengeId)
            .single();

        return {
            success: true,
            xpEarned: challenge?.reward_xp || 50
        };
    } catch (error) {
        console.error('Error completing challenge:', error);
        return { success: false, xpEarned: 0 };
    }
};

/**
 * Update challenge progress (for incremental challenges)
 */
export const updateChallengeProgress = async (
    userId: string,
    challengeType: string,
    increment: number = 1
): Promise<void> => {
    try {
        // Get active challenges of this type
        const { data: challenges } = await supabase
            .from('daily_challenges')
            .select('id')
            .eq('type', challengeType)
            .eq('is_active', true);

        if (!challenges?.length) return;

        for (const challenge of challenges) {
            // Upsert progress
            await supabase
                .from('user_challenges')
                .upsert({
                    user_id: userId,
                    challenge_id: challenge.id,
                    progress: increment,
                    date: new Date().toISOString().split('T')[0]
                }, {
                    onConflict: 'user_id,challenge_id,date'
                });
        }
    } catch (error) {
        console.error('Error updating challenge progress:', error);
    }
};

export const dailyChallengesService = {
    getDailyChallenges,
    completeChallenge,
    updateChallengeProgress
};
