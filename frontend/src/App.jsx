import React, { useEffect, useRef } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import gsap from 'gsap';

import Login from './pages/Login';
import PatientDashboard from './pages/PatientDashboard';
import ExerciseSelection from './pages/ExerciseSelection';
import CameraExecution from './pages/CameraExecution';
import ProfileSettings from './pages/ProfileSettings';

import SpecialistDashboard from './pages/SpecialistDashboard';
import SpecialistPatientView from './pages/SpecialistPatientView';
import SpecialistAssignPlan from './pages/SpecialistAssignPlan';

function App() {
  const location = useLocation();
  const pageRef = useRef(null);

  // Transición suave al cambiar de página
  useEffect(() => {
    if (pageRef.current) {
      gsap.fromTo(
        pageRef.current,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }
      );
    }
  }, [location.pathname]);

  return (
    <div className="min-h-screen relative overflow-hidden bg-brand-dark">
      {/* Fondo Aurora Mesh Premium */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] bg-brand-accent/20 rounded-full aurora-blob" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-brand-purple/20 rounded-full aurora-blob" style={{animationDelay: '-5s'}} />
        <div className="absolute top-[40%] left-[20%] w-[40vw] h-[40vw] bg-brand-teal/10 rounded-full aurora-blob" style={{animationDelay: '-10s'}} />
      </div>

      {/* Ruido sutil encima del fondo para darle textura "premium" */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-20 mix-blend-overlay" style={{backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`}}></div>

      {/* Contenedor de Rutas */}
      <div ref={pageRef} className="relative z-10 w-full h-full min-h-screen">
        <Routes>
          {/* Rutas Compartidas / Paciente */}
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<PatientDashboard />} />
          <Route path="/exercises" element={<ExerciseSelection />} />
          <Route path="/camera" element={<CameraExecution />} />
          <Route path="/profile" element={<ProfileSettings />} />
          
          {/* Rutas Especialista */}
          <Route path="/specialist-dashboard" element={<SpecialistDashboard />} />
          <Route path="/specialist-patient/:id" element={<SpecialistPatientView />} />
          <Route path="/specialist-assign/:id" element={<SpecialistAssignPlan />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
