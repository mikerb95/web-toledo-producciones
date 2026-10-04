// Motion de las páginas internas: solo el lenguaje común (entradas, bucles,
// luz del cursor, botones magnéticos). Lo propio de cada sección de la portada
// (hero, radar, dron) vive en index.ts.
import { reducido, entradas, bucles, luzCursor, magneticos } from './comun';

declare global { interface Window { __motionOk?: boolean } }

if (!reducido()) {
  try {
    entradas();
    bucles();
    luzCursor();
    magneticos();
    window.__motionOk = true;
  } catch (err) {
    console.error('[motion]', err);
    document.documentElement.classList.remove('motion');
  }
}
