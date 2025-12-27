import { supabase } from './supabaseClient';
import { UserProfile, Badge } from '../types';

export const gamificationService = {
    async getProfile(userId: string): Promise<UserProfile | null> {
        try {
            const { data: profile, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (error || !profile) {
                console.error('Error fetching profile:', error);
                return null;
            }

            // Fetch Badges
            // Note: This relies on the foreign key relationship being correctly detected by Supabase client
            // If the join is tricky, we might need to adjust the query or use separate queries
            const { data: userBadges, error: badgeError } = await supabase
                .from('user_badges')
                .select(`
                    obtained_at,
                    badges (
                        id, slug, name, description, icon, rarity, xp_reward, aura_reward
                    )
                `)
                .eq('user_id', userId);

            if (badgeError) {
                console.error('Error fetching badges:', badgeError);
            }

            const badges: Badge[] = userBadges?.map((ub: any) => ({
                id: ub.badges.id,
                slug: ub.badges.slug,
                name: ub.badges.name,
                description: ub.badges.description,
                icon: ub.badges.icon,
                rarity: ub.badges.rarity,
                xpReward: ub.badges.xp_reward,
                auraReward: ub.badges.aura_reward,
                obtainedAt: new Date(ub.obtained_at)
            })) || [];

            return {
                id: profile.id,
                username: profile.username,
                avatarUrl: profile.avatar_url,
                bio: profile.bio,
                level: profile.level,
                xp: profile.xp,
                aura: profile.aura || 0,
                title: profile.title,
                duelWins: profile.duel_wins,
                duelTotal: profile.duel_total,
                whatsapp_number: profile.whatsapp_number,
                badges
            };
        } catch (err) {
            console.error('Unexpected error in getProfile:', err);
            return null;
        }
    },

    async getAllBadges(): Promise<Badge[]> {
        const { data, error } = await supabase
            .from('badges')
            .select('*');

        if (error) return [];

        return data.map((b: any) => ({
            id: b.id,
            slug: b.slug,
            name: b.name,
            description: b.description,
            icon: b.icon,
            rarity: b.rarity,
            xpReward: b.xp_reward,
            auraReward: b.aura_reward
        }));
    },

    async checkAndAwardBadge(userId: string, badgeSlug: string): Promise<boolean> {
        // Calls the Postgres function we created
        const { data, error } = await supabase.rpc('award_badge', {
            target_user_id: userId,
            badge_slug: badgeSlug
        });

        if (error) {
            console.error('Error awarding badge:', error);
            return false;
        }
        return !!data;
    },

    async summonItem(userId: string, cost: number = 100): Promise<any> {
        const { data, error } = await supabase.rpc('perform_summon', {
            p_user_id: userId,
            p_cost: cost
        });

        if (error) {
            console.error('Error invoking summons:', error);
            throw error;
        }
        return data; // Returns { success, outcome, badge, remaining_aura, message }
    }
};
