import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { BPM, PULSO_S, fase, compas, golpe } from './pulso';
import { anguloHacia, coreografia, GIRO_MAX, COMPASES_FIGURA } from './rig';
import { ubicar, normalizar, trasBarrido, RADIO_KM } from './cobertura';

const cerca = (a: number, b: number, tol = 1e-6) => Math.abs(a - b) <= tol;

test('pulso: --pulso de global.css coincide con BPM', () => {
  const css = readFileSync(new URL('../../styles/global.css', import.meta.url), 'utf8');
  const m = css.match(/--pulso:\s*([\d.]+)s/);
  assert.ok(m, 'global.css debe declarar --pulso');
  assert.ok(cerca(Number(m![1]), 60 / BPM, 0.001));
});

test('pulso: fase y compás', () => {
  assert.equal(fase(0), 0);
  assert.ok(cerca(fase(PULSO_S * 2.25), 0.25));
  assert.ok(cerca(fase(PULSO_S * 3, 4), 0.75));
  assert.ok(fase(-0.1) >= 0 && fase(-0.1) < 1);
  assert.equal(compas(PULSO_S * 3.9), 0);
  assert.equal(compas(PULSO_S * 4.1), 1);
  assert.equal(golpe(0), 1);
  assert.ok(golpe(PULSO_S * 0.5) < 0.1);
});

test('rig: anguloHacia sigue la convención de CSS rotate', () => {
  const cabeza = { x: 500, y: 0 };
  assert.ok(cerca(anguloHacia(cabeza, { x: 500, y: 400 }), 0));
  // Objetivo a la derecha: la punta va a la derecha, giro antihorario (negativo).
  assert.ok(cerca(anguloHacia(cabeza, { x: 900, y: 400 }), -45));
  assert.ok(cerca(anguloHacia(cabeza, { x: 100, y: 400 }), 45));
  // Objetivo por encima o muy al lado: se limita, nunca media vuelta.
  assert.equal(anguloHacia(cabeza, { x: 5000, y: -50 }), -GIRO_MAX);
});

test('rig: la coreografía no se sale del giro máximo ni salta entre figuras', () => {
  const n = 6;
  const dt = 1 / 60;
  const durFigura = PULSO_S * 4 * COMPASES_FIGURA;
  for (let i = 0; i < n; i++) {
    let previo = coreografia(0, i, n);
    for (let t = dt; t < durFigura * 4.5; t += dt) {
      const a = coreografia(t, i, n);
      assert.ok(Math.abs(a) <= GIRO_MAX, `ángulo fuera de rango en t=${t}`);
      // A 60 fps ninguna cabeza debería moverse más de 5° por fotograma.
      assert.ok(Math.abs(a - previo) < 5, `salto de ${a - previo}° en t=${t.toFixed(2)}, cabeza ${i}`);
      previo = a;
    }
  }
});

test('cobertura: municipios en su lugar real', () => {
  assert.equal(normalizar(' Zipaquirá '), 'zipaquira');
  const bogota = ubicar('Bogotá')!;
  assert.equal(bogota.km, 0);
  const zipa = ubicar('Zipaquirá')!;
  // Zipaquirá queda al norte-noreste, a unos 35 km.
  assert.ok(zipa.km > 30 && zipa.km < RADIO_KM);
  assert.ok(zipa.rumbo > 0 && zipa.rumbo < 30);
  assert.ok(zipa.y < 0, 'norte va hacia arriba');
  const soacha = ubicar('Soacha')!;
  assert.ok(soacha.rumbo > 180 && soacha.rumbo < 270, 'Soacha al suroeste');
  const calera = ubicar('La Calera')!;
  assert.ok(calera.x > 0 && calera.rumbo > 60 && calera.rumbo < 120, 'La Calera al oriente');
  assert.equal(ubicar('Medellín'), null);
});

test('cobertura: los municipios de la lista por defecto caben en el radar', () => {
  for (const m of ['Chía', 'Cota', 'Cajicá', 'Zipaquirá', 'La Calera', 'Soacha', 'Mosquera', 'Funza', 'Madrid', 'Sopó', 'Tabio']) {
    const u = ubicar(m);
    assert.ok(u, `${m} sin coordenadas`);
    assert.ok(Math.hypot(u!.x, u!.y) <= 1, `${m} fuera del radar`);
  }
});

test('cobertura: trasBarrido', () => {
  assert.equal(trasBarrido(10, 10), 0);
  assert.equal(trasBarrido(20, 10), 10);
  assert.equal(trasBarrido(5, 355), 10);
  assert.equal(trasBarrido(350, 10), 340);
});
