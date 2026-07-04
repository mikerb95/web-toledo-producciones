import type { APIRoute } from 'astro';
import { listContracts, createContract, updateContract, deleteContract, type ContractInput } from '../../../lib/finance/repo';
import { vId, vAmount, vDateOpt, vEnum, vStr } from '../../../lib/finance/validate';
import { CONTRACT_KINDS, CONTRACT_STATUSES } from '../../../lib/finance/constants';

export const prerender = false;

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });

const unauthorized = () => json({ ok: false, error: 'No autorizado.' }, 401);

export const GET: APIRoute = async ({ locals, url }) => {
  if (!locals.authed) return unauthorized();
  const items = await listContracts(Number(url.searchParams.get('client_id')) || 0);
  return json({ ok: true, items });
};

function parseContractInput(body: any): { ok: true; value: ContractInput } | { ok: false; error: string } {
  const clientIdV = vId(body?.client_id, 'Cliente');
  if (!clientIdV.ok) return clientIdV;
  const title = vStr(body?.title, 160, 'Título', true);
  if (!title.ok) return title;
  const kind = vEnum(body?.kind, Object.keys(CONTRACT_KINDS) as (keyof typeof CONTRACT_KINDS)[], 'Tipo de contrato');
  if (!kind.ok) return kind;
  const start_date = vDateOpt(body?.start_date, 'Fecha de inicio');
  if (!start_date.ok) return start_date;
  const end_date = vDateOpt(body?.end_date, 'Fecha de fin');
  if (!end_date.ok) return end_date;
  let total_agreed = 0;
  if (body?.total_agreed) {
    const v = vAmount(body.total_agreed, 'Valor acordado');
    if (!v.ok) return v;
    total_agreed = v.value;
  }
  const status = vEnum(body?.status, Object.keys(CONTRACT_STATUSES) as (keyof typeof CONTRACT_STATUSES)[], 'Estado');
  if (!status.ok) return status;
  const notes = vStr(body?.notes, 1000, 'Notas');
  if (!notes.ok) return notes;
  return {
    ok: true,
    value: {
      client_id: clientIdV.value, title: title.value, kind: kind.value, start_date: start_date.value,
      end_date: end_date.value, total_agreed, status: status.value, notes: notes.value,
    },
  };
}

export const POST: APIRoute = async ({ request, locals }) => {
  if (!locals.authed) return unauthorized();
  let body: any;
  try { body = await request.json(); } catch { return json({ ok: false, error: 'JSON inválido.' }, 400); }
  const parsed = parseContractInput(body);
  if (!parsed.ok) return json({ ok: false, error: parsed.error }, 400);
  const result = await createContract(parsed.value);
  if ('error' in result) return json({ ok: false, error: result.error }, 400);
  return json({ ok: true, id: result.id }, 201);
};

export const PUT: APIRoute = async ({ request, locals }) => {
  if (!locals.authed) return unauthorized();
  let body: any;
  try { body = await request.json(); } catch { return json({ ok: false, error: 'JSON inválido.' }, 400); }
  const idv = vId(body?.id, 'Contrato');
  if (!idv.ok) return json({ ok: false, error: idv.error }, 400);
  const parsed = parseContractInput(body);
  if (!parsed.ok) return json({ ok: false, error: parsed.error }, 400);
  const result = await updateContract(idv.value, parsed.value);
  if ('error' in result) return json({ ok: false, error: result.error }, 400);
  return json({ ok: true });
};

export const DELETE: APIRoute = async ({ url, locals }) => {
  if (!locals.authed) return unauthorized();
  const idv = vId(url.searchParams.get('id'), 'Contrato');
  if (!idv.ok) return json({ ok: false, error: idv.error }, 400);
  const result = await deleteContract(idv.value);
  if ('error' in result) return json({ ok: false, error: result.error }, result.referenced ? 409 : 404);
  return json({ ok: true });
};
