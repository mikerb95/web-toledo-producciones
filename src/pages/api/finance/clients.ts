import type { APIRoute } from 'astro';
import { listClients, createClient, updateClient, deleteClient, type ClientInput } from '../../../lib/finance/repo';
import { vId, vStr } from '../../../lib/finance/validate';

export const prerender = false;

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });

const unauthorized = () => json({ ok: false, error: 'No autorizado.' }, 401);

export const GET: APIRoute = async ({ locals, url }) => {
  if (!locals.authed) return unauthorized();
  const items = await listClients(url.searchParams.get('q') || '');
  return json({ ok: true, items });
};

function parseClientInput(body: any): { ok: true; value: ClientInput } | { ok: false; error: string } {
  const name = vStr(body?.name, 120, 'Nombre', true);
  if (!name.ok) return name;
  const phone = vStr(body?.phone, 40, 'Teléfono');
  if (!phone.ok) return phone;
  const email = vStr(body?.email, 120, 'Correo');
  if (!email.ok) return email;
  const document_id = vStr(body?.document_id, 40, 'Documento');
  if (!document_id.ok) return document_id;
  const notes = vStr(body?.notes, 1000, 'Notas');
  if (!notes.ok) return notes;
  return { ok: true, value: { name: name.value, phone: phone.value, email: email.value, document_id: document_id.value, notes: notes.value } };
}

export const POST: APIRoute = async ({ request, locals }) => {
  if (!locals.authed) return unauthorized();
  let body: any;
  try { body = await request.json(); } catch { return json({ ok: false, error: 'JSON inválido.' }, 400); }
  const parsed = parseClientInput(body);
  if (!parsed.ok) return json({ ok: false, error: parsed.error }, 400);
  const result = await createClient(parsed.value);
  return json({ ok: true, id: result.id }, 201);
};

export const PUT: APIRoute = async ({ request, locals }) => {
  if (!locals.authed) return unauthorized();
  let body: any;
  try { body = await request.json(); } catch { return json({ ok: false, error: 'JSON inválido.' }, 400); }
  const idv = vId(body?.id, 'Cliente');
  if (!idv.ok) return json({ ok: false, error: idv.error }, 400);
  const parsed = parseClientInput(body);
  if (!parsed.ok) return json({ ok: false, error: parsed.error }, 400);
  const result = await updateClient(idv.value, parsed.value);
  if ('error' in result) return json({ ok: false, error: result.error }, 404);
  return json({ ok: true });
};

export const DELETE: APIRoute = async ({ url, locals }) => {
  if (!locals.authed) return unauthorized();
  const idv = vId(url.searchParams.get('id'), 'Cliente');
  if (!idv.ok) return json({ ok: false, error: idv.error }, 400);
  const result = await deleteClient(idv.value);
  if ('error' in result) return json({ ok: false, error: result.error }, result.referenced ? 409 : 404);
  return json({ ok: true });
};
