// Hero: el rig de luces. Las cabezas bailan solas al tempo (coreografía de
// src/lib/motion/rig.ts); con ratón, siguen al cursor como si un operador las
// llevara a mano y vuelven a la coreografía cuando el cursor se queda quieto.
// Clic o tap en la pista (fuera de los botones) = "drop": destello, abanico
// abierto y láser a tope durante dos pulsos.
//
// Un solo bucle en gsap.ticker para todo, parado fuera de pantalla.
import { gsap } from 'gsap';
import { anguloHacia, coreografia } from '../../lib/motion/rig';
import { PULSO_S, golpe, fase } from '../../lib/motion/pulso';
import { alVer, encender, punteroFino } from './comun';

export function hero(): void {
  const raiz = document.querySelector<HTMLElement>('[data-hero]');
  if (!raiz) return;
  const cabezas = [...raiz.querySelectorAll<HTMLElement>('[data-cabeza]')];
  const lineas = [...raiz.querySelectorAll<SVGLineElement>('[data-laser] line')];
  const laser = raiz.querySelector<SVGSVGElement>('[data-laser]')!;
  const flash = raiz.querySelector<HTMLElement>('[data-flash]')!;
  const titulo = raiz.querySelector<HTMLElement>('.hero-titulo')!;

  // ── Medidas (se rehacen al cambiar el tamaño) ──────────────────────
  let visibles: { el: HTMLElement; giro: HTMLElement; x: number; y: number }[] = [];
  let ancho = 0;
  let alto = 0;
  const medir = () => {
    const r = raiz.getBoundingClientRect();
    ancho = r.width;
    alto = r.height;
    laser.setAttribute('viewBox', `0 0 ${ancho} ${alto}`);
    visibles = cabezas
      .filter((c) => c.offsetParent !== null)
      .map((c) => ({ el: c, giro: c.querySelector<HTMLElement>('.rig-giro')!, x: c.offsetLeft, y: c.offsetTop }));
  };
  const angulos: number[] = [];
  medir();
  new ResizeObserver(medir).observe(raiz);

  // ── Estado ─────────────────────────────────────────────────────────
  // Peso del cursor frente a la coreografía (0 = baila solo, 1 = sigue al cursor).
  const mando = { cursor: 0, drop: 0, intro: 1 };
  let objetivo = { x: ancho / 2, y: alto * 0.45 };
  let quietoDesde = 0;
  let scrollY = window.scrollY;
  const t0 = performance.now();

  if (punteroFino()) {
    raiz.addEventListener('pointermove', (ev) => {
      const r = raiz.getBoundingClientRect();
      objetivo = { x: ev.clientX - r.left, y: ev.clientY - r.top };
      quietoDesde = performance.now();
      gsap.to(mando, { cursor: 1, duration: 0.6, overwrite: 'auto' });
    }, { passive: true });
    raiz.addEventListener('pointerleave', () => gsap.to(mando, { cursor: 0, duration: 1.2, overwrite: 'auto' }));
  }
  window.addEventListener('scroll', () => { scrollY = window.scrollY; }, { passive: true });

  // ── Drop ───────────────────────────────────────────────────────────
  // Un solo destello suave (no estrobo: nada que parpadee más de 3 veces por
  // segundo) y el abanico se abre al máximo durante dos pulsos.
  raiz.addEventListener('click', (ev) => {
    if ((ev.target as Element).closest('a,button,input,select,textarea')) return;
    gsap.timeline()
      .fromTo(flash, { opacity: 0 }, { opacity: 0.32, duration: 0.06, ease: 'none' })
      .to(flash, { opacity: 0, duration: 0.7, ease: 'power2.out' });
    gsap.fromTo(mando, { drop: 1 }, { drop: 0, duration: PULSO_S * 2, delay: PULSO_S * 2, ease: 'power2.inOut', overwrite: 'auto' });
    gsap.fromTo(titulo, { filter: 'brightness(1.35)' }, { filter: 'brightness(1)', duration: 0.8, ease: 'power2.out' });
  });

  // ── Bucle ──────────────────────────────────────────────────────────
  const tick = () => {
    const n = visibles.length;
    const ahora = performance.now();
    const t = (ahora - t0) / 1000;
    // Tras 2.5 s con el cursor quieto, el operador "suelta" las cabezas.
    if (mando.cursor > 0 && ahora - quietoDesde > 2500 && !gsap.isTweening(mando)) {
      gsap.to(mando, { cursor: 0, duration: 1.4, ease: 'power2.inOut' });
    }
    const b = golpe(t, 5);
    visibles.forEach((c, i) => {
      const p = n > 1 ? (i / (n - 1)) * 2 - 1 : 0;
      const baile = coreografia(t, i, n);
      // Cada cabeza apunta un poco al lado del cursor para que los haces no
      // se encimen en una sola línea.
      const alCursor = anguloHacia(c, { x: objetivo.x + p * 70, y: objetivo.y });
      const abierto = -p * 52;
      let a = baile + (alCursor - baile) * mando.cursor;
      a = a + (abierto - a) * mando.drop;
      // Intro: arrancan abiertas hacia fuera y se cierran sobre el título.
      a = a + (-p * 58 - a) * mando.intro;
      angulos[i] = (angulos[i] ?? a) + (a - (angulos[i] ?? a)) * 0.14;
      c.giro.style.transform = `rotate(${angulos[i].toFixed(2)}deg)`;
      c.el.style.setProperty('--haz', (0.26 + 0.12 * b + 0.25 * mando.drop).toFixed(3));
    });

    // Láser: abanico desde el centro del truss que respira al compás.
    const ex = ancho / 2;
    const ey = visibles[0]?.y ?? 90;
    const apertura = 0.35 + 0.25 * Math.sin(fase(t, 8) * Math.PI * 2) + 0.5 * mando.drop;
    const giro = 0.18 * Math.sin(fase(t, 16) * Math.PI * 2);
    const m = lineas.length;
    lineas.forEach((l, k) => {
      const q = m > 1 ? k / (m - 1) - 0.5 : 0;
      const ang = giro + q * apertura * 2;
      l.setAttribute('x1', ex.toFixed(1));
      l.setAttribute('y1', ey.toFixed(1));
      l.setAttribute('x2', (ex + Math.sin(ang) * alto * 1.4).toFixed(1));
      l.setAttribute('y2', (ey + Math.cos(ang) * alto * 1.4).toFixed(1));
    });
    laser.style.opacity = (0.16 + 0.14 * b + 0.5 * mando.drop).toFixed(3);

    // Al bajar, el rig se atenúa y sube con el truss: la noche sigue abajo.
    const prog = Math.min(scrollY / Math.max(alto, 1), 1);
    raiz.style.setProperty('--rig-scroll', prog.toFixed(3));
  };

  let corriendo = false;
  alVer(raiz, () => { if (!corriendo) { gsap.ticker.add(tick); corriendo = true; } },
    () => { gsap.ticker.remove(tick); corriendo = false; });

  // ── Entrada ────────────────────────────────────────────────────────
  // Las luces se cierran sobre el título y, justo cuando lo cruzan, el
  // título se enciende de forma gradual. Luego entra el resto en cadena.
  gsap.to(mando, { intro: 0, duration: 1.6, ease: 'power3.inOut', delay: 0.15 });
  titulo.setAttribute('data-in', '');
  gsap.fromTo(titulo, { filter: 'brightness(.16)' }, {
    filter: 'brightness(1)',
    ease: 'power2.inOut',
    duration: 1.1,
    delay: 0.9,
    clearProps: 'filter',
  });
  const resto = [...raiz.querySelectorAll('[data-hero-entra]')];
  resto.forEach((el) => el.setAttribute('data-in', ''));
  encender(resto, 1.2);
}
