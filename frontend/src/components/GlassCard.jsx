import React from 'react';

export default function GlassCard({ children, className = '' }) {
  // Eliminamos completamente la lógica de isometría estática.
  // Ahora la tarjeta siempre mira de frente, limpia y ultra-premium.
  
  return (
    <div 
      className={`glass-panel rounded-2xl p-6 relative overflow-hidden transition-all duration-300 hover:shadow-[0_12px_40px_rgba(0,0,0,0.6)] ${className}`}
    >
      {/* Brillo interno superior (Reflejo del cristal sutil) */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
      
      {/* Reflejo lateral izquierdo */}
      <div className="absolute top-0 bottom-0 left-0 w-[1px] bg-gradient-to-b from-transparent via-white/10 to-transparent"></div>

      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
