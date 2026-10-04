// Cobertura: el barrido del radar da una vuelta cada 16 pulsos y, al pasar
// por el rumbo real de cada municipio, lo enciende en el radar y en su chip.
// Bogotá late en cada pulso y la lectura bajo el radar dice cuál tocó, con su
// distancia real (cada lectura dura al menos medio segundo para poder leerla).
// Un solo bucle en el ticker, parado fuera de pantalla.
import { gsap } from 'gsap';
import { fase, golpe } from '../../lib/motion/pulso';
import { trasBarrido } from '../../lib/motion/cobertura';
import { alVer } from './comun';

const PULSOS_VUELTA = 16;
/** Grados de estela durante los que un municipio sigue encendido. */
const ESTELA = 75;

export function cobertura(): void {
  const radar = document.querySelector<HTMLElement>('[data-radar]');
  const chips = document.querySelector<HTMLElement>('[data-chips]');
  if (!radar) return;
  const barrido = radar.querySelector<HTMLElement>('[data-barrido]')!;
  const centro = radar.querySelector<HTMLElement>('[data-centro]')!;
  const lectura = radar.querySelector<HTMLElement>('[data-lectura]');
  const cola: string[] = [];
  let ultimaLectura = 0;
  const puntos = [...radar.querySelectorAll<HTMLElement>('[data-punto]')].map((el) => ({
    el,
    rumbo: Number(el.dataset.rumbo),
    ciudad: el.dataset.ciudad ?? '',
    km: el.dataset.km ?? '',
    encendido: false,
  }));
  const t0 = performance.now();

  const tick = () => {
    const t = (performance.now() - t0) / 1000;
    const angulo = fase(t, PULSOS_VUELTA) * 360;
    barrido.style.setProperty('--barrido', `${angulo.toFixed(1)}deg`);
    centro.style.setProperty('--golpe', golpe(t, 5).toFixed(3));
    for (const p of puntos) {
      const d = trasBarrido(angulo, p.rumbo);
      const brillo = d < ESTELA ? 1 - d / ESTELA : 0;
      p.el.style.setProperty('--brillo', (brillo * brillo).toFixed(3));
      const encendido = d < ESTELA * 0.6;
      if (encendido !== p.encendido) {
        p.encendido = encendido;
        // Los chips se reconstruyen al cambiar de idioma: se buscan cada vez.
        chips?.querySelector<HTMLElement>(`[data-ciudad="${CSS.escape(p.ciudad)}"]`)?.toggleAttribute('data-encendido', encendido);
        if (encendido && cola.length < 4) cola.push(`${p.ciudad} · ${p.km} km`);
      }
    }
    const ahora = performance.now();
    if (lectura && cola.length && ahora - ultimaLectura > 500) {
      lectura.textContent = cola.shift()!;
      ultimaLectura = ahora;
    }
  };

  alVer(radar, () => gsap.ticker.add(tick), () => gsap.ticker.remove(tick));
}
