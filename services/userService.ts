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

/**
 * Update user profile (username and/or avatar)
 */
export async function updateProfile(userId: string, updates: { username?: string; avatarFile?: File }): Promise<boolean> {
    try {
        let avatarUrl = undefined;

        // Upload avatar if provided
        if (updates.avatarFile) {
            const fileExt = updates.avatarFile.name.split('.').pop();
            const fileName = `${userId}-${Date.now()}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(fileName, updates.avatarFile, { upsert: true });

            if (uploadError) {
                console.error('Error uploading avatar:', uploadError);
                return false;
            }

            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(fileName);

            avatarUrl = publicUrl;
        }

        // Update profile in DB
        const updateData: any = {};
        if (updates.username) updateData.username = updates.username;
        if (avatarUrl) updateData.avatar_url = avatarUrl;

        if (Object.keys(updateData).length === 0) return true;

        const { error } = await supabase
            .from('profiles')
            .update(updateData)
            .eq('id', userId);

        if (error) {
            console.error('Error updating profile:', error);
            return false;
        }

        return true;
    } catch (error) {
        console.error('Error in updateProfile:', error);
        return false;
    }
}
