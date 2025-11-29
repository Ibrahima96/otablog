import React, { useState, useEffect, useRef } from 'react';
import { Send, User, Loader, Mic, Square, Play, Pause, Image as ImageIcon, MoreVertical, Edit2, Trash2, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import * as chatService from '../services/chatService';
import { supabase } from '../services/supabaseClient';

interface ChatRoomProps {
    channel: chatService.Channel;
}

const ChatRoom: React.FC<ChatRoomProps> = ({ channel }) => {
    const { user } = useAuth();
    const [messages, setMessages] = useState<chatService.ChannelMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const subscriptionRef = useRef<any>(null);

    // Voice Recording State
    const [isRecording, setIsRecording] = useState(false);
    const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
    const [recordingTime, setRecordingTime] = useState(0);
    const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);

    // Edit & Delete State
    const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
    const [editContent, setEditContent] = useState('');
    const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

    // Image Upload State
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        loadMessages();

        // Subscribe to realtime updates
        subscriptionRef.current = chatService.subscribeToChannel(
            channel.id,
            (msg) => {
                setMessages(prev => [...prev, msg]);
                scrollToBottom();
            },
            (updatedMsg) => {
                setMessages(prev => prev.map(m => m.id === updatedMsg.id ? updatedMsg : m));
            }
        );

        return () => {
            if (subscriptionRef.current) {
                supabase.removeChannel(subscriptionRef.current);
            }
        };
    }, [channel.id]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const loadMessages = async () => {
        setLoading(true);
        const msgs = await chatService.getChannelMessages(channel.id);
        setMessages(msgs);
        setLoading(false);
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !user) return;

        try {
            await chatService.sendMessage(channel.id, user.id, newMessage);
            setNewMessage('');
        } catch (error) {
            console.error('Error sending message:', error);
            alert('Erreur lors de l\'envoi du message');
        }
    };

    const handleEditMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingMessageId || !editContent.trim()) return;

        try {
            await chatService.editMessage(editingMessageId, editContent);
            setEditingMessageId(null);
            setEditContent('');
            setActiveMenuId(null);
        } catch (error) {
            console.error('Error editing message:', error);
            alert('Erreur lors de la modification');
        }
    };

    const handleDeleteMessage = async (messageId: string) => {
        if (!confirm('Voulez-vous vraiment supprimer ce message ?')) return;
        try {
            await chatService.deleteMessage(messageId);
            setActiveMenuId(null);
        } catch (error) {
            console.error('Error deleting message:', error);
            alert('Erreur lors de la suppression');
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || !e.target.files[0] || !user) return;

        setIsUploading(true);
        const file = e.target.files[0];

        try {
            const url = await chatService.uploadChatMedia(file);
            if (url) {
                await chatService.sendMessage(channel.id, user.id, 'Image', 'image', url);
            }
        } catch (error) {
            console.error('Error uploading image:', error);
            alert('Erreur lors de l\'envoi de l\'image');
        }
        setIsUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream);
            const chunks: Blob[] = [];

            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunks.push(e.data);
            };

            recorder.onstop = async () => {
                const audioBlob = new Blob(chunks, { type: 'audio/webm' });
                if (user) {
                    const url = await chatService.uploadChatMedia(audioBlob);
                    if (url) {
                        await chatService.sendMessage(channel.id, user.id, 'Message vocal', 'audio', url);
                    }
                }
                stream.getTracks().forEach(track => track.stop());
            };

            recorder.start();
            setMediaRecorder(recorder);
            setIsRecording(true);
            setRecordingTime(0);
            recordingTimerRef.current = setInterval(() => setRecordingTime(prev => prev + 1), 1000);

        } catch (error) {
            console.error('Error accessing microphone:', error);
            alert('Impossible d\'accéder au micro.');
        }
    };

    const stopRecording = () => {
        if (mediaRecorder && isRecording) {
            mediaRecorder.stop();
            setIsRecording(false);
            if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (loading) {
        return <div className="flex items-center justify-center h-64"><Loader className="w-8 h-8 text-neonPink animate-spin" /></div>;
    }

    return (
        <div className="flex flex-col h-[calc(100vh-220px)] md:h-[600px] lg:h-[700px] bg-midnight/30 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-sm" onClick={() => setActiveMenuId(null)}>
            {/* Header */}
            <div className="p-4 border-b border-white/10 bg-black/20">
                <h3 className="text-xl font-display font-bold text-white">{channel.name}</h3>
                <p className="text-sm text-gray-400">{channel.description}</p>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                {messages.map((msg) => {
                    const isMe = user?.id === msg.user_id;
                    const isDeleted = !!msg.deleted_at;

                    if (isDeleted) {
                        return (
                            <div key={msg.id} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : ''}`}>
                                <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center"><User size={14} className="text-gray-500" /></div>
                                <div className="p-3 rounded-2xl bg-white/5 text-gray-500 text-sm italic border border-white/5">
                                    🚫 Ce message a été supprimé
                                </div>
                            </div>
                        );
                    }

                    return (
                        <div key={msg.id} className={`flex gap-3 group ${isMe ? 'flex-row-reverse' : ''}`}>
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                {msg.avatar_url ? <img src={msg.avatar_url} alt="" className="w-full h-full object-cover" /> : <User size={14} className="text-gray-400" />}
                            </div>
                            <div className={`max-w-[70%] ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs text-gray-400 font-bold">{msg.username}</span>
                                    <span className="text-[10px] text-gray-600">{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>

                                <div className="relative group/msg">
                                    {editingMessageId === msg.id ? (
                                        <form onSubmit={handleEditMessage} className="flex gap-2 items-center bg-black/50 p-2 rounded-xl border border-neonPink/50">
                                            <input
                                                autoFocus
                                                value={editContent}
                                                onChange={e => setEditContent(e.target.value)}
                                                className="bg-transparent text-white text-sm outline-none min-w-[200px]"
                                            />
                                            <button type="submit" className="text-neonPink hover:text-white"><Send size={14} /></button>
                                            <button type="button" onClick={() => setEditingMessageId(null)} className="text-gray-400 hover:text-white"><X size={14} /></button>
                                        </form>
                                    ) : (
                                        <div className={`p-3 rounded-2xl text-sm relative ${isMe ? 'bg-neonPink/20 text-white rounded-tr-none border border-neonPink/30' : 'bg-white/10 text-gray-200 rounded-tl-none border border-white/5'}`}>
                                            {msg.message_type === 'audio' && msg.media_url ? (
                                                <div className="flex items-center gap-2 min-w-[200px]"><audio controls src={msg.media_url} className="w-full h-8" /></div>
                                            ) : msg.message_type === 'image' && msg.media_url ? (
                                                <img src={msg.media_url} alt="Image partagée" className="max-w-full rounded-lg max-h-64 object-cover cursor-pointer hover:opacity-90 transition-opacity" onClick={() => window.open(msg.media_url, '_blank')} />
                                            ) : (
                                                <>
                                                    {msg.content}
                                                    {msg.is_edited && <span className="text-[10px] text-gray-400 ml-2 italic">(modifié)</span>}
                                                </>
                                            )}
                                        </div>
                                    )}

                                    {/* Context Menu Trigger */}
                                    {isMe && !editingMessageId && !isDeleted && (
                                        <div className={`absolute top-0 ${isMe ? '-left-8' : '-right-8'} opacity-0 group-hover/msg:opacity-100 transition-opacity`}>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setActiveMenuId(activeMenuId === msg.id ? null : msg.id); }}
                                                className="p-1 hover:bg-white/10 rounded-full text-gray-400 hover:text-white"
                                            >
                                                <MoreVertical size={16} />
                                            </button>
                                            {activeMenuId === msg.id && (
                                                <div className={`absolute top-6 ${isMe ? 'right-0' : 'left-0'} bg-[#111] border border-white/10 rounded-lg shadow-xl z-10 overflow-hidden min-w-[120px]`}>
                                                    {msg.message_type === 'text' && (
                                                        <button onClick={() => { setEditingMessageId(msg.id); setEditContent(msg.content); setActiveMenuId(null); }} className="w-full text-left px-4 py-2 text-sm text-white hover:bg-white/10 flex items-center gap-2">
                                                            <Edit2 size={14} /> Modifier
                                                        </button>
                                                    )}
                                                    <button onClick={() => handleDeleteMessage(msg.id)} className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2">
                                                        <Trash2 size={14} /> Supprimer
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 md:p-4 border-t border-white/10 bg-black/40 backdrop-blur-md">
                {user ? (
                    <div className="flex gap-2 md:gap-3 items-end">
                        {isRecording ? (
                            <div className="flex-1 flex items-center gap-4 bg-red-500/20 border border-red-500/50 rounded-2xl px-4 py-3 animate-pulse">
                                <div className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
                                <span className="text-red-500 font-mono font-bold">{formatTime(recordingTime)}</span>
                                <span className="text-white text-sm flex-1 text-center">Enregistrement...</span>
                                <button onClick={stopRecording} className="p-2 bg-red-500 text-white rounded-full hover:scale-110 transition-transform shadow-lg shadow-red-500/30"><Square size={16} fill="currentColor" /></button>
                            </div>
                        ) : (
                            <>
                                <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={isUploading}
                                    className="p-3 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-full transition-colors border border-white/5 disabled:opacity-50 flex-shrink-0"
                                >
                                    {isUploading ? <Loader size={20} className="animate-spin" /> : <ImageIcon size={20} />}
                                </button>

                                <form onSubmit={handleSendMessage} className="flex-1 bg-white/5 border border-white/10 rounded-2xl flex items-center px-4 py-2 focus-within:border-neonPink/50 focus-within:bg-white/10 transition-all">
                                    <input
                                        type="text"
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        placeholder={`Message...`}
                                        className="flex-1 bg-transparent text-white placeholder-gray-500 focus:outline-none min-w-0 py-1"
                                    />
                                </form>

                                {newMessage.trim() ? (
                                    <button
                                        onClick={handleSendMessage}
                                        disabled={!newMessage.trim()}
                                        className="p-3 bg-neonPink hover:bg-neonPink/80 text-white rounded-full shadow-lg shadow-neonPink/20 transition-all hover:scale-105 active:scale-95 flex-shrink-0"
                                    >
                                        <Send size={20} />
                                    </button>
                                ) : (
                                    <button
                                        onClick={startRecording}
                                        className="p-3 bg-neonPurple hover:bg-neonPurple/80 text-white rounded-full shadow-lg shadow-neonPurple/20 transition-all hover:scale-105 active:scale-95 flex-shrink-0"
                                        title="Message vocal"
                                    >
                                        <Mic size={20} />
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                ) : (
                    <div className="text-center py-2"><p className="text-gray-400 text-sm">Connectez-vous pour participer au chat.</p></div>
                )}
            </div>
        </div>
    );
};

export default ChatRoom;
