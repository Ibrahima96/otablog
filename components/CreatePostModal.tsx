import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Image as ImageIcon, Video, ShoppingBag, Upload, DollarSign, Tag, CheckCircle, Loader2, Shirt, Watch, Package, Link, Phone } from 'lucide-react';
import { PostType, CommunityPost } from '../types';
import { createPost } from '../services/communityService';
import { useAuth } from '../context/AuthContext';

interface CreatePostModalProps {
    isOpen: boolean;
    onClose: () => void;
    onPostCreated?: (post: CommunityPost) => void;
}

const CreatePostModal: React.FC<CreatePostModalProps> = ({ isOpen, onClose, onPostCreated }) => {
    const { user } = useAuth();
    const [postType, setPostType] = useState<PostType>('image');
    const [caption, setCaption] = useState('');
    const [title, setTitle] = useState('');
    const [price, setPrice] = useState('');
    const [category, setCategory] = useState<'article' | 'vetement' | 'accessoire' | 'autre'>('article');
    const [mediaFile, setMediaFile] = useState<File | null>(null);
    const [mediaPreview, setMediaPreview] = useState<string | null>(null);
    const [imageInputMethod, setImageInputMethod] = useState<'upload' | 'url'>('upload');
    const [imageUrl, setImageUrl] = useState('');
    const [whatsappNumber, setWhatsappNumber] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [uploadSuccess, setUploadSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        const validVideoTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];

        if ((postType === 'image' || postType === 'marketplace') && !validImageTypes.includes(file.type)) {
            setError('Format d\'image non supporté. Utilisez JPG, PNG, GIF ou WebP.');
            return;
        }

        if (postType === 'video' && !validVideoTypes.includes(file.type)) {
            setError('Format de vidéo non supporté. Utilisez MP4, WebM, OGG ou MOV.');
            return;
        }

        // Validate file size (max 50MB)
        const maxSize = 50 * 1024 * 1024; // 50MB
        if (file.size > maxSize) {
            setError('Le fichier est trop volumineux. Taille maximale: 50MB.');
            return;
        }

        setError(null);
        setMediaFile(file);

        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setMediaPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleImageUrlChange = (url: string) => {
        setImageUrl(url);
        if (url) {
            setError(null);
            setMediaPreview(url);
        } else {
            setMediaPreview(null);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        console.log('📝 [CreatePostModal] Form submitted');

        if (!user) {
            console.error('❌ [CreatePostModal] No user found');
            setError('Vous devez être connecté');
            return;
        }

        console.log('👤 [CreatePostModal] User:', { id: user.id, email: user.email });

        setIsUploading(true);
        setError(null);

        try {
            const postData: any = {
                type: postType,
                caption,
                mediaFile: mediaFile || undefined
            };

            // Add imageUrl if provided and no file
            if (imageUrl && !mediaFile) {
                postData.imageUrl = imageUrl;
            }

            // Add marketplace data if type is marketplace
            if (postType === 'marketplace') {
                if (!title || !price) {
                    setError('Veuillez remplir tous les champs obligatoires');
                    setIsUploading(false);
                    return;
                }

                if (!mediaFile && !imageUrl) {
                    setError('Veuillez ajouter une image du produit (fichier ou URL)');
                    setIsUploading(false);
                    return;
                }

                postData.marketplaceItem = {
                    title,
                    description: caption,
                    price: parseFloat(price),
                    currency: 'FCFA',
                    category,
                    whatsappNumber: whatsappNumber || undefined
                };
            }

            console.log('📤 [CreatePostModal] Creating post with data:', {
                type: postData.type,
                hasFile: !!postData.mediaFile,
                hasMarketplace: !!postData.marketplaceItem,
                userId: user.id
            });

            // Get username from user metadata or email
            const username = user.user_metadata?.username || user.email?.split('@')[0] || 'Utilisateur';
            console.log('👤 [CreatePostModal] Username:', username);

            // Create post
            const newPost = await createPost(postData, user.id, username);

            console.log('✅ [CreatePostModal] Post created successfully:', newPost);

            setUploadSuccess(true);

            // Notify parent component
            if (onPostCreated) {
                onPostCreated(newPost);
            }

            // Wait a bit to show success message, then close
            setTimeout(() => {
                handleClose();
            }, 1500);

        } catch (err: any) {
            console.error('❌ [CreatePostModal] Error:', err);
            const errorMessage = err.message || 'Une erreur est survenue lors de la création du post';
            console.error('Error message:', errorMessage);
            console.error('Error stack:', err.stack);
            setError(errorMessage);
            setIsUploading(false);
        }
    };

    const handleClose = () => {
        if (!isUploading) {
            setCaption('');
            setTitle('');
            setPrice('');
            setMediaFile(null);
            setMediaPreview(null);
            setImageUrl('');
            setWhatsappNumber('');
            setImageInputMethod('upload');
            setUploadSuccess(false);
            setError(null);
            onClose();
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    >
                        {/* Modal */}
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-[#0f0f13] border border-white/10 w-full max-w-2xl rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(114,9,183,0.3)] relative max-h-[90vh] overflow-y-auto"
                        >
                            {/* Decorative Elements */}
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-neonPink via-neonPurple to-electricBlue"></div>
                            <div className="absolute -left-10 -top-10 w-32 h-32 bg-neonPurple/20 rounded-full blur-[50px]"></div>
                            <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-cyanLight/20 rounded-full blur-[50px]"></div>

                            {/* Close Button */}
                            {!isUploading && (
                                <button
                                    onClick={handleClose}
                                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-20"
                                >
                                    <X size={24} />
                                </button>
                            )}

                            <div className="p-8 relative z-10">
                                {uploadSuccess ? (
                                    // Success State
                                    <div className="text-center py-12">
                                        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4 animate-pulse" />
                                        <h3 className="text-2xl font-display font-bold text-white mb-2">
                                            POST CRÉÉ !
                                        </h3>
                                        <p className="text-gray-400">Votre contenu a été publié avec succès</p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="text-center mb-8">
                                            <h2 className="text-3xl font-display font-bold text-white mb-2">
                                                CRÉER UN POST
                                            </h2>
                                            <p className="text-cyanLight font-mono text-xs tracking-[0.2em] uppercase">
                                                PARTAGE AVEC LA COMMUNAUTÉ
                                            </p>
                                        </div>

                                        <form onSubmit={handleSubmit} className="space-y-6">
                                            {/* Post Type Selector */}
                                            <div className="space-y-3">
                                                <label className="text-xs text-gray-400 font-bold uppercase tracking-wide">Type de Post</label>
                                                <div className="grid grid-cols-3 gap-3">
                                                    {[
                                                        { type: 'image' as PostType, icon: ImageIcon, label: 'Image' },
                                                        { type: 'video' as PostType, icon: Video, label: 'Vidéo' },
                                                        { type: 'marketplace' as PostType, icon: ShoppingBag, label: 'Vente' }
                                                    ].map(({ type, icon: Icon, label }) => (
                                                        <button
                                                            key={type}
                                                            type="button"
                                                            onClick={() => setPostType(type)}
                                                            disabled={isUploading}
                                                            className={`p-4 rounded-lg border transition-all disabled:opacity-50 ${postType === type
                                                                ? 'bg-neonPurple/20 border-neonPurple text-neonPurple'
                                                                : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
                                                                }`}
                                                        >
                                                            <Icon className="w-6 h-6 mx-auto mb-2" />
                                                            <span className="text-xs font-bold">{label}</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* File Upload */}
                                            {(postType === 'image' || postType === 'video') && (
                                                <div className="space-y-3">
                                                    <div className="flex items-center justify-between">
                                                        <label className="text-xs text-gray-400 font-bold uppercase tracking-wide">
                                                            Fichier {postType === 'image' ? 'Image' : 'Vidéo'}
                                                        </label>
                                                        <div className="flex gap-2">
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setImageInputMethod('upload');
                                                                    setImageUrl('');
                                                                    setMediaPreview(null);
                                                                }}
                                                                disabled={isUploading}
                                                                className={`px-3 py-1 rounded text-xs font-bold transition-all ${imageInputMethod === 'upload'
                                                                    ? 'bg-neonPurple/20 text-neonPurple border border-neonPurple'
                                                                    : 'bg-white/5 text-gray-400 border border-white/10 hover:border-white/20'
                                                                    }`}
                                                            >
                                                                <Upload className="inline w-3 h-3 mr-1" />
                                                                Upload
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setImageInputMethod('url');
                                                                    setMediaFile(null);
                                                                    setMediaPreview(null);
                                                                }}
                                                                disabled={isUploading}
                                                                className={`px-3 py-1 rounded text-xs font-bold transition-all ${imageInputMethod === 'url'
                                                                    ? 'bg-neonPurple/20 text-neonPurple border border-neonPurple'
                                                                    : 'bg-white/5 text-gray-400 border border-white/10 hover:border-white/20'
                                                                    }`}
                                                            >
                                                                <Link className="inline w-3 h-3 mr-1" />
                                                                URL
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {imageInputMethod === 'url' ? (
                                                        <div className="space-y-2">
                                                            <input
                                                                type="url"
                                                                value={imageUrl}
                                                                onChange={(e) => handleImageUrlChange(e.target.value)}
                                                                disabled={isUploading}
                                                                className="w-full bg-white/5 border border-white/10 rounded-lg py-3 px-4 text-white focus:outline-none focus:border-neonPurple transition-all placeholder-gray-600 disabled:opacity-50"
                                                                placeholder={postType === 'image' ? 'https://example.com/image.jpg' : 'https://example.com/video.mp4'}
                                                            />
                                                            {imageUrl && (
                                                                <div className="relative">
                                                                    {postType === 'image' ? (
                                                                        <img
                                                                            src={imageUrl}
                                                                            alt="Aperçu"
                                                                            className="w-full h-64 object-cover rounded-lg"
                                                                            onError={() => setError('URL d\'image invalide')}
                                                                        />
                                                                    ) : (
                                                                        <video
                                                                            src={imageUrl}
                                                                            controls
                                                                            className="w-full h-64 rounded-lg bg-black"
                                                                            onError={() => setError('URL de vidéo invalide')}
                                                                        />
                                                                    )}
                                                                    {!isUploading && (
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => {
                                                                                setImageUrl('');
                                                                                setMediaPreview(null);
                                                                            }}
                                                                            className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                                                                        >
                                                                            <X size={16} />
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        mediaPreview ? (
                                                            <div className="relative">
                                                                {postType === 'image' ? (
                                                                    <img
                                                                        src={mediaPreview}
                                                                        alt="Preview"
                                                                        className="w-full h-64 object-cover rounded-lg"
                                                                    />
                                                                ) : (
                                                                    <video
                                                                        src={mediaPreview}
                                                                        controls
                                                                        className="w-full h-64 rounded-lg bg-black"
                                                                    />
                                                                )}
                                                                {!isUploading && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => {
                                                                            setMediaFile(null);
                                                                            setMediaPreview(null);
                                                                        }}
                                                                        className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                                                                    >
                                                                        <X size={16} />
                                                                    </button>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <label className="block border-2 border-dashed border-white/20 rounded-lg p-8 text-center hover:border-neonPink/50 transition-colors cursor-pointer">
                                                                <input
                                                                    type="file"
                                                                    accept={postType === 'image' ? 'image/*' : 'video/*'}
                                                                    onChange={handleFileChange}
                                                                    disabled={isUploading}
                                                                    className="hidden"
                                                                />
                                                                <Upload className="w-12 h-12 mx-auto mb-3 text-gray-500" />
                                                                <p className="text-gray-400 text-sm mb-1">Cliquez pour uploader</p>
                                                                <p className="text-gray-600 text-xs">Max 50MB</p>
                                                            </label>
                                                        ))}
                                                </div>
                                            )}

                                            {/* Marketplace Fields */}
                                            {postType === 'marketplace' && (
                                                <>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="space-y-2">
                                                            <label className="text-xs text-gray-400 font-bold uppercase tracking-wide">Titre *</label>
                                                            <input
                                                                type="text"
                                                                value={title}
                                                                onChange={(e) => setTitle(e.target.value)}
                                                                disabled={isUploading}
                                                                className="w-full bg-white/5 border border-white/10 rounded-lg py-3 px-4 text-white focus:outline-none focus:border-neonPink transition-all placeholder-gray-600 disabled:opacity-50"
                                                                placeholder="Ex: T-shirt Naruto"
                                                                required
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <label className="text-xs text-gray-400 font-bold uppercase tracking-wide">Prix (FCFA) *</label>
                                                            <div className="relative">
                                                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                                                                <input
                                                                    type="number"
                                                                    step="0.01"
                                                                    value={price}
                                                                    onChange={(e) => setPrice(e.target.value)}
                                                                    disabled={isUploading}
                                                                    className="w-full bg-white/5 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white focus:outline-none focus:border-neonPink transition-all placeholder-gray-600 disabled:opacity-50"
                                                                    placeholder="5000"
                                                                    required
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Category Selector */}
                                                    <div className="space-y-2">
                                                        <label className="text-xs text-gray-400 font-bold uppercase tracking-wide">Catégorie *</label>
                                                        <div className="grid grid-cols-2 gap-3">
                                                            {[
                                                                { value: 'article', icon: Package, label: 'Article' },
                                                                { value: 'vetement', icon: Shirt, label: 'Vêtement' },
                                                                { value: 'accessoire', icon: Watch, label: 'Accessoire' },
                                                                { value: 'autre', icon: Tag, label: 'Autre' }
                                                            ].map(({ value, icon: Icon, label }) => (
                                                                <button
                                                                    key={value}
                                                                    type="button"
                                                                    onClick={() => setCategory(value as any)}
                                                                    disabled={isUploading}
                                                                    className={`p-3 rounded-lg border transition-all disabled:opacity-50 flex items-center gap-2 ${category === value
                                                                        ? 'bg-neonPurple/20 border-neonPurple text-neonPurple'
                                                                        : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
                                                                        }`}
                                                                >
                                                                    <Icon size={18} />
                                                                    <span className="text-sm font-bold">{label}</span>
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    {/* WhatsApp Contact */}
                                                    <div className="space-y-2">
                                                        <label className="text-xs text-gray-400 font-bold uppercase tracking-wide flex items-center gap-2">
                                                            <Phone size={14} className="text-green-500" />
                                                            Numéro WhatsApp (pour contact direct)
                                                        </label>
                                                        <div className="relative">
                                                            <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                                                                <svg className="w-5 h-5 text-green-500" viewBox="0 0 24 24" fill="currentColor">
                                                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                                                </svg>
                                                            </div>
                                                            <input
                                                                type="tel"
                                                                value={whatsappNumber}
                                                                onChange={(e) => setWhatsappNumber(e.target.value)}
                                                                disabled={isUploading}
                                                                className="w-full bg-white/5 border border-white/10 rounded-lg py-3 pl-12 pr-4 text-white focus:outline-none focus:border-green-500 transition-all placeholder-gray-600 disabled:opacity-50"
                                                                placeholder="+221 77 123 45 67"
                                                            />
                                                        </div>
                                                        <p className="text-xs text-gray-500">
                                                            Les acheteurs pourront vous contacter directement sur WhatsApp
                                                        </p>
                                                    </div>

                                                    {/* Product Image Upload/URL */}
                                                    <div className="space-y-3">
                                                        <div className="flex items-center justify-between">
                                                            <label className="text-xs text-gray-400 font-bold uppercase tracking-wide">
                                                                Image du Produit *
                                                            </label>
                                                            <div className="flex gap-2">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        setImageInputMethod('upload');
                                                                        setImageUrl('');
                                                                        setMediaPreview(null);
                                                                    }}
                                                                    disabled={isUploading}
                                                                    className={`px-3 py-1 rounded text-xs font-bold transition-all ${imageInputMethod === 'upload'
                                                                        ? 'bg-neonPurple/20 text-neonPurple border border-neonPurple'
                                                                        : 'bg-white/5 text-gray-400 border border-white/10 hover:border-white/20'
                                                                        }`}
                                                                >
                                                                    <Upload className="inline w-3 h-3 mr-1" />
                                                                    Upload
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        setImageInputMethod('url');
                                                                        setMediaFile(null);
                                                                        setMediaPreview(null);
                                                                    }}
                                                                    disabled={isUploading}
                                                                    className={`px-3 py-1 rounded text-xs font-bold transition-all ${imageInputMethod === 'url'
                                                                        ? 'bg-neonPurple/20 text-neonPurple border border-neonPurple'
                                                                        : 'bg-white/5 text-gray-400 border border-white/10 hover:border-white/20'
                                                                        }`}
                                                                >
                                                                    <Link className="inline w-3 h-3 mr-1" />
                                                                    URL
                                                                </button>
                                                            </div>
                                                        </div>

                                                        {imageInputMethod === 'url' ? (
                                                            <div className="space-y-2">
                                                                <input
                                                                    type="url"
                                                                    value={imageUrl}
                                                                    onChange={(e) => handleImageUrlChange(e.target.value)}
                                                                    disabled={isUploading}
                                                                    className="w-full bg-white/5 border border-white/10 rounded-lg py-3 px-4 text-white focus:outline-none focus:border-neonPurple transition-all placeholder-gray-600 disabled:opacity-50"
                                                                    placeholder="https://example.com/image.jpg"
                                                                />
                                                                {imageUrl && (
                                                                    <div className="relative">
                                                                        <img
                                                                            src={imageUrl}
                                                                            alt="Aperçu"
                                                                            className="w-full h-64 object-cover rounded-lg"
                                                                            onError={() => setError('URL d\'image invalide')}
                                                                        />
                                                                        {!isUploading && (
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => {
                                                                                    setImageUrl('');
                                                                                    setMediaPreview(null);
                                                                                }}
                                                                                className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                                                                            >
                                                                                <X size={16} />
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            mediaPreview ? (
                                                                <div className="relative">
                                                                    <img
                                                                        src={mediaPreview}
                                                                        alt="Aperçu du produit"
                                                                        className="w-full h-64 object-cover rounded-lg"
                                                                    />
                                                                    {!isUploading && (
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => {
                                                                                setMediaFile(null);
                                                                                setMediaPreview(null);
                                                                            }}
                                                                            className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                                                                        >
                                                                            <X size={16} />
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            ) : (
                                                                <label className="block border-2 border-dashed border-white/20 rounded-lg p-8 text-center hover:border-neonPink/50 transition-colors cursor-pointer">
                                                                    <input
                                                                        type="file"
                                                                        accept="image/*"
                                                                        onChange={handleFileChange}
                                                                        disabled={isUploading}
                                                                        className="hidden"
                                                                    />
                                                                    <Upload className="w-12 h-12 mx-auto mb-3 text-gray-500" />
                                                                    <p className="text-gray-400 text-sm mb-1">Cliquez pour uploader l'image du produit</p>
                                                                    <p className="text-gray-600 text-xs">JPG, PNG, GIF ou WebP - Max 50MB</p>
                                                                </label>
                                                            ))}
                                                    </div>
                                                </>
                                            )}

                                            {/* Caption */}
                                            <div className="space-y-2">
                                                <label className="text-xs text-gray-400 font-bold uppercase tracking-wide">
                                                    {postType === 'marketplace' ? 'Description *' : 'Légende *'}
                                                </label>
                                                <textarea
                                                    value={caption}
                                                    onChange={(e) => setCaption(e.target.value)}
                                                    rows={4}
                                                    disabled={isUploading}
                                                    className="w-full bg-white/5 border border-white/10 rounded-lg py-3 px-4 text-white focus:outline-none focus:border-neonPurple transition-all placeholder-gray-600 resize-none disabled:opacity-50"
                                                    placeholder={postType === 'marketplace' ? 'Décrivez votre article...' : 'Ajoutez une légende...'}
                                                    required
                                                />
                                            </div>

                                            {/* Error Message */}
                                            {error && (
                                                <div className="bg-red-500/10 border border-red-500/50 p-3 rounded-lg text-red-200 text-sm">
                                                    {error}
                                                </div>
                                            )}

                                            {/* Submit Button */}
                                            <button
                                                type="submit"
                                                disabled={isUploading}
                                                className="w-full bg-gradient-to-r from-neonPurple to-neonPink text-white font-bold py-3 rounded-lg shadow-[0_0_20px_rgba(247,37,133,0.4)] hover:shadow-[0_0_30px_rgba(247,37,133,0.6)] hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
                                            >
                                                {isUploading ? (
                                                    <>
                                                        <Loader2 className="w-5 h-5 animate-spin" />
                                                        <span>PUBLICATION EN COURS...</span>
                                                    </>
                                                ) : (
                                                    <span>PUBLIER</span>
                                                )}
                                            </button>
                                        </form>
                                    </>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default CreatePostModal;
