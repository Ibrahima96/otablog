import React, { useState } from 'react';
import Navbar from './components/Navbar';
import FloatingGallery from './components/FloatingGallery';
import TerminalChat from './components/TerminalChat';
import AuthModal from './components/AuthModal';
import Community from './components/Community';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ArrowRight, MessageSquare, Share2, Sparkles } from 'lucide-react';

const Hero = ({ onOpenAuth }: { onOpenAuth: () => void }) => {
  const { user } = useAuth();

  return (
    <header className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
      {/* Animated Grid Background */}
      <div className="absolute inset-0 bg-cyber-grid bg-[length:50px_50px] opacity-[0.15] animate-[pulse_4s_infinite]"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-transparent to-transparent"></div>

      <div className="relative z-10 text-center max-w-5xl mx-auto px-6">
        <div className="inline-block mb-6 px-4 py-1.5 rounded-full border border-neonPink/30 bg-neonPink/10 text-neonPink text-xs font-mono tracking-widest uppercase backdrop-blur-md animate-fade-in-up">
          Bienvenue au Niveau Supérieur
        </div>

        <h1 className="text-5xl md:text-8xl font-display font-black text-white mb-2 leading-tight tracking-tighter neon-text-glow">
          CULTURE <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyanLight to-electricBlue">OTAKU</span>
          <br />
          DU FUTUR
        </h1>

        <p className="text-xl md:text-2xl font-jp text-gray-400 mb-8 tracking-widest font-light">
          次世代のオタクコミュニティ
        </p>

        <p className="max-w-2xl mx-auto text-gray-400 mb-10 text-lg leading-relaxed">
          Rejoignez le réseau d'élite des créateurs, fans et futuristes.
          Discussions immersives, galeries néon et interactions IA.
        </p>

        <div className="flex flex-col md:flex-row gap-6 justify-center items-center">
          <button
            onClick={user ? undefined : onOpenAuth}
            className="group relative px-8 py-4 bg-white text-black font-display font-bold tracking-wide rounded-sm overflow-hidden transition-transform hover:scale-105"
          >
            <span className="relative z-10 flex items-center gap-2">
              {user ? 'ACCÉDER AU HUB' : "LANCER L'AVENTURE"} <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-neonPink to-neonPurple opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <span className="absolute inset-0 z-10 flex items-center justify-center gap-2 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              {user ? 'ACCÉDER AU HUB' : "LANCER L'AVENTURE"} <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </span>
          </button>

          <button className="px-8 py-4 border border-white/20 text-white font-display font-bold tracking-wide rounded-sm hover:bg-white/5 transition-all backdrop-blur-sm">
            DÉCOUVRIR
          </button>
        </div>
      </div>
    </header>
  );
};

const Features = () => (
  <section id="discover" className="py-24 bg-obsidian relative">
    <div className="max-w-7xl mx-auto px-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          {
            title: "Découvrir",
            desc: "Explorez l'art anime tendance et l'esthétique cyberpunk sélectionnés par la communauté.",
            icon: <Sparkles className="w-8 h-8 text-neonPink" />,
            border: "hover:border-neonPink/50",
            glow: "group-hover:shadow-[0_0_30px_rgba(247,37,133,0.2)]"
          },
          {
            title: "Partager",
            desc: "Publiez vos créations, théories et collections en haute fidélité.",
            icon: <Share2 className="w-8 h-8 text-cyanLight" />,
            border: "hover:border-cyanLight/50",
            glow: "group-hover:shadow-[0_0_30px_rgba(76,201,240,0.2)]"
          },
          {
            title: "Discuter",
            desc: "Participez à des conversations approfondies avec un public passionné.",
            icon: <MessageSquare className="w-8 h-8 text-neonPurple" />,
            border: "hover:border-neonPurple/50",
            glow: "group-hover:shadow-[0_0_30px_rgba(114,9,183,0.2)]"
          }
        ].map((feature, i) => (
          <div key={i} className={`group p-8 rounded-2xl bg-midnight/30 border border-white/5 backdrop-blur-sm transition-all duration-300 ${feature.border} ${feature.glow}`}>
            <div className="mb-6 p-4 rounded-xl bg-white/5 w-fit group-hover:scale-110 transition-transform duration-300">
              {feature.icon}
            </div>
            <h3 className="text-2xl font-display font-bold text-white mb-4">{feature.title}</h3>
            <p className="text-gray-400 leading-relaxed">{feature.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const Footer = () => (
  <footer className="border-t border-white/10 bg-[#050505] pt-20 pb-10">
    <div className="max-w-7xl mx-auto px-6 flex flex-col items-center">
      <div className="text-3xl font-display font-bold text-white mb-2">OTABLOG</div>
      <div className="text-sm font-jp text-gray-500 mb-8 tracking-[0.3em]">未来のコミュニティ</div>

      <div className="flex gap-8 mb-12">
        {['Twitter', 'Discord', 'Instagram', 'Github'].map(social => (
          <a key={social} href="#" className="text-gray-400 hover:text-white hover:underline decoration-neonPink underline-offset-4 transition-all">
            {social}
          </a>
        ))}
      </div>


      <p className="text-gray-600 text-sm">© 2025 OtaBlog - Créé par Bicomaru Shogunai. Tous droits réservés.</p>
    </div>
  </footer>
);

const AppContent: React.FC = () => {
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  return (
    <main className="bg-obsidian min-h-screen text-white selection:bg-neonPink selection:text-white">
      <Navbar onOpenAuth={() => setIsAuthOpen(true)} />
      <Hero onOpenAuth={() => setIsAuthOpen(true)} />
      <FloatingGallery />
      <Features />
      <Community onOpenAuth={() => setIsAuthOpen(true)} />
      <TerminalChat onOpenAuth={() => setIsAuthOpen(true)} />
      <Footer />
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </main>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;