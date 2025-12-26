import React, { useState, useEffect } from 'react';
import { UserPlus, UserMinus, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { isFollowing, toggleFollow } from '../services/followersService';
import { toast } from 'sonner';

interface FollowButtonProps {
    targetUserId: string;
    targetUsername: string;
    size?: 'sm' | 'md';
    className?: string;
}

const FollowButton: React.FC<FollowButtonProps> = ({
    targetUserId,
    targetUsername,
    size = 'sm',
    className = ''
}) => {
    const { user } = useAuth();
    const [following, setFollowing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [toggling, setToggling] = useState(false);

    // Don't show button for own profile
    if (!user || user.id === targetUserId) {
        return null;
    }

    useEffect(() => {
        checkFollowStatus();
    }, [user, targetUserId]);

    const checkFollowStatus = async () => {
        if (!user) return;
        try {
            setLoading(true);
            const result = await isFollowing(user.id, targetUserId);
            setFollowing(result);
        } catch (error) {
            console.error('Error checking follow status:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleFollow = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!user || toggling) return;

        setToggling(true);
        try {
            const newStatus = await toggleFollow(user.id, targetUserId);
            setFollowing(newStatus);
            toast.success(newStatus
                ? `👥 Vous suivez ${targetUsername}`
                : `Vous ne suivez plus ${targetUsername}`
            );
        } catch (error: any) {
            toast.error(error.message || 'Erreur');
        } finally {
            setToggling(false);
        }
    };

    if (loading) {
        return (
            <div className={`${size === 'sm' ? 'w-6 h-6' : 'w-8 h-8'} flex items-center justify-center`}>
                <Loader2 className="w-3 h-3 animate-spin text-gray-400" />
            </div>
        );
    }

    const sizeStyles = size === 'sm'
        ? 'px-2 py-1 text-[10px] gap-1'
        : 'px-3 py-1.5 text-xs gap-1.5';

    return (
        <button
            onClick={handleToggleFollow}
            disabled={toggling}
            className={`
                flex items-center font-bold rounded-full transition-all
                ${following
                    ? 'bg-white/10 text-gray-300 hover:bg-red-500/20 hover:text-red-400 border border-white/20'
                    : 'bg-neonPink/20 text-neonPink hover:bg-neonPink/30 border border-neonPink/30'
                }
                ${sizeStyles}
                ${toggling ? 'opacity-50 cursor-not-allowed' : ''}
                ${className}
            `}
        >
            {toggling ? (
                <Loader2 className="w-3 h-3 animate-spin" />
            ) : following ? (
                <>
                    <UserMinus size={size === 'sm' ? 10 : 12} />
                    <span>Suivi</span>
                </>
            ) : (
                <>
                    <UserPlus size={size === 'sm' ? 10 : 12} />
                    <span>Suivre</span>
                </>
            )}
        </button>
    );
};

export default FollowButton;
