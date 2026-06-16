// Acceso al store de contenido embebido en la página (#toledo-data).
// Contiene los view models ES y EN para que el toggle intercambie sin recargar.
import type { ViewModel } from '../lib/viewmodel';
import type { Lang } from '../i18n/strings';

export interface Store { es: ViewModel; en: ViewModel; }

let _store: Store | null = null;

export function getStore(): Store {
  if (_store) return _store;
  const el = document.getElementById('toledo-data');
  _store = JSON.parse(el?.textContent || '{}') as Store;
  return _store;
}

export const LANG_KEY = 'toledo_lang';

export function getLang(): Lang {
  try {
    const l = localStorage.getItem(LANG_KEY);
    if (l === 'en' || l === 'es') return l;
  } catch {}
  return 'es';
}

export function setLang(lang: Lang): void {
  try { localStorage.setItem(LANG_KEY, lang); } catch {}
  document.cookie = `${LANG_KEY}=${lang};path=/;max-age=31536000;samesite=lax`;
}

// Resuelve una ruta tipo "t.nav.servicios" o "packages.0.name" en un objeto.
export function resolve(obj: unknown, path: string): unknown {
  return path.split('.').reduce<unknown>((acc, key) => {
    if (acc == null) return undefined;
    return (acc as Record<string, unknown>)[key];
  }, obj);
}
