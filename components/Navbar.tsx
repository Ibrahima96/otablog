import React, { useState, useEffect } from 'react';
import { Menu, X, Zap, User, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  onOpenAuth: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onOpenAuth }) => {
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
    { name: 'Découvrir', href: '#discover' },
    { name: 'Communauté', href: '#community' },
    { name: 'Terminal', href: '#chat' },
  ];

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'glass-panel border-b border-white/5 py-4' : 'bg-transparent py-6'}`}>
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center gap-2 group cursor-pointer">
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
              href={link.href}
              className="text-gray-300 hover:text-cyanLight font-medium text-sm tracking-wide transition-colors relative after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-[1px] after:bg-cyanLight hover:after:w-full after:transition-all"
            >
              {link.name}
            </a>
          ))}

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

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-obsidian/95 backdrop-blur-xl border-b border-white/10 p-6 flex flex-col gap-6">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="text-xl text-gray-300 hover:text-cyanLight font-display"
              onClick={() => setIsOpen(false)}
            >
              {link.name}
            </a>
          ))}

          {user ? (
            <div className="border-t border-white/10 pt-6 flex justify-between items-center">
              <span className="text-cyanLight font-mono">{user.email}</span>
              <button onClick={() => { signOut(); setIsOpen(false); }} className="text-red-400">Déconnexion</button>
            </div>
          ) : (
            <button
              onClick={() => { onOpenAuth(); setIsOpen(false); }}
              className="w-full bg-gradient-to-r from-neonPurple to-neonPink py-3 rounded-lg font-bold text-white tracking-widest uppercase"
            >
              Connexion
            </button>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;