import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Activity, TrendingUp, Calendar, AlertTriangle, Plus, Edit2, Save, X } from 'lucide-react';
import PageTransition from '../components/PageTransition';
import GlassCard from '../components/GlassCard';
import FloatingButton from '../components/FloatingButton';
import api from '../services/api';

export default function SpecialistPatientView() {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [patient, setPatient] = useState(null);
  const [activePlan, setActivePlan] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Edit observations state
  const [isEditingObs, setIsEditingObs] = useState(false);
  const [obsText, setObsText] = useState('');
  const [savingObs, setSavingObs] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [profileRes, plansRes, sessionsRes] = await Promise.all([
          api.getProfile(id),
          api.getPatientActivePlans(id),
          api.getPatientSessions(id)
        ]);
        
        setPatient(profileRes);
        setObsText(profileRes.clinical_observations || '');
        if (plansRes && plansRes.length > 0) {
          setActivePlan(plansRes[0]);
        }
        setSessions(sessionsRes || []);
      } catch (error) {
        console.error("Error al cargar datos del paciente:", error);
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      fetchData();
    }
  }, [id]);

  const handleSaveObservations = async () => {
    setSavingObs(true);
    try {
      const updatedProfile = await api.updateProfile(id, { clinical_observations: obsText });
      setPatient(updatedProfile);
      setIsEditingObs(false);
    } catch (err) {
      console.error("Error al guardar observaciones:", err);
      alert("No se pudieron guardar las observaciones.");
    } finally {
      setSavingObs(false);
    }
  };

  if (loading || !patient) {
    return (
      <PageTransition className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-brand-primary/30 border-t-brand-primary rounded-full animate-spin" />
      </PageTransition>
    );
  }

  // Calculos basados en datos reales
  const lastSession = sessions.length > 0 ? sessions[sessions.length - 1] : null;
  const adherence = sessions.length > 0 
    ? Math.round(sessions.reduce((acc, s) => acc + s.accuracy_percentage, 0) / sessions.length) 
    : 0;
  
  // Fase (calculado)
  const totalSessions = activePlan ? (activePlan.total_sessions || 0) : 0; 
  const completedSessions = sessions.length;
  const phase = activePlan ? Math.ceil((completedSessions || 1) / 5) : 0; // Cambia fase cada 5 sesiones


  const generateChartPath = () => {
    if (sessions.length === 0) return "M 0,200 L 500,200";
    if (sessions.length === 1) {
      const y = 200 - (sessions[0].accuracy_percentage * 2);
      return `M 0,${y} L 500,${y}`;
    }
    const sorted = [...sessions].sort((a,b) => new Date(a.start_time) - new Date(b.start_time));
    const xStep = 500 / (sorted.length - 1);
    const points = sorted.map((s, i) => {
      const x = i * xStep;
      const y = 200 - (s.accuracy_percentage * 2);
      return `${x},${y}`;
    });
    return `M ${points[0]} ` + points.slice(1).map(p => `L ${p}`).join(' ');
  };

  const chartPath = generateChartPath();

  return (
    <PageTransition>
      <div className="flex justify-between items-center mb-4 stagger-item">
        <button onClick={() => navigate('/specialist-dashboard')} className="flex items-center gap-2 text-white/50 hover:text-white text-sm uppercase tracking-wider font-semibold transition-colors">
          <ArrowLeft size={16} /> Volver a Pacientes
        </button>
        <FloatingButton onClick={() => navigate(`/specialist-assign/${id}`)} className="text-sm py-2">
          <Plus size={16} /> Asignar Nuevo Plan
        </FloatingButton>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* Columna Izquierda: Perfil y Alertas */}
        <div className="flex flex-col gap-4 stagger-item">
          <GlassCard className="text-center">
            <div className="w-24 h-24 rounded-full bg-brand-primary/20 flex items-center justify-center text-brand-primary font-bold text-3xl mx-auto mb-4 border border-brand-primary/30">
              {patient.first_name.charAt(0)}
            </div>
            <h2 className="text-2xl font-bold">{patient.first_name} {patient.last_name}</h2>
            <p className="text-white/50 text-sm mt-1">ID: {id.split('-')[0]}... • 28 años</p>
            
            <div className="mt-6 pt-6 border-t border-white/10 flex justify-around text-center">
              <div>
                <p className="text-xs text-white/50 uppercase">Adherencia</p>
                <p className="text-xl font-mono text-teal-400 mt-1">{sessions.length > 0 ? `${adherence}%` : 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-white/50 uppercase">Fase</p>
                <p className="text-xl font-medium mt-1">{activePlan ? `${phase} / 4` : 'N/A'}</p>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="border-orange-500/30">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-medium flex items-center gap-2 text-orange-400">
                <AlertTriangle size={18} /> Observaciones Clínicas
              </h3>
              {!isEditingObs && (
                <button 
                  onClick={() => setIsEditingObs(true)}
                  className="text-white/50 hover:text-white transition-colors p-1"
                >
                  <Edit2 size={16} />
                </button>
              )}
            </div>
            
            {isEditingObs ? (
              <div className="space-y-3">
                <textarea
                  className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-brand-primary min-h-[100px]"
                  placeholder="Añadir observaciones sobre el paciente..."
                  value={obsText}
                  onChange={(e) => setObsText(e.target.value)}
                />
                <div className="flex justify-end gap-2">
                  <button 
                    onClick={() => { setIsEditingObs(false); setObsText(patient.clinical_observations || ''); }}
                    className="p-2 text-white/50 hover:text-white bg-white/5 rounded-lg transition-colors"
                  >
                    <X size={16} />
                  </button>
                  <button 
                    onClick={handleSaveObservations}
                    disabled={savingObs}
                    className="flex items-center gap-2 px-3 py-2 bg-brand-primary/20 text-brand-primary hover:bg-brand-primary/30 rounded-lg transition-colors text-sm font-medium"
                  >
                    {savingObs ? 'Guardando...' : <><Save size={16} /> Guardar</>}
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-white/70 leading-relaxed whitespace-pre-wrap">
                {patient.clinical_observations || <span className="italic text-white/30">Sin observaciones registradas.</span>}
              </p>
            )}
          </GlassCard>
        </div>

        {/* Columna Derecha: Gráficas y Progreso */}
        <div className="lg:col-span-2 flex flex-col gap-4 stagger-item">
          
          <GlassCard className="flex-1">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-medium flex items-center gap-2"><TrendingUp size={18} className="text-brand-primary" /> Evolución de Precisión / ROM</h3>
              <select className="bg-black/20 border border-white/10 rounded-lg py-1 px-3 text-sm text-white focus:outline-none focus:border-brand-primary">
                <option>Histórico Total</option>
                <option>Último mes</option>
              </select>
            </div>
            
            {/* Gráfica Real por CSS */}
            <div className="h-48 w-full border-b border-l border-white/20 relative mt-4">
              {/* Grid lines */}
              <div className="absolute inset-0 flex flex-col justify-between">
                {[1,2,3,4].map(i => <div key={i} className="w-full border-b border-white/5 h-0"></div>)}
              </div>
              {/* Line chart */}
              <svg className="absolute inset-0 h-full w-full preserve-3d" preserveAspectRatio="none">
                <path d={chartPath} fill="none" stroke="#0ea5e9" strokeWidth="3" className="drop-shadow-[0_0_8px_rgba(14,165,233,0.8)]" />
                <path d={`${chartPath} L 500,200 L 0,200 Z`} fill="url(#gradient)" opacity="0.2" />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#0ea5e9" stopOpacity="1" />
                    <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <div className="flex justify-between text-xs text-white/40 mt-2">
              {sessions.length === 0 ? (
                 <span>Sin datos aún</span>
              ) : sessions.length === 1 ? (
                 <><span>S1</span><span className="opacity-0">S1</span></>
              ) : (
                 [...sessions].sort((a,b) => new Date(a.start_time) - new Date(b.start_time)).map((s, i) => (
                   <span key={i} className={sessions.length > 10 && i % 2 !== 0 ? "hidden md:inline" : ""}>S{i+1}</span>
                 ))
              )}
            </div>
          </GlassCard>

          <div className="grid grid-cols-2 gap-4">
            <GlassCard>
              <h3 className="text-sm font-medium text-white/60 mb-2 uppercase tracking-wider">Plan Activo</h3>
              {activePlan ? (
                <>
                  <p className="font-bold">{activePlan.title || 'Plan de Rehabilitación'}</p>
                  <div className="mt-4 flex items-center justify-between text-sm">
                    <span className="text-brand-primary">{completedSessions} / {totalSessions} Sesiones</span>
                    <span className="font-mono bg-white/10 px-2 py-1 rounded">
                      {Math.round((completedSessions/totalSessions)*100)}%
                    </span>
                  </div>
                </>
              ) : (
                <p className="text-white/50 italic text-sm">No hay plan activo</p>
              )}
            </GlassCard>

            <GlassCard>
              <h3 className="text-sm font-medium text-white/60 mb-2 uppercase tracking-wider">Última Sesión</h3>
              {lastSession ? (
                <>
                  <p className="font-bold flex items-center gap-2">
                    <Calendar size={16} className="text-purple-400" /> 
                    {new Date(lastSession.start_time).toLocaleDateString()} a las {new Date(lastSession.start_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </p>
                  <div className="mt-4 text-sm text-white/70">
                    Precisión IA: <span className="text-teal-400 font-bold">{lastSession.accuracy_percentage}%</span>
                  </div>
                </>
              ) : (
                <p className="text-white/50 italic text-sm">Sin sesiones registradas</p>
              )}
            </GlassCard>
          </div>

        </div>
      </div>
    </PageTransition>
  );
}
