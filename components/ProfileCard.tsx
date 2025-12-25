import React from 'react';
import { Trophy, Star, Shield, Zap, User } from 'lucide-react';

interface ProfileCardProps {
    username: string;
    avatarUrl?: string;
    level: number;
    xp: number;
    title: string;
    wins: number;
    totalGames: number;
    rank?: string;
    isOwnProfile?: boolean;
    onAvatarClick?: () => void;
}

const ProfileCard: React.FC<ProfileCardProps> = ({
    username,
    avatarUrl,
    level,
    xp,
    title,
    wins,
    totalGames,
    isOwnProfile,
    onAvatarClick
}) => {
    const nextLevelXp = level * 100;
    const progress = Math.min((xp % 100) / 100 * 100, 100);

    // Calculate win rate
    const winRate = totalGames > 0 ? Math.round((wins / totalGames) * 100) : 0;

    return (
        <div className="relative w-full max-w-full md:max-w-sm mx-auto group perspective-1000 my-4">
            <div className="relative bg-[#0a0a0a] border border-gray-800 rounded-xl overflow-hidden shadow-[0_0_30px_rgba(67,97,238,0.15)] transition-all duration-500 hover:scale-[1.02] hover:shadow-[0_0_50px_rgba(247,37,133,0.3)]">

                {/* Holographic Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 mixing-blend-overlay" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 z-0" />

                {/* Header / Banner */}
                <div className="h-24 bg-gradient-to-r from-blue-900 via-purple-900 to-black relative overflow-hidden">
                    <div className="absolute inset-0 bg-grid-white/[0.05] bg-[length:20px_20px]" />
                    <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-[#0a0a0a] to-transparent" />

                    {isOwnProfile && (
                        <div className="absolute top-2 right-2 z-30">
                            <span className="text-[10px] bg-neonPink/20 text-neonPink border border-neonPink/50 px-2 py-0.5 rounded-full animate-pulse">
                                EDIT MODE
                            </span>
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="px-6 pb-6 -mt-12 relative z-10">
                    <div className="flex justify-between items-end mb-4">
                        {/* Avatar */}
                        <div className={`relative group/avatar ${isOwnProfile ? 'cursor-pointer' : ''}`} onClick={isOwnProfile ? onAvatarClick : undefined}>
                            <div className="w-24 h-24 rounded-xl overflow-hidden border-2 border-neonPink shadow-[0_0_20px_rgba(247,37,133,0.4)] bg-black relative">
                                {avatarUrl ? (
                                    <img src={avatarUrl} alt={username} className="w-full h-full object-cover transition-transform duration-500 group-hover/avatar:scale-110" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gray-900 text-gray-500">
                                        <User size={40} />
                                    </div>
                                )}

                                {/* Upload Overlay */}
                                {isOwnProfile && (
                                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity">
                                        <span className="text-white text-[10px] font-bold uppercase tracking-wider text-center">
                                            Changer<br />Photo
                                        </span>
                                    </div>
                                )}
                            </div>
                            <div className="absolute -bottom-2 -right-2 bg-neonBlue text-black font-bold text-xs px-2 py-0.5 rounded-sm shadow-lg border border-white/20">
                                LVL {level}
                            </div>
                        </div>

                        {/* Rank Badge */}
                        <div className="text-right">
                            <div className="text-xs text-gray-400 font-mono tracking-widest uppercase mb-1">Rang actuel</div>
                            <div className="text-2xl font-black italic text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 drop-shadow-[0_2px_10px_rgba(234,179,8,0.5)]">
                                {level >= 50 ? 'S-RANK' : level >= 20 ? 'A-RANK' : level >= 10 ? 'B-RANK' : 'C-RANK'}
                            </div>
                        </div>
                    </div>

                    {/* User Info */}
                    <div className="mb-6">
                        <h3 className="text-2xl font-bold text-white tracking-wide">{username}</h3>
                        <div className="flex items-center gap-2 text-neonPurple font-mono text-xs uppercase tracking-widest">
                            <Shield size={12} />
                            <span>{title}</span>
                        </div>
                    </div>

                    {/* XP Bar */}
                    <div className="mb-6">
                        <div className="flex justify-between text-[10px] uppercase font-mono text-gray-400 mb-1">
                            <span>Expérience</span>
                            <span>{Math.floor(xp)} / {nextLevelXp} XP</span>
                        </div>
                        <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden border border-white/5">
                            <div
                                className="h-full bg-gradient-to-r from-neonBlue to-neonPurple shadow-[0_0_15px_rgba(67,97,238,0.5)] transition-all duration-1000 ease-out"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white/5 p-3 rounded-lg border border-white/5 flex items-center gap-3">
                            <div className="p-2 bg-yellow-500/20 rounded-md text-yellow-400">
                                <Trophy size={16} />
                            </div>
                            <div>
                                <div className="text-[10px] text-gray-500 uppercase tracking-wider">Victoires</div>
                                <div className="text-lg font-bold text-white">{wins}</div>
                            </div>
                        </div>

                        <div className="bg-white/5 p-3 rounded-lg border border-white/5 flex items-center gap-3">
                            <div className="p-2 bg-red-500/20 rounded-md text-red-400">
                                <Zap size={16} />
                            </div>
                            <div>
                                <div className="text-[10px] text-gray-500 uppercase tracking-wider">Win Rate</div>
                                <div className="text-lg font-bold text-white">{winRate}%</div>
                            </div>
                        </div>
                    </div>

                    {/* Footer Decoration */}
                    <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center opacity-50">
                        <div className="text-[8px] font-mono text-gray-600">ID: {Math.random().toString(36).substr(2, 8).toUpperCase()}</div>
                        <div className="flex gap-1">
                            <div className="w-1 h-1 rounded-full bg-gray-600" />
                            <div className="w-1 h-1 rounded-full bg-gray-600" />
                            <div className="w-1 h-1 rounded-full bg-gray-600" />
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default ProfileCard;
