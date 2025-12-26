import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, MessageCircle, ShoppingBag, Image as ImageIcon, Video, Trash2 } from 'lucide-react';
import { CommunityPost as CommunityPostType } from '../types';
import { toggleLike, hasUserLikedPost, deletePost } from '../services/communityService';
import { useAuth } from '../context/AuthContext';
import ProductPreviewModal from './ProductPreviewModal';
import FollowButton from './FollowButton';
import { toast } from 'sonner';
import { useSoundEffects } from '../hooks/useSoundEffects';

interface CommunityPostProps {
    post: CommunityPostType;
    onDelete?: (postId: string) => void;
    onCommentClick?: (post: CommunityPostType) => void;
    onLikeChange?: (postId: string, newCount: number, isLiked: boolean) => void;
    variant?: 'featured' | 'horizontal' | 'vertical' | 'standard';
    index?: number;
}

const CommunityPost: React.FC<CommunityPostProps> = ({
    post,
    onDelete,
    onCommentClick,
    onLikeChange
}) => {
    const { user } = useAuth();
    const { playClick, playHover, playSuccess } = useSoundEffects();
    const isMarketplace = post.type === 'marketplace';
    const [liked, setLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(post.likes);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);

    // Check if user has liked this post
    useEffect(() => {
        if (user) {
            hasUserLikedPost(post.id, user.id).then(setLiked);
        }
    }, [post.id, user]);

    // Update local state if prop changes (e.g. from parent update)
    useEffect(() => {
        setLikeCount(post.likes);
    }, [post.likes]);

    const handleLike = async () => {
        if (!user) return;

        playClick();
        try {
            const isLiked = await toggleLike(post.id, user.id);
            if (isLiked) playSuccess();
            setLiked(isLiked);
            const newCount = isLiked ? likeCount + 1 : likeCount - 1;
            setLikeCount(newCount);
            if (onLikeChange) {
                onLikeChange(post.id, newCount, isLiked);
            }
        } catch (error) {
            console.error('Error toggling like:', error);
        }
    };

    const handleDelete = async () => {
        if (!user || !window.confirm('Êtes-vous sûr de vouloir supprimer ce post ?')) return;

        const toastId = toast.loading('Suppression en cours...');
        try {
            setIsDeleting(true);
            await deletePost(post.id, user.id);
            toast.success('🗑️ Post supprimé!', { id: toastId });
            if (onDelete) {
                onDelete(post.id);
            }
        } catch (error: any) {
            console.error('Error deleting post:', error);
            toast.error(error.message || 'Erreur lors de la suppression', { id: toastId });
            setIsDeleting(false);
        }
    };

    const isOwnPost = user && user.id === post.author.id;

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onMouseEnter={() => playHover()}
                className={`group bg-midnight/40 border border-white/10 rounded-xl overflow-hidden hover:border-neonPink/30 transition-all duration-300 hover:shadow-[0_0_30px_rgba(247,37,133,0.15)] ${isDeleting ? 'opacity-50 pointer-events-none' : ''}`}
            >
                <div className="flex flex-col h-full">
                    {/* Post Media or Marketplace Preview */}
                    <div
                        onClick={() => setIsPreviewOpen(true)}
                        className="relative aspect-square bg-gradient-to-br from-neonPurple/10 to-electricBlue/10 flex items-center justify-center overflow-hidden cursor-pointer"
                    >
                        {post.content.mediaUrl ? (
                            post.type === 'video' ? (
                                <video
                                    src={post.content.mediaUrl}
                                    controls
                                    playsInline
                                    preload="metadata"
                                    onClick={(e) => e.stopPropagation()}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <img
                                    src={post.content.mediaUrl}
                                    alt={post.content.caption}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                            )
                        ) : (
                            <div className="flex flex-col items-center gap-3 text-gray-600">
                                {post.type === 'image' && <ImageIcon size={48} />}
                                {post.type === 'video' && <Video size={48} />}
                                {post.type === 'marketplace' && <ShoppingBag size={48} />}
                                <span className="text-xs font-mono uppercase tracking-wider">
                                    {post.type === 'marketplace' ? 'Article' : 'Média'}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Content Section */}
                    <div className="p-4 flex flex-col gap-3">
                        {/* Header */}
                        <div className="flex items-center gap-3 mb-3">
                            {post.author.avatarUrl ? (
                                <div className="w-8 h-8 rounded-full overflow-hidden border border-neonPink/50">
                                    <img src={post.author.avatarUrl} alt={post.author.username} className="w-full h-full object-cover" />
                                </div>
                            ) : (
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-neonPink to-neonPurple flex items-center justify-center text-white text-xs font-bold">
                                    {post.author.username.charAt(0).toUpperCase()}
                                </div>
                            )}
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-white truncate">{post.author.username}</p>
                                <p className="text-xs text-gray-500 font-mono">
                                    {new Date(post.createdAt).toLocaleDateString('fr-FR')}
                                </p>
                            </div>
                            <FollowButton
                                targetUserId={post.author.id}
                                targetUsername={post.author.username}
                            />
                        </div>

                        {/* Marketplace Item Details */}
                        {isMarketplace && post.content.marketplaceItem && (
                            <div className="mb-3 p-3 bg-neonPink/5 border border-neonPink/20 rounded-lg">
                                <h4 className="font-bold text-white mb-1 flex items-center gap-2">
                                    <ShoppingBag size={14} className="text-neonPink" />
                                    {post.content.marketplaceItem.title}
                                </h4>
                                <p className="text-2xl font-display font-bold text-neonPink mb-2">
                                    {post.content.marketplaceItem.price.toFixed(2)} {post.content.marketplaceItem.currency}
                                </p>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-xs px-2 py-1 bg-neonPurple/20 text-neonPurple rounded-full border border-neonPurple/30 font-mono">
                                        {post.content.marketplaceItem.category}
                                    </span>
                                    {post.content.marketplaceItem.whatsappNumber && (
                                        <a
                                            href={`https://wa.me/${post.content.marketplaceItem.whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                                                `Bonjour ${post.author.username}! 👋\n\nJe suis intéressé(e) par:\n📦 ${post.content.marketplaceItem.title}\n💰 ${post.content.marketplaceItem.price} ${post.content.marketplaceItem.currency}\n\nEst-il toujours disponible?\n\nMerci!`
                                            )}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            onClick={(e) => e.stopPropagation()}
                                            className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 bg-gradient-to-r from-green-500/20 to-green-600/20 text-green-400 rounded-full border border-green-500/40 font-mono hover:from-green-500/30 hover:to-green-600/30 hover:border-green-500/60 transition-all hover:shadow-[0_0_15px_rgba(34,197,94,0.3)]"
                                        >
                                            Contact WhatsApp
                                        </a>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Caption */}
                        <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                            {post.content.caption}
                        </p>

                        {/* Actions */}
                        <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between text-gray-400">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={handleLike}
                                    disabled={!user}
                                    className={`flex items-center gap-1.5 transition-colors group/btn ${liked
                                        ? 'text-neonPink'
                                        : 'hover:text-neonPink'
                                        } disabled:cursor-not-allowed disabled:opacity-50`}
                                >
                                    <Heart
                                        size={18}
                                        className={liked ? 'fill-neonPink' : 'group-hover/btn:fill-neonPink/50'}
                                    />
                                    <span className="text-sm font-mono">{likeCount}</span>
                                </button>
                                <button
                                    onClick={() => onCommentClick && onCommentClick(post)}
                                    className="flex items-center gap-1.5 hover:text-cyanLight transition-colors cursor-pointer"
                                >
                                    <MessageCircle size={18} />
                                    <span className="text-sm font-mono">{post.comments}</span>
                                </button>
                            </div>

                            {isOwnPost && (
                                <button
                                    onClick={handleDelete}
                                    disabled={isDeleting}
                                    className="text-gray-600 hover:text-red-500 transition-colors"
                                >
                                    <Trash2 size={16} />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Product/Media Preview Modal */}
            <ProductPreviewModal
                isOpen={isPreviewOpen}
                onClose={() => setIsPreviewOpen(false)}
                item={post.content.marketplaceItem}
                description={post.content.caption}
                imageUrl={post.content.mediaUrl}
                authorName={post.author.username}
                postId={post.id}
            />
        </>
    );
};

export default CommunityPost;
