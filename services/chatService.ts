import { supabase } from './supabaseClient';

export interface Channel {
    id: string;
    slug: string;
    name: string;
    description: string;
}

export interface ChannelMessage {
    id: string;
    channel_id: string;
    user_id: string;
    content: string;
    created_at: string;
    username?: string;
    avatar_url?: string;
    message_type?: 'text' | 'audio' | 'image';
    media_url?: string;
    is_edited?: boolean;
    deleted_at?: string;
}

/**
 * Fetch all public channels
 */
export const getChannels = async (): Promise<Channel[]> => {
    const { data, error } = await supabase
        .from('channels')
        .select('*')
        .eq('type', 'public')
        .order('name');

    if (error) {
        console.error('Error fetching channels:', error);
        return [];
    }

    return data;
};

/**
 * Fetch messages for a specific channel
 */
export const getChannelMessages = async (channelId: string): Promise<ChannelMessage[]> => {
    const { data, error } = await supabase
        .from('channel_messages')
        .select(`
            *,
            profiles:user_id (
                username,
                avatar_url
            )
        `)
        .eq('channel_id', channelId)
        .order('created_at', { ascending: true })
        .limit(100);

    if (error) {
        console.error('Error fetching messages:', error);
        return [];
    }

    return (data || []).map(msg => ({
        id: msg.id,
        channel_id: msg.channel_id,
        user_id: msg.user_id,
        content: msg.content,
        created_at: msg.created_at,
        username: msg.profiles?.username || 'Utilisateur',
        avatar_url: msg.profiles?.avatar_url,
        message_type: msg.message_type || 'text',
        media_url: msg.media_url,
        is_edited: msg.is_edited,
        deleted_at: msg.deleted_at
    }));
};

/**
 * Upload media (voice or image) to storage
 */
export const uploadChatMedia = async (file: Blob | File, bucket: 'chat-media' = 'chat-media'): Promise<string | null> => {
    try {
        const fileExt = file instanceof File ? file.name.split('.').pop() : 'webm';
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

        const { data, error } = await supabase.storage
            .from(bucket)
            .upload(fileName, file, {
                cacheControl: '3600',
                upsert: false
            });

        if (error) {
            console.error('Error uploading media:', error);
            return null;
        }

        const { data: { publicUrl } } = supabase.storage
            .from(bucket)
            .getPublicUrl(fileName);

        return publicUrl;
    } catch (error) {
        console.error('Error in uploadChatMedia:', error);
        return null;
    }
};

// Kept for backward compatibility if needed, but redirects to new function
export const uploadVoiceMessage = (audioBlob: Blob) => uploadChatMedia(audioBlob);

/**
 * Send a message to a channel
 */
export const sendMessage = async (
    channelId: string,
    userId: string,
    content: string,
    type: 'text' | 'audio' | 'image' = 'text',
    mediaUrl?: string
): Promise<void> => {
    const { error } = await supabase
        .from('channel_messages')
        .insert({
            channel_id: channelId,
            user_id: userId,
            content,
            message_type: type,
            media_url: mediaUrl
        });

    if (error) {
        throw error;
    }
};

/**
 * Edit a message
 */
export const editMessage = async (messageId: string, newContent: string): Promise<void> => {
    const { error } = await supabase
        .from('channel_messages')
        .update({ content: newContent, is_edited: true })
        .eq('id', messageId);

    if (error) throw error;
};

/**
 * Delete a message (soft delete)
 */
export const deleteMessage = async (messageId: string): Promise<void> => {
    const { error } = await supabase
        .from('channel_messages')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', messageId);

    if (error) throw error;
};

/**
 * Subscribe to new messages in a channel
 */
