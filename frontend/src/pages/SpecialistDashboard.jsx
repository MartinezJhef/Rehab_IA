import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Activity, Bell, Search, ChevronRight, LogOut, User } from 'lucide-react';
import PageTransition from '../components/PageTransition';
import GlassCard from '../components/GlassCard';
import api from '../services/api';

export default function SpecialistDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  const [patients, setPatients] = useState([]);
  const [stats, setStats] = useState({ totalPatients: 0, sessionsToday: 0, requireRevision: 0 });
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      
      // Cargar stats y pacientes reales asignados a este especialista
      Promise.all([
        api.getSpecialistPatients(parsedUser.id),
        api.getSpecialistStats(parsedUser.id)
      ])
        .then(async ([patientsData, statsData]) => {
          // Mapeamos los datos reales y obtenemos las sesiones de cada paciente
          const formattedPatients = await Promise.all(patientsData.map(async p => {
            let compliance = '0%';
            let lastSession = 'Sin sesiones';
            let alert = false;
            
            try {
              const sessions = await api.getPatientSessions(p.id);
              if (sessions && sessions.length > 0) {
                const avg = Math.round(sessions.reduce((acc, s) => acc + s.accuracy_percentage, 0) / sessions.length);
                compliance = `${avg}%`;
                
                const sorted = sessions.sort((a,b) => new Date(b.start_time) - new Date(a.start_time));
                const lastDate = new Date(sorted[0].start_time);
                
                // Formatear última sesión
                const diffHours = Math.floor((new Date() - lastDate) / (1000 * 60 * 60));
                if (diffHours < 24) {
                  lastSession = `Hace ${diffHours} horas`;
                } else {
                  lastSession = `Hace ${Math.floor(diffHours/24)} días`;
                }
                
                // Alerta si la precisión es muy baja
                if (avg < 50) alert = true;
              }
            } catch (error) {
              console.error("Error fetching sessions for patient", p.id);
            }

            return {
              id: p.id,
              name: `${p.first_name} ${p.last_name}`,
              status: 'Activo',
              compliance,
              lastSession,
              alert
            };
          }));
          
          setPatients(formattedPatients);
          setStats(statsData);
        })
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    } else {
      navigate('/');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  if (!user) return null;

  return (
    <PageTransition>
      {/* Header Fisioterapeuta Compacto */}
      <div className="flex justify-between items-center mb-6 stagger-item relative z-50">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Panel Médico</h1>
          <p className="text-white/50 text-sm mt-1">Dr. {user.last_name} - Fisioterapia y Rehabilitación</p>
        </div>
        <div className="flex gap-3 items-center">
          <button className="relative p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/10">
            <Bell size={18} />
            <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border border-brand-dark"></span>
          </button>
          
          <div className="relative">
            <button 
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="w-12 h-12 rounded-full overflow-hidden border border-brand-primary/30 p-1 bg-black/20 focus:outline-none focus:border-brand-primary transition-colors"
            >
              <img src={user.avatar_url || "https://i.pravatar.cc/150?img=33"} alt="Perfil" className="w-full h-full rounded-full object-cover" />
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-brand-dark/95 border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 animate-fade-in backdrop-blur-md">
                <button 
                  onClick={() => navigate('/profile')} 
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-white/80 hover:bg-white/5 hover:text-brand-primary transition-colors text-left"
                >
                  <User size={16} /> Mi Perfil
                </button>
                <div className="w-full h-[1px] bg-white/10"></div>
                <button 
                  onClick={handleLogout} 
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition-colors text-left"
                >
                  <LogOut size={16} /> Cerrar Sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* KPIs Rápidos Compactos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <GlassCard className="stagger-item !p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400">
              <Users size={20} />
            </div>
            <div>
              <p className="text-white/50 text-[10px] font-semibold uppercase tracking-wider">Pacientes Totales</p>
              <h2 className="text-2xl font-light text-white">{loading ? '...' : stats.totalPatients}</h2>
            </div>
          </div>
        </GlassCard>
        
        <GlassCard className="stagger-item !p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-brand-primary/10 text-brand-primary">
              <Activity size={20} />
            </div>
            <div>
              <p className="text-white/50 text-[10px] font-semibold uppercase tracking-wider">Sesiones Hoy</p>
              <h2 className="text-2xl font-light text-white">{loading ? '...' : stats.sessionsToday}</h2>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="stagger-item border-red-500/20 !p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-red-500/10 text-red-400">
              <Bell size={20} />
            </div>
            <div>
              <p className="text-white/50 text-[10px] font-semibold uppercase tracking-wider">Requieren Revisión</p>
              <h2 className="text-2xl font-light text-white">{loading ? '...' : stats.requireRevision}</h2>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Lista de Pacientes (GlassTable) */}
      <div className="stagger-item">
        <div className="flex justify-between items-end mb-3">
          <h3 className="text-base font-medium text-white/90">Mis Pacientes</h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={14} />
            <input 
              type="text" 
              placeholder="Buscar paciente..."
              className="bg-black/20 border border-white/10 rounded-lg py-1.5 pl-8 pr-4 text-xs text-white placeholder-white/30 focus:outline-none focus:border-brand-primary"
            />
          </div>
        </div>

        <GlassCard className="!p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-white/5 text-xs font-semibold text-white/40 tracking-wider">
              <div className="col-span-5">PACIENTE</div>
              <div className="col-span-2">ADHERENCIA</div>
              <div className="col-span-3">ÚLTIMA SESIÓN</div>
              <div className="col-span-1">ESTADO</div>
              <div className="col-span-1 text-right">ACCIÓN</div>
            </div>

            <div className="divide-y divide-white/5">
              {loading ? (
                <div className="py-8 text-center text-white/50">Cargando pacientes...</div>
              ) : patients.length === 0 ? (
                <div className="py-8 text-center text-white/50">No tienes pacientes asignados.</div>
              ) : (
                patients.map((patient) => (
                  <div 
                    key={patient.id} 
                    className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-white/5 transition-colors cursor-pointer"
                    onClick={() => navigate(`/specialist-patient/${patient.id}`)}
                  >
                    <div className="col-span-5 flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-brand-primary/20 flex items-center justify-center text-brand-primary font-bold text-xs">
                        {patient.name.charAt(0)}
                      </div>
                      <span className="font-medium text-sm">{patient.name}</span>
                    </div>
                    <div className="col-span-2 font-mono text-xs text-white/80">{patient.compliance}</div>
                    <div className="col-span-3 text-xs text-white/60">{patient.lastSession}</div>
                    <div className="col-span-1">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${patient.alert ? 'bg-red-500/20 text-red-400' : 'bg-teal-500/20 text-teal-400'}`}>
                        {patient.status}
                      </span>
                    </div>
                    <div className="col-span-1 text-right">
                      <button className="text-brand-primary hover:text-white transition-colors">
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </GlassCard>
      </div>
    </PageTransition>
  );
}
