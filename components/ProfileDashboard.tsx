import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import {
    Trophy, Zap, Shield, Crown, Sparkles, Grid,
    Activity, Clock, ShoppingBag, Gamepad2, Share2, Camera, Upload
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { gamificationService } from '../services/gamificationService';
import { duelService } from '../services/duelService';
import { supabase } from '../services/supabaseClient';
import { UserProfile, Badge } from '../types';
import { toast } from 'sonner';

interface ProfileDashboardProps {
    onNavigate?: (view: any) => void;
}

const ProfileDashboard: React.FC<ProfileDashboardProps> = ({ onNavigate }) => {
    const { user } = useAuth();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'badges' | 'stats' | 'inventory'>('badges');
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (user) {
            loadProfile();
        }
    }, [user]);

    const loadProfile = async () => {
        if (!user) return;
        setLoading(true);
        const data = await gamificationService.getProfile(user.id);
        setProfile(data);
        setLoading(false);
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !user) return;

        const toastId = toast.loading("Upload de l'avatar en cours...");

        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `avatars/${user.id}-${Date.now()}.${fileExt}`;

            // 1. Upload to Supabase Storage
            // Ensure 'community-media' bucket exists and is public
            const { error: uploadError } = await supabase.storage
                .from('community-media')
                .upload(fileName, file);

            if (uploadError) throw uploadError;

            // 2. Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('community-media')
                .getPublicUrl(fileName);

            // 3. Update Profile in DB
            await duelService.updateProfile(user.id, { avatar_url: publicUrl });

            // 4. Update Local State
            setProfile(prev => prev ? { ...prev, avatarUrl: publicUrl } : null);

            toast.success("Avatar mis à jour avec succès !", { id: toastId });

        } catch (error) {
            console.error('Avatar upload error:', error);
            toast.error("Erreur lors de l'upload de l'image.", { id: toastId });
        }
    };


    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-neonPink"></div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="text-center py-20 text-gray-400">
                Impossible de charger le profil.
            </div>
        );
    }

    const nextLevelXp = profile.level * 100;
    const progress = Math.min((profile.xp % 100) / 100 * 100, 100);
    const xpRemaining = 100 - (profile.xp % 100);

    const rarityColors = {
        common: 'text-gray-400 border-gray-600',
        rare: 'text-blue-400 border-blue-500',
        epic: 'text-purple-400 border-purple-500',
        legendary: 'text-yellow-400 border-yellow-500 shadow-[0_0_15px_rgba(250,204,21,0.5)]'
    };

    const rarityBg = {
        common: 'bg-gray-500/10',
        rare: 'bg-blue-500/10',
        epic: 'bg-purple-500/10',
        legendary: 'bg-yellow-500/10'
    };

    return (
        <section className="min-h-screen py-24 px-4 md:px-8 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute inset-0 bg-obsidian z-0" />
            <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-neonPurple/10 to-transparent z-0" />
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 z-0 pointer-events-none" />

            <div className="max-w-7xl mx-auto relative z-10">

                {/* Header: Identity Card */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">

                    {/* LEFT COLUMN: Avatar & Level */}
                    <div className="lg:col-span-4">
                        <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-4 md:p-6 relative overflow-hidden group hover:border-neonPink/30 transition-colors">
                            <div className="absolute top-0 right-0 p-3">
                                <span className="bg-neonPink/10 text-neonPink border border-neonPink/30 px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase animate-pulse">
                                    En Ligne
                                </span>
                            </div>

                            <div className="flex flex-col items-center">
                                <div className="relative w-32 h-32 mb-4 group/avatar cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                    <div className="absolute inset-0 bg-gradient-to-br from-neonPink to-neonPurple rounded-full blur-md opacity-70 group-hover/avatar:opacity-100 transition-opacity" />
                                    <img
                                        src={profile.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.username}`}
                                        alt={profile.username}
                                        className="relative w-full h-full rounded-full border-4 border-[#0a0a0a] object-cover ring-2 ring-white/20 z-10"
                                    />
                                    <div className="absolute inset-0 bg-black/50 rounded-full z-20 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity">
                                        <Camera className="text-white w-8 h-8" />
                                    </div>
                                    <div className="absolute -bottom-2 -right-2 bg-black border border-white/20 text-white text-xs font-bold px-2 py-1 rounded-md z-30">
                                        LVL {profile.level}
                                    </div>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleFileSelect}
                                    />
                                </div>

                                <h2 className="text-2xl md:text-3xl font-display font-black text-white mb-1">{profile.username}</h2>
                                <div className="flex items-center gap-2 text-neonPurple font-mono text-sm uppercase tracking-widest mb-6">
                                    <Shield size={14} />
                                    <span>{profile.title}</span>
                                </div>

                                {profile.whatsapp_number && (
                                    <div className="flex items-center gap-2 mb-6">
                                        <div className="bg-[#25D366]/10 text-[#25D366] px-3 py-1 rounded-full border border-[#25D366]/20 font-mono text-xs flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-[#25D366] animate-pulse"></span>
                                            WA: +{profile.whatsapp_number}
                                        </div>
                                    </div>
                                )}

                                {/* XP Bar */}
                                <div className="w-full bg-white/5 rounded-full h-4 overflow-hidden relative border border-white/10">
                                    <div
                                        className="h-full bg-gradient-to-r from-neonBlue to-neonPurple shadow-[0_0_20px_rgba(67,97,238,0.6)]"
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                                <div className="flex justify-between w-full text-xs text-gray-500 mt-2 font-mono">
                                    <span>{profile.xp} XP</span>
                                    <span>NEXT: {nextLevelXp} XP</span>
                                </div>
                            </div>
                        </div>

                        {/* Aura Card */}
                        <div className="mt-4 bg-gradient-to-br from-indigo-900/40 to-black border border-white/10 rounded-2xl p-4 md:p-6 flex items-center justify-between">
                            <div>
                                <div className="text-gray-400 text-xs font-mono uppercase tracking-widest mb-1">Solde Aura</div>
                                <div className="text-3xl font-black text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
                                    {profile.aura} <span className="text-lg text-indigo-400">AP</span>
                                </div>
                            </div>
                            <div className="w-12 h-12 bg-indigo-500/20 rounded-full flex items-center justify-center text-indigo-400">
                                <Sparkles size={24} />
                            </div>
                        </div>
                    </div>

                    {/* CENTER/RIGHT COLUMN: Dashboard */}
                    <div className="lg:col-span-8">

                        {/* Synchro Status */}
                        <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-4 md:p-6 mb-6 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-full bg-gradient-to-l from-neonPink/10 to-transparent pointer-events-none" />

                            <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
                                <div>
                                    <div className="flex items-center gap-2 text-neonPink mb-2">
                                        <Activity size={18} className="animate-pulse" />
                                        <h3 className="font-bold tracking-wide uppercase text-sm">Synchronisation Neurale</h3>
                                    </div>
                                    <p className="text-gray-400 text-sm max-w-md">
                                        Complétez vos objectifs quotidiens pour maximiser votre connexion avec l'OtaGrid.
                                    </p>
                                </div>
                                <div className="text-right">
                                    <div className="text-4xl font-black text-white leading-none">100%</div>
                                    <div className="text-xs text-green-400 font-mono">SYNCHRO OPTIMALE</div>
                                </div>
                            </div>

                            {/* Daily Tasks Mini-Grid (Mockup for now) */}
                            <div className="grid grid-cols-4 gap-2 mt-6">
                                {['Login', 'Read', 'Quiz', 'Post'].map((task, i) => (
                                    <div key={i} className={`h-1.5 rounded-full ${i < 3 ? 'bg-neonPink box-shadow-neon' : 'bg-gray-800'}`} />
                                ))}
                            </div>
                        </div>

                        {/* Tabs Navigation */}
                        <div className="flex gap-4 mb-6 border-b border-white/10 pb-1 overflow-x-auto">
                            {['badges', 'stats', 'inventory'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab as any)}
                                    className={`px-4 py-2 text-sm font-bold uppercase tracking-wider transition-all relative whitespace-nowrap ${activeTab === tab ? 'text-white' : 'text-gray-500 hover:text-white'
                                        }`}
                                >
                                    {tab}
                                    {activeTab === tab && (
                                        <motion.div
                                            layoutId="activeTab"
                                            className="absolute bottom-0 left-0 w-full h-0.5 bg-neonBlue"
                                        />
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* Main Content Area */}
                        <div className="min-h-[300px]">
                            {activeTab === 'badges' && (
                                <div>
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-xl font-bold text-white">Badges Débloqués</h3>
                                        <span className="text-xs text-gray-500 font-mono">{profile.badges?.length || 0} / 50</span>
                                    </div>

                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                        {profile.badges?.map((badge) => (
                                            <div
                                                key={badge.id}
                                                className={`bg-[#0a0a0a] border ${rarityColors[badge.rarity]} rounded-xl p-4 flex flex-col items-center text-center hover:scale-105 transition-transform cursor-help group relative`}
                                            >
                                                <div className="text-4xl mb-3 filter drop-shadow-lg">{badge.icon}</div>
                                                <h4 className="font-bold text-white text-sm leading-tight mb-1">{badge.name}</h4>
                                                <p className="text-[10px] text-gray-400 uppercase tracking-wider">{badge.rarity}</p>

                                                {/* Tooltip */}
                                                <div className="absolute inset-0 bg-black/95 rounded-xl flex items-center justify-center p-4 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                                    <p className="text-xs text-gray-300">{badge.description}</p>
                                                </div>
                                            </div>
                                        ))}

                                        {/* Placeholder for empty/locked slots */}
                                        {Array.from({ length: Math.max(0, 4 - (profile.badges?.length || 0)) }).map((_, i) => (
                                            <div key={i} className="bg-white/5 border border-white/5 border-dashed rounded-xl p-4 flex flex-col items-center justify-center opacity-50">
                                                <div className="text-3xl text-gray-700 mb-2">🔒</div>
                                                <div className="text-xs text-gray-600">Locked</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'stats' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-[#0a0a0a] p-4 md:p-6 rounded-xl border border-white/10">
                                        <div className="flex items-center gap-3 mb-2 text-yellow-500">
                                            <Trophy size={20} />
                                            <span className="font-bold">Victoires</span>
                                        </div>
                                        <div className="text-3xl font-black text-white">{profile.duelWins}</div>
                                        <div className="text-xs text-gray-500 mt-1">Sur {profile.duelTotal} duels joués</div>
                                    </div>
                                    <div className="bg-[#0a0a0a] p-4 md:p-6 rounded-xl border border-white/10">
                                        <div className="flex items-center gap-3 mb-2 text-red-500">
                                            <Zap size={20} />
                                            <span className="font-bold">Win Rate</span>
                                        </div>
                                        <div className="text-3xl font-black text-white">
                                            {profile.duelTotal > 0 ? Math.round((profile.duelWins / profile.duelTotal) * 100) : 0}%
                                        </div>
                                        <div className="text-xs text-gray-500 mt-1">Performance globale</div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'inventory' && (
                                <div className="text-center py-12 bg-[#0a0a0a] rounded-xl border border-white/10 border-dashed">
                                    <ShoppingBag size={40} className="mx-auto text-gray-600 mb-4" />
                                    <h3 className="text-lg font-bold text-white mb-2">Inventaire Vide</h3>
                                    <p className="text-gray-500 text-sm mb-6">Utilisez vos points d'Aura pour acheter des objets.</p>
                                    <button
                                        onClick={() => onNavigate && onNavigate('shop')}
                                        className="px-6 py-2 bg-neonBlue/20 text-neonBlue border border-neonBlue/50 rounded-lg hover:bg-neonBlue/30 transition-colors"
                                    >
                                        Aller à la Boutique
                                    </button>
                                </div>
                            )}
                        </div>

                    </div>
                </div>

                {/* Footer Actions */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <button onClick={() => onNavigate && onNavigate('quiz')} className="bg-gradient-to-r from-neonPink to-neonPurple p-4 rounded-xl flex items-center justify-center gap-3 font-bold text-white hover:opacity-90 transition-opacity">
                        <Gamepad2 /> Lancer un Quiz
                    </button>
                    <button className="bg-white/5 border border-white/10 p-4 rounded-xl flex items-center justify-center gap-3 font-bold text-white hover:bg-white/10 transition-colors">
                        <Share2 /> Partager Profil
                    </button>
                </div>

            </div>
        </section>
    );
};

export default ProfileDashboard;
