import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, Tag, User, ShieldCheck, MessageCircle, ArrowBigLeft } from 'lucide-react';
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

                                    {/* WhatsApp Contact Button */}
                                    {item.whatsappNumber && (
                                        <a
                                            href={`https://wa.me/${item.whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                                                `Bonjour ${authorName}! 👋\n\nJe suis intéressé(e) par votre article:\n📦 ${item.title}\n💰 ${item.price} ${item.currency}\n\nEst-il toujours disponible?\n\nMerci!`
                                            )}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-full py-4 bg-gradient-to-r from-green-500 to-green-600 text-white font-display font-bold text-lg tracking-wide rounded-sm hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:shadow-[0_0_30px_rgba(34,197,94,0.5)]"
                                        >
                                            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                            </svg>
                                             WHATSAPP
                                        </a>
                                    )}

                                    <button
                                        onClick={handleAddToCart}
                                        className="w-full py-4 bg-white text-black font-display font-bold text-lg tracking-wide rounded-sm hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group"
                                    >
                                        <ArrowBigLeft size={20} className="group-hover:fill-black transition-colors" />
                                       RETOURE
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
