import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { streamChatResponse } from '../services/llamaService';
import { ChatMessage } from '../types';
import { useAuth } from '../context/AuthContext';

const FloatingChat: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            id: '1',
            role: 'model',
            text: 'Salut ! Je suis l\'arbitre IA du Salon. Besoin d\'infos sur les combattants ou d\'un avis impartial ?'
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const { user } = useAuth();

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isOpen]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userText = input;
        const userMsg: ChatMessage = {
            id: Date.now().toString(),
            role: 'user',
            text: userText
        };

        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        const botMsgId = (Date.now() + 1).toString();
        const botMsg: ChatMessage = {
            id: botMsgId,
            role: 'model',
            text: '',
            isTyping: true
        };

        setMessages(prev => [...prev, botMsg]);

        try {
            // Context for the Salon AI
            const contextPrompt = "Tu es un assistant IA expert en culture anime/manga, agissant comme modérateur et commentateur dans une arène de duel virtuelle. Tes réponses doivent être courtes, dynamiques et parfois humoristiques. Tu analyses les forces et faiblesses des personnages si on te le demande.";

            const history = [
                { role: 'user', text: contextPrompt },
                ...messages.map(m => ({ role: m.role, text: m.text }))
            ];

            const stream = streamChatResponse(history, userText);
            let fullResponse = "";

            for await (const chunk of stream) {
                fullResponse += chunk;
                setMessages(prev => prev.map(msg =>
                    msg.id === botMsgId
                        ? { ...msg, text: fullResponse, isTyping: true }
                        : msg
                ));
            }

            setMessages(prev => prev.map(msg =>
                msg.id === botMsgId
                    ? { ...msg, isTyping: false }
                    : msg
            ));
        } catch (error) {
            console.error("Chat Error:", error);
            setMessages(prev => prev.map(msg =>
                msg.id === botMsgId
                    ? { ...msg, text: "Oups, interférence signal...", isTyping: false }
                    : msg
            ));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {/* Floating Button */}
            <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(true)}
                className={`fixed bottom-24 right-6 lg:bottom-6 lg:right-6 z-40 w-14 h-14 rounded-full bg-gradient-to-r from-neonPurple to-neonPink flex items-center justify-center shadow-[0_0_20px_rgba(247,37,133,0.5)] border border-white/20 ${isOpen ? 'hidden' : 'flex'}`}
            >
                <Bot className="text-white w-7 h-7" />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-[#0a0a0a] animate-pulse" />
            </motion.button>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="fixed bottom-0 right-0 w-full h-[100dvh] sm:h-[500px] sm:w-[350px] sm:bottom-6 sm:right-6 z-50 bg-[#111] border-t sm:border border-white/10 sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="p-4 bg-gradient-to-r from-neonPurple/20 to-neonPink/20 border-b border-white/10 flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <Bot size={18} className="text-neonPink" />
                                <span className="font-display font-bold text-white">OtaBot Arbitre</span>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-gray-400 hover:text-white transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Messages */}
                        <div
                            ref={scrollRef}
                            className="flex-1 overflow-y-auto p-4 space-y-4 bg-black/20"
                        >
                            {messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`max-w-[85%] p-3 rounded-xl text-sm ${msg.role === 'user'
                                        ? 'bg-neonPurple/20 text-white rounded-br-none border border-neonPurple/30'
                                        : 'bg-white/5 text-gray-300 rounded-bl-none border border-white/10'
                                        }`}>
                                        {msg.text}
                                        {msg.isTyping && (
                                            <span className="inline-block w-2 h-4 ml-1 bg-neonPink animate-pulse align-middle" />
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Input */}
                        <div className="p-3 border-t border-white/10 bg-[#1a1a1a]">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                    placeholder="Posez une question..."
                                    className="flex-1 bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-neonPink/50 transition-colors"
                                />
                                <button
                                    onClick={handleSend}
                                    disabled={isLoading || !input.trim()}
                                    className="p-2 bg-neonPink/20 hover:bg-neonPink/40 text-neonPink rounded-lg transition-colors disabled:opacity-50"
                                >
                                    <Send size={18} />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default FloatingChat;
