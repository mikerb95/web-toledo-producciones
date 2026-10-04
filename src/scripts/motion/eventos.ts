// Eventos: cada tipo de celebración enciende su ambiente de luz sobre el
// video real (cálido para bodas, magenta para 15 años...). Avanza solo cada
// 16 pulsos, salvo con movimiento reducido. Al apuntar o enfocar la lista se
// detiene el reloj (no el ambiente activo) para que nada cambie mientras
// alguien lo lee.
import { gsap } from 'gsap';
import { PULSO_S } from '../../lib/motion/pulso';
import { alVer, reducido } from './comun';

const PULSOS_POR_AMBIENTE = 16;

export function eventos(): void {
  const lista = document.querySelector<HTMLElement>('[data-ambiente-lista]');
  const escena = document.querySelector<HTMLElement>('[data-ambientes]');
  if (!lista || !escena) return;
  const botones = [...lista.querySelectorAll<HTMLButtonElement>('[data-ambiente]')];
  const luces = [...escena.querySelectorAll<HTMLElement>('[data-ambiente-luz]')];
  const duracion = PULSO_S * PULSOS_POR_AMBIENTE;

  let actual = -1;
  const reloj = { p: 0 };
  let tween: gsap.core.Tween | null = null;
  let enPantalla = false;
  let quieto = false;
  const auto = !reducido();

  const activar = (i: number) => {
    actual = i;
    botones.forEach((b, k) => b.setAttribute('aria-pressed', String(k === i)));
    luces.forEach((l, k) => l.toggleAttribute('data-activo', k === i));
    reloj.p = 0;
    botones[i].style.setProperty('--avance', '0');
    arrancar();
  };

  const arrancar = () => {
    tween?.kill();
    if (!auto || !enPantalla || quieto) return;
    const b = botones[actual];
    tween = gsap.to(reloj, {
      p: 1,
      duration: duracion * (1 - reloj.p),
      ease: 'none',
      onUpdate: () => b.style.setProperty('--avance', reloj.p.toFixed(3)),
      onComplete: () => activar((actual + 1) % botones.length),
    });
  };

  botones.forEach((b, i) => b.addEventListener('click', () => activar(i)));
  const pausar = (v: boolean) => { quieto = v; if (v) tween?.kill(); else arrancar(); };
  lista.addEventListener('pointerenter', () => pausar(true));
  lista.addEventListener('pointerleave', () => pausar(false));
  lista.addEventListener('focusin', () => pausar(true));
  lista.addEventListener('focusout', (ev) => { if (!lista.contains(ev.relatedTarget as Node)) pausar(false); });

  alVer(escena, () => {
    enPantalla = true;
    if (actual < 0) activar(0); else arrancar();
  }, () => { enPantalla = false; tween?.kill(); });
}
