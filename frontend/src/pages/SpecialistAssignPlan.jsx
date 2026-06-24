import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, PlusCircle, Check } from 'lucide-react';
import PageTransition from '../components/PageTransition';
import GlassCard from '../components/GlassCard';
import FloatingButton from '../components/FloatingButton';
import api from '../services/api';

export default function SpecialistAssignPlan() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [selectedExercises, setSelectedExercises] = useState([]);
  const [exerciseCatalog, setExerciseCatalog] = useState([]);
  const [saving, setSaving] = useState(false);

  const [patient, setPatient] = useState(null);
  const [title, setTitle] = useState('');
  const [totalSessions, setTotalSessions] = useState(20);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const [exercisesData, profileData] = await Promise.all([
          api.getExercises(),
          api.getProfile(id)
        ]);
        setExerciseCatalog(exercisesData);
        setPatient(profileData);
      } catch (err) {
        console.error("Error cargando datos:", err);
      }
    };
    fetchData();
  }, [id]);

  const handleAddExercise = (e) => {
    const exId = e.target.value;
    if (!exId) return;
    const ex = exerciseCatalog.find(x => x.id === exId);
    if (ex && !selectedExercises.find(x => x.id === exId)) {
      setSelectedExercises([...selectedExercises, { ...ex, sets: 3, reps: 10 }]);
    }
    e.target.value = ''; // Reset select
  };

  const updateMetric = (idx, field, value) => {
    const updated = [...selectedExercises];
    updated[idx][field] = value;
    setSelectedExercises(updated);
  };

  const handleSave = async () => {
    if (!title || selectedExercises.length === 0 || !patient || !patient.specialist_id) {
      alert("Por favor completa el nombre del plan y añade al menos un ejercicio.");
      return;
    }
    
    setSaving(true);
    try {
      const payload = {
        specialist_id: patient.specialist_id,
        patient_id: id,
        title: title,
        total_sessions: parseInt(totalSessions) || 20,
        start_date: new Date().toISOString().split('T')[0],
        exercises: selectedExercises.map(ex => ({
          exercise_id: ex.id,
          frequency_weekly: 5, // Default for now
          series: parseInt(ex.sets) || 3,
          repetitions: parseInt(ex.reps) || 10
        }))
      };
      
      await api.createPlan(payload);
      navigate(`/specialist-patient/${id}`);
    } catch (error) {
      console.error("Error saving plan:", error);
      alert(error.message || "Hubo un error al guardar el plan.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageTransition>
      <div className="flex justify-between items-center mb-4 stagger-item">
        <button onClick={() => navigate(`/specialist-patient/${id}`)} className="flex items-center gap-2 text-white/50 hover:text-white text-sm uppercase tracking-wider font-semibold transition-colors">
          <ArrowLeft size={16} /> Cancelar Asignación
        </button>
      </div>

      <div className="max-w-4xl mx-auto stagger-item">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Crear Plan de Rehabilitación</h1>
          <p className="text-white/50 mt-2">Configura los ejercicios guiados por IA para el paciente.</p>
        </div>

        <GlassCard className="mb-6">
          <h2 className="text-lg font-medium mb-3">Detalles Generales del Plan</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-white/60 uppercase tracking-wider">Nombre del Plan</label>
              <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Ej: Fase 3 - Fortalecimiento" className="w-full bg-black/20 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-white/20 focus:outline-none focus:border-brand-primary focus:bg-black/40 transition-all" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-white/60 uppercase tracking-wider">Duración (Sesiones totales)</label>
              <input type="number" value={totalSessions} onChange={e => setTotalSessions(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-brand-primary focus:bg-black/40 transition-all" />
            </div>
          </div>
        </GlassCard>

        <GlassCard className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-medium">Ejercicios Asignados</h2>
            <div className="relative">
              <select onChange={handleAddExercise} className="appearance-none bg-brand-primary text-white font-medium py-2 pl-4 pr-10 rounded-lg focus:outline-none cursor-pointer">
                <option value="">+ Añadir Ejercicio</option>
                {exerciseCatalog.map(ex => (
                  <option key={ex.id} value={ex.id}>{ex.name}</option>
                ))}
              </select>
            </div>
          </div>

          {selectedExercises.length === 0 ? (
            <div className="text-center py-10 border-2 border-dashed border-white/10 rounded-xl">
              <p className="text-white/40">No hay ejercicios asignados. Usa el botón superior para agregar rutinas.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {selectedExercises.map((ex, idx) => (
                <div key={ex.id} className="flex flex-col md:flex-row items-center gap-4 bg-black/30 p-4 rounded-xl border border-white/5">
                  <div className="flex-1">
                    <h3 className="font-bold text-white/90">{ex.name}</h3>
                    <p className="text-xs text-brand-primary mt-1 truncate max-w-[200px] md:max-w-md">{ex.description || ex.target || 'Ejercicio de Rehabilitación'}</p>
                  </div>
                  
                  <div className="flex gap-4">
                    <div className="flex items-center gap-2">
                      <label className="text-xs text-white/50">Series</label>
                      <input type="number" value={ex.sets} onChange={(e) => updateMetric(idx, 'sets', e.target.value)} className="w-16 bg-black/40 border border-white/10 rounded px-2 py-1 text-center focus:border-brand-primary focus:outline-none" />
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="text-xs text-white/50">Reps</label>
                      <input type="number" value={ex.reps} onChange={(e) => updateMetric(idx, 'reps', e.target.value)} className="w-16 bg-black/40 border border-white/10 rounded px-2 py-1 text-center focus:border-brand-primary focus:outline-none" />
                    </div>
                  </div>

                  <button onClick={() => setSelectedExercises(selectedExercises.filter(x => x.id !== ex.id))} className="text-white/30 hover:text-red-400 p-2 transition-colors">
                    Eliminar
                  </button>
                </div>
              ))}
            </div>
          )}
        </GlassCard>

        <div className="flex justify-end stagger-item">
          <FloatingButton onClick={handleSave} disabled={selectedExercises.length === 0 || saving} className="px-10">
            {saving ? 'Guardando...' : <><Save size={18} /> Guardar y Asignar Plan</>}
          </FloatingButton>
        </div>

      </div>
    </PageTransition>
  );
}
