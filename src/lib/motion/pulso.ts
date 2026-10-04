// Tempo compartido de toda la portada. La página "suena" a 124 BPM (house de
// fiesta): los bucles de CSS usan var(--pulso) de global.css y los de JS usan
// estas funciones, así el rig del hero, las demos de servicios, el radar y el
// ecualizador laten juntos en vez de ir cada uno a su aire.
//
// Si se cambia BPM hay que cambiar --pulso en global.css (un test lo vigila).

export const BPM = 124;

/** Duración de un pulso (negra) en segundos. */
export const PULSO_S = 60 / BPM;

/** Pulsos por compás (4/4). */
export const PULSOS_COMPAS = 4;

/**
 * Fase en [0, 1) de un ciclo que dura `pulsos` pulsos, para un tiempo en
 * segundos. Con pulsos = 1 es la fase dentro del pulso actual.
 */
export function fase(tSeg: number, pulsos = 1): number {
  const ciclo = PULSO_S * pulsos;
  const f = (tSeg % ciclo) / ciclo;
  return f < 0 ? f + 1 : f;
}

/** Índice del compás en curso (entero, desde 0). */
export function compas(tSeg: number): number {
  return Math.floor(tSeg / (PULSO_S * PULSOS_COMPAS));
}

/**
 * Envolvente de golpe: 1 justo en el pulso y cae exponencialmente hasta el
 * siguiente. Sirve para "bombear" brillo o escala al ritmo.
 */
export function golpe(tSeg: number, caida = 6): number {
  return Math.exp(-caida * fase(tSeg));
}
