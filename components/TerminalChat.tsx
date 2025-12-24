import React, { useRef, useEffect } from 'react';
import { Send, Terminal, Cpu, Lock, LogIn, Command } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useChatTerminal } from '../hooks/useChatTerminal';
import MatrixRain from './MatrixRain';

interface TerminalChatProps {
  onOpenAuth?: () => void;
  onLaunchDuel?: (questions: any) => void;
  lastGameResult?: { score: number, topic: string } | null;
}

const TerminalChat: React.FC<TerminalChatProps> = ({ onOpenAuth, onLaunchDuel, lastGameResult }) => {
  const { user } = useAuth();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = React.useState('');

  const { messages, sendMessage, isLoading, isMatrixMode } = useChatTerminal({
    user,
    initialMessage: "Connexion sécurisée établie. OtaBot v3.0 (Cyber-Enhanced) en ligne. \nTapez '/help' pour voir les commandes.",
    lastGameResult
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    sendMessage(input);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <section id="chat" className="py-24 bg-obsidian relative overflow-hidden min-h-[800px] flex items-center">
      {/* Background Decor */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-electricBlue/5 blur-[120px] rounded-full pointer-events-none" />

      <MatrixRain active={isMatrixMode} />

      <div className="max-w-4xl mx-auto px-4 relative z-10 w-full">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-6xl font-display font-black text-white mb-4 tracking-tighter crt-text">
            TERMINAL <span className="text-cyanLight text-shadow-glow">IA</span>
          </h2>
          <p className="text-gray-400 font-mono tracking-widest text-xs uppercase opacity-70">
            Link Start // Neural Interface v3.0
          </p>
        </div>

        {/* Terminal Window */}
        <div className="w-full bg-[#050505] border border-gray-800 rounded-xl overflow-hidden shadow-[0_0_50px_rgba(67,97,238,0.15)] ring-1 ring-white/5 relative perspective-1000 group">
          <div className="absolute inset-0 bg-grid-white/[0.02] bg-[length:20px_20px] pointer-events-none" />

          {/* CRT Overlay */}
          <div className="crt absolute inset-0 pointer-events-none z-20 opacity-50 mixing-blend-overlay" />
          <div className="scanline" />

          {/* Terminal Header */}
          <div className="bg-[#0a0a0a] p-3 flex items-center justify-between border-b border-gray-800 relative z-30">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/80 shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/80 shadow-[0_0_10px_rgba(234,179,8,0.5)]" />
              <div className="w-3 h-3 rounded-full bg-green-500/80 shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
            </div>
            <div className="text-xs text-gray-500 font-mono flex items-center gap-2">
              <Lock size={10} />
              user@otablog:~/interface
            </div>
            <div className="opacity-50">
              <Cpu size={14} className="text-gray-500 animate-pulse" />
            </div>
          </div>

          {/* Authentication Overlay for Non-Logged Users */}
          {!user && (
            <div className="absolute inset-0 bg-obsidian/95 backdrop-blur-md z-40 flex items-center justify-center">
              <div className="text-center max-w-md p-8 border border-white/10 rounded-2xl bg-black/50">
                <div className="mb-6 mx-auto w-20 h-20 bg-neonPurple/10 rounded-full flex items-center justify-center border border-neonPurple/30 relative">
                  <div className="absolute inset-0 rounded-full border-t border-neonPurple animate-spin" />
                  <Lock className="w-10 h-10 text-neonPurple" />
                </div>

                <h3 className="text-2xl font-display font-bold text-white mb-4 tracking-widest">
                  ACCÈS RESTREINT
                </h3>

                <p className="text-gray-400 mb-8 leading-relaxed font-mono text-sm">
                  Identity verification required.<br />
                  Please authenticate to access Neural Net.
                </p>

                <button
                  onClick={onOpenAuth}
                  className="w-full bg-white text-black font-bold py-4 px-6 rounded-sm shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(247,37,133,0.4)] hover:scale-[1.02] transition-all flex items-center justify-center gap-2 tracking-widest uppercase"
                >
                  <LogIn size={18} />
                  <span>Initialiser Connexion</span>
                </button>
              </div>
            </div>
          )}

          {/* Chat Area */}
          <div
            ref={scrollRef}
            className={`h-[500px] overflow-y-auto p-6 font-mono text-sm space-y-4 scroll-smooth ${!user ? 'opacity-10 blur-sm' : ''} relative z-10`}
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] p-4 rounded-sm border relative overflow-hidden backdrop-blur-sm transition-all duration-300 hover:scale-[1.01] ${msg.role === 'user'
                    ? 'bg-electricBlue/5 border-electricBlue/30 text-electricBlue shadow-[0_0_15px_rgba(67,97,238,0.1)]'
                    : 'bg-neonPurple/5 border-neonPurple/30 text-neonPurple shadow-[0_0_15px_rgba(114,9,183,0.1)]'
                    }`}
                >
                  <div className="flex items-center gap-2 mb-2 opacity-50 text-[10px] uppercase tracking-widest border-b border-white/5 pb-1">
                    {msg.role === 'model' ? <Terminal size={10} /> : <Command size={10} />}
                    {msg.role === 'model' ? 'AI_CORE' : 'UNKNOWN_USER'}
                    <span className="ml-auto text-[8px]">{new Date().toLocaleTimeString()}</span>
                  </div>

                  {msg.isTyping && msg.text.length === 0 ? (
                    <div className="flex items-center gap-2 text-neonPink text-xs font-bold animate-pulse py-2">
                      <span className="w-2 h-2 bg-neonPink rounded-full" />
                      <span>PROCESSING_DATA_STREAM...</span>
                    </div>
                  ) : (
                    <>
                      <p className="leading-relaxed whitespace-pre-wrap crt-text relative">
                        {msg.text}
                        {msg.isTyping && (
                          <span className="inline-block w-2 h-4 bg-neonPink ml-1 animate-pulse align-middle" />
                        )}
                      </p>
                      {/* Render Duel Invite if present */}
                      {msg.data?.type === 'duel_invite' && onLaunchDuel && (
                        <div className="mt-4 p-4 border border-neonPink/30 bg-neonPink/5 rounded-sm relative group/invite cursor-pointer hover:bg-neonPink/10 transition-colors" onClick={() => onLaunchDuel(msg.data?.payload)}>
                          <div className="absolute top-0 right-0 p-1">
                            <span className="flex h-3 w-3 relative">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neonPink opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-3 w-3 bg-neonPink"></span>
                            </span>
                          </div>
                          <h4 className="text-neonPink font-bold text-lg mb-1 flex items-center gap-2">
                            <Command size={18} />
                            DUEL_PROTOCOL_READY
                          </h4>
                          <p className="text-xs text-gray-400 mb-3">Custom simulation generated. Difficulty: ADAPTIVE.</p>
                          <button
                            className="w-full py-2 bg-neonPink text-white font-bold tracking-widest text-xs uppercase hover:bg-neonPink/80 transition-colors shadow-[0_0_10px_rgba(247,37,133,0.4)]"
                          >
                            Initialiser le Duel
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Input Area */}
          <div className={`p-4 bg-[#0a0a0a] border-t border-gray-800 flex gap-4 relative z-30 ${!user ? 'opacity-30 blur-sm' : ''}`}>
            {isLoading && (
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-neonPink to-transparent animate-pulse"></div>
            )}
            <span className="text-neonPink font-mono py-3 font-bold animate-pulse">{'>'}</span>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading || !user}
              placeholder={isLoading ? "Neural uplink active..." : "Enter command or query..."}
              className="flex-1 bg-transparent border-none outline-none text-white font-mono placeholder-gray-700 caret-neonPink disabled:opacity-50"
              autoComplete="off"
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !user}
              className={`text-gray-500 hover:text-white transition-colors disabled:opacity-30 ${isLoading ? 'animate-spin text-neonPink' : ''}`}
            >
              {isLoading ? <Cpu className="w-5 h-5" /> : <Send className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <div className="mt-4 flex justify-between text-[10px] text-gray-600 font-mono uppercase tracking-widest">
          <div>System status: NORMAL</div>
          <div>Encrypted Connection: <span className="text-green-500">SECURE</span></div>
        </div>
      </div>
    </section>
  );
};

export default TerminalChat;