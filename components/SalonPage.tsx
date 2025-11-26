import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Swords, MessageSquare, ThumbsUp, User, Plus, X, Send, Loader, Trash2 } from 'lucide-react';
import FloatingChat from './FloatingChat';
import { useAuth } from '../context/AuthContext';
import { Duel, DuelComment } from '../types';
import * as salonService from '../services/salonService';
import * as userService from '../services/userService';

const SalonPage: React.FC = () => {
    const { user } = useAuth();
    const [duel, setDuel] = useState<Duel | null>(null);
    const [loading, setLoading] = useState(true);
    const [hasVoted, setHasVoted] = useState(false);
    const [selectedCandidate, setSelectedCandidate] = useState<'A' | 'B' | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [comments, setComments] = useState<DuelComment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [users, setUsers] = useState<userService.User[]>([]);

    const [newDuelData, setNewDuelData] = useState({
        player1UserId: '',
        player1ImageSource: 'file' as 'file' | 'url',
        player1Image: null as File | null,
        player1ImageUrl: '',
        player1Desc: '',
        player2UserId: '',
        player2ImageSource: 'file' as 'file' | 'url',
        player2Image: null as File | null,
        player2ImageUrl: '',
        player2Desc: ''
    });

    useEffect(() => {
        loadDuel();
        loadUsers();
    }, []);

    useEffect(() => {
        if (duel && user) {
            checkUserVote();
        }
    }, [duel, user]);

    const loadUsers = async () => {
        const allUsers = await userService.getAllUsers();
        setUsers(allUsers);
    };

    const loadDuel = async () => {
        setLoading(true);
        const activeDuel = await salonService.getActiveDuel();
        if (activeDuel) {
            setDuel(activeDuel);
            loadComments(activeDuel.id);
        }
        setLoading(false);
    };

    const loadComments = async (duelId: string) => {
        const commentsData = await salonService.getComments(duelId);
        setComments(commentsData);
    };

    const checkUserVote = async () => {
        if (!duel || !user) return;
        const vote = await salonService.hasUserVoted(duel.id, user.id);
        if (vote) {
            setSelectedCandidate(vote as 'A' | 'B');
            setHasVoted(true);
        }
    };

    const handleVote = async (candidate: 'A' | 'B') => {
        if (hasVoted || !duel || !user) return;
        const success = await salonService.voteDuel(duel.id, user.id, candidate);
        if (success) {
            setSelectedCandidate(candidate);
            setHasVoted(true);
            loadDuel();
        }
    };

    const handleCreateDuel = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        if (!newDuelData.player1UserId || !newDuelData.player2UserId) {
            alert('Veuillez sélectionner les deux joueurs');
            return;
        }

        if (!newDuelData.player1Image && !newDuelData.player1ImageUrl) {
            alert('Veuillez fournir une image pour le joueur 1');
            return;
        }

        if (!newDuelData.player2Image && !newDuelData.player2ImageUrl) {
            alert('Veuillez fournir une image pour le joueur 2');
            return;
        }

        setIsSubmitting(true);
        const success = await salonService.createDuel(
            newDuelData.player1UserId,
            newDuelData.player1Image || newDuelData.player1ImageUrl,
            newDuelData.player1Desc,
            newDuelData.player2UserId,
            newDuelData.player2Image || newDuelData.player2ImageUrl,
            newDuelData.player2Desc,
            user.id
        );

        if (success) {
            setIsCreateModalOpen(false);
            setNewDuelData({
                player1UserId: '', player1ImageSource: 'file', player1Image: null, player1ImageUrl: '', player1Desc: '',
                player2UserId: '', player2ImageSource: 'file', player2Image: null, player2ImageUrl: '', player2Desc: ''
            });
            setHasVoted(false);
            setSelectedCandidate(null);
            await loadDuel();
        }
        setIsSubmitting(false);
    };

    const handlePostComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim() || !user || !duel) return;

        setIsSubmitting(true);
        const comment = await salonService.addComment(duel.id, user.id, user.email?.split('@')[0] || 'Anonyme', newComment);
        if (comment) {
            setComments(prev => [comment, ...prev]);
            setNewComment('');
        }
        setIsSubmitting(false);
    };

    const handleDeleteComment = async (commentId: string) => {
        if (!user) return;

        if (!confirm('Êtes-vous sûr de vouloir supprimer ce commentaire ?')) {
            return;
        }

        const success = await salonService.deleteComment(commentId, user.id);
        if (success) {
            setComments(prev => prev.filter(c => c.id !== commentId));
        } else {
            alert('Erreur lors de la suppression du commentaire');
        }
    };

    const getTimeAgo = (date: Date): string => {
        const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
        if (seconds < 60) return 'À l\'instant';
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `Il y a ${minutes}min`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `Il y a ${hours}h`;
        const days = Math.floor(hours / 24);
        return `Il y a ${days}j`;
    };

    if (loading) return (
        <div className="min-h-screen pt-24 pb-12 px-6 flex items-center justify-center">
            <Loader className="w-12 h-12 text-neonPink animate-spin" />
        </div>
    );

    if (!duel) return (
        <div className="min-h-screen pt-24 pb-12 px-6 flex items-center justify-center">
            <p className="text-gray-400">Aucun duel actif pour le moment.</p>
        </div>
    );

    const totalVotes = duel.votesA + duel.votesB;
    const percentA = totalVotes === 0 ? 0 : Math.round((duel.votesA / totalVotes) * 100);
    const percentB = totalVotes === 0 ? 0 : Math.round((duel.votesB / totalVotes) * 100);

    return (
        <div className="min-h-screen pt-24 pb-12 px-6 max-w-7xl mx-auto">
            <div className="text-center mb-16">
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neonPurple/10 border border-neonPurple/30 text-neonPurple mb-4">
                    <Swords size={20} />
                    <span className="font-mono uppercase tracking-widest text-sm">Zone de Duel</span>
                </motion.div>
                <h1 className="text-5xl md:text-7xl font-display font-black text-white mb-6 tracking-tighter">
                    LE SALON <span className="text-transparent bg-clip-text bg-gradient-to-r from-neonPink to-neonPurple">VERSUS</span>
                </h1>
                <p className="text-gray-400 max-w-2xl mx-auto text-lg mb-8">
                    Chaque week-end, deux légendes s'affrontent. La communauté décide. Le vainqueur règne sur la page d'accueil toute la semaine.
                </p>
                {user && (
                    <button onClick={() => setIsCreateModalOpen(true)} className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/20 rounded-full text-white font-display font-bold tracking-wide transition-all hover:scale-105">
                        <Plus size={18} />
                        CRÉER UN DUEL
                    </button>
                )}
            </div>

            <div className="relative grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-20 items-center mb-20">
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center">
                    <div className="w-20 h-20 bg-black border-2 border-white/20 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                        <span className="font-display font-black text-3xl text-white italic">VS</span>
                    </div>
                </div>
                <CandidateCard candidate={duel.candidateA} votes={duel.votesA} percent={percentA} hasVoted={hasVoted} onVote={() => handleVote('A')} isWinner={hasVoted && duel.votesA > duel.votesB} color="neonPink" canVote={!!user} />
                <CandidateCard candidate={duel.candidateB} votes={duel.votesB} percent={percentB} hasVoted={hasVoted} onVote={() => handleVote('B')} isWinner={hasVoted && duel.votesB > duel.votesA} color="cyanLight" canVote={!!user} />
            </div>

            <div className="max-w-3xl mx-auto bg-midnight/30 border border-white/10 rounded-2xl p-8 backdrop-blur-sm mb-20">
                <div className="flex items-center gap-3 mb-8">
                    <MessageSquare className="text-white" />
                    <h3 className="text-2xl font-display font-bold text-white">Débats de la Communauté</h3>
                </div>
                {user && (
                    <form onSubmit={handlePostComment} className="mb-8 flex gap-4">
                        <input type="text" value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Ajouter un argument..." disabled={isSubmitting} className="flex-1 bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-neonPurple/50 transition-colors disabled:opacity-50" />
                        <button type="submit" disabled={!newComment.trim() || isSubmitting} className="px-6 py-3 bg-neonPurple/20 hover:bg-neonPurple/40 text-neonPurple border border-neonPurple/30 rounded-xl font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                            {isSubmitting ? <Loader size={20} className="animate-spin" /> : <Send size={20} />}
                        </button>
                    </form>
                )}
                <div className="space-y-6">
                    {comments.map(comment => (
                        <Comment
                            key={comment.id}
                            author={comment.authorName}
                            text={comment.text}
                            time={getTimeAgo(comment.createdAt)}
                            userId={comment.userId}
                            currentUserId={user?.id}
                            onDelete={() => handleDeleteComment(comment.id)}
                        />
                    ))}
                </div>
            </div>

            <AnimatePresence>
                {isCreateModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsCreateModalOpen(false)} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
                        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-2xl bg-[#111] border border-white/10 rounded-2xl p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
                            <button onClick={() => setIsCreateModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X size={24} /></button>
                            <h2 className="text-3xl font-display font-bold text-white mb-6">Nouveau Duel</h2>

                            <form onSubmit={handleCreateDuel} className="space-y-6">
                                <div className="p-4 border border-neonPink/30 rounded-lg bg-neonPink/5">
                                    <h3 className="text-lg font-display font-bold text-neonPink mb-4">Joueur 1</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-mono text-gray-400 mb-2">Sélectionner un utilisateur</label>
                                            <select required value={newDuelData.player1UserId} onChange={e => setNewDuelData({ ...newDuelData, player1UserId: e.target.value })} className="w-full bg-gradient-to-r from-black/80 to-black/60 border border-neonPink/30 rounded-lg px-4 py-3 text-white focus:border-neonPink focus:ring-2 focus:ring-neonPink/20 outline-none transition-all">
                                                <option value="" className="bg-black">Choisir un joueur...</option>
                                                {users.map(u => <option key={u.id} value={u.id} className="bg-black py-2">{u.username || u.email}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-mono text-gray-400 mb-2">Source de l'image</label>
                                            <div className="flex gap-4 mb-3">
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <input type="radio" name="p1src" checked={newDuelData.player1ImageSource === 'file'} onChange={() => setNewDuelData({ ...newDuelData, player1ImageSource: 'file', player1ImageUrl: '' })} className="text-neonPink" />
                                                    <span className="text-white text-sm">Upload</span>
                                                </label>
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <input type="radio" name="p1src" checked={newDuelData.player1ImageSource === 'url'} onChange={() => setNewDuelData({ ...newDuelData, player1ImageSource: 'url', player1Image: null })} className="text-neonPink" />
                                                    <span className="text-white text-sm">URL</span>
                                                </label>
                                            </div>
                                            {newDuelData.player1ImageSource === 'file' ? (
                                                <input type="file" required={newDuelData.player1ImageSource === 'file'} accept="image/*" onChange={e => setNewDuelData({ ...newDuelData, player1Image: e.target.files?.[0] || null })} className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-neonPink/20 file:text-neonPink hover:file:bg-neonPink/30" />
                                            ) : (
                                                <input type="url" required={newDuelData.player1ImageSource === 'url'} value={newDuelData.player1ImageUrl} onChange={e => setNewDuelData({ ...newDuelData, player1ImageUrl: e.target.value })} placeholder="https://..." className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-neonPink/50 outline-none" />
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-mono text-gray-400 mb-2">Description / Argument</label>
                                            <textarea required value={newDuelData.player1Desc} onChange={e => setNewDuelData({ ...newDuelData, player1Desc: e.target.value })} className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-neonPink/50 outline-none h-24 resize-none" placeholder="Pourquoi ce joueur devrait gagner ?" />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-center">
                                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                                    <span className="px-4 text-white font-display font-bold text-xl">VS</span>
                                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                                </div>

                                <div className="p-4 border border-cyanLight/30 rounded-lg bg-cyanLight/5">
                                    <h3 className="text-lg font-display font-bold text-cyanLight mb-4">Joueur 2</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-mono text-gray-400 mb-2">Sélectionner un utilisateur</label>
                                            <select required value={newDuelData.player2UserId} onChange={e => setNewDuelData({ ...newDuelData, player2UserId: e.target.value })} className="w-full bg-gradient-to-r from-black/80 to-black/60 border border-cyanLight/30 rounded-lg px-4 py-3 text-white focus:border-cyanLight focus:ring-2 focus:ring-cyanLight/20 outline-none transition-all">
                                                <option value="" className="bg-black">Choisir un joueur...</option>
                                                {users.map(u => <option key={u.id} value={u.id} className="bg-black py-2">{u.username || u.email}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-mono text-gray-400 mb-2">Source de l'image</label>
                                            <div className="flex gap-4 mb-3">
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <input type="radio" name="p2src" checked={newDuelData.player2ImageSource === 'file'} onChange={() => setNewDuelData({ ...newDuelData, player2ImageSource: 'file', player2ImageUrl: '' })} className="text-cyanLight" />
                                                    <span className="text-white text-sm">Upload</span>
                                                </label>
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <input type="radio" name="p2src" checked={newDuelData.player2ImageSource === 'url'} onChange={() => setNewDuelData({ ...newDuelData, player2ImageSource: 'url', player2Image: null })} className="text-cyanLight" />
                                                    <span className="text-white text-sm">URL</span>
                                                </label>
                                            </div>
                                            {newDuelData.player2ImageSource === 'file' ? (
                                                <input type="file" required={newDuelData.player2ImageSource === 'file'} accept="image/*" onChange={e => setNewDuelData({ ...newDuelData, player2Image: e.target.files?.[0] || null })} className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-cyanLight/20 file:text-cyanLight hover:file:bg-cyanLight/30" />
                                            ) : (
                                                <input type="url" required={newDuelData.player2ImageSource === 'url'} value={newDuelData.player2ImageUrl} onChange={e => setNewDuelData({ ...newDuelData, player2ImageUrl: e.target.value })} placeholder="https://..." className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-cyanLight/50 outline-none" />
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-mono text-gray-400 mb-2">Description / Argument</label>
                                            <textarea required value={newDuelData.player2Desc} onChange={e => setNewDuelData({ ...newDuelData, player2Desc: e.target.value })} className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-cyanLight/50 outline-none h-24 resize-none" placeholder="Pourquoi ce joueur devrait gagner ?" />
                                        </div>
                                    </div>
                                </div>

                                <button type="submit" disabled={isSubmitting} className="w-full py-4 bg-gradient-to-r from-neonPink to-neonPurple text-white font-bold tracking-widest rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2">
                                    {isSubmitting ? <Loader className="animate-spin" size={20} /> : 'LANCER LE DUEL'}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
            <FloatingChat />
        </div>
    );
};

const CandidateCard: React.FC<{ candidate: { name: string; image: string; description: string }; votes: number; percent: number; hasVoted: boolean; onVote: () => void; isWinner: boolean; color: string; canVote: boolean }> = ({ candidate, votes, percent, hasVoted, onVote, isWinner, color, canVote }) => (
    <motion.div whileHover={{ scale: 1.02 }} className={`relative group rounded-2xl overflow-hidden border-2 transition-all duration-500 ${hasVoted && isWinner ? `border-${color} shadow-[0_0_30px_rgba(var(--${color}),0.3)]` : 'border-white/10 hover:border-white/30'}`}>
        <div className="aspect-[3/4] relative">
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10 opacity-80" />
            <img src={candidate.image} alt={candidate.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
            <div className="absolute bottom-0 left-0 right-0 p-8 z-20">
                <h2 className="text-4xl font-display font-black text-white mb-2 uppercase italic">{candidate.name}</h2>
                <p className="text-gray-300 mb-6 font-jp tracking-wide">{candidate.description}</p>
                {!hasVoted && canVote ? (
                    <button onClick={onVote} className={`w-full py-4 bg-white/10 hover:bg-${color} border border-white/20 hover:border-${color} backdrop-blur-md rounded-xl text-white font-bold tracking-widest transition-all duration-300 flex items-center justify-center gap-2 group/btn`}>
                        <ThumbsUp size={18} className="group-hover/btn:scale-110 transition-transform" />
                        VOTER
                    </button>
                ) : (
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm font-mono text-gray-400">
                            <span>{votes} votes</span>
                            <span>{percent}%</span>
                        </div>
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                            <motion.div initial={{ width: 0 }} animate={{ width: `${percent}%` }} transition={{ duration: 1, ease: "easeOut" }} className={`h-full bg-${color}`} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    </motion.div>
);

const Comment = ({ author, text, time, userId, currentUserId, onDelete }: { author: string; text: string; time: string; userId: string; currentUserId?: string; onDelete: () => void }) => (
    <div className="flex gap-4 p-4 rounded-xl bg-white/5 border border-white/5 group">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
            <User size={16} className="text-gray-400" />
        </div>
        <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
                <span className="font-bold text-white text-sm">{author}</span>
                <span className="text-xs text-gray-500 font-mono">{time}</span>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">{text}</p>
        </div>
        {userId === currentUserId && (
            <button
                onClick={onDelete}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-400 p-2 hover:bg-red-500/10 rounded-lg"
                title="Supprimer le commentaire"
            >
                <Trash2 size={16} />
            </button>
        )}
    </div>
);

export default SalonPage;
