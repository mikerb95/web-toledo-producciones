// Punto de entrada del motion de la portada. Con movimiento reducido solo se
// monta lo interactivo (ambientes de Eventos): el marcado del servidor ya es
// el estado final.
import { reducido, entradas, bucles, luzCursor, magneticos } from './comun';
import { hero } from './hero';
import { dron } from './dron';
import { eventos } from './eventos';
import { galeria } from './galeria';
import { cobertura } from './cobertura';

declare global { interface Window { __motionOk?: boolean } }

// Los ambientes de Eventos son interacción, no adorno: van siempre.
eventos();

if (!reducido()) {
  try {
    hero();
    dron();
    galeria();
    cobertura();
    entradas();
    bucles();
    luzCursor();
    magneticos();
    window.__motionOk = true;
  } catch (err) {
    // Fail-open: si algo revienta, se muestra todo lo que pudo quedar escondido.
    console.error('[motion]', err);
    document.documentElement.classList.remove('motion');
  }
}
