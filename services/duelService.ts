import { QuizScore } from '../types';
import { supabase } from './supabaseClient';

class DuelService {
    /**
     * Get top duelists from Supabase
     */
    async getTopDuelists(limit: number = 4): Promise<QuizScore[]> {
        try {
            const { data, error } = await supabase
                .from('quiz_scores')
                .select('*')
                .order('score', { ascending: false })
                .limit(limit);

            if (error) throw error;

            return (data || []).map((score, index) => ({
                userId: score.user_id,
                username: score.username,
                score: score.score,
                rank: index + 1,
                avatarUrl: score.avatar_url || ''
            }));
        } catch (error) {
            console.error('Error fetching top duelists:', error);
            return [];
        }
    }

    /**
     * Save or update a quiz score
     * Returns true if it's a new high score for the leaderboard
     */
    async checkHighScore(score: number, username: string, userId?: string): Promise<boolean> {
        try {
            // Get current user ID (if authenticated)
            const effectiveUserId = userId || (await supabase.auth.getUser()).data.user?.id;

            if (!effectiveUserId) {
                console.warn('No user ID available, score not saved');
                return false;
            }

            // Check if user already has a score
            const { data: existingScore } = await supabase
                .from('quiz_scores')
                .select('score')
                .eq('user_id', effectiveUserId)
                .single();

            if (existingScore) {
                // Update only if new score is higher
                if (score > existingScore.score) {
                    const { error } = await supabase
                        .from('quiz_scores')
                        .update({
                            score,
                            username,
                            updated_at: new Date().toISOString()
                        })
                        .eq('user_id', effectiveUserId);

                    if (error) throw error;
                    return await this.isInTopLeaderboard(score);
                }
                return false;
            } else {
                // Insert new score
                const { error } = await supabase
                    .from('quiz_scores')
                    .insert({
                        user_id: effectiveUserId,
                        username,
                        score,
                        category: 'general'
                    });

                if (error) throw error;
                return await this.isInTopLeaderboard(score);
            }
        } catch (error) {
            console.error('Error saving quiz score:', error);
            return false;
        }
    }

    /**
     * Check if a score qualifies for top 4
     */
    private async isInTopLeaderboard(score: number): Promise<boolean> {
        try {
            const { data, error } = await supabase
                .from('quiz_scores')
                .select('score')
                .order('score', { ascending: false })
                .limit(4);

            if (error) throw error;

            if (!data || data.length < 4) return true;

            const lowestTopScore = data[3].score;
            return score >= lowestTopScore;
        } catch (error) {
            console.error('Error checking leaderboard:', error);
            return false;
        }
    }

    /**
     * Get user's personal best score
     */
    async getUserBestScore(userId: string): Promise<number | null> {
        try {
            const { data, error } = await supabase
                .from('quiz_scores')
                .select('score')
                .eq('user_id', userId)
                .single();

            if (error) return null;
            return data?.score || null;
        } catch (error) {
            console.error('Error fetching user score:', error);
            return null;
        }
    }
}

export const duelService = new DuelService();
