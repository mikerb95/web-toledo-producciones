import type { APIRoute } from 'astro';
import { checkPassword, createSession, SESSION_COOKIE, cookieOptions } from '../../lib/auth';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  let password = '';
  try {
    const body = await request.json();
    password = String(body?.password || '');
  } catch {
    const form = await request.formData().catch(() => null);
    password = String(form?.get('password') || '');
  }

  if (!checkPassword(password)) {
    return new Response(JSON.stringify({ ok: false, error: 'Contraseña incorrecta.' }), {
      status: 401,
      headers: { 'content-type': 'application/json' },
    });
  }

  cookies.set(SESSION_COOKIE, createSession(), cookieOptions());
  return new Response(JSON.stringify({ ok: true }), { headers: { 'content-type': 'application/json' } });
};
