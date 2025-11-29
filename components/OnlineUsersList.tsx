import React, { useEffect, useState } from 'react';
import { User, MessageCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import * as chatService from '../services/chatService';
import * as userService from '../services/userService';

interface OnlineUsersListProps {
    onUserClick: (userId: string) => void;
}

const OnlineUsersList: React.FC<OnlineUsersListProps> = ({ onUserClick }) => {
    const { user } = useAuth();
    const [onlineUserIds, setOnlineUserIds] = useState<string[]>([]);
    const [allUsers, setAllUsers] = useState<userService.User[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadUsers();
        if (user) {
            const subscription = chatService.subscribeToPresence(user.id, (userIds) => {
                setOnlineUserIds(userIds);
            });
            return () => {
                subscription.unsubscribe();
            };
        }
    }, [user]);

    const loadUsers = async () => {
        const users = await userService.getAllUsers();
        setAllUsers(users);
        setLoading(false);
    };

    const onlineUsers = allUsers.filter(u => onlineUserIds.includes(u.id) && u.id !== user?.id);
    const offlineUsers = allUsers.filter(u => !onlineUserIds.includes(u.id) && u.id !== user?.id);

    if (loading) return <div className="text-gray-500 text-sm p-4">Chargement...</div>;

    return (
        <div className="bg-midnight/30 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-sm h-full flex flex-col">
            <div className="p-4 border-b border-white/10 bg-black/20">
                <h3 className="text-lg font-display font-bold text-white flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                    En Ligne ({onlineUsers.length})
                </h3>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                {onlineUsers.length === 0 && (
                    <p className="text-gray-500 text-sm text-center py-4">Personne d'autre n'est en ligne.</p>
                )}

                {onlineUsers.map(u => (
                    <button
                        key={u.id}
                        onClick={() => onUserClick(u.id)}
                        className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors group text-left"
                    >
                        <div className="relative">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center overflow-hidden">
                                {u.avatar_url ? (
                                    <img src={u.avatar_url} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <User size={16} className="text-gray-400" />
                                )}
                            </div>
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-black rounded-full" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-white font-bold text-sm truncate">{u.username || 'Utilisateur'}</p>
                            <p className="text-neonPink text-xs flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <MessageCircle size={10} /> Message privé
                            </p>
                        </div>
                    </button>
                ))}

                {offlineUsers.length > 0 && (
                    <>
                        <div className="my-4 px-2 text-xs font-bold text-gray-600 uppercase tracking-wider">Hors Ligne</div>
                        {offlineUsers.map(u => (
                            <button
                                key={u.id}
                                onClick={() => onUserClick(u.id)}
                                className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors group text-left opacity-60 hover:opacity-100"
                            >
                                <div className="relative">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center overflow-hidden">
                                        {u.avatar_url ? (
                                            <img src={u.avatar_url} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <User size={16} className="text-gray-400" />
                                        )}
                                    </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-white font-bold text-sm truncate">{u.username || 'Utilisateur'}</p>
                                </div>
                            </button>
                        ))}
                    </>
                )}
            </div>
        </div>
    );
};

export default OnlineUsersList;
