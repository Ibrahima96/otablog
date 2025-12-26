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
     * Get the current champion (Top #1)
     */
    async getChampion() {
        try {
            const topDuelists = await this.getTopDuelists(1);
            if (topDuelists.length === 0) return null;

            const champion = topDuelists[0];

            // Fetch extra profile details for the champion (bio, etc)
            const profile = await this.getUserProfile(champion.userId);

            return {
                name: champion.username,
                image: champion.avatarUrl || `https://ui-avatars.com/api/?name=${champion.username}&background=random`,
                description: profile?.bio || "Le maître incontesté du quiz. Oserez-vous le défier ?",
                wins: profile?.duel_wins || champion.score, // Use wins or score
            };
        } catch (error) {
            console.error('Error fetching champion:', error);
            return null;
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

            // Fetch user profile to ensure we have the latest avatar
            const { data: profile } = await supabase
                .from('profiles')
                .select('avatar_url')
                .eq('id', effectiveUserId)
                .single();

            const avatarUrl = profile?.avatar_url || '';

            if (existingScore) {
                // Update only if new score is higher
                if (score > existingScore.score) {
                    const { error } = await supabase
                        .from('quiz_scores')
                        .update({
                            score,
                            username,
                            avatar_url: avatarUrl, // Force update avatar
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
                        avatar_url: avatarUrl, // Insert avatar
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

    /**
     * Get full user profile with RPG stats
     */
    async getUserProfile(userId: string) {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error fetching profile:', error);
            return null;
        }
    }

    /**
     * Add XP to user (and potentially level up)
     */
    async addXp(userId: string, amount: number) {
        try {
            const { error } = await supabase.rpc('add_xp', {
                user_id: userId,
                amount: amount
            });

            if (error) {
                // Fallback if RPC not available: Manual update
                console.warn('RPC add_xp failed, trying manual update...');
                const profile = await this.getUserProfile(userId);
                if (profile) {
                    const newXp = (profile.xp || 0) + amount;
                    const newLevel = Math.floor(newXp / 100) + 1;

                    await supabase
                        .from('profiles')
                        .update({ xp: newXp, level: newLevel, updated_at: new Date() })
                        .eq('id', userId);
                }
            }
            return true;
        } catch (error) {
            console.error('Error adding XP:', error);
            return false;
        }
    }
    /**
     * Update user profile fields
     */
    async updateProfile(userId: string, updates: { avatar_url?: string; title?: string; bio?: string }) {
        try {
            // 1. Update Profiles Table
            const { error } = await supabase
                .from('profiles')
                .update({ ...updates, updated_at: new Date() })
                .eq('id', userId);

            if (error) throw error;

            // 2. Sync Avatar to Quiz Scores (Leaderboard) if changed
            if (updates.avatar_url) {
                const { error: scoreError } = await supabase
                    .from('quiz_scores')
                    .update({ avatar_url: updates.avatar_url })
                    .eq('user_id', userId);

                if (scoreError) console.warn('Failed to sync avatar to quiz_scores:', scoreError);
            }

            return true;
        } catch (error) {
            console.error('Error updating profile:', error);
            return false;
        }
    }
}

export const duelService = new DuelService();
