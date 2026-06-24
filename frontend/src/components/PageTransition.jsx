import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function PageTransition({ children, className = '' }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Todos los elementos hijos con la clase .stagger-item entrarán escalonados
      gsap.fromTo(".stagger-item", 
        { opacity: 0, y: 30, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.6, stagger: 0.1, ease: 'power3.out' }
      );
    }, containerRef);
    
    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className={`w-full min-h-screen p-6 md:p-12 ${className}`}>
      {children}
    </div>
  );
}
