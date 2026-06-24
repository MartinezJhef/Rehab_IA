import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Play, ArrowLeft, Info, Activity } from 'lucide-react';
import PageTransition from '../components/PageTransition';
import GlassCard from '../components/GlassCard';
import FloatingButton from '../components/FloatingButton';
import { api } from '../services/api';

export default function ExerciseSelection() {
  const navigate = useNavigate();
  const location = useLocation();
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExercises = async () => {
      try {
        const data = await api.getExercises();
        if (location.state && location.state.planExercises) {
          const planExIds = location.state.planExercises.map(pe => pe.exercise_id);
          const filtered = data.filter(ex => planExIds.includes(ex.id));
          const finalExercises = filtered.map(ex => {
            const planConfig = location.state.planExercises.find(pe => pe.exercise_id === ex.id);
            return { ...ex, plan_series: planConfig.series, plan_reps: planConfig.repetitions, plan_exercise_id: planConfig.id };
          });
          setExercises(finalExercises);
        } else {
          setExercises(data);
        }
      } catch (error) {
        console.error('Error al cargar ejercicios', error);
      } finally {
        setLoading(false);
      }
    };
    fetchExercises();
  }, [location.state]);

  return (
    <PageTransition>
      <div className="flex justify-between items-center mb-6 stagger-item">
        <div>
          <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-white/50 hover:text-white text-sm uppercase tracking-wider font-semibold transition-colors mb-2">
            <ArrowLeft size={16} /> Volver al Inicio
          </button>
          <h1 className="text-3xl font-bold tracking-tight">Selección de Ejercicio</h1>
          <p className="text-white/50 text-sm mt-1">Selecciona una rutina para comenzar con la asistencia IA.</p>
        </div>
      </div>

      {/* Grid de ejercicios limpia y frontal */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full flex justify-center py-10">
            <div className="w-8 h-8 border-4 border-brand-primary/30 border-t-brand-primary rounded-full animate-spin"></div>
          </div>
        ) : (
          exercises.map((exercise, index) => (
            <GlassCard key={exercise.id} className="p-0 overflow-hidden group flex flex-col h-full stagger-item">
              
              <div className="h-48 w-full relative overflow-hidden bg-black flex items-center justify-center">
                {exercise.video_url ? (
                  <video 
                    src={exercise.video_url} 
                    className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-90 transition-opacity duration-500"
                    autoPlay 
                    loop 
                    muted 
                    playsInline
                  />
                ) : (
                  <>
                    {/* Imagen genérica si no hay video_url o image en bd */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-brand-primary/20 to-brand-secondary/10 opacity-50 mix-blend-overlay"></div>
                    <Activity size={48} className="text-white/20 group-hover:scale-110 transition-transform duration-500" />
                  </>
                )}
                
                <div className="absolute top-4 right-4 z-20 bg-black/60 border border-white/10 backdrop-blur-md px-3 py-1 rounded-md text-[10px] uppercase tracking-wider text-white/80 font-semibold shadow-lg">
                  IA Ready
                </div>
              </div>

              <div className="p-6 flex flex-col flex-1">
                <h3 className="text-lg font-semibold mb-1 text-white/90">{exercise.name}</h3>
                <p className="text-white/50 text-xs mb-4 line-clamp-2">{exercise.description || 'Sin descripción'}</p>
                <p className="text-brand-primary font-mono text-xs mb-6 bg-brand-primary/10 inline-block self-start px-2 py-1 rounded border border-brand-primary/20">
                  {exercise.plan_series && exercise.plan_reps ? `${exercise.plan_series} x ${exercise.plan_reps}` : '3 x 10'}
                </p>
                
                <div className="mt-auto flex gap-3 pt-4 border-t border-white/5">
                  <FloatingButton onClick={() => navigate('/camera', { state: { exercise, planId: location.state?.planId } })} className="flex-1 text-sm py-2 shadow-none border-none bg-white/5 hover:bg-brand-primary hover:text-white text-white/80 transition-colors">
                    <Play size={16} fill="currentColor" /> Comenzar
                  </FloatingButton>
                  <button className="p-2 rounded-xl bg-transparent hover:bg-white/5 transition-colors border border-white/10 text-white/50 hover:text-white">
                    <Info size={18} />
                  </button>
                </div>
              </div>
              
            </GlassCard>
          ))
        )}
      </div>
    </PageTransition>
  );
}
