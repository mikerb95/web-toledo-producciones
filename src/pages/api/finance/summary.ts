import type { APIRoute } from 'astro';
import { summary } from '../../../lib/finance/repo';

export const prerender = false;

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });

export const GET: APIRoute = async ({ locals }) => {
  if (!locals.authed) return json({ ok: false, error: 'No autorizado.' }, 401);
  const data = await summary();
  return json({ ok: true, data });
};
