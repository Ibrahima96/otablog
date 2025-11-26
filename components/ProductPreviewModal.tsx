import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, Tag, User, ShieldCheck } from 'lucide-react';
import { MarketplaceItem } from '../types';
import { useCart } from '../context/CartContext';

interface ProductPreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    item?: MarketplaceItem;
    description?: string;
    imageUrl?: string;
    authorName: string;
    postId: string;
}

const ProductPreviewModal: React.FC<ProductPreviewModalProps> = ({
    isOpen,
    onClose,
    item,
    description,
    imageUrl,
    authorName,
    postId
}) => {
    const { addToCart } = useCart();

    if (!isOpen) return null;

    const handleAddToCart = () => {
        if (item) {
            addToCart(item, postId);
            // Optional: Close modal or show success message
            onClose();
        }
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                />

                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative w-full max-w-4xl bg-[#0a0a0a] border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row"
                >
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-white/10 rounded-full text-white transition-colors"
                    >
                        <X size={20} />
                    </button>

                    {/* Left: Image */}
                    <div className="w-full md:w-1/2 bg-gradient-to-br from-neonPurple/5 to-electricBlue/5 relative min-h-[300px] md:min-h-[500px]">
                        {imageUrl ? (
                            <img
                                src={imageUrl}
                                alt={item?.title || 'Aperçu'}
                                className="absolute inset-0 w-full h-full object-cover"
                            />
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-gray-600">
                                <ShoppingBag size={64} />
                            </div>
                        )}
                        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                            <div className="flex items-center gap-2 text-white/80 text-sm">
                                <User size={14} />
                                <span>{item ? 'Vendu par' : 'Publié par'} <span className="text-white font-medium">{authorName}</span></span>
                            </div>
                        </div>
                    </div>

                    {/* Right: Info */}
                    <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                {item && (
                                    <span className="inline-block px-3 py-1 mb-3 text-xs font-mono text-neonPurple bg-neonPurple/10 border border-neonPurple/20 rounded-full uppercase tracking-wider">
                                        {item.category}
                                    </span>
                                )}
                                <h2 className="text-3xl font-display font-bold text-white mb-2 leading-tight">
                                    {item ? item.title : 'Aperçu du Média'}
                                </h2>
                            </div>
                        </div>

                        {item && (
                            <div className="flex items-baseline gap-2 mb-6">
                                <span className="text-4xl font-display font-bold text-neonPink">
                                    {item.price.toFixed(2)}
                                </span>
                                <span className="text-xl text-gray-400 font-mono">
                                    {item.currency}
                                </span>
                            </div>
                        )}

                        <div className="prose prose-invert prose-sm mb-8 flex-grow">
                            <p className="text-gray-300 leading-relaxed">
                                {item ? item.description : description}
                            </p>
                        </div>

                        <div className="space-y-4 mt-auto">
                            {item && (
                                <>
                                    <div className="flex items-center gap-2 text-sm text-green-400 bg-green-400/10 p-3 rounded-lg border border-green-400/20">
                                        <ShieldCheck size={16} />
                                        <span>Protection acheteur incluse</span>
                                    </div>

                                    <button
                                        onClick={handleAddToCart}
                                        className="w-full py-4 bg-white text-black font-display font-bold text-lg tracking-wide rounded-sm hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group"
                                    >
                                        <ShoppingBag size={20} className="group-hover:fill-black transition-colors" />
                                        AJOUTER AU PANIER
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default ProductPreviewModal;
