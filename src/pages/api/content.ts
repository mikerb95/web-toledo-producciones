import type { APIRoute } from 'astro';
import { getContent, saveContent, resetContent } from '../../lib/content';
import type { SiteContent } from '../../data/defaults';

export const prerender = false;

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json' } });

const unauthorized = () => json({ ok: false, error: 'No autorizado.' }, 401);

export const GET: APIRoute = async ({ locals }) => {
  if (!locals.authed) return unauthorized();
  const content = await getContent();
  return json({ ok: true, content });
};

export const POST: APIRoute = async ({ request, locals }) => {
  if (!locals.authed) return unauthorized();
  let body: any;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: 'JSON inválido.' }, 400);
  }

  if (body?.action === 'reset') {
    const content = await resetContent();
    return json({ ok: true, content });
  }

  const incoming = (body?.content ?? body) as SiteContent;
  if (!incoming || typeof incoming !== 'object' || !Array.isArray(incoming.packages)) {
    return json({ ok: false, error: 'Contenido inválido.' }, 400);
  }
  const content = await saveContent(incoming);
  return json({ ok: true, content });
};
