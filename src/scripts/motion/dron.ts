// Dron: la primera vez que el visor entra en pantalla, la aeronave "despega".
// La altitud del HUD cuenta de 0 a 40 m mientras la toma se abre (la cámara
// sube y el plano se ensancha) y las coordenadas llegan descifrándose.
// El marcado del servidor ya trae los valores finales.
import { gsap } from 'gsap';
import { alVer, descifrar } from './comun';

export function dron(): void {
  const visor = document.querySelector<HTMLElement>('[data-dron]');
  if (!visor) return;
  const video = visor.querySelector<HTMLElement>('[data-dron-video]');
  const alt = visor.querySelector<HTMLElement>('[data-dron-alt]');
  const coord = visor.querySelector<HTMLElement>('[data-dron-coord]');
  const finalCoord = coord?.textContent ?? '';

  let hecho = false;
  const parar = alVer(visor, () => {
    if (hecho) return;
    hecho = true;
    parar();
    const subida = { m: 0 };
    const tl = gsap.timeline({ delay: 0.3 });
    if (video) tl.fromTo(video, { scale: 1.22 }, { scale: 1, duration: 2.6, ease: 'power2.out', clearProps: 'transform' }, 0);
    if (alt) tl.to(subida, {
      m: 40, duration: 2.6, ease: 'power2.out',
      onUpdate: () => { alt.textContent = `ALT ${Math.round(subida.m)}m`; },
    }, 0);
    if (coord) tl.add(descifrar(coord, finalCoord, 1.4), 0.6);
  }, undefined, '0px 0px -20% 0px');
}
