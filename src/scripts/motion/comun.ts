// Motion compartido de la portada: el gesto de "encender" (entradas), la luz
// que sigue al cursor, los botones magnéticos y el ayudante para que los
// bucles solo corran en pantalla. Cada sección importa de aquí en vez de
// inventar su propio gesto: así toda la página habla el mismo idioma.
import { gsap } from 'gsap';

export const reducido = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
export const punteroFino = () => matchMedia('(hover: hover) and (pointer: fine)').matches;

/**
 * Llama a `dentro` / `fuera` cuando el elemento entra o sale del viewport.
 * Devuelve una función para dejar de observar.
 */
export function alVer(el: Element, dentro: () => void, fuera?: () => void, margen = '0px'): () => void {
  const io = new IntersectionObserver(
    (entradas) => {
      for (const e of entradas) (e.isIntersecting ? dentro : fuera)?.();
    },
    { rootMargin: margen },
  );
  io.observe(el);
  return () => io.disconnect();
}

/**
 * El gesto común de entrada: el elemento sube un poco mientras su luz crece
 * de forma continua, como un dimmer que se levanta (sin parpadeos).
 */
export function encender(el: Element | Element[], retardo = 0): gsap.core.Timeline {
  // Estado inicial explícito: sin este set, lo que espera su retardo se ve un
  // instante y luego se apaga.
  gsap.set(el, { opacity: 0, y: 22 });
  const tl = gsap.timeline({ delay: retardo });
  tl.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.9, ease: 'power2.out', stagger: 0.08, clearProps: 'opacity' }, 0);
  tl.fromTo(el, { y: 22 }, { y: 0, duration: 0.9, ease: 'expo.out', stagger: 0.08, clearProps: 'transform' }, 0);
  return tl;
}

/**
 * Entradas de todos los [data-rev] de la página. Los que entran en el mismo
 * lote (p. ej. las tarjetas de una rejilla) se encienden en cadena.
 */
export function entradas(): void {
  const els = [...document.querySelectorAll<HTMLElement>('[data-rev]')];
  const io = new IntersectionObserver(
    (lote) => {
      const nuevos = lote.filter((e) => e.isIntersecting).map((e) => e.target as HTMLElement);
      nuevos.forEach((el, i) => {
        io.unobserve(el);
        el.setAttribute('data-in', '');
        encender(el, i * 0.08);
      });
    },
    { rootMargin: '0px 0px -12% 0px' },
  );
  els.forEach((el) => io.observe(el));
}

/** Pone data-vivo a los [data-bucle] solo mientras están en pantalla. */
export function bucles(): void {
  document.querySelectorAll<HTMLElement>('[data-bucle]').forEach((el) => {
    alVer(el, () => el.setAttribute('data-vivo', ''), () => el.removeAttribute('data-vivo'));
  });
}

/** Luz que sigue al cursor sobre una rejilla [data-luz]. */
export function luzCursor(): void {
  if (!punteroFino()) return;
  document.querySelectorAll<HTMLElement>('[data-luz]').forEach((rejilla) => {
    const hijos = [...rejilla.children] as HTMLElement[];
    rejilla.addEventListener('pointermove', (ev) => {
      for (const h of hijos) {
        const r = h.getBoundingClientRect();
        h.style.setProperty('--fx', `${ev.clientX - r.left}px`);
        h.style.setProperty('--fy', `${ev.clientY - r.top}px`);
      }
    }, { passive: true });
  });
}

/**
 * Botones magnéticos: la píldora se deja atraer por el cursor dentro de un
 * radio algo mayor que ella. El centro se mide restando la traslación propia,
 * si no el botón se persigue a sí mismo y tiembla.
 */
export function magneticos(): void {
  if (!punteroFino()) return;
  document.querySelectorAll<HTMLElement>('[data-magnetico]').forEach((el) => {
    const x = gsap.quickTo(el, 'x', { duration: 0.5, ease: 'power3.out' });
    const y = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'power3.out' });
    const zona = el.parentElement ?? el;
    zona.addEventListener('pointermove', (ev) => {
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2 - Number(gsap.getProperty(el, 'x'));
      const cy = r.top + r.height / 2 - Number(gsap.getProperty(el, 'y'));
      const dx = ev.clientX - cx;
      const dy = ev.clientY - cy;
      const radio = Math.max(r.width, r.height) * 0.9;
      if (Math.hypot(dx, dy) < radio) {
        x(dx * 0.28);
        y(dy * 0.38);
      } else {
        x(0);
        y(0);
      }
    }, { passive: true });
    zona.addEventListener('pointerleave', () => { x(0); y(0); });
  });
}

/** Texto que "llega" descifrándose (para datos del HUD del dron). */
export function descifrar(el: HTMLElement, final: string, duracion = 0.9): gsap.core.Tween {
  const signos = '0123456789·°NW';
  const estado = { p: 0 };
  return gsap.to(estado, {
    p: 1,
    duration: duracion,
    ease: 'none',
    onUpdate: () => {
      const fijos = Math.floor(final.length * estado.p);
      let s = final.slice(0, fijos);
      for (let i = fijos; i < final.length; i++) {
        s += final[i] === ' ' ? ' ' : signos[(Math.random() * signos.length) | 0];
      }
      el.textContent = s;
    },
    onComplete: () => { el.textContent = final; },
  });
}
