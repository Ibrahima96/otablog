import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, MessageCircle, ShoppingBag, Image as ImageIcon, Video, Tag, Trash2, Eye } from 'lucide-react';
import { CommunityPost as CommunityPostType } from '../types';
import { toggleLike, hasUserLikedPost, deletePost } from '../services/communityService';
import { useAuth } from '../context/AuthContext';
import ProductPreviewModal from './ProductPreviewModal';

interface CommunityPostProps {
    post: CommunityPostType;
    onDelete?: (postId: string) => void;
}

const CommunityPost: React.FC<CommunityPostProps> = ({ post, onDelete }) => {
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

        try {
            setIsDeleting(true);
            await deletePost(post.id, user.id);
            if (onDelete) {
                onDelete(post.id);
            }
        } catch (error) {
            console.error('Error deleting post:', error);
            alert('Erreur lors de la suppression du post');
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
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="absolute top-3 left-3 p-2 bg-red-500/80 hover:bg-red-600 backdrop-blur-sm rounded-full border border-white/20 text-white transition-all opacity-0 group-hover:opacity-100 z-20"
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
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-neonPink to-neonPurple flex items-center justify-center text-white text-xs font-bold">
                            {post.author.username.substring(0, 2).toUpperCase()}
                        </div>
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
                            <div className="flex items-center gap-2">
                                <span className="text-xs px-2 py-1 bg-neonPurple/20 text-neonPurple rounded-full border border-neonPurple/30 font-mono">
                                    {post.content.marketplaceItem.category}
                                </span>
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
                        <button className="flex items-center gap-1.5 hover:text-cyanLight transition-colors">
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
