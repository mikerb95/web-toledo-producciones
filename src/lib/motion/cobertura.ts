// Posición real de los municipios de cobertura en el radar, sin DOM.
//
// La lista de cobertura se edita desde el admin, así que aquí solo hay una
// tabla de coordenadas conocidas: un municipio que no esté en la tabla se
// muestra como chip pero no se dibuja en el radar (mejor nada que un punto en
// un lugar inventado).

export interface Coordenada { lat: number; lon: number; }

/** Centro del radar. */
export const BOGOTA: Coordenada = { lat: 4.711, lon: -74.0721 };

/** Radio del anillo exterior del radar, en km. */
export const RADIO_KM = 40;

// Cabeceras municipales (aprox. a 0.01°, sobra para un radar de 40 km).
const TABLA: Record<string, Coordenada> = {
  bogota: BOGOTA,
  chia: { lat: 4.8617, lon: -74.0583 },
  cota: { lat: 4.8094, lon: -74.1031 },
  cajica: { lat: 4.9183, lon: -74.0278 },
  zipaquira: { lat: 5.0221, lon: -73.9948 },
  'la calera': { lat: 4.7211, lon: -73.9681 },
  soacha: { lat: 4.5794, lon: -74.2168 },
  mosquera: { lat: 4.7059, lon: -74.2302 },
  funza: { lat: 4.7163, lon: -74.2117 },
  madrid: { lat: 4.7325, lon: -74.2642 },
  sopo: { lat: 4.9075, lon: -73.9383 },
  tabio: { lat: 4.9167, lon: -74.0975 },
  tenjo: { lat: 4.8722, lon: -74.1442 },
  tocancipa: { lat: 4.9653, lon: -73.9133 },
  guasca: { lat: 4.8664, lon: -73.8772 },
  facatativa: { lat: 4.8136, lon: -74.3544 },
  sibate: { lat: 4.4908, lon: -74.2603 },
  gachancipa: { lat: 4.9917, lon: -73.8717 },
};

/** Minúsculas y sin tildes: "Zipaquirá" y "zipaquira" son el mismo. */
export function normalizar(nombre: string): string {
  return nombre.normalize('NFD').replace(/[̀-ͯ]/g, '').trim().toLowerCase();
}

export interface Ubicacion {
  /** Posición en el radar, en [-1, 1] respecto al radio exterior (y hacia abajo). */
  x: number;
  y: number;
  km: number;
  /** Rumbo desde Bogotá en grados, 0 = norte, sentido horario. */
  rumbo: number;
}

const KM_POR_GRADO = 111.32;

export function ubicar(nombre: string, radioKm = RADIO_KM): Ubicacion | null {
  const c = TABLA[normalizar(nombre)];
  if (!c) return null;
  const norte = (c.lat - BOGOTA.lat) * KM_POR_GRADO;
  const este = (c.lon - BOGOTA.lon) * KM_POR_GRADO * Math.cos((BOGOTA.lat * Math.PI) / 180);
  const km = Math.hypot(norte, este);
  let rumbo = (Math.atan2(este, norte) * 180) / Math.PI;
  if (rumbo < 0) rumbo += 360;
  return { x: este / radioKm, y: -norte / radioKm, km, rumbo };
}

/**
 * Distancia angular en grados que el barrido (que gira en sentido horario)
 * lleva recorrida desde que pasó por `rumbo`. 0 = lo está tocando ahora.
 */
export function trasBarrido(anguloBarrido: number, rumbo: number): number {
  const d = (anguloBarrido - rumbo) % 360;
  return d < 0 ? d + 360 : d;
}