export const subscribeToChannel = (channelId: string, onMessage: (msg: ChannelMessage) => void, onUpdate?: (msg: ChannelMessage) => void) => {
    return supabase
        .channel(`public:channel_messages:channel_id=eq.${channelId}`)
        .on(
            'postgres_changes',
            {
                event: 'INSERT',
                schema: 'public',
                table: 'channel_messages',
                filter: `channel_id=eq.${channelId}`
            },
            async (payload) => {
                // Fetch user details for the new message
                const { data: userData } = await supabase
                    .from('profiles')
                    .select('username, avatar_url')
                    .eq('id', payload.new.user_id)
                    .single();

                const newMessage: ChannelMessage = {
                    id: payload.new.id,
                    channel_id: payload.new.channel_id,
                    user_id: payload.new.user_id,
                    content: payload.new.content,
                    created_at: payload.new.created_at,
                    username: userData?.username || 'Utilisateur',
                    avatar_url: userData?.avatar_url,
                    message_type: payload.new.message_type || 'text',
                    media_url: payload.new.media_url,
                    is_edited: payload.new.is_edited,
                    deleted_at: payload.new.deleted_at
                };

                onMessage(newMessage);
            }
        )
        .on(
            'postgres_changes',
            {
                event: 'UPDATE',
                schema: 'public',
                table: 'channel_messages',
                filter: `channel_id=eq.${channelId}`
            },
            async (payload) => {
                if (onUpdate) {
                    const { data: userData } = await supabase
                        .from('profiles')
                        .select('username, avatar_url')
                        .eq('id', payload.new.user_id)
                        .single();

                    const updatedMessage: ChannelMessage = {
                        id: payload.new.id,
                        channel_id: payload.new.channel_id,
                        user_id: payload.new.user_id,
                        content: payload.new.content,
                        created_at: payload.new.created_at,
                        username: userData?.username || 'Utilisateur',
                        avatar_url: userData?.avatar_url,
                        message_type: payload.new.message_type || 'text',
                        media_url: payload.new.media_url,
                        is_edited: payload.new.is_edited,
                        deleted_at: payload.new.deleted_at
                    };
                    onUpdate(updatedMessage);
                }
            }
        )
        .subscribe();
};

/**
 * Subscribe to online presence
 */
export const subscribeToPresence = (userId: string, onSync: (userIds: string[]) => void) => {
    const channel = supabase.channel('online-users', {
        config: {
            presence: {
                key: userId,
            },
        },
    });

    channel
        .on('presence', { event: 'sync' }, () => {
            const newState = channel.presenceState();
            const userIds = Object.keys(newState);
            onSync(userIds);
        })
        .subscribe(async (status) => {
            if (status === 'SUBSCRIBED') {
                await channel.track({ online_at: new Date().toISOString() });
            }
        });

    return channel;
};

/**
 * Create or get existing private chat with another user
 */
export const createPrivateChat = async (otherUserId: string): Promise<string | null> => {
    const { data, error } = await supabase
        .rpc('create_private_chat_if_not_exists', { other_user_id: otherUserId });

    if (error) {
        console.error('Error creating private chat:', error);
        return null;
    }

    return data;
};

/**
 * Get my private chats
 */
export const getMyPrivateChats = async (): Promise<Channel[]> => {
    // This is a bit complex because we need to get channels where I am a member AND type is private
    // And also fetch the OTHER user's name to display as the channel name

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
        .from('channels')
        .select(`
            *,
            channel_members!inner (user_id)
        `)
        .eq('type', 'private')
        .eq('channel_members.user_id', user.id);

    if (error) {
        console.error('Error fetching private chats:', error);
        return [];
    }

    // Now we need to fetch the other member's name for each channel to use as the name
    const channelsWithNames = await Promise.all(data.map(async (channel: any) => {
        const { data: members } = await supabase
            .from('channel_members')
            .select('user_id, profiles(username)')
            .eq('channel_id', channel.id)
            .neq('user_id', user.id)
            .single();

        // Type assertion or safe access for profiles
        const profileData = members?.profiles as any;
        const username = Array.isArray(profileData) ? profileData[0]?.username : profileData?.username;

        return {
            ...channel,
            name: username || 'Discussion Privée'
        };
    }));

    return channelsWithNames;
};
