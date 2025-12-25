import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, MessageCircle, ShoppingBag, Image as ImageIcon, Video, Tag, Trash2, Eye } from 'lucide-react';
import { CommunityPost as CommunityPostType } from '../types';
import { toggleLike, hasUserLikedPost, deletePost } from '../services/communityService';
import { useAuth } from '../context/AuthContext';
import ProductPreviewModal from './ProductPreviewModal';
import { toast } from 'sonner';

interface CommunityPostProps {
    post: CommunityPostType;
    onDelete?: (postId: string) => void;
    onCommentClick?: (post: CommunityPostType) => void;
}

const CommunityPost: React.FC<CommunityPostProps> = ({ post, onDelete, onCommentClick }) => {
    const { user } = useAuth();
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

    const handleLike = async () => {
        if (!user) return;

        try {
            const isLiked = await toggleLike(post.id, user.id);
            setLiked(isLiked);
            setLikeCount(prev => isLiked ? prev + 1 : prev - 1);
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
                className={`group bg-midnight/40 border border-white/10 rounded-xl overflow-hidden hover:border-neonPink/30 transition-all duration-300 hover:shadow-[0_0_30px_rgba(247,37,133,0.15)] ${isDeleting ? 'opacity-50 pointer-events-none' : ''
                    }`}
            >

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
                                className="w-full h-full object-cover"
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

                    {/* Type Badge */}
                    <div className="absolute top-3 right-3 px-3 py-1 bg-black/60 backdrop-blur-sm rounded-full border border-white/20 text-xs font-mono text-white flex items-center gap-1.5">
                        {post.type === 'image' && <ImageIcon size={12} />}
                        {post.type === 'video' && <Video size={12} />}
                        {post.type === 'marketplace' && <Tag size={12} />}
                        <span className="uppercase tracking-wider">
                            {post.type === 'marketplace' ? 'Vente' : post.type}
                        </span>
                    </div>

                    {/* Delete Button for Own Posts */}
                    {isOwnPost && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleDelete();
                            }}
                            disabled={isDeleting}
                            className="absolute top-3 left-3 p-2 bg-red-500/80 hover:bg-red-600 backdrop-blur-sm rounded-full border border-white/20 text-white transition-all opacity-100 z-20"
                            title="Supprimer"
                        >
                            <Trash2 size={16} />
                        </button>
                    )}

                    {/* Hover Overlay with Preview Button - Only for Marketplace */}
                    {isMarketplace && (
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsPreviewOpen(true);
                                }}
                                className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/30 rounded-full backdrop-blur-md text-white font-display font-bold tracking-wide transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 flex items-center gap-2"
                            >
                                <Eye size={18} />
                                APERÇU
                            </button>
                        </div>
                    )}
                </div>

                {/* Post Content */}
                <div className="p-4">
                    {/* Author Info */}
                    <div className="flex items-center gap-2 mb-3">
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
                                {/* WhatsApp Contact Button */}
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
                                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                        </svg>
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
                    <div className="flex items-center gap-4 text-gray-400">
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
