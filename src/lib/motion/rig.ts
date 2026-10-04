// Geometría del rig de cabezas móviles del hero, sin DOM.
//
// Convención de ángulos: 0° es el haz apuntando recto hacia abajo y el signo es
// el de CSS `rotate()` (positivo = horario). Como el haz cuelga de su cabeza,
// un giro horario lleva la punta del haz hacia la IZQUIERDA.

import { PULSO_S, PULSOS_COMPAS } from './pulso';

export interface Punto { x: number; y: number; }

/** Giro máximo de una cabeza en cualquier dirección. */
export const GIRO_MAX = 58;

const limitar = (v: number, max: number) => Math.max(-max, Math.min(max, v));

/** Ángulo para que el haz que sale de `cabeza` pase por `objetivo`. */
export function anguloHacia(cabeza: Punto, objetivo: Punto, max = GIRO_MAX): number {
  const dx = objetivo.x - cabeza.x;
  // Un objetivo por encima de la cabeza no se puede alcanzar: se apunta al
  // horizonte de ese lado en vez de dar media vuelta.
  const dy = Math.max(objetivo.y - cabeza.y, 1);
  const grados = (-Math.atan2(dx, dy) * 180) / Math.PI;
  return limitar(grados, max);
}

/**
 * Figuras de la coreografía automática. Cada una devuelve el ángulo de la
 * cabeza `i` de `n` en una fase `f` de [0, 1) del ciclo de la figura.
 * `p` es la posición de la cabeza en [-1, 1] (izquierda a derecha).
 */
type Figura = (f: number, p: number, i: number) => number;

const onda = (f: number) => Math.sin(f * Math.PI * 2);

export const FIGURAS: Record<string, Figura> = {
  // Abanico que se abre y se cierra desde el centro.
  abanico: (f, p) => p * (14 + 30 * (0.5 + 0.5 * onda(f))),
  // Los dos lados se cruzan en el centro de la pista.
  cruce: (f, p) => -p * 34 + 16 * onda(f),
  // Ola: cada cabeza va un poco detrás de la anterior.
  ola: (f, _p, i) => 38 * onda(f - i * 0.11),
  // Todas en paralelo barriendo de lado a lado.
  paralelo: (f) => 42 * onda(f),
};

const ORDEN = ['abanico', 'ola', 'cruce', 'paralelo'] as const;

/** Compases que dura cada figura antes de pasar a la siguiente. */
export const COMPASES_FIGURA = 4;

const suave = (x: number) => x * x * (3 - 2 * x);

/**
 * Ángulo de la cabeza `i` de `n` en el instante `tSeg` de la coreografía.
 * Cada figura dura COMPASES_FIGURA compases y el último pulso funde con la
 * siguiente, para que el cambio no sea un salto.
 */
export function coreografia(tSeg: number, i: number, n: number): number {
  const durFigura = PULSO_S * PULSOS_COMPAS * COMPASES_FIGURA;
  const k = Math.floor(tSeg / durFigura);
  const f = (tSeg - k * durFigura) / durFigura;
  const p = n > 1 ? (i / (n - 1)) * 2 - 1 : 0;
  const actual = FIGURAS[ORDEN[k % ORDEN.length]];
  const siguiente = FIGURAS[ORDEN[(k + 1) % ORDEN.length]];
  // Una figura completa da dos vueltas por ciclo (un barrido cada 2 compases).
  const fa = (f * 2) % 1;
  const a = actual(fa, p, i);
  const umbral = 1 - PULSO_S / durFigura;
  if (f < umbral) return limitar(a, GIRO_MAX);
  const b = siguiente(0, p, i);
  return limitar(a + (b - a) * suave((f - umbral) / (1 - umbral)), GIRO_MAX);
}
