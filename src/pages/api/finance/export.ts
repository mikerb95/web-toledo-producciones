import type { APIRoute } from 'astro';
import { listTransactions, type TxFilters } from '../../../lib/finance/repo';
import { toCsv } from '../../../lib/finance/csv';
import { categoryLabel, PAYMENT_STATUSES, METHODS } from '../../../lib/finance/constants';

export const prerender = false;

function parseFilters(url: URL): TxFilters {
  const p = url.searchParams;
  return {
    from: p.get('from') || '',
    to: p.get('to') || '',
    type: (p.get('type') as 'ingreso' | 'gasto' | '') || '',
    category: p.get('category') || '',
    client_id: Number(p.get('client_id')) || 0,
    contract_id: Number(p.get('contract_id')) || 0,
    payment_status: (p.get('payment_status') as TxFilters['payment_status']) || '',
    q: p.get('q') || '',
    page: 1,
    per_page: 100000, // exporta todo el set filtrado, no solo la página cargada
  };
}

export const GET: APIRoute = async ({ locals, url }) => {
  if (!locals.authed) {
    return new Response(JSON.stringify({ ok: false, error: 'No autorizado.' }), { status: 401, headers: { 'content-type': 'application/json' } });
  }

  const { items } = await listTransactions(parseFilters(url));
  const csv = toCsv(
    ['Fecha', 'Tipo', 'Categoría', 'Monto (COP)', 'Descripción', 'Cliente', 'Contrato', 'Estado de pago', 'Fecha límite', 'Método'],
    items.map((t) => [
      t.tx_date,
      t.type === 'ingreso' ? 'Ingreso' : 'Gasto',
      categoryLabel(t.category),
      t.amount,
      t.description,
      t.client_name || '',
      t.contract_title || '',
      PAYMENT_STATUSES[t.payment_status],
      t.due_date,
      t.method ? METHODS[t.method] : '',
    ]),
  );

  const filename = `finanzas-${new Date().toISOString().slice(0, 10)}.csv`;
  return new Response(csv, {
    status: 200,
    headers: {
      'content-type': 'text/csv; charset=utf-8',
      'content-disposition': `attachment; filename="${filename}"`,
      'cache-control': 'no-store',
    },
  });
};
