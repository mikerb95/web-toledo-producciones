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

  // Reconstruye los chips de cobertura (lista dependiente del idioma).
  const chips = document.getElementById('coverage-chips');
  if (chips) {
    chips.innerHTML = vm.coverage
      .map((c) => `<span style="display:inline-flex;align-items:center;gap:7px;border:1px solid rgba(226,168,46,.28);background:rgba(226,168,46,.05);border-radius:999px;padding:8px 14px;font-size:13.5px;font-weight:600;color:#d8d2c6"><span style="width:5px;height:5px;border-radius:50%;background:#E2A82E"></span>${c}</span>`)
      .join('');
  }

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
