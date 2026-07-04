// Validadores mínimos para los payloads de finanzas. Cada uno devuelve
// {ok:true, value} con el valor normalizado o {ok:false, error} con mensaje.
import { MAX_AMOUNT } from './constants';

export type V<T> = { ok: true; value: T } | { ok: false; error: string };

const err = (error: string): { ok: false; error: string } => ({ ok: false, error });

// Entero positivo (ids). Acepta number o string numérica.
export function vId(input: unknown, label: string): V<number> {
  const n = typeof input === 'string' ? Number(input) : input;
  if (typeof n !== 'number' || !Number.isSafeInteger(n) || n <= 0) return err(`${label} inválido.`);
  return { ok: true, value: n };
}

// Monto en COP: entero, > 0, <= MAX_AMOUNT. Sin floats: rechaza 1000.5.
export function vAmount(input: unknown, label = 'Monto'): V<number> {
  const n = typeof input === 'string' ? Number(input.trim()) : input;
  if (typeof n !== 'number' || !Number.isSafeInteger(n)) return err(`${label} debe ser un entero en pesos (sin centavos).`);
  if (n <= 0) return err(`${label} debe ser mayor que cero.`);
  if (n > MAX_AMOUNT) return err(`${label} supera el máximo permitido.`);
  return { ok: true, value: n };
}

// Fecha YYYY-MM-DD real (round-trip por Date.UTC para descartar 2026-13-40).
export function vDate(input: unknown, label = 'Fecha'): V<string> {
  if (typeof input !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(input)) return err(`${label} inválida (formato AAAA-MM-DD).`);
  const [y, m, d] = input.split('-').map(Number);
  const t = new Date(Date.UTC(y, m - 1, d));
  if (t.getUTCFullYear() !== y || t.getUTCMonth() !== m - 1 || t.getUTCDate() !== d) return err(`${label} no existe en el calendario.`);
  return { ok: true, value: input };
}

// Fecha opcional: '' o fecha válida.
export function vDateOpt(input: unknown, label = 'Fecha'): V<string> {
  if (input === undefined || input === null || input === '') return { ok: true, value: '' };
  return vDate(input, label);
}

// Valor dentro de un conjunto de claves permitidas.
export function vEnum<T extends string>(input: unknown, allowed: readonly T[], label: string): V<T> {
  if (typeof input !== 'string' || !(allowed as readonly string[]).includes(input)) return err(`${label} inválido.`);
  return { ok: true, value: input as T };
}

// Texto con tope de longitud; recorta espacios. required exige no-vacío.
export function vStr(input: unknown, max: number, label: string, required = false): V<string> {
  if (input === undefined || input === null) input = '';
  if (typeof input !== 'string') return err(`${label} inválido.`);
  const s = input.trim();
  if (required && !s) return err(`${label} es obligatorio.`);
  if (s.length > max) return err(`${label} supera ${max} caracteres.`);
  return { ok: true, value: s };
}
