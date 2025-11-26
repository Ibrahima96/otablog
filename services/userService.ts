import { supabase } from './supabaseClient';

export interface User {
    id: string;
    email: string;
    username: string;
}

/**
 * Fetch all registered users from the profiles table
 */
export async function getAllUsers(): Promise<User[]> {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('id, email, username')
            .order('username', { ascending: true });

        if (error) {
            console.error('Error fetching users:', error);
            return [];
        }

        return (data || []).map(profile => ({
            id: profile.id,
            email: profile.email,
            username: profile.username || profile.email.split('@')[0]
        }));
    } catch (error) {
        console.error('Unexpected error in getAllUsers:', error);
        return [];
    }
}

/**
 * Get user by ID from profiles table
 */
export async function getUserById(userId: string): Promise<User | null> {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('id, email, username')
            .eq('id', userId)
            .single();

        if (error || !data) {
            console.error('Error fetching user:', error);
            return null;
        }

        return {
            id: data.id,
            email: data.email,
            username: data.username || data.email.split('@')[0]
        };
    } catch (error) {
        console.error('Unexpected error in getUserById:', error);
        return null;
    }
}
