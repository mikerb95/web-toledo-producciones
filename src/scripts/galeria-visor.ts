// Visor de fotos de /galeria: <dialog> modal con anterior/siguiente, flechas
// del teclado, deslizar en táctil y cierre con Esc o tocando fuera de la foto.
// Al cerrar, el navegador devuelve el foco a la miniatura que lo abrió.
import { getStore, getLang } from './store';
import type { Lang } from '../i18n/strings';

const visor = document.getElementById('visor') as HTMLDialogElement | null;
if (visor) {
  const miniaturas = [...document.querySelectorAll<HTMLButtonElement>('[data-foto]')];
  const img = visor.querySelector<HTMLImageElement>('[data-visor-img]')!;
  const pie = visor.querySelector<HTMLElement>('[data-visor-pie]')!;
  const cuenta = visor.querySelector<HTMLElement>('[data-visor-cuenta]')!;
  const n = miniaturas.length;
  let actual = 0;
  let turno = 0;

  async function mostrar(k: number, animar = true): Promise<void> {
    actual = (k + n) % n;
    const fuente = miniaturas[actual].querySelector('img')!;
    const mio = ++turno;
    // Se decodifica antes de cambiar, así la foto nueva entra completa.
    const siguiente = new Image();
    siguiente.src = fuente.currentSrc || fuente.src;
    try { await siguiente.decode(); } catch {}
    if (mio !== turno) return;
    img.src = siguiente.src;
    img.alt = fuente.alt;
    pie.textContent = fuente.alt;
    cuenta.textContent = `${actual + 1} / ${n}`;
    if (animar && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
      img.animate([{ opacity: 0, transform: 'scale(.985)' }, { opacity: 1, transform: 'none' }], { duration: 280, easing: 'cubic-bezier(.2,.7,.2,1)' });
    }
  }

  miniaturas.forEach((b, k) => b.addEventListener('click', async () => {
    await mostrar(k, false);
    visor.showModal();
  }));

  visor.addEventListener('click', (e) => {
    const accion = (e.target as HTMLElement).closest<HTMLElement>('[data-visor]')?.dataset.visor;
    if (accion === 'cerrar') visor.close();
    else if (accion === 'ant') mostrar(actual - 1);
    else if (accion === 'sig') mostrar(actual + 1);
    // Tocar el fondo (fuera de la foto y los botones) cierra.
    else if (e.target === visor || (e.target as HTMLElement).classList.contains('visor-marco')) visor.close();
  });

  visor.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') { e.preventDefault(); mostrar(actual - 1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); mostrar(actual + 1); }
  });

  let inicioX: number | null = null;
  visor.addEventListener('pointerdown', (e) => { if (e.pointerType !== 'mouse') inicioX = e.clientX; });
  visor.addEventListener('pointerup', (e) => {
    if (inicioX === null) return;
    const dx = e.clientX - inicioX;
    inicioX = null;
    if (Math.abs(dx) > 50) mostrar(actual + (dx < 0 ? 1 : -1));
  });

  // Etiquetas de los botones en el idioma activo.
  const etiquetar = (lang: Lang) => {
    const t = getStore()[lang]?.t.galp;
    if (!t) return;
    visor.querySelector('[data-visor="cerrar"]')?.setAttribute('aria-label', t.cerrar);
    visor.querySelector('[data-visor="ant"]')?.setAttribute('aria-label', t.anterior);
    visor.querySelector('[data-visor="sig"]')?.setAttribute('aria-label', t.siguiente);
  };
  window.__toledoRefreshPage = etiquetar;
  etiquetar(getLang());
}
