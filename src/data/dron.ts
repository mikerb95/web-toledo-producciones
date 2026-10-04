// Preguntas frecuentes de /cubrimiento-dron. Solo afirman lo que el sitio ya
// dice del servicio (t.drone y los servicios adicionales): es un adicional a
// cualquier paquete, el momento lo elige el cliente, graba en 4K/60 fps con
// gimbal de 3 ejes y las tomas son en exteriores.
import type { Lang } from '../i18n/strings';
import type { Pregunta } from './eventos';

export function preguntasDron(lang: Lang, paquetes: string[]): Pregunta[] {
  const lista = (xs: string[], y: string) => (xs.length > 1 ? `${xs.slice(0, -1).join(', ')} ${y} ${xs[xs.length - 1]}` : xs.join(''));
  if (lang === 'es') {
    return [
      { q: '¿Puedo agregar el dron a cualquier paquete?', a: `Sí. El cubrimiento en dron es un servicio adicional que se suma a cualquiera de nuestros paquetes: ${lista(paquetes, 'o')}.` },
      { q: '¿Qué momento graba el dron?', a: 'Tú eliges el momento clave de tu celebración: la entrada, el brindis, el primer baile o la foto grupal.' },
      { q: '¿En qué calidad se graba?', a: 'En 4K a 60 cuadros por segundo, con estabilización en gimbal de 3 ejes para que las tomas salgan fluidas.' },
      { q: '¿Se puede volar dentro de un salón?', a: 'Las tomas con dron son en exteriores. Si tu evento es en un salón cerrado, escríbenos y revisamos qué espacio abierto del lugar se puede usar.' },
    ];
  }
  return [
    { q: 'Can I add the drone to any package?', a: `Yes. Drone coverage is an add-on that works with any of our packages: ${lista(paquetes, 'or')}.` },
    { q: 'Which moment does the drone capture?', a: 'You choose the key moment of your celebration: the entrance, the toast, the first dance or the group photo.' },
    { q: 'What quality is it shot in?', a: '4K at 60 frames per second, with 3-axis gimbal stabilization for smooth shots.' },
    { q: 'Can it fly inside a venue?', a: 'Drone shots are outdoors. If your event is in an enclosed venue, message us and we will check which open area of the place can be used.' },
  ];
}
