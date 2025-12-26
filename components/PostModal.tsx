import React, { useState, useEffect } from 'react';
import { X, Heart, MessageCircle, Send, User, ShoppingBag } from 'lucide-react';
import { CommunityPost } from '../types';
import { useAuth } from '../context/AuthContext';
import * as communityService from '../services/communityService';

interface PostModalProps {
    isOpen: boolean;
    onClose: () => void;
    post: CommunityPost | null;
    onOpenAuth: () => void;
    onCommentChange?: (postId: string, newCount: number) => void;
}

const PostModal: React.FC<PostModalProps> = ({ isOpen, onClose, post, onOpenAuth, onCommentChange }) => {
    const { user } = useAuth();
    const [postComments, setPostComments] = useState<any[]>([]);
    const [newComment, setNewComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen && post) {
            loadComments();
        } else {
            setPostComments([]);
            setNewComment('');
        }
    }, [isOpen, post]);

    const loadComments = async () => {
        if (!post) return;
        try {
            const comments = await communityService.getCommentsByPost(post.id);
            setPostComments(comments);
        } catch (error) {
            console.error('Error loading comments:', error);
            setPostComments([]);
        }
    };

    const handleAddComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim() || !user || !post) return;

        setIsSubmitting(true);
        try {
            await communityService.addComment(post.id, user.id, newComment);
            await loadComments();
            // Notify parent
            if (onCommentChange) {
                const updatedCount = postComments.length + 1; // optimistic or fetch? postComments is updated by loadComments? No, loadComments is async.
                // Wait for loadComments to finish?
                // Actually loadComments sets state.
                // Let's just pass the incremented count or fetch fresh.
                // Safer to just increment current length + 1
                onCommentChange(post.id, postComments.length + 1);
            }
            setNewComment('');
        } catch (error: any) {
            console.error('Error adding comment:', error);
            alert(`Erreur lors de l'ajout du commentaire: ${error.message || 'Erreur inconnue'}`);
        }
        setIsSubmitting(false);
    };

    const handleDeleteComment = async (commentId: string) => {
        if (!user || !confirm('Êtes-vous sûr de vouloir supprimer ce commentaire ?')) return;
        try {
            await communityService.deleteComment(commentId, user.id);
            await loadComments();
            if (onCommentChange) {
                onCommentChange(post.id, Math.max(0, postComments.length - 1));
            }
        } catch (error: any) {
            alert(error.message);
        }
    };

    const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
    const [editCommentText, setEditCommentText] = useState('');

    const startEditing = (comment: any) => {
        setEditingCommentId(comment.id);
        setEditCommentText(comment.text);
    };

    const cancelEditing = () => {
        setEditingCommentId(null);
        setEditCommentText('');
    };

    const handleUpdateComment = async (commentId: string) => {
        if (!user || !editCommentText.trim()) return;
        try {
            await communityService.updateComment(commentId, user.id, editCommentText);
            setEditingCommentId(null);
            await loadComments();
        } catch (error: any) {
            alert(error.message);
        }
    };

    if (!isOpen || !post) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={onClose}>
            <div
                className="relative w-full max-w-3xl bg-midnight border border-white/10 rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 text-gray-400 hover:text-white bg-black/50 rounded-full p-2 transition-colors"
                >
                    <X size={20} />
                </button>

                {post.content.mediaUrl && (
                    <div className="aspect-video overflow-hidden bg-black">
                        {post.type === 'video' ? (
                            <video src={post.content.mediaUrl} controls className="w-full h-full object-cover" />
                        ) : (
                            <img src={post.content.mediaUrl} alt="" className="w-full h-full object-cover" />
                        )}
                    </div>
                )}

                <div className="p-8">
                    <div className="flex items-center gap-3 mb-6">
                        {post.author.avatarUrl ? (
                            <div className="w-12 h-12 rounded-full overflow-hidden border border-neonPink/50">
                                <img src={post.author.avatarUrl} alt={post.author.username} className="w-full h-full object-cover" />
                            </div>
                        ) : (
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-neonPink to-neonPurple flex items-center justify-center text-white font-bold">
                                {post.author.username.charAt(0).toUpperCase()}
                            </div>
                        )}
                        <div>
                            <p className="text-white font-bold">{post.author.username}</p>
                            <p className="text-gray-500 text-sm">
                                {new Date(post.createdAt).toLocaleDateString('fr-FR', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </p>
                        </div>
                    </div>

                    <p className="text-gray-300 text-lg mb-6">{post.content.caption}</p>

                    {post.type === 'marketplace' && post.content.marketplaceItem && (
                        <div className="mb-6 p-4 bg-neonPink/10 border border-neonPink/30 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-neonPink font-bold text-xl">
                                    {post.content.marketplaceItem.price} {post.content.marketplaceItem.currency}
                                </span>
                                <span className="text-sm text-gray-400 capitalize">{post.content.marketplaceItem.category}</span>
                            </div>
                            <h3 className="text-white font-bold mb-1 flex items-center gap-2">
                                <ShoppingBag size={18} />
                                {post.content.marketplaceItem.title}
                            </h3>
                            <p className="text-gray-400 text-sm">{post.content.marketplaceItem.description}</p>
                        </div>
                    )}

                    <div className="flex items-center gap-6 mb-8 text-gray-400">
                        <span className="flex items-center gap-2">
                            <Heart size={20} /> {post.likes} likes
                        </span>
                        <span className="flex items-center gap-2">
                            <MessageCircle size={20} /> {postComments.length} commentaires
                        </span>
                    </div>

                    <div className="border-t border-white/10 pt-6">
                        <h4 className="text-white font-bold mb-4 flex items-center gap-2">
                            <MessageCircle size={18} /> Commentaires
                        </h4>

                        {user ? (
                            <div className="mb-6">
                                <p className="text-xs text-gray-500 mb-2">
                                    Commenter en tant que <span className="text-neonPink">{user.email?.split('@')[0]}</span>
                                </p>
                                <form onSubmit={handleAddComment} className="flex gap-3">
                                    <input
                                        type="text"
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        placeholder="Ajouter un commentaire..."
                                        disabled={isSubmitting}
                                        className="flex-1 bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-neonPink/50 transition-colors disabled:opacity-50"
                                    />
                                    <button
                                        type="submit"
                                        disabled={!newComment.trim() || isSubmitting}
                                        className="px-6 py-3 bg-neonPink/20 hover:bg-neonPink/40 text-neonPink border border-neonPink/30 rounded-lg font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                    >
                                        <Send size={18} />
                                    </button>
                                </form>
                            </div>
                        ) : (
                            <div className="mb-6 text-center py-4 bg-white/5 rounded-lg border border-white/10">
                                <p className="text-gray-400 mb-3">Connectez-vous pour participer à la discussion</p>
                                <button
                                    onClick={() => { onClose(); onOpenAuth(); }}
                                    className="px-6 py-2 bg-neonPink/20 hover:bg-neonPink/40 text-neonPink border border-neonPink/30 rounded-lg font-bold transition-colors"
                                >
                                    Se connecter
                                </button>
                            </div>
                        )}

                        <div className="space-y-4 max-h-96 overflow-y-auto custom-scrollbar">
                            {postComments.length > 0 ? (
                                postComments.map((comment) => (
                                    <div key={comment.id} className="flex gap-3 p-3 rounded-lg bg-white/5 group">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center flex-shrink-0">
                                            {comment.avatar_url ? (
                                                <img src={comment.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                                            ) : (
                                                <User size={14} className="text-gray-400" />
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-white font-semibold text-sm">{comment.username || 'Utilisateur'}</span>
                                                    <span className="text-gray-500 text-xs">
                                                        {new Date(comment.created_at).toLocaleDateString('fr-FR', {
                                                            day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                                                        })}
                                                    </span>
                                                </div>
                                                {user && user.id === comment.user_id && (
                                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={() => startEditing(comment)}
                                                            className="text-xs text-cyanLight hover:underline"
                                                        >
                                                            Modifier
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteComment(comment.id)}
                                                            className="text-xs text-red-400 hover:underline"
                                                        >
                                                            Supprimer
                                                        </button>
                                                    </div>
                                                )}
                                            </div>

                                            {editingCommentId === comment.id ? (
                                                <div className="flex gap-2 mt-2">
                                                    <input
                                                        type="text"
                                                        value={editCommentText}
                                                        onChange={(e) => setEditCommentText(e.target.value)}
                                                        className="flex-1 bg-black/50 border border-white/20 rounded px-2 py-1 text-sm text-white"
                                                    />
                                                    <button onClick={() => handleUpdateComment(comment.id)} className="text-xs bg-neonPink/20 text-neonPink px-2 rounded">OK</button>
                                                    <button onClick={cancelEditing} className="text-xs bg-white/10 text-white px-2 rounded">Annuler</button>
                                                </div>
                                            ) : (
                                                <p className="text-gray-300 text-sm">{comment.text}</p>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500 text-center py-8">Aucun commentaire pour le moment</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PostModal;
