/**
 * Calcula el ángulo entre 3 puntos (en 2D, ignorando Z para mayor simplicidad o usándolo si es necesario).
 * A, B y C son objetos con {x, y, z}. B es el vértice.
 */
export function calculateAngle(a, b, c) {
  // Convertimos a coordenadas cartesianas relativas a la cámara
  // MediaPipe devuelve x, y normalizados [0, 1] respecto al ancho y alto.
  // Z es relativo a la cadera. Para ángulos de articulaciones planas (codo), 2D (x, y) suele bastar.
  const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
  let angle = Math.abs(radians * 180.0 / Math.PI);
  
  if (angle > 180.0) {
    angle = 360 - angle;
  }
  return angle;
}

/**
 * Valida de forma ESTRICTA si una repetición se ejecutó correctamente
 * basado en los ai_parameters (ej. max_angle, min_angle)
 */
export function validateRepetition(angle, parameters, exerciseType) {
  // El contador estricto debe verificar los umbrales
  if (!parameters) return true; // Si no hay IA params, todo vale
  
  // Lógica simplificada:
  // Concentrica: El ángulo debe cruzar el umbral mínimo (ej: doblar codo < 50 grados)
  // Excéntrica: El ángulo debe volver al umbral máximo (ej: estirar codo > 160 grados)
  // Retornamos el estado actual
  
  const type = (exerciseType || '').toLowerCase();
  if (type.includes('codo')) {
    // Para codo, menor ángulo = más flexionado
    const targetFlexion = parameters.min_angle || 60;
    const targetExtension = parameters.max_angle || 160;
    
    // Flexibilidad al 70% del rango de movimiento
    const rom = targetExtension - targetFlexion;
    const thresholdFlexion = targetFlexion + (rom * 0.30); // ~90 grados
    const thresholdExtension = targetExtension - (rom * 0.30); // ~130 grados
    
    if (angle < thresholdFlexion) return 'CONCENTRIC';
    if (angle > thresholdExtension) return 'ECCENTRIC';
  } else if (type.includes('hombro') || type.includes('abducción') || type.includes('frontal')) {
    // Para hombro (abducción/elevación), mayor ángulo = más levantado
    const targetElevation = parameters.max_angle || 150;
    const targetRest = parameters.min_angle || 30;
    
    // Flexibilidad al 70% del rango de movimiento
    const rom = targetElevation - targetRest;
    const thresholdElevation = targetElevation - (rom * 0.30);
    const thresholdRest = targetRest + (rom * 0.30);
    
    if (angle > thresholdElevation) return 'CONCENTRIC'; // Brazo arriba
    if (angle < thresholdRest) return 'ECCENTRIC'; // Brazo abajo
  } else if (type.includes('muñeca')) {
    // Para muñeca (flexión hacia abajo), menor ángulo = más flexionado
    const targetFlexion = parameters.min_angle || 120;
    const targetExtension = parameters.max_angle || 170;
    
    // Flexibilidad al 70% del rango de movimiento
    const rom = targetExtension - targetFlexion;
    const thresholdFlexion = targetFlexion + (rom * 0.30);
    const thresholdExtension = targetExtension - (rom * 0.30);
    
    if (angle < thresholdFlexion) return 'CONCENTRIC'; // Mano abajo
    if (angle > thresholdExtension) return 'ECCENTRIC'; // Mano recta/arriba
  } else if (type.includes('rodilla')) {
    // Para rodilla, menor ángulo = más flexionado
    const targetFlexion = parameters.min_angle || 60;
    const targetExtension = parameters.max_angle || 160;
    
    // Flexibilidad al 70% del rango de movimiento
    const rom = targetExtension - targetFlexion;
    const thresholdFlexion = targetFlexion + (rom * 0.30);
    const thresholdExtension = targetExtension - (rom * 0.30);
    
    if (angle < thresholdFlexion) return 'CONCENTRIC'; // Pierna doblada
    if (angle > thresholdExtension) return 'ECCENTRIC'; // Pierna estirada
  }
  
  return 'TRANSITION';
}
