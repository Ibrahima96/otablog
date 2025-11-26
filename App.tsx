import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import FloatingGallery from './components/FloatingGallery';
import TerminalChat from './components/TerminalChat';
import AuthModal from './components/AuthModal';
import Community from './components/Community';
import PostModal from './components/PostModal';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ArrowRight, MessageSquare, Share2, Sparkles, Trophy, Heart, MessageCircle, ExternalLink } from 'lucide-react';
import SalonPage from './components/SalonPage';
import * as salonService from './services/salonService';
import * as communityService from './services/communityService';
import { CommunityPost } from './types';

const Hero = ({ onOpenAuth }: { onOpenAuth: () => void }) => {
  const { user } = useAuth();

  return (
    <header className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
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
          Rejoignez le réseau d'élite des créateurs, fans et futur istes.
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

const ChampionSection: React.FC<{ champion: { name: string; image: string; description: string; wins: number } | null }> = ({ champion }) => {
  return (
    <section className="relative py-20 px-6 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 text-yellow-400 mb-4">
            <Trophy size={20} />
            <span className="font-mono uppercase tracking-widest text-sm">Champion de la Semaine</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-display font-black text-white mb-4">
            Le <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">Vainqueur</span>
          </h2>
        </div>

        {champion ? (
          <div className="relative max-w-2xl mx-auto">
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-2xl blur-xl" />
            <div className="relative bg-midnight/50 border border-yellow-500/30 rounded-2xl p-8 backdrop-blur-sm">
              <div className="flex flex-col md:flex-row gap-6 items-center">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-yellow-500/50 shadow-[0_0_30px_rgba(234,179,8,0.3)]">
                  <img
                    src={champion.image}
                    alt={champion.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-3xl font-display font-black text-white mb-2 uppercase italic">
                    {champion.name}
                  </h3>
                  <p className="text-gray-300 mb-3">{champion.description}</p>
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500/10 border border-yellow-500/30 rounded-full">
                    <Trophy size={16} className="text-yellow-400" />
                    <span className="text-yellow-400 font-bold">{champion.wins} votes</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-gray-400">Aucun champion pour le moment. Participez aux duels pour élire le prochain !</p>
          </div>
        )}
      </div>
    </section>
  );
};

const RecentPostsPreview: React.FC<{ posts: CommunityPost[]; onOpenAuth: () => void }> = ({ posts, onOpenAuth }) => {
  const { session } = useAuth();
  const [selectedPost, setSelectedPost] = useState<CommunityPost | null>(null);

  return (
    <section className="py-24 px-6 bg-gradient-to-b from-obsidian to-midnight relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(247,37,133,0.1),transparent_50%)]" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neonPink/10 border border-neonPink/30 text-neonPink mb-4">
            <MessageCircle size={20} />
            <span className="font-mono uppercase tracking-widest text-sm">Derniers Posts</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-display font-black text-white mb-4">
            La <span className="text-transparent bg-clip-text bg-gradient-to-r from-neonPink to-neonPurple">Communauté</span> en Action
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Découvrez les dernières créations, discussions et trouvailles de notre communauté passionnée.
          </p>
        </div>

        {posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {posts.slice(0, 3).map((post) => (
              <div key={post.id} className="group relative bg-midnight/50 border border-white/10 rounded-xl overflow-hidden hover:border-neonPink/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(247,37,133,0.2)]">
                {post.content.mediaUrl && (
                  <div className="aspect-video overflow-hidden bg-black/50">
                    {post.type === 'video' ? (
                      <video src={post.content.mediaUrl} className="w-full h-full object-cover" />
                    ) : (
                      <img src={post.content.mediaUrl} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    )}
                  </div>
                )}
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-neonPink to-neonPurple flex items-center justify-center text-white text-sm font-bold">
                      {post.author.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm">{post.author.username}</p>
                      <p className="text-gray-500 text-xs">
                        {new Date(post.createdAt).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>
                  <p className="text-gray-300 text-sm line-clamp-3 mb-4">{post.content.caption}</p>
                  {post.type === 'marketplace' && post.content.marketplaceItem && (
                    <div className="flex items-center justify-between py-2 px-3 bg-neonPink/10 border border-neonPink/30 rounded-lg mb-4">
                      <span className="text-neonPink font-bold text-sm">
                        {post.content.marketplaceItem.price} {post.content.marketplaceItem.currency}
                      </span>
                      <span className="text-xs text-gray-400">{post.content.marketplaceItem.category}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-4 text-gray-400 text-sm">
                    <span className="flex items-center gap-1">
                      <Heart size={16} /> {post.likes}
                    </span>
                    <button
                      onClick={() => setSelectedPost(post)}
                      className="flex items-center gap-1 hover:text-neonPink transition-colors cursor-pointer"
                    >
                      <MessageCircle size={16} /> {post.comments}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-400">Aucun post pour le moment. Soyez le premier à partager !</p>
          </div>
        )}

        {!session && (
          <div className="text-center">
            <p className="text-gray-400 mb-6">Connectez-vous pour partager vos créations et interagir avec la communauté</p>
            <button
              onClick={onOpenAuth}
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-neonPink to-neonPurple text-white font-display font-bold tracking-wide rounded-lg hover:opacity-90 transition-opacity"
            >
              Rejoindre la Communauté <ExternalLink size={18} />
            </button>
          </div>
        )}
      </div>

      <PostModal
        isOpen={!!selectedPost}
        onClose={() => setSelectedPost(null)}
        post={selectedPost}
        onOpenAuth={onOpenAuth}
      />
    </section>
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
            <div className="mb-6 p-4 rounded-lg bg-white/5 w-fit group-hover:scale-110 transition-transform duration-300">
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
  const [currentView, setCurrentView] = useState<'home' | 'salon'>('home');
  const { session } = useAuth();
  const [champion, setChampion] = useState<{
    name: string;
    image: string;
    description: string;
    wins: number;
  } | null>(null);
  const [recentPosts, setRecentPosts] = useState<CommunityPost[]>([]);

  useEffect(() => {
    loadChampion();
    loadRecentPosts();
  }, []);

  const loadChampion = async () => {
    const championData = await salonService.getChampion();
    setChampion(championData);
  };

  const loadRecentPosts = async () => {
    const posts = await communityService.getPosts({ limit: 3 });
    setRecentPosts(posts);
  };

  return (
    <main className="bg-obsidian min-h-screen text-white selection:bg-neonPink selection:text-white">
      <Navbar
        onOpenAuth={() => setIsAuthOpen(true)}
        currentView={currentView}
        onNavigate={setCurrentView}
      />

      {currentView === 'home' ? (
        <>
          <Hero onOpenAuth={() => setIsAuthOpen(true)} />
          {session && <ChampionSection champion={champion} />}
          <FloatingGallery />
          <Features />
          <Community onOpenAuth={() => setIsAuthOpen(true)} />
          <TerminalChat onOpenAuth={() => setIsAuthOpen(true)} />
          <RecentPostsPreview posts={recentPosts} onOpenAuth={() => setIsAuthOpen(true)} />
        </>
      ) : (
        <SalonPage />
      )}

      <Footer />
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </main>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </AuthProvider>
  );
};

export default App;