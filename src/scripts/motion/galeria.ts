// Galería: las fotos esperan "apagadas" y un haz de luz cruza la rejilla al
// entrar; cada foto se enciende cuando el haz pasa por encima de ella (el
// retardo sale de su posición horizontal, no del orden del DOM).
import { gsap } from 'gsap';
import { alVer } from './comun';

const APAGADA = 'brightness(.2) saturate(.25)';
const ENCENDIDA = 'brightness(1) saturate(1)';

export function galeria(): void {
  const rejilla = document.querySelector<HTMLElement>('[data-galeria]');
  const haz = rejilla?.querySelector<HTMLElement>('[data-barrido]');
  if (!rejilla || !haz) return;
  const fotos = [...rejilla.querySelectorAll<HTMLElement>('img')];
  gsap.set(fotos, { filter: APAGADA });

  let hecho = false;
  const parar = alVer(rejilla, () => {
    if (hecho) return;
    hecho = true;
    parar();
    const ancho = rejilla.offsetWidth;
    const recorrido = 1.5;
    const tl = gsap.timeline({ delay: 0.35 });
    tl.fromTo(haz, { x: -haz.offsetWidth * 1.2, opacity: 1 }, { x: ancho + haz.offsetWidth * 0.2, duration: recorrido, ease: 'power1.inOut' }, 0)
      .to(haz, { opacity: 0, duration: 0.3 }, recorrido - 0.2);
    fotos.forEach((img) => {
      // offsetLeft de la celda (medida de maquetación, ajena a transforms).
      const celda = img.parentElement as HTMLElement;
      const centro = (celda.offsetLeft + celda.offsetWidth / 2) / ancho;
      tl.fromTo(img, { filter: APAGADA }, {
        keyframes: { filter: [APAGADA, 'brightness(1.25) saturate(1.1)', 'brightness(.55) saturate(.7)', ENCENDIDA], easeEach: 'none' },
        duration: 0.5,
        clearProps: 'filter',
      }, Math.max(0, centro * recorrido - 0.15));
    });
  }, undefined, '0px 0px -25% 0px');
}
