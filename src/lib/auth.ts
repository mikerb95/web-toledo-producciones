// Autenticación del admin: contraseña única (env ADMIN_PASSWORD) y cookie
// de sesión firmada con HMAC (env SESSION_SECRET). Sin base de datos de usuarios.
import { createHmac, timingSafeEqual } from 'node:crypto';

export const SESSION_COOKIE = 'toledo_admin';
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 días

function secret(): string {
  return import.meta.env.SESSION_SECRET || process.env.SESSION_SECRET || 'dev-secret-change-me';
}

function adminPassword(): string {
  return import.meta.env.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD || '';
}

function sign(payload: string): string {
  return createHmac('sha256', secret()).update(payload).digest('hex');
}

function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ba.length !== bb.length) return false;
  return timingSafeEqual(ba, bb);
}

// Compara la contraseña recibida con ADMIN_PASSWORD (tiempo constante).
export function checkPassword(input: string): boolean {
  const expected = adminPassword();
  if (!expected) return false;
  return safeEqual(input, expected);
}

// Crea el valor de cookie firmado: "<exp>.<firma>".
export function createSession(): string {
  const exp = String(Date.now() + SESSION_TTL_MS);
  return `${exp}.${sign(exp)}`;
}

// Verifica el valor de cookie: firma válida y no expirado.
export function verifySession(token: string | undefined): boolean {
  if (!token) return false;
  const dot = token.lastIndexOf('.');
  if (dot < 0) return false;
  const exp = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  if (!safeEqual(sig, sign(exp))) return false;
  const expNum = Number(exp);
  return Number.isFinite(expNum) && expNum > Date.now();
}

// Opciones estándar para setear/borrar la cookie de sesión.
export function cookieOptions(): { httpOnly: boolean; secure: boolean; sameSite: 'lax'; path: string; maxAge: number } {
  return {
    httpOnly: true,
    secure: import.meta.env.PROD,
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_TTL_MS / 1000,
  };
}
