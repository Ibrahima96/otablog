import React, { useState, useEffect, useRef } from 'react';
import { Send, User, Loader, Mic, Square, Play, Pause } from 'lucide-react';
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
    const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
    const [recordingTime, setRecordingTime] = useState(0);
    const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        loadMessages();

        // Subscribe to realtime updates
        subscriptionRef.current = chatService.subscribeToChannel(channel.id, (msg) => {
            setMessages(prev => [...prev, msg]);
            scrollToBottom();
        });

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

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream);
            const chunks: Blob[] = [];

            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunks.push(e.data);
                }
            };

            recorder.onstop = async () => {
                const audioBlob = new Blob(chunks, { type: 'audio/webm' });
                setAudioChunks([]);

                // Upload and send
                if (user) {
                    const url = await chatService.uploadVoiceMessage(audioBlob);
                    if (url) {
                        await chatService.sendMessage(channel.id, user.id, 'Message vocal', 'audio', url);
                    }
                }

                // Stop tracks
                stream.getTracks().forEach(track => track.stop());
            };

            recorder.start();
            setMediaRecorder(recorder);
            setIsRecording(true);

            // Timer
            setRecordingTime(0);
            recordingTimerRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);

        } catch (error) {
            console.error('Error accessing microphone:', error);
            alert('Impossible d\'accéder au micro. Vérifiez vos permissions.');
        }
    };

    const stopRecording = () => {
        if (mediaRecorder && isRecording) {
            mediaRecorder.stop();
            setIsRecording(false);
            if (recordingTimerRef.current) {
                clearInterval(recordingTimerRef.current);
            }
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader className="w-8 h-8 text-neonPink animate-spin" />
            </div>
        );
    }

    return (
        <div className="flex flex-col h-[600px] bg-midnight/30 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-sm">
            {/* Header */}
            <div className="p-4 border-b border-white/10 bg-black/20">
                <h3 className="text-xl font-display font-bold text-white">{channel.name}</h3>
                <p className="text-sm text-gray-400">{channel.description}</p>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                {messages.length === 0 ? (
                    <div className="text-center text-gray-500 py-10">
                        <p>Le salon est calme... Lancez la discussion !</p>
                    </div>
                ) : (
                    messages.map((msg) => {
                        const isMe = user?.id === msg.user_id;
                        return (
                            <div key={msg.id} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : ''}`}>
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center flex-shrink-0">
                                    {msg.avatar_url ? (
                                        <img src={msg.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                                    ) : (
                                        <User size={14} className="text-gray-400" />
                                    )}
                                </div>
                                <div className={`max-w-[70%] ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs text-gray-400 font-bold">{msg.username}</span>
                                        <span className="text-[10px] text-gray-600">
                                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <div className={`p-3 rounded-2xl text-sm ${isMe
                                            ? 'bg-neonPink/20 text-white rounded-tr-none border border-neonPink/30'
                                            : 'bg-white/10 text-gray-200 rounded-tl-none border border-white/5'
                                        }`}>
                                        {msg.message_type === 'audio' && msg.media_url ? (
                                            <div className="flex items-center gap-2 min-w-[200px]">
                                                <audio controls src={msg.media_url} className="w-full h-8" />
                                            </div>
                                        ) : (
                                            msg.content
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-white/10 bg-black/20">
                {user ? (
                    <div className="flex gap-3 items-center">
                        {isRecording ? (
                            <div className="flex-1 flex items-center gap-4 bg-red-500/20 border border-red-500/50 rounded-xl px-4 py-3 animate-pulse">
                                <div className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
                                <span className="text-red-500 font-mono font-bold">{formatTime(recordingTime)}</span>
                                <span className="text-white text-sm flex-1 text-center">Enregistrement...</span>
                                <button
                                    onClick={stopRecording}
                                    className="p-2 bg-red-500 text-white rounded-full hover:scale-110 transition-transform"
                                >
                                    <Square size={16} fill="currentColor" />
                                </button>
                            </div>
                        ) : (
                            <>
                                <form onSubmit={handleSendMessage} className="flex-1 flex gap-3">
                                    <input
                                        type="text"
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        placeholder={`Message dans #${channel.slug}...`}
                                        className="flex-1 bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-neonPink/50 transition-colors"
                                    />
                                    <button
                                        type="submit"
                                        disabled={!newMessage.trim()}
                                        className="px-4 py-2 bg-neonPink hover:bg-neonPink/80 text-white rounded-xl font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                                    >
                                        <Send size={20} />
                                    </button>
                                </form>
                                <button
                                    onClick={startRecording}
                                    className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors border border-white/10"
                                    title="Message vocal"
                                >
                                    <Mic size={20} />
                                </button>
                            </>
                        )}
                    </div>
                ) : (
                    <div className="text-center py-2">
                        <p className="text-gray-400 text-sm">Connectez-vous pour participer au chat.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatRoom;
