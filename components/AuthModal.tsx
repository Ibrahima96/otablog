import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User, AlertTriangle, ArrowRight, Loader2 } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!isSupabaseConfigured) {
      setError("Le service d'authentification n'est pas configuré. Veuillez vérifier les variables d'environnement.");
      setIsLoading(false);
      return;
    }

    const auth = supabase.auth;

    try {
      if (isSignUp) {
        // Supabase v2 API: signUp
        const { error } = await auth.signUp({
          email,
          password,
          options: {
            data: { username },
          },
        });
        if (error) throw error;

        // Reset form fields
        setEmail('');
        setPassword('');
        setUsername('');

        // Show success message
        alert("✅ Inscription réussie ! Vous pouvez maintenant vous connecter.");

        // Switch to login mode
        setIsSignUp(false);

      } else {
        // Supabase v2 API: signInWithPassword
        const { error } = await auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;

        // Reset form on successful login
        setEmail('');
        setPassword('');

        if (onSuccess) onSuccess();
        onClose();
      }
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4"
          >
            {/* Modal */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#0f0f13] border border-white/10 w-full max-w-md rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(114,9,183,0.3)] relative"
            >
              {/* Decorative Elements */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-neonPink via-neonPurple to-electricBlue"></div>
              <div className="absolute -left-10 -top-10 w-32 h-32 bg-neonPurple/20 rounded-full blur-[50px]"></div>
              <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-cyanLight/20 rounded-full blur-[50px]"></div>

              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-20"
              >
                <X size={24} />
              </button>

              <div className="p-8 relative z-10">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-display font-bold text-white mb-2">
                    {isSignUp ? 'REJOINDRE' : 'ACCÉDER'}
                  </h2>
                  <p className="text-cyanLight font-mono text-xs tracking-[0.2em] uppercase">
                    {isSignUp ? 'INITIALISATION SYSTÈME' : 'AUTHENTIFICATION REQUISE'}
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {error && (
                    <div className="bg-red-500/10 border border-red-500/50 p-3 rounded-lg flex items-center gap-3 text-red-200 text-sm">
                      <AlertTriangle size={16} />
                      <span>{error}</span>
                    </div>
                  )}

                  {isSignUp && (
                    <div className="space-y-2">
                      <label className="text-xs text-gray-400 font-bold uppercase tracking-wide ml-1">Nom d'utilisateur</label>
                      <div className="relative group">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-neonPink transition-colors" size={18} />
                        <input
                          type="text"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white focus:outline-none focus:border-neonPink focus:shadow-[0_0_15px_rgba(247,37,133,0.2)] transition-all placeholder-gray-600"
                          placeholder="Otaku_01"
                          required
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-xs text-gray-400 font-bold uppercase tracking-wide ml-1">Email</label>
                    <div className="relative group">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-cyanLight transition-colors" size={18} />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white focus:outline-none focus:border-cyanLight focus:shadow-[0_0_15px_rgba(76,201,240,0.2)] transition-all placeholder-gray-600"
                        placeholder="user@exemple.com"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs text-gray-400 font-bold uppercase tracking-wide ml-1">Mot de passe</label>
                    <div className="relative group">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-neonPurple transition-colors" size={18} />
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white focus:outline-none focus:border-neonPurple focus:shadow-[0_0_15px_rgba(114,9,183,0.2)] transition-all placeholder-gray-600"
                        placeholder="••••••••"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full mt-4 bg-gradient-to-r from-neonPurple to-neonPink text-white font-bold py-3 rounded-lg shadow-[0_0_20px_rgba(247,37,133,0.4)] hover:shadow-[0_0_30px_rgba(247,37,133,0.6)] hover:scale-[1.02] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 size={20} className="animate-spin" />
                        <span>TRAITEMENT...</span>
                      </>
                    ) : (
                      <>
                        <span>{isSignUp ? "S'INSCRIRE" : 'CONNEXION'}</span>
                        <ArrowRight size={20} />
                      </>
                    )}
                  </button>
                </form>

                <div className="mt-6 text-center">
                  <p className="text-gray-400 text-sm">
                    {isSignUp ? "Déjà membre ?" : "Pas encore de compte ?"}
                    <button
                      onClick={() => {
                        setIsSignUp(!isSignUp);
                        setError(null);
                        setEmail('');
                        setPassword('');
                        setUsername('');
                      }}
                      className="ml-2 text-cyanLight hover:text-white underline underline-offset-4 decoration-neonPink font-medium transition-colors"
                    >
                      {isSignUp ? 'Se connecter' : 'Créer un compte'}
                    </button>
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AuthModal;