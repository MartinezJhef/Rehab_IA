import React, { useRef } from 'react';
import gsap from 'gsap';

export default function FloatingButton({ children, onClick, className = '', variant = 'primary' }) {
  const btnRef = useRef(null);

  // Efecto sutil, sin agrandamientos excesivos
  const handleMouseEnter = () => {
    gsap.to(btnRef.current, {
      scale: 1.02,
      y: -2,
      duration: 0.3,
      ease: 'power2.out'
    });
  };

  const handleMouseLeave = () => {
    gsap.to(btnRef.current, {
      scale: 1,
      y: 0,
      duration: 0.4,
      ease: 'power2.out'
    });
  };

  const variants = {
    primary: 'bg-brand-accent hover:bg-blue-500 text-white shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.6)] border border-blue-400/20',
    glass: 'bg-white/5 hover:bg-white/10 border border-white/10 text-white backdrop-blur-md',
  };

  return (
    <button
      ref={btnRef}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`px-6 py-3 rounded-xl font-medium transition-colors duration-300 flex items-center justify-center gap-2 will-change-transform ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}
