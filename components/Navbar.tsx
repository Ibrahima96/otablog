import React, { useState, useEffect } from 'react';
import { Menu, X, Zap, User, LogOut, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  onOpenAuth: () => void;
  currentView?: 'home' | 'quiz' | 'shop';
  onNavigate?: (view: 'home' | 'quiz' | 'shop') => void;
}

const Navbar: React.FC<NavbarProps> = ({ onOpenAuth, currentView = 'home', onNavigate }) => {
  const [scrolled, setScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Découvrir', href: '#discover', view: 'home' as const },
    { name: 'Communauté', href: '#community', view: 'home' as const },
    { name: 'Shop', href: '#shop', view: 'shop' as const },
    { name: 'Terminal', href: '#chat', view: 'home' as const },
  ];

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'glass-panel border-b border-white/5 py-4' : 'bg-transparent py-6'}`}>
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
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.view === 'home' ? link.href : '#'}
              onClick={(e) => {
                if (link.view === 'shop') {
                  e.preventDefault();
                  onNavigate?.('shop');
                } else if (link.view === 'home' && currentView !== 'home') {
                  e.preventDefault();
                  onNavigate?.('home');
                  // Small timeout to allow view switch before scrolling
                  setTimeout(() => {
                    const element = document.querySelector(link.href);
                    element?.scrollIntoView({ behavior: 'smooth' });
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
              <div className="flex items-center gap-2 text-sm text-cyanLight font-mono border border-cyanLight/20 px-3 py-1 rounded-full bg-cyanLight/5">
                <User size={14} />
                <span className="max-w-[100px] truncate">{user.email?.split('@')[0]}</span>
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

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="md:hidden fixed inset-0 z-50 bg-obsidian/98  backdrop-blur-2xl p-8 flex flex-col"
          >
            <div className="flex justify-between items-center mb-12">
              <div className="flex items-center gap-2">
                <Zap className="text-neonPink w-6 h-6" />
                <span className="font-display font-bold text-xl text-white">OTABLOG</span>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-white p-2 border border-white/10 rounded-full">
                <X />
              </button>
            </div>

            <div className="flex flex-col gap-8">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className={`text-3xl font-display border-b border-white/5 pb-4 ${link.view === currentView ? 'text-neonPink' : 'text-gray-300 hover:text-cyanLight'
                    }`}
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate?.(link.view);
                    setIsOpen(false);
                  }}
                >
                  {link.name}
                </a>
              ))}

              {user && (
                <button
                  onClick={() => {
                    onNavigate?.('quiz');
                    setIsOpen(false);
                  }}
                  className="text-3xl text-neonPink font-display text-left border-b border-white/5 pb-4"
                >
                  QUIZ BATTLE
                </button>
              )}
            </div>

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
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;