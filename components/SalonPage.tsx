import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Swords, MessageSquare, ThumbsUp, User, Plus, X, Send, Loader, Trash2, Hash, ShoppingBag, Globe, MessageCircle, Menu, ChevronLeft, ChevronRight } from 'lucide-react';
import FloatingChat from './FloatingChat';
import ChatRoom from './ChatRoom';
import OnlineUsersList from './OnlineUsersList';
import { useAuth } from '../context/AuthContext';
import { Duel, DuelComment } from '../types';
import * as salonService from '../services/salonService';
import * as userService from '../services/userService';
import * as chatService from '../services/chatService';

const SalonPage: React.FC = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'versus' | 'ota' | 'commerce' | 'all-for-one' | 'private'>('versus');
    const [channels, setChannels] = useState<chatService.Channel[]>([]);
    const [privateChats, setPrivateChats] = useState<chatService.Channel[]>([]);
    const [activePrivateChatId, setActivePrivateChatId] = useState<string | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [sidebarTab, setSidebarTab] = useState<'users' | 'messages'>('users');

    // Versus State
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
        loadChannels();
        if (user) loadPrivateChats();
    }, [user]);

    useEffect(() => {
        if (duel && user) {
            checkUserVote();
        }
    }, [duel, user]);

    const loadChannels = async () => {
        const chans = await chatService.getChannels();
        setChannels(chans.filter(c => !c.slug.startsWith('private-'))); // Only public channels
    };

    const loadPrivateChats = async () => {
        const chats = await chatService.getMyPrivateChats();
        setPrivateChats(chats);
    };

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

    const handleUserClick = async (otherUserId: string) => {
        if (!user) {
            alert('Connectez-vous pour envoyer un message privé.');
            return;
        }

        const chatId = await chatService.createPrivateChat(otherUserId);
        if (chatId) {
            await loadPrivateChats();
            setActivePrivateChatId(chatId);
            setActiveTab('private');
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

    const getChannelBySlug = (slug: string) => channels.find(c => c.slug === slug);
    const getPrivateChatById = (id: string) => privateChats.find(c => c.id === id);

    return (
        <div className="min-h-screen pt-24 pb-12 px-6 max-w-[1600px] mx-auto flex gap-6">
            {/* Sidebar (Desktop) */}
            <div className="hidden lg:block w-80 flex-shrink-0 space-y-6">
                <OnlineUsersList onUserClick={handleUserClick} />

                {/* Private Chats List */}
                {user && privateChats.length > 0 && (
                    <div className="bg-midnight/30 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-sm p-4">
                        <h3 className="text-lg font-display font-bold text-white mb-4 flex items-center gap-2">
                            <MessageCircle size={20} className="text-neonPink" />
                            Mes Messages
                        </h3>
                        <div className="space-y-2">
                            {privateChats.map(chat => (
                                <button
                                    key={chat.id}
                                    onClick={() => { setActivePrivateChatId(chat.id); setActiveTab('private'); }}
                                    className={`w-full text-left p-3 rounded-xl transition-colors ${activePrivateChatId === chat.id && activeTab === 'private' ? 'bg-neonPink/20 border border-neonPink/30 text-white' : 'hover:bg-white/5 text-gray-300'}`}
                                >
                                    <p className="font-bold text-sm">{chat.name}</p>
                                    <p className="text-xs text-gray-500 truncate">Cliquez pour ouvrir</p>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Mobile Sidebar Drawer */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsSidebarOpen(false)}
                            className="fixed inset-0 bg-black/80 z-40 lg:hidden backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed top-0 left-0 bottom-0 w-80 bg-[#0a0a0a] border-r border-white/10 z-50 p-6 overflow-y-auto lg:hidden"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-display font-bold text-white">Menu</h2>
                                <button onClick={() => setIsSidebarOpen(false)} className="p-2 text-gray-400 hover:text-white">
                                    <ChevronLeft size={24} />
                                </button>
                            </div>

                            {/* Mobile Tabs */}
                            <div className="flex p-1 bg-white/5 rounded-xl mb-6">
                                <button
                                    onClick={() => setSidebarTab('users')}
                                    className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${sidebarTab === 'users' ? 'bg-neonPink text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                                >
                                    Utilisateurs
                                </button>
                                <button
                                    onClick={() => setSidebarTab('messages')}
                                    className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${sidebarTab === 'messages' ? 'bg-neonPurple text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                                >
                                    Messages
                                </button>
                            </div>

                            <div className="space-y-4">
                                {sidebarTab === 'users' ? (
                                    <OnlineUsersList onUserClick={(id) => { handleUserClick(id); setIsSidebarOpen(false); }} />
                                ) : (
                                    <div className="bg-midnight/30 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-sm p-4">
                                        <h3 className="text-lg font-display font-bold text-white mb-4 flex items-center gap-2">
                                            <MessageCircle size={20} className="text-neonPink" />
                                            Mes Messages
                                        </h3>
                                        {user && privateChats.length > 0 ? (
                                            <div className="space-y-2">
                                                {privateChats.map(chat => (
                                                    <button
                                                        key={chat.id}
                                                        onClick={() => { setActivePrivateChatId(chat.id); setActiveTab('private'); setIsSidebarOpen(false); }}
                                                        className={`w-full text-left p-3 rounded-xl transition-colors ${activePrivateChatId === chat.id && activeTab === 'private' ? 'bg-neonPink/20 border border-neonPink/30 text-white' : 'hover:bg-white/5 text-gray-300'}`}
                                                    >
                                                        <p className="font-bold text-sm">{chat.name}</p>
                                                        <p className="text-xs text-gray-500 truncate">Cliquez pour ouvrir</p>
                                                    </button>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-gray-400 text-sm italic">Aucun message privé.</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Main Content */}
            <div className="flex-1 min-w-0">
                <div className="relative text-center mb-8 md:mb-12 pt-4 md:pt-0">
                    <div className="lg:hidden absolute left-0 top-1/2 -translate-y-1/2">
                        <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-white hover:bg-white/10 rounded-xl transition-colors">
                            <ChevronRight size={28} />
                        </button>
                    </div>
                    <h1 className="text-4xl md:text-7xl font-display font-black text-white tracking-tighter inline-block">
                        LE <span className="text-transparent bg-clip-text bg-gradient-to-r from-neonPink to-neonPurple">SALON</span>
                    </h1>
                </div>

                <div className="flex flex-wrap justify-center gap-4 mb-8">
                    <button
                        onClick={() => setActiveTab('versus')}
                        className={`px-6 py-3 rounded-full font-bold tracking-wide transition-all flex items-center gap-2 ${activeTab === 'versus' ? 'bg-neonPink text-white shadow-[0_0_20px_rgba(247,37,133,0.4)]' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
                    >
                        <Swords size={18} /> VERSUS
                    </button>
                    <button
                        onClick={() => setActiveTab('ota')}
                        className={`px-6 py-3 rounded-full font-bold tracking-wide transition-all flex items-center gap-2 ${activeTab === 'ota' ? 'bg-neonPurple text-white shadow-[0_0_20px_rgba(114,9,183,0.4)]' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
                    >
                        <Hash size={18} /> SALON OTA
                    </button>
                    <button
                        onClick={() => setActiveTab('commerce')}
                        className={`px-6 py-3 rounded-full font-bold tracking-wide transition-all flex items-center gap-2 ${activeTab === 'commerce' ? 'bg-cyanLight text-black shadow-[0_0_20px_rgba(76,201,240,0.4)]' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
                    >
                        <ShoppingBag size={18} /> COMMERCE
                    </button>
                    <button
                        onClick={() => setActiveTab('all-for-one')}
                        className={`px-6 py-3 rounded-full font-bold tracking-wide transition-all flex items-center gap-2 ${activeTab === 'all-for-one' ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.4)]' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
                    >
                        <Globe size={18} /> ALL FOR ONE
                    </button>
                </div>

                <AnimatePresence mode="wait">
                    {activeTab === 'versus' ? (
                        <motion.div
                            key="versus"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            {loading ? (
                                <div className="flex justify-center py-20"><Loader className="animate-spin text-neonPink" /></div>
                            ) : !duel ? (
                                <div className="text-center py-20 text-gray-400">Aucun duel actif. <button onClick={() => setIsCreateModalOpen(true)} className="text-neonPink hover:underline">Créer un duel ?</button></div>
                            ) : (
                                <>
                                    <div className="text-center mb-8">
                                        <p className="text-gray-400 max-w-2xl mx-auto text-lg">
                                            Chaque week-end, deux légendes s'affrontent. La communauté décide.
                                        </p>
                                        {user && (
                                            <button onClick={() => setIsCreateModalOpen(true)} className="mt-4 inline-flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/20 rounded-full text-white font-display font-bold tracking-wide transition-all hover:scale-105">
                                                <Plus size={18} /> CRÉER UN DUEL
                                            </button>
                                        )}
                                    </div>

                                    <div className="relative grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-20 items-center mb-20">
                                        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center">
                                            <div className="w-20 h-20 bg-black border-2 border-white/20 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                                                <span className="font-display font-black text-3xl text-white italic">VS</span>
                                            </div>
                                        </div>
                                        <CandidateCard candidate={duel.candidateA} votes={duel.votesA} percent={duel.votesA + duel.votesB === 0 ? 0 : Math.round((duel.votesA / (duel.votesA + duel.votesB)) * 100)} hasVoted={hasVoted} onVote={() => handleVote('A')} isWinner={hasVoted && duel.votesA > duel.votesB} color="neonPink" canVote={!!user} />
                                        <CandidateCard candidate={duel.candidateB} votes={duel.votesB} percent={duel.votesA + duel.votesB === 0 ? 0 : Math.round((duel.votesB / (duel.votesA + duel.votesB)) * 100)} hasVoted={hasVoted} onVote={() => handleVote('B')} isWinner={hasVoted && duel.votesB > duel.votesA} color="cyanLight" canVote={!!user} />
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
                                </>
                            )}
                        </motion.div>
                    ) : activeTab === 'private' && activePrivateChatId ? (
                        <motion.div
                            key="private-chat"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                            className="max-w-4xl mx-auto"
                        >
                            {getPrivateChatById(activePrivateChatId) ? (
                                <ChatRoom channel={getPrivateChatById(activePrivateChatId)!} />
                            ) : (
                                <div className="text-center py-20 text-gray-400">Chat introuvable ou chargement...</div>
                            )}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="chat"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                            className="max-w-4xl mx-auto"
                        >
                            {getChannelBySlug(activeTab) ? (
                                <ChatRoom channel={getChannelBySlug(activeTab)!} />
                            ) : (
                                <div className="text-center py-20">
                                    <Loader className="animate-spin mx-auto mb-4 text-neonPink" />
                                    <p className="text-gray-400">Chargement du salon...</p>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div >

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
        </div >
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
