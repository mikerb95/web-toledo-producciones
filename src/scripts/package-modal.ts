// Modal de detalle de paquete. Abre desde las tarjetas [data-package] con una
// view transition (morph) cuando el navegador la soporta. Portado de
// openPackage/closePackage del prototipo.
import { getStore, getLang } from './store';
import type { Lang } from '../i18n/strings';
import type { PackageVM } from '../lib/viewmodel';

const modal = document.getElementById('pkg-modal');
if (modal) {
  const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T | null;
  let currentIndex = -1;
  let openCardEl: HTMLElement | null = null;

  function fill(index: number, lang: Lang): void {
    const vm = getStore()[lang];
    const p: PackageVM | undefined = vm?.packages[index];
    if (!p) return;
    const t = vm.t;
    const a = p.accent;

    $('pkg-back')!.textContent = t.pkg.back;
    $('pkg-includes')!.textContent = t.pkg.includes;
    $('pkg-reserve-label')!.textContent = t.pkg.reserve;

    $('pkg-name')!.textContent = p.name;
    $('pkg-tag')!.textContent = p.tag;
    const price = $('pkg-price')!;
    price.textContent = p.price;
    price.style.color = a;
    $('pkg-price-note')!.textContent = p.priceNote;
    $('pkg-badge')!.textContent = p.badge;

    $('pkg-glow')!.setAttribute(
      'style',
      `position:absolute;top:-120px;right:-80px;width:420px;height:420px;border-radius:50%;background:radial-gradient(circle,${a}33,transparent 65%);filter:blur(40px);pointer-events:none`,
    );

    const chip = $('pkg-chip')!;
    if (p.drone) {
      chip.hidden = false;
      chip.textContent = '◆ ' + t.pkg.droneTag;
      chip.setAttribute('style', `display:inline-flex;align-items:center;gap:8px;background:${a}1f;border:1px solid ${a}66;color:${a};font-weight:700;font-size:12.5px;letter-spacing:.5px;padding:8px 15px;border-radius:999px`);
    } else {
      chip.hidden = true;
    }

    const feats = $('pkg-features')!;
    feats.innerHTML = '';
    for (const f of p.features) {
      const row = document.createElement('div');
      row.setAttribute('data-feat', '');
      row.style.cssText = 'display:flex;align-items:flex-start;gap:12px;font-size:15px;line-height:1.5;color:#dcd6cb';
      const bullet = document.createElement('span');
      bullet.textContent = '✓';
      bullet.style.cssText = `flex-shrink:0;width:22px;height:22px;border-radius:50%;background:${a}22;border:1px solid ${a}66;display:flex;align-items:center;justify-content:center;color:${a};font-size:11px;margin-top:1px`;
      const label = document.createElement('span');
      label.textContent = f;
      row.append(bullet, label);
      feats.appendChild(row);
    }

    const drone = $('pkg-drone')!;
    if (p.drone) {
      drone.hidden = false;
      $('pkg-drone-hud')!.textContent = t.drone.hud;
      $('pkg-drone-sub')!.textContent = t.drone.sub;
    } else {
      drone.hidden = true;
    }

    const reserve = $('pkg-reserve') as HTMLAnchorElement;
    reserve.href = p.waLink;
  }

  function staggerFeatures(): void {
    document.querySelectorAll<HTMLElement>('#pkg-features [data-feat]').forEach((el, i) => {
      try {
        el.animate(
          [{ opacity: 0, transform: 'translateY(16px)' }, { opacity: 1, transform: 'none' }],
          { duration: 430, delay: 120 + i * 70, easing: 'cubic-bezier(.2,.7,.2,1)', fill: 'backwards' },
        );
      } catch {}
    });
  }

  function show(): void {
    modal!.hidden = false;
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(staggerFeatures);
  }

  function open(index: number, cardEl: HTMLElement): void {
    currentIndex = index;
    openCardEl = cardEl;
    fill(index, getLang());
    const start = (document as any).startViewTransition?.bind(document);
    if (!start) { show(); return; }
    cardEl.style.viewTransitionName = 'toledo-morph';
    modal!.style.viewTransitionName = 'toledo-morph';
    const vt = start(() => { cardEl.style.viewTransitionName = ''; show(); });
    vt.finished.finally(() => { try { modal!.style.viewTransitionName = ''; } catch {} });
  }

  function close(): void {
    const hide = () => { modal!.hidden = true; document.body.style.overflow = ''; currentIndex = -1; };
    const start = (document as any).startViewTransition?.bind(document);
    if (!start || !openCardEl) { hide(); return; }
    modal!.style.viewTransitionName = 'toledo-morph';
    const vt = start(() => { hide(); openCardEl!.style.viewTransitionName = 'toledo-morph'; });
    vt.finished.finally(() => { try { openCardEl!.style.viewTransitionName = ''; modal!.style.viewTransitionName = ''; } catch {} });
  }

  document.querySelectorAll<HTMLElement>('[data-package]').forEach((card) => {
    const idx = Number(card.dataset.index);
    card.addEventListener('click', () => open(idx, card));
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(idx, card); }
    });
  });

  modal.querySelectorAll<HTMLElement>('[data-modal-close]').forEach((b) => b.addEventListener('click', close));
  modal.addEventListener('click', (e) => { if (e.target === modal) close(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !modal.hidden) close(); });

  // Permite al toggle de idioma re-renderizar el modal abierto.
  window.__toledoRefreshModal = (lang: Lang) => { if (!modal.hidden && currentIndex >= 0) fill(currentIndex, lang); };
}
