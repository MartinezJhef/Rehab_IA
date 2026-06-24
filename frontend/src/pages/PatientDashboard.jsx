import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Target, Flame, Calendar, ChevronRight, Play, LogOut, Bell, X, User } from 'lucide-react';
import PageTransition from '../components/PageTransition';
import GlassCard from '../components/GlassCard';
import FloatingButton from '../components/FloatingButton';
import { api } from '../services/api';

export default function PatientDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activePlans, setActivePlans] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [exercisesMap, setExercisesMap] = useState({});
  const [specialistsMap, setSpecialistsMap] = useState({});
  const [errorMsg, setErrorMsg] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (!savedUser) {
      navigate('/');
      return;
    }
    const parsedUser = JSON.parse(savedUser);
    setUser(parsedUser);

    const fetchData = async () => {
      try {
        let plansRes = [];
        let sessionsRes = [];
        let exercisesRes = [];
        
        try { plansRes = await api.getPatientActivePlans(parsedUser.id); } catch (e) { setErrorMsg('Error planes: ' + e.message); }
        try { sessionsRes = await api.getPatientSessions(parsedUser.id); } catch (e) { setErrorMsg(prev => (prev ? prev + ' | ' : '') + 'Error sesiones: ' + e.message); }
        try { exercisesRes = await api.getExercises(); } catch (e) { setErrorMsg(prev => (prev ? prev + ' | ' : '') + 'Error ejercicios: ' + e.message); }

        if (plansRes && plansRes.length > 0) {
          setActivePlans(plansRes);
          const specMap = {};
          for (const plan of plansRes) {
            if (plan.specialist_id && !specMap[plan.specialist_id]) {
              try {
                const specProfile = await api.getProfile(plan.specialist_id);
                specMap[plan.specialist_id] = `Dr. ${specProfile.last_name}`;
              } catch (e) {
                specMap[plan.specialist_id] = 'Especialista Desconocido';
              }
            }
          }
          setSpecialistsMap(specMap);
        }
        
        setSessions(sessionsRes || []);
        
        const exMap = {};
        if (exercisesRes && exercisesRes.length > 0) {
          exercisesRes.forEach(ex => { exMap[ex.id] = ex.name; });
        }
        setExercisesMap(exMap);

      } catch (err) {
        console.error("Error crítico al cargar datos del dashboard:", err);
        setErrorMsg("Error crítico: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  if (!user || loading) return null;

  // Calculos basados en datos reales
  const adherence = sessions.length > 0 
    ? Math.round(sessions.reduce((acc, s) => acc + s.accuracy_percentage, 0) / sessions.length) 
    : 0;
  
  const totalSessions = activePlans.length > 0 
    ? activePlans.reduce((acc, p) => acc + (p.total_sessions || 0), 0) 
    : 0;
  const completedSessions = sessions.length;
  const remainingSessions = Math.max(0, totalSessions - completedSessions);
  
  // Racha actual (Streak) - simplificado
  let streak = 0;
  if (sessions.length > 0) {
    // Ordenar sesiones por fecha desc
    const sortedDates = [...new Set(sessions.map(s => new Date(s.start_time).toDateString()))]
      .sort((a, b) => new Date(b) - new Date(a));
    
    let currentDate = new Date();
    currentDate.setHours(0,0,0,0);
    
    for (let i = 0; i < sortedDates.length; i++) {
      const d = new Date(sortedDates[i]);
      const diffTime = Math.abs(currentDate - d);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
      
      if (i === 0 && diffDays > 1) break; // If latest session is older than yesterday, streak is 0
      
      if (i > 0) {
        const prev = new Date(sortedDates[i-1]);
        const diffPrev = Math.abs(prev - d);
        const diffDaysPrev = Math.ceil(diffPrev / (1000 * 60 * 60 * 24));
        if (diffDaysPrev > 1) break; // Gap larger than 1 day
      }
      streak++;
    }
  }

  return (
    <PageTransition>
      {/* Header Premium y Compacto */}
      <div className="flex justify-between items-center mb-6 stagger-item relative z-50">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Hola, {user.first_name} 👋</h1>
          <p className="text-white/50 text-sm mt-1">Tu progreso de rehabilitación.</p>
          {errorMsg && (
            <div className="mt-2 p-2 bg-red-500/20 border border-red-500/50 rounded text-red-200 text-xs">
              {errorMsg}
            </div>
          )}
        </div>
        <div className="flex gap-3 items-center relative">
          <button onClick={() => {
            if (activePlans.length > 0) {
              setShowToast(true);
              setTimeout(() => setShowToast(false), 4000);
            }
          }} className="relative p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/10">
            <Bell size={18} />
            {activePlans.length > 0 && (
              <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border border-brand-dark"></span>
            )}
          </button>
          
          {showToast && (
            <div className="absolute bottom-full right-0 mb-2 bg-brand-primary/20 border border-brand-primary/50 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 z-50 min-w-[250px] animate-fade-in">
              <span className="text-sm font-medium text-brand-primary flex-1">¡Revisa tus ejercicios, tienes tareas pendientes!</span>
              <button onClick={() => setShowToast(false)} className="text-white/50 hover:text-white">
                <X size={14} />
              </button>
            </div>
          )}

          <div className="relative">
            <button 
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="w-12 h-12 rounded-full overflow-hidden border border-brand-primary/30 p-1 bg-black/20 focus:outline-none focus:border-brand-primary transition-colors"
            >
              <img src={user.avatar_url || "https://i.pravatar.cc/150?img=11"} alt="Perfil" className="w-full h-full rounded-full object-cover" />
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

      {/* Grid de Estadísticas Frontales y Compactas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <GlassCard className="stagger-item !p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/50 text-[10px] font-semibold uppercase tracking-wider">Precisión Media</p>
              <h2 className="text-3xl font-light mt-1 text-white">{adherence}<span className="text-lg text-white/40">%</span></h2>
            </div>
            <div className="p-2.5 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400">
              <Target size={20} />
            </div>
          </div>
        </GlassCard>

        <GlassCard className="stagger-item !p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/50 text-[10px] font-semibold uppercase tracking-wider">Racha Actual</p>
              <h2 className="text-3xl font-light mt-1 text-white">{streak} <span className="text-sm text-white/40">Días</span></h2>
            </div>
            <div className="p-2.5 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400">
              <Flame size={20} />
            </div>
          </div>
        </GlassCard>

        <GlassCard className="stagger-item !p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/50 text-[10px] font-semibold uppercase tracking-wider">Sesiones Restantes</p>
              <h2 className="text-3xl font-light mt-1 text-white">{remainingSessions}<span className="text-lg text-white/40">/{totalSessions}</span></h2>
            </div>
            <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
              <Calendar size={20} />
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Plan Actual */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 stagger-item">
        
        <div className="lg:col-span-2 flex flex-col">
          <div className="flex justify-between items-end mb-3 px-1">
            <h3 className="text-base font-medium text-white/90">Tu Plan de Hoy</h3>
            <button className="text-xs text-brand-primary flex items-center hover:text-white transition-colors">
              Historial completo <ChevronRight size={14} />
            </button>
          </div>
          
          {activePlans.length > 0 ? (
            <div className="flex flex-col gap-4">
              {activePlans.map(plan => (
                <GlassCard key={plan.id} className="!p-0 overflow-hidden border-t border-brand-primary/20 flex-1 flex flex-col">
                  <div className="p-4 bg-black/20 border-b border-white/5">
                    <h4 className="font-semibold text-base">{plan.title}</h4>
                    <p className="text-white/50 text-xs mt-1">Asignado por {specialistsMap[plan.specialist_id] || 'Especialista'}</p>
                  </div>
                  
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4 h-full">
                      <div className="flex-1 space-y-2 w-full">
                        {plan.exercises?.length > 0 ? (
                          plan.exercises.map((ex, idx) => (
                            <div key={idx} className="flex justify-between items-center bg-black/10 p-2.5 rounded-lg border border-white/5">
                              <span className="text-white/80 text-sm">{exercisesMap[ex.exercise_id] || 'Ejercicio'}</span>
                              <span className="text-[10px] font-mono text-brand-primary bg-brand-primary/10 px-2 py-0.5 rounded">{ex.series}x{ex.repetitions} reps</span>
                            </div>
                          ))
                        ) : (
                          <p className="text-white/50 text-sm italic">No hay ejercicios asignados.</p>
                        )}
                      </div>
                      
                      <FloatingButton onClick={() => navigate('/exercises', { state: { planId: plan.id, planExercises: plan.exercises } })} className="w-full md:w-auto px-6 py-2.5 h-fit text-sm shrink-0">
                        <Play size={16} fill="currentColor" /> Iniciar Terapia
                      </FloatingButton>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          ) : (
            <GlassCard className="!p-0 overflow-hidden border-t border-brand-primary/20 flex-1 flex flex-col">
              <div className="p-4 bg-black/20 border-b border-white/5">
                <h4 className="font-semibold text-base">Sin plan activo</h4>
              </div>
              <div className="p-4 flex-1 flex items-center justify-center">
                <p className="text-white/50 text-sm italic">No tienes ningún plan asignado.</p>
              </div>
            </GlassCard>
          )}
        </div>

        {/* Gráfico Minimalista Compacto */}
        <div className="lg:col-span-1">
          <GlassCard className="h-full flex flex-col justify-center items-center text-center !p-6">
            <div className="w-24 h-24 mx-auto rounded-full border-[2px] border-white/10 relative flex items-center justify-center mb-4">
              <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 96 96">
                <circle cx="48" cy="48" r="45" stroke="currentColor" strokeWidth="3" fill="transparent" className="text-white/5" />
                <circle cx="48" cy="48" r="45" stroke="currentColor" strokeWidth="3" fill="transparent" strokeDasharray="282.74" strokeDashoffset={282.74 * (1 - adherence / 100)} className="text-brand-primary transition-all duration-1000 ease-out" />
              </svg>
              <div className="flex flex-col z-10">
                <span className="text-2xl font-light">{adherence}<span className="text-xs text-white/50">%</span></span>
              </div>
            </div>
            <h4 className="font-medium text-sm text-white/90">Progreso por Sesiones</h4>
            <p className="text-xs text-white/40 mt-1.5 leading-relaxed">Mejora del 15% respecto al ciclo anterior.</p>
          </GlassCard>
        </div>

      </div>
    </PageTransition>
  );
}
