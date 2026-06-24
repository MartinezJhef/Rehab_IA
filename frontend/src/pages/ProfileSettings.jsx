import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Phone, Calendar, ArrowLeft, Save } from 'lucide-react';
import gsap from 'gsap';
import PageTransition from '../components/PageTransition';
import GlassCard from '../components/GlassCard';
import FloatingButton from '../components/FloatingButton';
import { api } from '../services/api';

export default function ProfileSettings() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const containerRef = useRef(null);
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    age: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      setFormData(prev => ({
        ...prev,
        first_name: parsedUser.first_name || '',
        last_name: parsedUser.last_name || '',
        age: parsedUser.age || '',
        phone: parsedUser.phone || '',
      }));
    } else {
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    if (user && containerRef.current) {
      const elements = containerRef.current.querySelectorAll('.stagger-card');
      gsap.fromTo(
        elements,
        { opacity: 0, y: 30, rotateX: 10 },
        { 
          opacity: 1, 
          y: 0, 
          rotateX: 0, 
          duration: 0.8, 
          stagger: 0.1, 
          ease: 'power3.out',
          clearProps: 'all'
        }
      );
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(formData.first_name)) {
      setErrorMsg('El nombre no debe contener caracteres especiales o números.');
      return;
    }
    if (formData.first_name.length > 120) {
      setErrorMsg('El nombre no debe exceder 120 caracteres.');
      return;
    }
    if (formData.password) {
      if (formData.password.length < 8) {
        setErrorMsg('La contraseña debe tener al menos 8 caracteres.');
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setErrorMsg('Las contraseñas no coinciden.');
        return;
      }
    }

    setLoading(true);
    try {
      const updateData = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        age: formData.age ? parseInt(formData.age) : null,
        phone: formData.phone
      };
      
      const updatedProfile = await api.updateProfile(user.id, updateData);
      
      let passwordChanged = false;
      if (formData.password) {
        await api.updatePassword(user.id, formData.password);
        passwordChanged = true;
      }

      localStorage.setItem('user', JSON.stringify({ ...user, ...updatedProfile }));
      setUser({ ...user, ...updatedProfile });
      
      if (passwordChanged) {
        setSuccessMsg('Perfil actualizado. La contraseña cambió. Redirigiendo...');
        setTimeout(() => handleLogout(), 3000);
      } else {
        setSuccessMsg('Perfil actualizado correctamente.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Error al actualizar el perfil.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <PageTransition className="flex items-center justify-center min-h-screen p-4 md:p-8">
      <div className="w-full max-w-5xl" ref={containerRef}>
        
        {/* Header - Compacto y Flotante */}
        <div className="flex items-center justify-between mb-6 z-20 relative stagger-card">
          <button 
            onClick={() => navigate(-1)} 
            className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg transition-colors border border-white/10 flex items-center gap-2 text-white/70 shadow-lg"
          >
            <ArrowLeft size={16} />
            <span className="text-sm font-medium">Volver</span>
          </button>
          <h1 className="text-xl font-semibold tracking-tight text-white drop-shadow-md">Mi Perfil</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6">
          
          {/* Panel Izquierdo: Foto y Resumen */}
          <div className="lg:col-span-1">
            <GlassCard className="flex flex-col items-center p-5 text-center stagger-card h-full justify-center shadow-[0_20px_40px_rgba(0,0,0,0.15)]">
              <div className="relative mb-3 group">
                <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-brand-primary/40 p-1 bg-black/20 shadow-[0_0_20px_rgba(var(--brand-primary-rgb),0.3)] transition-transform duration-500 group-hover:scale-105">
                  <img 
                    src={user.avatar_url || "https://i.pravatar.cc/150?img=11"} 
                    alt="Perfil" 
                    className="w-full h-full rounded-full object-cover" 
                  />
                </div>
              </div>
              <h2 className="text-lg font-medium text-white">{user.first_name}</h2>
              <h3 className="text-sm font-light text-white/80">{user.last_name}</h3>
              <div className="mt-3 px-3 py-1 rounded-full bg-brand-primary/20 border border-brand-primary/30 text-brand-primary text-xs font-semibold uppercase tracking-widest">
                {user.role}
              </div>
            </GlassCard>
          </div>

          {/* Panel Derecho: Formulario Ultra-Compacto */}
          <div className="lg:col-span-3">
            <GlassCard className="p-5 md:p-6 stagger-card shadow-[0_20px_40px_rgba(0,0,0,0.15)] relative overflow-hidden">
              {/* Brillo de fondo sutil */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/5 rounded-full blur-3xl pointer-events-none"></div>

              {errorMsg && (
                <div className="mb-4 p-2.5 bg-red-500/20 border border-red-500/30 rounded-lg text-red-200 text-xs flex items-center shadow-lg">
                  {errorMsg}
                </div>
              )}
              {successMsg && (
                <div className="mb-4 p-2.5 bg-teal-500/20 border border-teal-500/30 rounded-lg text-teal-200 text-xs flex items-center shadow-lg">
                  {successMsg}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
                
                {/* Fila 1: Nombres y Edad */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5 md:col-span-1">
                    <label className="text-[10px] font-semibold text-white/60 uppercase tracking-widest">Nombre</label>
                    <div className="relative group">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 transition-colors group-focus-within:text-brand-primary" size={14} />
                      <input 
                        type="text" name="first_name" value={formData.first_name} onChange={handleChange} maxLength="120" required
                        className="w-full bg-black/20 border border-white/10 rounded-lg py-2 pl-9 pr-3 text-white text-sm focus:outline-none focus:border-brand-primary focus:bg-black/40 transition-all shadow-inner"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5 md:col-span-1">
                    <label className="text-[10px] font-semibold text-white/60 uppercase tracking-widest">Apellidos</label>
                    <div className="relative group">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 transition-colors group-focus-within:text-brand-primary" size={14} />
                      <input 
                        type="text" name="last_name" value={formData.last_name} onChange={handleChange}
                        className="w-full bg-black/20 border border-white/10 rounded-lg py-2 pl-9 pr-3 text-white text-sm focus:outline-none focus:border-brand-primary focus:bg-black/40 transition-all shadow-inner"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5 md:col-span-1">
                    <label className="text-[10px] font-semibold text-white/60 uppercase tracking-widest">Edad</label>
                    <div className="relative group">
                      <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 transition-colors group-focus-within:text-brand-primary" size={14} />
                      <input 
                        type="number" name="age" value={formData.age} onChange={handleChange} min="18" max="120"
                        className="w-full bg-black/20 border border-white/10 rounded-lg py-2 pl-9 pr-3 text-white text-sm focus:outline-none focus:border-brand-primary focus:bg-black/40 transition-all shadow-inner"
                      />
                    </div>
                  </div>
                </div>

                {/* Fila 2: Correo y Teléfono */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-[10px] font-semibold text-white/60 uppercase tracking-widest flex justify-between">
                      Correo Electrónico <span className="text-white/30 lowercase tracking-normal">(no editable)</span>
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/20" size={14} />
                      <input 
                        type="email" value={user.email} disabled
                        className="w-full bg-white/5 border border-white/5 rounded-lg py-2 pl-9 pr-3 text-white/40 text-sm cursor-not-allowed shadow-inner"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5 md:col-span-1">
                    <label className="text-[10px] font-semibold text-white/60 uppercase tracking-widest">Teléfono</label>
                    <div className="relative group">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 transition-colors group-focus-within:text-brand-primary" size={14} />
                      <input 
                        type="tel" name="phone" value={formData.phone} onChange={handleChange}
                        className="w-full bg-black/20 border border-white/10 rounded-lg py-2 pl-9 pr-3 text-white text-sm focus:outline-none focus:border-brand-primary focus:bg-black/40 transition-all shadow-inner"
                      />
                    </div>
                  </div>
                </div>

                <div className="h-[1px] w-full bg-gradient-to-r from-white/0 via-white/10 to-white/0 my-4"></div>

                {/* Fila 3: Seguridad */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-semibold text-white/60 uppercase tracking-widest">Nueva Contraseña</label>
                    <div className="relative group">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 transition-colors group-focus-within:text-brand-primary" size={14} />
                      <input 
                        type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Dejar en blanco para mantener"
                        className="w-full bg-black/20 border border-white/10 rounded-lg py-2 pl-9 pr-3 text-white text-sm placeholder-white/20 focus:outline-none focus:border-brand-primary focus:bg-black/40 transition-all shadow-inner"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-semibold text-white/60 uppercase tracking-widest">Confirmar Contraseña</label>
                    <div className="relative group">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 transition-colors group-focus-within:text-brand-primary" size={14} />
                      <input 
                        type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="Repetir nueva contraseña"
                        className="w-full bg-black/20 border border-white/10 rounded-lg py-2 pl-9 pr-3 text-white text-sm placeholder-white/20 focus:outline-none focus:border-brand-primary focus:bg-black/40 transition-all shadow-inner"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-3">
                  <FloatingButton type="submit" className="px-6 py-2 shadow-[0_10px_20px_rgba(var(--brand-primary-rgb),0.3)]">
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <span className="flex items-center gap-2 text-sm"><Save size={14} /> Guardar Cambios</span>
                    )}
                  </FloatingButton>
                </div>

              </form>
            </GlassCard>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
