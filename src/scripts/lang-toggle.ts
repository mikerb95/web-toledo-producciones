// Toggle de idioma ES/EN del lado cliente. Reescribe los nodos marcados con
// data-i18n / data-i18n-href según el view model del idioma activo.
import { getStore, getLang, setLang, resolve } from './store';
import type { Lang } from '../i18n/strings';

declare global {
  interface Window { __toledoApplyLang?: (lang: Lang) => void; __toledoRefreshModal?: (lang: Lang) => void; }
}

function applyLang(lang: Lang): void {
  const vm = getStore()[lang];
  if (!vm) return;

  document.querySelectorAll<HTMLElement>('[data-i18n]').forEach((el) => {
    const val = resolve(vm, el.getAttribute('data-i18n')!);
    if (val == null) return;
    const prefix = el.dataset.i18nPrefix || '';
    el.textContent = prefix + String(val);
  });

  document.querySelectorAll<HTMLElement>('[data-i18n-href]').forEach((el) => {
    const val = resolve(vm, el.getAttribute('data-i18n-href')!);
    if (typeof val === 'string') el.setAttribute('href', val);
  });

  document.querySelectorAll<HTMLButtonElement>('[data-lang-btn]').forEach((btn) => {
    btn.setAttribute('aria-pressed', String(btn.dataset.langBtn === lang));
  });

  document.documentElement.lang = lang;
  setLang(lang);

  // Refresca el modal de paquete si está abierto.
  window.__toledoRefreshModal?.(lang);
}

window.__toledoApplyLang = applyLang;

document.querySelectorAll<HTMLButtonElement>('[data-lang-btn]').forEach((btn) => {
  btn.addEventListener('click', () => applyLang((btn.dataset.langBtn as Lang) || 'es'));
});

// Aplica el idioma persistido al cargar (por si difiere del render inicial ES).
applyLang(getLang());
