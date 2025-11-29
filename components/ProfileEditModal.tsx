import React, { useState } from 'react';
import { X, User, Camera, Loader, Save } from 'lucide-react';
import { motion } from 'framer-motion';
import * as userService from '../services/userService';
import { useAuth } from '../context/AuthContext';

interface ProfileEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentUser: userService.User & { avatar_url?: string };
    onUpdate: () => void;
}

const ProfileEditModal: React.FC<ProfileEditModalProps> = ({ isOpen, onClose, currentUser, onUpdate }) => {
    const [username, setUsername] = useState(currentUser.username || '');
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(currentUser.avatar_url || null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setAvatarFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const success = await userService.updateProfile(currentUser.id, {
            username,
            avatarFile: avatarFile || undefined
        });

        if (success) {
            onUpdate();
            onClose();
        } else {
            alert('Erreur lors de la mise à jour du profil.');
        }
        setIsSubmitting(false);
    };

    return (
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
                className="relative w-full max-w-md bg-[#111] border border-white/10 rounded-2xl p-6 shadow-2xl"
            >
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
                    <X size={24} />
                </button>

                <h2 className="text-2xl font-display font-bold text-white mb-6">Mon Profil</h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Avatar Upload */}
                    <div className="flex flex-col items-center">
                        <div className="relative group cursor-pointer">
                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center overflow-hidden border-2 border-white/20 group-hover:border-neonPink transition-colors">
                                {previewUrl ? (
                                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <User size={40} className="text-gray-400" />
                                )}
                            </div>
                            <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-full cursor-pointer">
                                <Camera size={24} className="text-white" />
                                <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                            </label>
                        </div>
                        <p className="text-gray-400 text-xs mt-2">Cliquez pour changer la photo</p>
                    </div>

                    {/* Username Input */}
                    <div>
                        <label className="block text-sm font-mono text-gray-400 mb-2">Nom d'utilisateur</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-neonPink focus:ring-1 focus:ring-neonPink/20 outline-none transition-all"
                            placeholder="Votre pseudo"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-3 bg-neonPink hover:bg-neonPink/80 text-white font-bold rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {isSubmitting ? <Loader className="animate-spin" size={20} /> : <><Save size={20} /> Enregistrer</>}
                    </button>
                </form>
            </motion.div>
        </div>
    );
};

export default ProfileEditModal;
