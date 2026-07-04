import type { APIRoute } from 'astro';
import {
  listTransactions, createTransaction, updateTransaction, softDeleteTransaction, type TxFilters, type TxInput,
} from '../../../lib/finance/repo';
import { vId, vAmount, vDate, vDateOpt, vEnum, vStr } from '../../../lib/finance/validate';
import { PAYMENT_STATUSES, METHODS } from '../../../lib/finance/constants';

export const prerender = false;

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });

const unauthorized = () => json({ ok: false, error: 'No autorizado.' }, 401);

function parseFilters(url: URL): TxFilters {
  const p = url.searchParams;
  const page = Math.max(1, Number(p.get('page')) || 1);
  const per_page = Math.min(100, Math.max(1, Number(p.get('per_page')) || 25));
  return {
    from: p.get('from') || '',
    to: p.get('to') || '',
    type: (p.get('type') as 'ingreso' | 'gasto' | '') || '',
    category: p.get('category') || '',
    client_id: Number(p.get('client_id')) || 0,
    contract_id: Number(p.get('contract_id')) || 0,
    payment_status: (p.get('payment_status') as TxFilters['payment_status']) || '',
    q: p.get('q') || '',
    page,
    per_page,
  };
}

export const GET: APIRoute = async ({ locals, url }) => {
  if (!locals.authed) return unauthorized();
  const result = await listTransactions(parseFilters(url));
  return json({ ok: true, ...result });
};

function parseTxInput(body: any): { ok: true; value: TxInput } | { ok: false; error: string } {
  const type = vEnum(body?.type, ['ingreso', 'gasto'] as const, 'Tipo');
  if (!type.ok) return type;
  const category = vStr(body?.category, 60, 'Categoría', true);
  if (!category.ok) return category;
  const amount = vAmount(body?.amount);
  if (!amount.ok) return amount;
  const tx_date = vDate(body?.tx_date, 'Fecha del movimiento');
  if (!tx_date.ok) return tx_date;
  const description = vStr(body?.description, 500, 'Descripción');
  if (!description.ok) return description;
  const payment_status = vEnum(body?.payment_status, Object.keys(PAYMENT_STATUSES) as (keyof typeof PAYMENT_STATUSES)[], 'Estado de pago');
  if (!payment_status.ok) return payment_status;
  const due_date = vDateOpt(body?.due_date, 'Fecha límite');
  if (!due_date.ok) return due_date;
  const method = body?.method ? vEnum(body.method, Object.keys(METHODS) as (keyof typeof METHODS)[], 'Método') : { ok: true as const, value: '' as const };
  if (!method.ok) return method;

  let client_id: number | null = null;
  if (body?.client_id) {
    const v = vId(body.client_id, 'Cliente');
    if (!v.ok) return v;
    client_id = v.value;
  }
  let contract_id: number | null = null;
  if (body?.contract_id) {
    const v = vId(body.contract_id, 'Contrato');
    if (!v.ok) return v;
    contract_id = v.value;
  }

  return {
    ok: true,
    value: {
      type: type.value, category: category.value, amount: amount.value, tx_date: tx_date.value,
      description: description.value, client_id, contract_id, payment_status: payment_status.value,
      due_date: due_date.value, method: method.value,
    },
  };
}

export const POST: APIRoute = async ({ request, locals }) => {
  if (!locals.authed) return unauthorized();
  let body: any;
  try { body = await request.json(); } catch { return json({ ok: false, error: 'JSON inválido.' }, 400); }

  const parsed = parseTxInput(body);
  if (!parsed.ok) return json({ ok: false, error: parsed.error }, 400);

  const result = await createTransaction(parsed.value);
  if ('error' in result) return json({ ok: false, error: result.error }, 400);
  return json({ ok: true, id: result.id }, 201);
};

export const PUT: APIRoute = async ({ request, locals }) => {
  if (!locals.authed) return unauthorized();
  let body: any;
  try { body = await request.json(); } catch { return json({ ok: false, error: 'JSON inválido.' }, 400); }

  const idv = vId(body?.id, 'Movimiento');
  if (!idv.ok) return json({ ok: false, error: idv.error }, 400);
  const parsed = parseTxInput(body);
  if (!parsed.ok) return json({ ok: false, error: parsed.error }, 400);

  const result = await updateTransaction(idv.value, parsed.value);
  if ('error' in result) return json({ ok: false, error: result.error }, 400);
  return json({ ok: true });
};

export const DELETE: APIRoute = async ({ url, locals }) => {
  if (!locals.authed) return unauthorized();
  const idv = vId(url.searchParams.get('id'), 'Movimiento');
  if (!idv.ok) return json({ ok: false, error: idv.error }, 400);

  const result = await softDeleteTransaction(idv.value);
  if ('error' in result) return json({ ok: false, error: result.error }, 404);
  return json({ ok: true });
};
