import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Menu, X, Zap, User, LogOut, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabaseClient';
import { useSoundEffects } from '../hooks/useSoundEffects';

interface NavbarProps {
  onOpenAuth: () => void;
  currentView?: 'home' | 'quiz' | 'shop' | 'profile';
  onNavigate?: (view: 'home' | 'quiz' | 'shop' | 'profile') => void;
}

const Navbar: React.FC<NavbarProps> = ({ onOpenAuth, currentView = 'home', onNavigate }) => {
  const [scrolled, setScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { playHover, playClick } = useSoundEffects();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const navLinks = [
    { name: 'Découvrir', href: '#discover', view: 'home' as const },
    { name: 'Communauté', href: '#community', view: 'home' as const },
    { name: 'Shop', href: '#shop', view: 'shop' as const },
    { name: 'Terminal', href: '#chat', view: 'home' as const },
  ];

  const profileLink = user ? [{ name: 'Profil', href: '#profile', view: 'profile' as const }] : [];
  const allLinks = [...navLinks, ...profileLink];

  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      // Fetch avatar from profiles
      const fetchAvatar = async () => {
        const { data } = await supabase
          .from('profiles')
          .select('avatar_url')
          .eq('id', user.id)
          .single();
        if (data?.avatar_url) {
          setAvatarUrl(data.avatar_url);
        }
      };
      fetchAvatar();
    }
  }, [user]);

  return (
    <nav className={`fixed top-0 w-full z-[100] transition-all duration-300 ${scrolled ? 'glass-panel border-b border-white/5 py-4' : 'bg-transparent py-6'}`}>
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        {/* Logo */}
        <div
          className="flex items-center gap-2 group cursor-pointer"
          onClick={() => onNavigate?.('home')}
        >
          <div className="w-10 h-10 bg-gradient-to-br from-neonPink to-neonPurple rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(247,37,133,0.4)] group-hover:shadow-[0_0_25px_rgba(247,37,133,0.6)] transition-all">
            <Zap className="text-white w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <span className="font-display font-bold text-2xl tracking-wider text-white">OTABLOG</span>
            <span className="text-[10px] text-cyanLight font-jp tracking-[0.2em] -mt-1 opacity-80 group-hover:opacity-100 transition-opacity">オタクブログ</span>
          </div>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          {allLinks.map((link) => (
            // ... link render ...
            <a
              key={link.name}
              href={link.view === 'home' ? link.href : '#'}
              onClick={(e) => {
                if (link.view === 'shop' || link.view === 'profile') {
                  e.preventDefault();
                  onNavigate?.(link.view as any);
                } else if (link.view === 'home' && currentView !== 'home') {
                  e.preventDefault();
                  onNavigate?.('home');
                  setTimeout(() => {
                    document.querySelector(link.href)?.scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                }
              }}
              className={`font-medium text-sm tracking-wide transition-colors relative after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-[1px] after:bg-cyanLight hover:after:w-full after:transition-all ${link.view === currentView ? 'text-neonPink' : 'text-gray-300 hover:text-cyanLight'
                }`}
            >
              {link.name}
            </a>
          ))}

          {user && (
            <button
              onClick={() => onNavigate?.('quiz')}
              className={`text-sm font-medium tracking-wide transition-colors relative ${currentView === 'quiz' ? 'text-neonPink' : 'text-gray-300 hover:text-neonPink'
                }`}
            >
              QUIZ BATTLE
            </button>
          )}

          {user ? (
            <div className="flex items-center gap-4">
              <div
                className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => onNavigate?.('profile')}
              >
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="w-8 h-8 rounded-full border border-cyanLight/30 object-cover" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-cyanLight/10 border border-cyanLight/30 flex items-center justify-center text-cyanLight">
                    <User size={14} />
                  </div>
                )}
                <div className="hidden lg:block text-sm text-cyanLight font-mono">
                  <span className="max-w-[100px] truncate block">{user.email?.split('@')[0]}</span>
                </div>
              </div>
              <button
                onClick={signOut}
                className="text-gray-400 hover:text-white transition-colors"
                title="Déconnexion"
              >
                <LogOut size={20} />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="bg-white/5 hover:bg-white/10 border border-white/10 text-white px-6 py-2 rounded-full backdrop-blur-md transition-all hover:scale-105 hover:border-neonPurple/50 hover:shadow-[0_0_15px_rgba(114,9,183,0.3)] font-display text-sm"
            >
              Connexion
            </button>
          )}
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden text-white"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu Overlay - Portalled to body to avoid clipping context */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-3xl p-8 flex flex-col overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-12">
                <div className="flex items-center gap-2">
                  <Zap className="text-neonPink w-6 h-6 animate-pulse" />
                  <span className="font-display font-bold text-xl text-white tracking-widest">OTABLOG</span>
                </div>
                <button onClick={() => setIsOpen(false)} className="text-white p-2 border border-white/10 rounded-full hover:bg-white/10 transition-colors">
                  <X />
                </button>
              </div>

              <motion.div
                className="flex flex-col gap-6"
                initial="hidden"
                animate="show"
                variants={{
                  hidden: { opacity: 0 },
                  show: {
                    opacity: 1,
                    transition: {
                      staggerChildren: 0.1
                    }
                  }
                }}
              >
                {navLinks.map((link) => (
                  <motion.a
                    key={link.name}
                    href={link.href}
                    variants={{
                      hidden: { opacity: 0, x: -20 },
                      show: { opacity: 1, x: 0 }
                    }}
                    className={`text-4xl font-display font-black tracking-tight ${link.view === currentView ? 'text-transparent bg-clip-text bg-gradient-to-r from-neonPink to-neonPurple' : 'text-white hover:text-gray-300'
                      }`}
                    onClick={(e) => {
                      e.preventDefault();
                      onNavigate?.(link.view);
                      setIsOpen(false);
                    }}
                  >
                    {link.name}
                  </motion.a>
                ))}

                {user && (
                  <motion.button
                    variants={{
                      hidden: { opacity: 0, x: -20 },
                      show: { opacity: 1, x: 0 }
                    }}
                    onClick={() => {
                      onNavigate?.('quiz');
                      setIsOpen(false);
                    }}
                    className="text-4xl font-display font-black tracking-tight text-left text-cyanLight"
                  >
                    QUIZ BATTLE
                  </motion.button>
                )}
              </motion.div>

              <div className="mt-auto pt-10 border-t border-white/10">
                {user ? (
                  <div className="flex flex-col gap-6">
                    <div className="flex items-center gap-3 text-cyanLight font-mono">
                      <User size={20} />
                      <span className="text-lg">{user.email}</span>
                    </div>
                    <button
                      onClick={() => { signOut(); setIsOpen(false); }}
                      className="w-full text-center py-4 rounded-xl border border-red-500/30 text-red-500 font-bold"
                    >
                      Déconnexion
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => { onOpenAuth(); setIsOpen(false); }}
                    className="w-full bg-gradient-to-r from-neonPurple to-neonPink py-5 rounded-xl font-display font-bold text-white tracking-widest uppercase shadow-[0_0_30px_rgba(247,37,133,0.3)]"
                  >
                    Connexion
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </nav>
  );
};

export default Navbar;