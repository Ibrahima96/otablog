import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Search, Filter, TrendingUp, Tag, X, SlidersHorizontal } from 'lucide-react';
import { CommunityPost } from '../types';
import { getPosts } from '../services/communityService';
import CommunityPostComponent from './CommunityPost';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = [
    { value: 'all', label: 'Tout' },
    { value: 'article', label: 'Articles' },
    { value: 'vetement', label: 'Vêtements' },
    { value: 'accessoire', label: 'Accessoires' },
    { value: 'autre', label: 'Autre' }
];

const SORT_OPTIONS = [
    { value: 'recent', label: 'Plus récents' },
    { value: 'price_asc', label: 'Prix croissant' },
    { value: 'price_desc', label: 'Prix décroissant' },
    { value: 'popular', label: 'Plus populaires' }
];

interface ShopPageProps {
    onOpenAuth: () => void;
}

const ShopPage: React.FC<ShopPageProps> = ({ onOpenAuth }) => {
    const { session } = useAuth();
    const [products, setProducts] = useState<CommunityPost[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<CommunityPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [sortBy, setSortBy] = useState('recent');
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        loadProducts();
    }, []);

    useEffect(() => {
        filterAndSortProducts();
    }, [products, searchQuery, selectedCategory, sortBy]);

    const loadProducts = async () => {
        try {
            setLoading(true);
            const posts = await getPosts({ type: 'marketplace' });
            setProducts(posts);
        } catch (error) {
            console.error('Error loading products:', error);
        } finally {
            setLoading(false);
        }
    };

    const filterAndSortProducts = () => {
        let filtered = [...products];

        // Filter by category
        if (selectedCategory !== 'all') {
            filtered = filtered.filter(
                p => p.content.marketplaceItem?.category === selectedCategory
            );
        }

        // Filter by search query
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(p => {
                const item = p.content.marketplaceItem;
                return (
                    item?.title.toLowerCase().includes(query) ||
                    item?.description.toLowerCase().includes(query) ||
                    p.content.caption.toLowerCase().includes(query)
                );
            });
        }

        // Sort
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'price_asc':
                    return (a.content.marketplaceItem?.price || 0) - (b.content.marketplaceItem?.price || 0);
                case 'price_desc':
                    return (b.content.marketplaceItem?.price || 0) - (a.content.marketplaceItem?.price || 0);
                case 'popular':
                    return b.likes - a.likes;
                case 'recent':
                default:
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            }
        });

        setFilteredProducts(filtered);
    };

    const handlePostDelete = (postId: string) => {
        setProducts(prev => prev.filter(p => p.id !== postId));
    };

    return (
        <div className="min-h-screen bg-obsidian pt-24 pb-20">
            {/* Hero Section */}
            <section className="relative py-16 px-6 overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(247,37,133,0.15),transparent_70%)]" />
                <div className="absolute inset-0 bg-cyber-grid bg-[length:50px_50px] opacity-[0.08]" />

                <div className="max-w-7xl mx-auto relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-12"
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neonPink/10 border border-neonPink/30 text-neonPink mb-6">
                            <ShoppingBag size={20} />
                            <span className="font-mono uppercase tracking-widest text-sm">Marketplace</span>
                        </div>

                        <h1 className="text-5xl md:text-7xl font-display font-black text-white mb-4 leading-tight">
                            OTAKU <span className="text-transparent bg-clip-text bg-gradient-to-r from-neonPink to-neonPurple">SHOP</span>
                        </h1>

                        <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
                            Découvrez des articles uniques vendus par la communauté
                        </p>

                        {/* Stats */}
                        <div className="flex items-center justify-center gap-8 flex-wrap">
                            <div className="text-center">
                                <div className="text-3xl font-display font-bold text-neonPink">{products.length}</div>
                                <div className="text-sm text-gray-500 font-mono uppercase tracking-wider">Articles</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-display font-bold text-cyanLight">
                                    {products.filter(p => p.content.marketplaceItem?.whatsappNumber).length}
                                </div>
                                <div className="text-sm text-gray-500 font-mono uppercase tracking-wider">Contact Direct</div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Search and Filters */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="max-w-4xl mx-auto"
                    >
                        {/* Search Bar */}
                        <div className="relative mb-6">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                            <input
                                type="text"
                                placeholder="Rechercher un article..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 bg-midnight/50 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-neonPink/50 focus:outline-none transition-colors"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            )}
                        </div>

                        {/* Filter Bar */}
                        <div className="flex items-center gap-4 flex-wrap">
                            {/* Mobile Filter Toggle */}
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className="md:hidden flex items-center gap-2 px-4 py-2 bg-midnight/50 border border-white/10 rounded-lg text-white hover:border-neonPink/50 transition-colors"
                            >
                                <SlidersHorizontal size={18} />
                                Filtres
                            </button>

                            {/* Desktop Filters */}
                            <div className={`${showFilters ? 'flex' : 'hidden md:flex'} flex-1 items-center gap-4 flex-wrap`}>
                                {/* Category Filter */}
                                <div className="flex items-center gap-2 flex-wrap">
                                    {CATEGORIES.map(cat => (
                                        <button
                                            key={cat.value}
                                            onClick={() => setSelectedCategory(cat.value)}
                                            className={`px-4 py-2 rounded-lg font-mono text-sm transition-all ${selectedCategory === cat.value
                                                    ? 'bg-neonPink text-white'
                                                    : 'bg-midnight/50 border border-white/10 text-gray-400 hover:border-neonPink/50 hover:text-white'
                                                }`}
                                        >
                                            {cat.label}
                                        </button>
                                    ))}
                                </div>

                                {/* Sort */}
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="px-4 py-2 bg-midnight/50 border border-white/10 rounded-lg text-white focus:border-neonPink/50 focus:outline-none cursor-pointer"
                                >
                                    {SORT_OPTIONS.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Products Grid */}
            <section className="px-6 pb-20">
                <div className="max-w-7xl mx-auto">
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="relative">
                                <div className="absolute inset-0 bg-neonPink/20 blur-xl rounded-full" />
                                <div className="w-16 h-16 border-4 border-neonPink/30 border-t-neonPink rounded-full animate-spin relative z-10" />
                            </div>
                        </div>
                    ) : filteredProducts.length > 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                        >
                            <AnimatePresence mode="popLayout">
                                {filteredProducts.map((product, index) => (
                                    <motion.div
                                        key={product.id}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        transition={{ delay: index * 0.05 }}
                                    >
                                        <CommunityPostComponent
                                            post={product}
                                            onDelete={handlePostDelete}
                                        />
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-20"
                        >
                            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-neonPink/10 border border-neonPink/30 mb-6">
                                <ShoppingBag size={40} className="text-neonPink" />
                            </div>
                            <h3 className="text-2xl font-display font-bold text-white mb-2">
                                Aucun article trouvé
                            </h3>
                            <p className="text-gray-400 mb-6">
                                {searchQuery || selectedCategory !== 'all'
                                    ? 'Essayez de modifier vos filtres'
                                    : 'Soyez le premier à vendre un article !'}
                            </p>
                            {!session && (
                                <button
                                    onClick={onOpenAuth}
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-neonPink to-neonPurple text-white font-display font-bold rounded-lg hover:opacity-90 transition-opacity"
                                >
                                    Commencer à vendre
                                </button>
                            )}
                        </motion.div>
                    )}
                </div>
            </section>
        </div>
    );
};

export default ShopPage;
