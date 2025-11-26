import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Users, Plus, Lock, LogIn, Image as ImageIcon, ShoppingBag, Sparkles, Loader2 } from 'lucide-react';
import CommunityPost from './CommunityPost';
import CreatePostModal from './CreatePostModal';
import PostModal from './PostModal';
import { CommunityPost as CommunityPostType, PostType } from '../types';
import { getPosts } from '../services/communityService';

interface CommunityProps {
    onOpenAuth?: () => void;
}

const Community: React.FC<CommunityProps> = ({ onOpenAuth }) => {
    const { user } = useAuth();
    const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
    const [posts, setPosts] = useState<CommunityPostType[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState<PostType | 'all'>('all');
    const [hasMore, setHasMore] = useState(true);
    const [currentOffset, setCurrentOffset] = useState(0);
    const [selectedPost, setSelectedPost] = useState<CommunityPostType | null>(null);
    const POSTS_PER_PAGE = 9;

    // Fetch posts on mount and when filter changes
    useEffect(() => {
        if (user) {
            loadInitialPosts();
        }
    }, [user, activeFilter]);

    const loadInitialPosts = async () => {
        try {
            setIsLoading(true);
            const filters: any = {
                limit: POSTS_PER_PAGE,
                offset: 0
            };

            if (activeFilter !== 'all') {
                filters.type = activeFilter;
            }

            const fetchedPosts = await getPosts(filters);
            setPosts(fetchedPosts);
            setCurrentOffset(POSTS_PER_PAGE);
            setHasMore(fetchedPosts.length === POSTS_PER_PAGE);
        } catch (error) {
            console.error('Error loading posts:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const loadMorePosts = async () => {
        try {
            setIsLoading(true);
            const filters: any = {
                limit: POSTS_PER_PAGE,
                offset: currentOffset
            };

            if (activeFilter !== 'all') {
                filters.type = activeFilter;
            }

            const morePosts = await getPosts(filters);
            setPosts([...posts, ...morePosts]);
            setCurrentOffset(currentOffset + POSTS_PER_PAGE);
            setHasMore(morePosts.length === POSTS_PER_PAGE);
        } catch (error) {
            console.error('Error loading more posts:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handlePostCreated = (newPost: CommunityPostType) => {
        // Add new post to the beginning of the list
        setPosts([newPost, ...posts]);
    };

    const handlePostDeleted = (postId: string) => {
        setPosts(posts.filter(p => p.id !== postId));
    };

    const handleFilterChange = (filter: PostType | 'all') => {
        setActiveFilter(filter);
        setCurrentOffset(0);
    };

    const handleCommentClick = (post: CommunityPostType) => {
        setSelectedPost(post);
    };

    return (
        <section id="community" className="py-24 bg-obsidian relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-1/4 left-0 w-[600px] h-[600px] bg-neonPink/5 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-1/4 right-0 w-[600px] h-[600px] bg-neonPurple/5 blur-[120px] rounded-full pointer-events-none" />

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full border border-neonPink/30 bg-neonPink/10 text-neonPink text-xs font-mono tracking-widest uppercase">
                        <Users size={14} />
                        <span>Communauté Otaku</span>
                    </div>

                    <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">
                        COMMUNAUTÉ <span className="text-transparent bg-clip-text bg-gradient-to-r from-neonPink to-neonPurple">CRÉATIVE</span>
                    </h2>
                    <p className="text-gray-400 font-jp tracking-wider mb-8">コミュニティスペース</p>

                    {user && (
                        <button
                            onClick={() => setIsCreatePostOpen(true)}
                            className="bg-gradient-to-r from-neonPurple to-neonPink text-white font-bold px-6 py-3 rounded-lg shadow-[0_0_20px_rgba(247,37,133,0.4)] hover:shadow-[0_0_30px_rgba(247,37,133,0.6)] hover:scale-105 transition-all inline-flex items-center gap-2"
                        >
                            <Plus size={20} />
                            <span>CRÉER UN POST</span>
                        </button>
                    )}
                </div>

                {/* Content */}
                {!user ? (
                    // Authentication Prompt for Non-Logged Users
                    <div className="max-w-2xl mx-auto text-center py-16">
                        <div className="mb-8 mx-auto w-24 h-24 bg-neonPurple/10 rounded-full flex items-center justify-center border border-neonPurple/30">
                            <Lock className="w-12 h-12 text-neonPurple" />
                        </div>

                        <h3 className="text-3xl font-display font-bold text-white mb-4">
                            REJOIGNEZ LA COMMUNAUTÉ
                        </h3>

                        <p className="text-gray-400 mb-8 leading-relaxed text-lg">
                            Connectez-vous pour accéder à la communauté, partager vos créations,
                            découvrir du contenu exclusif et acheter/vendre des articles otaku.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                            {[
                                { icon: ImageIcon, title: 'Partager', desc: 'Images & Vidéos' },
                                { icon: ShoppingBag, title: 'Acheter/Vendre', desc: 'Marketplace' },
                                { icon: Sparkles, title: 'Découvrir', desc: 'Contenu Exclusif' }
                            ].map((feature, i) => (
                                <div key={i} className="p-6 bg-midnight/50 border border-white/10 rounded-xl">
                                    <feature.icon className="w-8 h-8 text-cyanLight mx-auto mb-3" />
                                    <h4 className="font-display font-bold text-white mb-1">{feature.title}</h4>
                                    <p className="text-sm text-gray-500">{feature.desc}</p>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={onOpenAuth}
                            className="bg-gradient-to-r from-neonPurple to-neonPink text-white font-bold py-4 px-8 rounded-lg shadow-[0_0_20px_rgba(247,37,133,0.4)] hover:shadow-[0_0_30px_rgba(247,37,133,0.6)] hover:scale-105 transition-all inline-flex items-center gap-2"
                        >
                            <LogIn size={20} />
                            <span>SE CONNECTER</span>
                        </button>
                    </div>
                ) : (
                    // Community Posts Grid for Authenticated Users
                    <>
                        {/* Tab Navigation */}
                        <div className="flex justify-center gap-4 mb-12 flex-wrap">
                            {[
                                { label: 'Tout', value: 'all' as const },
                                { label: 'Galerie', value: 'image' as const },
                                { label: 'Vidéos', value: 'video' as const },
                                { label: 'Marketplace', value: 'marketplace' as const }
                            ].map((tab) => (
                                <button
                                    key={tab.value}
                                    onClick={() => handleFilterChange(tab.value)}
                                    className={`px-6 py-2 rounded-full border transition-all font-mono text-sm ${activeFilter === tab.value
                                        ? 'border-neonPink bg-neonPink/20 text-neonPink'
                                        : 'border-white/10 text-gray-400 hover:text-white hover:border-neonPink/50'
                                        }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Loading State */}
                        {isLoading && posts.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-20">
                                <Loader2 className="w-12 h-12 text-neonPink animate-spin mb-4" />
                                <p className="text-gray-400 font-mono">Chargement des posts...</p>
                            </div>
                        )}

                        {/* Posts Grid */}
                        {!isLoading && posts.length === 0 && (
                            <div className="text-center py-20">
                                <p className="text-gray-400 text-lg mb-4">Aucun post pour le moment</p>
                                <p className="text-gray-500 text-sm">Soyez le premier à partager du contenu !</p>
                            </div>
                        )}

                        {posts.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {posts.map((post) => (
                                    <CommunityPost
                                        key={post.id}
                                        post={post}
                                        onDelete={handlePostDeleted}
                                        onCommentClick={handleCommentClick}
                                    />
                                ))}
                            </div>
                        )}

                        {/* Load More Button */}
                        {hasMore && posts.length > 0 && (
                            <div className="text-center mt-12">
                                <button
                                    onClick={loadMorePosts}
                                    disabled={isLoading}
                                    className="px-8 py-3 border border-white/20 text-white font-display font-bold tracking-wide rounded-lg hover:bg-white/5 transition-all backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            <span>CHARGEMENT...</span>
                                        </>
                                    ) : (
                                        <span>CHARGER PLUS</span>
                                    )}
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Create Post Modal */}
            <CreatePostModal
                isOpen={isCreatePostOpen}
                onClose={() => setIsCreatePostOpen(false)}
                onPostCreated={handlePostCreated}
            />

            {/* Post/Comment Modal */}
            <PostModal
                isOpen={!!selectedPost}
                onClose={() => setSelectedPost(null)}
                post={selectedPost}
                onOpenAuth={onOpenAuth || (() => { })}
            />
        </section>
    );
};

export default Community;
