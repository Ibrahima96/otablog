import React, { useState, useRef, useEffect } from 'react';
import { Send, Terminal, Cpu, Lock, LogIn } from 'lucide-react';
import { streamChatResponse } from '../services/llamaService';
import { ChatMessage } from '../types';
import { useAuth } from '../context/AuthContext';

interface TerminalChatProps {
  onOpenAuth?: () => void;
}

const TerminalChat: React.FC<TerminalChatProps> = ({ onOpenAuth }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', role: 'model', text: 'Système initialisé. OtaBot v2.5 en ligne. Comment puis-je vous aider aujourd\'hui, user-san ?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading || !user) return;

    const userText = input;
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: userText
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    // Create a placeholder for the bot response
    const botMsgId = (Date.now() + 1).toString();
    const botMsg: ChatMessage = {
      id: botMsgId,
      role: 'model',
      text: '',
      isTyping: true
    };

    setMessages(prev => [...prev, botMsg]);

    try {
      const history = messages.map(m => ({ role: m.role, text: m.text }));

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

      // Stream completed successfully - remove typing indicator
      setMessages(prev => prev.map(msg =>
        msg.id === botMsgId
          ? { ...msg, isTyping: false }
          : msg
      ));
    } catch (error) {
      console.error("Chat Error:", error);
      setMessages(prev => prev.map(msg =>
        msg.id === botMsgId
          ? { ...msg, text: msg.text || "Erreur de connexion au serveur.", isTyping: false }
          : msg
      ));
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && user) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <section id="chat" className="py-24 bg-obsidian relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-electricBlue/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">
            TERMINAL <span className="text-cyanLight">IA</span>
          </h2>
          <p className="text-gray-400 font-jp tracking-wider">人工知能アシスタント</p>
        </div>

        {/* Terminal Window */}
        <div className="w-full bg-[#050505] border border-gray-800 rounded-xl overflow-hidden shadow-[0_0_50px_rgba(67,97,238,0.15)] ring-1 ring-white/5 relative">
          {/* Terminal Header */}
          <div className="bg-[#1a1a1a] p-3 flex items-center justify-between border-b border-gray-800">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <div className="w-3 h-3 rounded-full bg-green-500/80" />
            </div>
            <div className="text-xs text-gray-500 font-mono">user@otablog:~/interface</div>
            <div className="w-10"></div>
          </div>

          {/* Authentication Overlay for Non-Logged Users */}
          {!user && (
            <div className="absolute inset-0 bg-obsidian/95 backdrop-blur-md z-20 flex items-center justify-center">
              <div className="text-center max-w-md p-8">
                <div className="mb-6 mx-auto w-20 h-20 bg-neonPurple/10 rounded-full flex items-center justify-center border border-neonPurple/30">
                  <Lock className="w-10 h-10 text-neonPurple" />
                </div>

                <h3 className="text-2xl font-display font-bold text-white mb-4">
                  ACCÈS RESTREINT
                </h3>

                <p className="text-gray-400 mb-6 leading-relaxed">
                  Le Terminal IA est réservé aux membres authentifiés.
                  Connectez-vous pour accéder à OtaBot et discuter avec l'intelligence artificielle.
                </p>

                <div className="space-y-3">
                  <button
                    onClick={onOpenAuth}
                    className="w-full bg-gradient-to-r from-neonPurple to-neonPink text-white font-bold py-3 px-6 rounded-lg shadow-[0_0_20px_rgba(247,37,133,0.4)] hover:shadow-[0_0_30px_rgba(247,37,133,0.6)] hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                  >
                    <LogIn size={20} />
                    <span>SE CONNECTER</span>
                  </button>

                  <p className="text-xs text-gray-500 font-mono">
                    // Authentification requise pour déverrouiller les fonctionnalités IA
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Chat Area */}
          <div
            ref={scrollRef}
            className={`h-[400px] overflow-y-auto p-6 font-mono text-sm space-y-4 scroll-smooth ${!user ? 'opacity-30 blur-sm' : ''}`}
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-4 rounded-lg border relative overflow-hidden ${msg.role === 'user'
                    ? 'bg-electricBlue/10 border-electricBlue/30 text-electricBlue rounded-br-none'
                    : 'bg-neonPurple/10 border-neonPurple/30 text-neonPurple rounded-bl-none'
                    }`}
                >
                  <div className="flex items-center gap-2 mb-2 opacity-50 text-[10px] uppercase tracking-widest">
                    {msg.role === 'model' ? <Terminal size={12} /> : null}
                    {msg.role === 'model' ? 'OtaBot' : 'Utilisateur'}
                  </div>

                  {/* Logic for Typing Indicator vs Message Text */}
                  {msg.isTyping && msg.text.length === 0 ? (
                    <div className="flex flex-col gap-2 min-w-[150px] py-1">
                      {/* Animated Data Bars */}
                      <div className="flex items-end gap-1 h-6">
                        <div className="w-1.5 h-full bg-neonPink/40 animate-[pulse_0.8s_ease-in-out_infinite]" style={{ animationDelay: '0ms', height: '40%' }}></div>
                        <div className="w-1.5 h-full bg-neonPink/60 animate-[pulse_0.8s_ease-in-out_infinite]" style={{ animationDelay: '150ms', height: '80%' }}></div>
                        <div className="w-1.5 h-full bg-neonPink animate-[pulse_0.8s_ease-in-out_infinite]" style={{ animationDelay: '300ms', height: '60%' }}></div>
                        <div className="w-1.5 h-full bg-neonPink/60 animate-[pulse_0.8s_ease-in-out_infinite]" style={{ animationDelay: '450ms', height: '90%' }}></div>
                        <div className="w-1.5 h-full bg-neonPink/40 animate-[pulse_0.8s_ease-in-out_infinite]" style={{ animationDelay: '600ms', height: '50%' }}></div>
                      </div>
                      <div className="flex items-center gap-2 text-neonPink text-[10px] tracking-widest font-bold animate-pulse">
                        <Cpu size={10} className="animate-spin" />
                        <span>TRAITEMENT_NEURAL...</span>
                      </div>
                    </div>
                  ) : (
                    <p className="leading-relaxed whitespace-pre-wrap">
                      {msg.text}
                      {msg.isTyping && (
                        <span className="inline-block w-3 h-5 align-bottom bg-neonPink ml-1 animate-[pulse_0.5s_infinite] shadow-[0_0_10px_#F72585]" />
                      )}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Input Area */}
          <div className={`p-4 bg-[#111] border-t border-gray-800 flex gap-4 relative ${!user ? 'opacity-30 blur-sm' : ''}`}>
            {isLoading && (
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-neonPink to-transparent animate-pulse"></div>
            )}
            <span className="text-green-500 font-mono py-3">{'>'}</span>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading || !user}
              placeholder={!user ? "Connexion requise..." : isLoading ? "Liaison de données active..." : "Posez une question sur les animes ou le futur..."}
              className="flex-1 bg-transparent border-none outline-none text-white font-mono placeholder-gray-600 caret-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !user}
              className={`text-gray-400 hover:text-cyanLight transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${isLoading ? 'animate-pulse text-neonPink' : ''}`}
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TerminalChat;