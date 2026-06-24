import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Camera, X, Activity, CheckCircle, AlertTriangle, Volume2, VolumeX } from 'lucide-react';
import { Pose, POSE_CONNECTIONS } from '@mediapipe/pose';
import { Camera as CameraUtils } from '@mediapipe/camera_utils';
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';
import PageTransition from '../components/PageTransition';
import GlassCard from '../components/GlassCard';
import FloatingButton from '../components/FloatingButton';
import { calculateAngle, validateRepetition } from '../utils/geometry';
import confetti from 'canvas-confetti';
import api from '../services/api';

export default function CameraExecution() {
  const navigate = useNavigate();
  const location = useLocation();
  const { exercise, planId } = location.state || {};

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [hasPermission, setHasPermission] = useState(false);
  const [reps, setReps] = useState(0);
  const [feedback, setFeedback] = useState('Colócate frente a la cámara');
  const [accuracy, setAccuracy] = useState({ primary: 0, secondary: 0 });
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);

  // Refs for state that is used inside the MediaPipe callback
  const repsRef = useRef(0);
  const phaseRef = useRef('ECCENTRIC');
  const exerciseRef = useRef(exercise);
  const isVoiceEnabledRef = useRef(true);
  const lastSpokenRef = useRef({ time: 0, text: '' });
  const confettiFiredRef = useRef(false);
  const startTimeRef = useRef(new Date());
  const [showCompletionModal, setShowCompletionModal] = useState(false);

  const fireConfetti = () => {
    const duration = 3000;
    const end = Date.now() + duration;
    
    const frame = () => {
      confetti({ particleCount: 5, angle: 60, spread: 55, origin: { x: 0, y: 0.8 }, colors: ['#4F46E5', '#10B981', '#F59E0B'] });
      confetti({ particleCount: 5, angle: 120, spread: 55, origin: { x: 1, y: 0.8 }, colors: ['#4F46E5', '#10B981', '#F59E0B'] });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();
  };

  const toggleVoice = () => {
    isVoiceEnabledRef.current = !isVoiceEnabledRef.current;
    setIsVoiceEnabled(isVoiceEnabledRef.current);
    if (!isVoiceEnabledRef.current && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  };

  const targetReps = (exercise?.plan_series || 1) * (exercise?.plan_reps || 10);
  
  useEffect(() => {
    exerciseRef.current = exercise;
  }, [exercise]);

  useEffect(() => {
    if (!videoRef.current || !canvasRef.current || !exercise) return;

    let camera = null;
    const pose = new Pose({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5.1675469404/${file}`;
      }
    });

    pose.setOptions({
      modelComplexity: 1,
      smoothLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    pose.onResults((results) => {
      try {
        if (!canvasRef.current || !videoRef.current) return;
        const canvasCtx = canvasRef.current.getContext('2d');
        canvasCtx.save();
        canvasCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        
        // Draw video frame to canvas
        canvasCtx.drawImage(results.image, 0, 0, canvasRef.current.width, canvasRef.current.height);

        const handleFeedback = (text) => {
          setFeedback(text);
          if (!isVoiceEnabledRef.current || !window.speechSynthesis) return;
          
          const now = Date.now();
          const isSameText = lastSpokenRef.current.text === text;
          const debounceTime = isSameText ? 3000 : 1500;
          
          if (now - lastSpokenRef.current.time < debounceTime) return;
          
          lastSpokenRef.current = { time: now, text: text };
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.lang = 'es-ES';
          utterance.rate = 1.0;
          window.speechSynthesis.speak(utterance);
        };

        if (results.poseLandmarks) {
          if (!hasPermission) setHasPermission(true);
          drawConnectors(canvasCtx, results.poseLandmarks, POSE_CONNECTIONS, { color: '#00FF00', lineWidth: 4 });
          drawLandmarks(canvasCtx, results.poseLandmarks, { color: '#FF0000', lineWidth: 2 });

          // Logic for specific exercises
          const exName = exerciseRef.current?.name || '';
          const params = exerciseRef.current?.ai_parameters;
          let currentAngle = 0;

          if (exName.toLowerCase().includes('codo')) {
            // RIGHT ARM: shoulder(12), elbow(14), wrist(16)
            const shoulder = results.poseLandmarks[12];
            const elbow = results.poseLandmarks[14];
            const wrist = results.poseLandmarks[16];
            
            if (shoulder && elbow && wrist && shoulder.visibility > 0.5 && wrist.visibility > 0.5) {
              currentAngle = calculateAngle(shoulder, elbow, wrist);
              setAccuracy(prev => ({ ...prev, primary: Math.min(100, Math.max(0, 100 - Math.abs(currentAngle - (params?.min_angle || 60)))) }));
              
              const state = validateRepetition(currentAngle, params, 'codo');
              if (state === 'CONCENTRIC' && phaseRef.current === 'ECCENTRIC') {
                phaseRef.current = 'CONCENTRIC';
                repsRef.current += 1;
                setReps(repsRef.current);
                handleFeedback('¡Repetición completada! Ahora baja despacio');
                
                if (repsRef.current >= targetReps && !confettiFiredRef.current) {
                  confettiFiredRef.current = true;
                  
                  // Save session to backend
                  const patientId = JSON.parse(localStorage.getItem('user'))?.id;
                  if (patientId && exerciseRef.current) {
                    api.recordSession({
                      patient_id: patientId,
                      exercise_id: exerciseRef.current.id,
                      plan_exercise_id: exerciseRef.current.plan_exercise_id || null,
                      start_time: startTimeRef.current.toISOString(),
                      end_time: new Date().toISOString(),
                      duration_seconds: Math.floor((Date.now() - startTimeRef.current.getTime()) / 1000),
                      completed_repetitions: repsRef.current,
                      correct_repetitions: repsRef.current,
                      incorrect_repetitions: 0,
                      accuracy_percentage: accuracy.primary || 85.0,
                      status: 'completada'
                    }).then(() => {
                      setShowCompletionModal(true);
                      fireConfetti();
                    }).catch(err => {
                      confettiFiredRef.current = false;
                      console.error('Error saving session:', err);
                      alert('ERROR EN BASE DE DATOS: ' + err.message);
                    });
                  } else {
                    setShowCompletionModal(true);
                    fireConfetti();
                  }
                }
              } else if (state === 'ECCENTRIC' && phaseRef.current === 'CONCENTRIC') {
                phaseRef.current = 'ECCENTRIC';
                handleFeedback('Brazo estirado. ¡Sube de nuevo!');
              } else if (state === 'TRANSITION') {
                if (phaseRef.current === 'ECCENTRIC') {
                  handleFeedback('Sube más el brazo');
                } else {
                  handleFeedback('Sigue bajando hasta estirarlo');
                }
              }
            } else {
               handleFeedback('Asegúrate de que tu brazo sea visible');
            }

          } else if (exName.toLowerCase().includes('hombro') || exName.toLowerCase().includes('abducción')) {
            // RIGHT ARM: hip(24), shoulder(12), elbow(14)
            const hip = results.poseLandmarks[24];
            const shoulder = results.poseLandmarks[12];
            const elbow = results.poseLandmarks[14];

            if (hip && shoulder && elbow && hip.visibility > 0.5 && elbow.visibility > 0.5) {
              currentAngle = calculateAngle(hip, shoulder, elbow);
              setAccuracy(prev => ({ ...prev, primary: Math.min(100, Math.max(0, (currentAngle / (params?.max_angle || 150)) * 100)) }));
              
              const state = validateRepetition(currentAngle, params, 'hombro');
              if (state === 'CONCENTRIC' && phaseRef.current === 'ECCENTRIC') {
                phaseRef.current = 'CONCENTRIC';
                repsRef.current += 1;
                setReps(repsRef.current);
                handleFeedback('¡Bien hecho! Baja el brazo suavemente');

                if (repsRef.current >= targetReps && !confettiFiredRef.current) {
                  confettiFiredRef.current = true;
                  setShowCompletionModal(true);
                  fireConfetti();
                  
                  const patientId = JSON.parse(localStorage.getItem('user'))?.id;
                  if (patientId && exerciseRef.current) {
                    api.recordSession({
                      patient_id: patientId,
                      exercise_id: exerciseRef.current.id,
                      plan_exercise_id: exerciseRef.current.plan_exercise_id || null,
                      start_time: startTimeRef.current.toISOString(),
                      end_time: new Date().toISOString(),
                      duration_seconds: Math.floor((Date.now() - startTimeRef.current.getTime()) / 1000),
                      completed_repetitions: repsRef.current,
                      correct_repetitions: repsRef.current,
                      incorrect_repetitions: 0,
                      accuracy_percentage: accuracy.primary || 85.0,
                      status: 'COMPLETADA'
                    }).catch(err => console.error('Error saving session:', err));
                  }
                }
              } else if (state === 'ECCENTRIC' && phaseRef.current === 'CONCENTRIC') {
                phaseRef.current = 'ECCENTRIC';
                handleFeedback('Brazo abajo. ¡Sube de nuevo!');
              } else if (state === 'TRANSITION') {
                if (phaseRef.current === 'ECCENTRIC') {
                  handleFeedback('Sube más el brazo');
                } else {
                  handleFeedback('Sigue bajando suavemente');
                }
              }
            } else {
               handleFeedback('Aléjate un poco para ver tu torso');
            }
          } else if (exName.toLowerCase().includes('muñeca')) {
            // RIGHT ARM: elbow(14), wrist(16), index(20)
            const elbow = results.poseLandmarks[14];
            const wrist = results.poseLandmarks[16];
            const indexFinger = results.poseLandmarks[20];

            if (elbow && wrist && indexFinger && elbow.visibility > 0.5 && wrist.visibility > 0.5) {
              currentAngle = calculateAngle(elbow, wrist, indexFinger);
              setAccuracy(prev => ({ ...prev, primary: Math.min(100, Math.max(0, (currentAngle / (params?.max_angle || 180)) * 100)) }));
              
              const state = validateRepetition(currentAngle, params, 'muñeca');
              if (state === 'CONCENTRIC' && phaseRef.current === 'ECCENTRIC') {
                phaseRef.current = 'CONCENTRIC';
                repsRef.current += 1;
                setReps(repsRef.current);
                handleFeedback('¡Bien hecho! Sube la mano suavemente');

                if (repsRef.current >= targetReps && !confettiFiredRef.current) {
                  confettiFiredRef.current = true;
                  
                  const patientId = JSON.parse(localStorage.getItem('user'))?.id;
                  if (patientId && exerciseRef.current) {
                    api.recordSession({
                      patient_id: patientId,
                      exercise_id: exerciseRef.current.id,
                      plan_exercise_id: exerciseRef.current.plan_exercise_id || null,
                      start_time: startTimeRef.current.toISOString(),
                      end_time: new Date().toISOString(),
                      duration_seconds: Math.floor((Date.now() - startTimeRef.current.getTime()) / 1000),
                      completed_repetitions: repsRef.current,
                      correct_repetitions: repsRef.current,
                      incorrect_repetitions: 0,
                      accuracy_percentage: accuracy.primary || 85.0,
                      status: 'completada'
                    }).then(() => {
                      setShowCompletionModal(true);
                      fireConfetti();
                    }).catch(err => {
                      confettiFiredRef.current = false;
                      console.error('Error saving session:', err);
                      alert('ERROR EN BASE DE DATOS: ' + err.message);
                    });
                  } else {
                    setShowCompletionModal(true);
                    fireConfetti();
                  }
                }
              } else if (state === 'ECCENTRIC' && phaseRef.current === 'CONCENTRIC') {
                phaseRef.current = 'ECCENTRIC';
                handleFeedback('Mano arriba. ¡Baja de nuevo!');
              } else if (state === 'TRANSITION') {
                if (phaseRef.current === 'ECCENTRIC') {
                  handleFeedback('Baja más la mano');
                } else {
                  handleFeedback('Sigue subiendo suavemente');
                }
              }
            } else {
               handleFeedback('Asegúrate de que tu mano sea visible');
            }
          } else if (exName.toLowerCase().includes('rodilla')) {
            // RIGHT LEG: hip(24), knee(26), ankle(28)
            const hip = results.poseLandmarks[24];
            const knee = results.poseLandmarks[26];
            const ankle = results.poseLandmarks[28];

            if (hip && knee && ankle && hip.visibility > 0.5 && knee.visibility > 0.5 && ankle.visibility > 0.5) {
              currentAngle = calculateAngle(hip, knee, ankle);
              setAccuracy(prev => ({ ...prev, primary: Math.min(100, Math.max(0, 100 - Math.abs(currentAngle - (params?.min_angle || 60)))) }));
              
              const state = validateRepetition(currentAngle, params, 'rodilla');
              if (state === 'CONCENTRIC' && phaseRef.current === 'ECCENTRIC') {
                phaseRef.current = 'CONCENTRIC';
                repsRef.current += 1;
                setReps(repsRef.current);
                handleFeedback('¡Bien hecho! Vuelve a estirar lentamente');

                if (repsRef.current >= targetReps && !confettiFiredRef.current) {
                  confettiFiredRef.current = true;
                  
                  const patientId = JSON.parse(localStorage.getItem('user'))?.id;
                  if (patientId && exerciseRef.current) {
                    api.recordSession({
                      patient_id: patientId,
                      exercise_id: exerciseRef.current.id,
                      plan_exercise_id: exerciseRef.current.plan_exercise_id || null,
                      start_time: startTimeRef.current.toISOString(),
                      end_time: new Date().toISOString(),
                      duration_seconds: Math.floor((Date.now() - startTimeRef.current.getTime()) / 1000),
                      completed_repetitions: repsRef.current,
                      correct_repetitions: repsRef.current,
                      incorrect_repetitions: 0,
                      accuracy_percentage: accuracy.primary || 85.0,
                      status: 'completada'
                    }).then(() => {
                      setShowCompletionModal(true);
                      fireConfetti();
                    }).catch(err => {
                      confettiFiredRef.current = false;
                      console.error('Error saving session:', err);
                      alert('ERROR EN BASE DE DATOS: ' + err.message);
                    });
                  } else {
                    setShowCompletionModal(true);
                    fireConfetti();
                  }
                }
              } else if (state === 'ECCENTRIC' && phaseRef.current === 'CONCENTRIC') {
                phaseRef.current = 'ECCENTRIC';
                handleFeedback('Pierna estirada. ¡Flexiona de nuevo!');
              } else if (state === 'TRANSITION') {
                if (phaseRef.current === 'ECCENTRIC') {
                  handleFeedback('Flexiona más la rodilla');
                } else {
                  handleFeedback('Sigue estirando la pierna');
                }
              }
            } else {
               handleFeedback('Aléjate para que la cámara vea tu pierna');
            }
          }
        } else {
           handleFeedback('No se detecta a nadie en cámara');
        }
        canvasCtx.restore();
      } catch (e) {
        console.error("Error in onResults:", e);
      }
    });

    try {
      camera = new CameraUtils(videoRef.current, {
        onFrame: async () => {
          if (videoRef.current) {
            await pose.send({ image: videoRef.current });
          }
        },
        width: 640,
        height: 480
      });
      camera.start();
    } catch (e) {
      console.error("Camera error:", e);
      setFeedback('Error al acceder a la cámara');
    }

    return () => {
      if (camera) camera.stop();
      pose.close();
    };
  }, [exercise]);

  if (!exercise) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-white bg-brand-bg">
        <h2 className="mb-4">No hay ejercicio seleccionado</h2>
        <FloatingButton onClick={() => navigate('/dashboard')} className="px-6 py-2">Volver al Inicio</FloatingButton>
      </div>
    );
  }

  return (
    <PageTransition className="flex flex-col h-screen max-h-screen overflow-hidden !p-4">
      {/* Header Fijo */}
      <div className="flex justify-between items-center mb-4 z-20">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/exercises', { state: { planId } })} className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors">
            <X size={24} />
          </button>
          <button 
            onClick={toggleVoice} 
            className={`p-2 rounded-full transition-colors ${isVoiceEnabled ? 'bg-teal-500/20 text-teal-400 hover:bg-teal-500/30' : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'}`}
            title={isVoiceEnabled ? 'Desactivar voz' : 'Activar voz'}
          >
            {isVoiceEnabled ? <Volume2 size={24} /> : <VolumeX size={24} />}
          </button>
        </div>
        <div className="bg-brand-accent/20 border border-brand-accent/30 px-4 py-1.5 rounded-full flex items-center gap-2">
          <div className="w-2 h-2 bg-brand-accent rounded-full animate-pulse" />
          <span className="font-mono font-medium text-sm">Sesión Activa - {exercise.name}</span>
        </div>
      </div>

      {/* Grid Principal (Cámara + UI de IA) */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4 min-h-0">
        
        {/* Contenedor Principal de la "Cámara" */}
        <GlassCard className="lg:col-span-3 !p-0 relative flex items-center justify-center bg-black/40 overflow-hidden">
          <video ref={videoRef} className="absolute opacity-0 w-1 h-1 pointer-events-none" autoPlay playsInline></video>
          <canvas ref={canvasRef} width="640" height="480" className="w-full h-full object-contain"></canvas>
          
          {!hasPermission && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-30 text-center animate-pulse">
              <Camera size={48} className="mx-auto mb-4 text-white/50" />
              <p>Solicitando acceso a la cámara y cargando IA...</p>
            </div>
          )}

          {hasPermission && (
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
              <div className={`px-6 py-3 rounded-full backdrop-blur-md shadow-2xl flex items-center gap-3 transition-colors duration-500 ${feedback.includes('completada') || feedback.includes('Bien') ? 'bg-teal-500/80 text-white' : 'bg-brand-accent/90'}`}>
                {feedback.includes('completada') || feedback.includes('Bien') ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
                <span className="font-bold tracking-wide text-center">{feedback}</span>
              </div>
            </div>
          )}
        </GlassCard>

        {/* Panel Lateral de Estado */}
        <div className="lg:col-span-1 flex flex-col gap-4">
          <GlassCard className="flex-1 flex flex-col items-center justify-center text-center">
            <h3 className="text-white/60 font-medium mb-2">Repeticiones</h3>
            <div className="text-6xl font-black font-mono text-transparent bg-clip-text bg-gradient-to-br from-brand-accent to-brand-purple">
              {reps} <span className="text-2xl text-white/40">/ {targetReps}</span>
            </div>
          </GlassCard>

          <GlassCard className="flex-1">
            <h3 className="font-medium mb-4 flex items-center gap-2"><Activity size={18} className="text-brand-accent" /> Datos de Precisión</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-white/60">Precisión del Movimiento</span>
                  <span className="font-mono">{Math.round(accuracy.primary)}%</span>
                </div>
                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-brand-accent transition-all duration-300" style={{ width: `${Math.round(accuracy.primary)}%` }}></div>
                </div>
              </div>
            </div>
          </GlassCard>

          {reps >= targetReps && (
            <div className="py-4 font-bold text-center text-brand-accent bg-white/5 rounded-xl animate-pulse">
              Guardando resultados... Por favor espera.
            </div>
          )}
        </div>

      </div>

      {showCompletionModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
          <GlassCard className="p-8 max-w-md w-full text-center flex flex-col items-center shadow-[0_20px_50px_rgba(79,70,229,0.3)] border border-brand-primary/50">
            <div className="w-20 h-20 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
              <CheckCircle size={40} />
            </div>
            <h2 className="text-3xl font-bold mb-2 text-white">¡Lo lograste!</h2>
            <p className="text-white/60 mb-6">Has completado todas las repeticiones de la sesión con éxito.</p>
            <div className="text-6xl font-black font-mono text-transparent bg-clip-text bg-gradient-to-r from-brand-accent to-brand-primary mb-8">
              {reps} <span className="text-3xl text-white/40">/ {targetReps}</span>
            </div>
            <FloatingButton onClick={() => navigate('/dashboard')} className="w-full py-3 font-semibold text-lg">
              Ver Resumen
            </FloatingButton>
          </GlassCard>
        </div>
      )}
    </PageTransition>
  );
}
