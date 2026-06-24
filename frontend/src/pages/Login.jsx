import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, ArrowRight, UserRound, Lock, UserCog, User } from 'lucide-react';
import GlassCard from '../components/GlassCard';
import FloatingButton from '../components/FloatingButton';
import PageTransition from '../components/PageTransition';
import { api } from '../services/api';

export default function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('jheferson@rehab.com');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const user = await api.login(email, password);
      // Guardar en localStorage para usar en el resto de la app
      localStorage.setItem('user', JSON.stringify(user));
      
      if (user.role === 'especialista') {
        navigate('/specialist-dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition className="flex items-center justify-center min-h-screen relative z-10">
      <div className="w-full max-w-md stagger-item">
        
        {/* Encabezado Limpio sin Logo */}
        <div className="flex flex-col items-center mb-8">
          <h1 className="text-3xl font-semibold tracking-tight">RehabIA - Iniciar Sesión</h1>
          <p className="text-white/50 mt-2 text-sm">Bienvenido de nuevo a tu plataforma</p>
        </div>

        {/* Formulario Frontal, Elegante y Limpio */}
        <GlassCard className="p-8 sm:p-10">
          <form onSubmit={handleLogin} className="flex flex-col gap-6">
            
            {error && (
              <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded-lg text-sm text-center">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-semibold text-white/60 uppercase tracking-wider">Correo Electrónico</label>
              <div className="relative">
                <UserRound className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white text-sm placeholder-white/20 focus:outline-none focus:border-brand-primary focus:bg-black/40 transition-all duration-300 shadow-inner"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-white/60 uppercase tracking-wider">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="********"
                  className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white text-sm placeholder-white/20 focus:outline-none focus:border-brand-primary focus:bg-black/40 transition-all duration-300 shadow-inner"
                  required
                />
              </div>
            </div>

            <FloatingButton className="w-full mt-2 h-12 shadow-lg border-none">
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Conectando...
                </span>
              ) : (
                <>Entrar a la plataforma <ArrowRight size={18} /></>
              )}
            </FloatingButton>
            
            <p className="text-center text-sm text-white/40 mt-4 hover:text-white transition-colors cursor-pointer">
              ¿Olvidaste tu contraseña?
            </p>
          </form>
        </GlassCard>

      </div>
    </PageTransition>
  );
}
