// Acceso a datos del módulo de finanzas. Único lugar con SQL de finanzas:
// todo parametrizado, montos INTEGER COP, agregados siempre vía SUM() en SQL.
import { db } from '../db';
import { ensureFinanceSchema } from './schema';
import {
  INGRESO_CATEGORIES,
  GASTO_CATEGORIES,
  type TxType,
  type PaymentStatus,
  type PaymentMethod,
  type ContractKind,
  type ContractStatus,
  type TxRow,
  type ClientRow,
  type ContractRow,
  type AttachmentRow,
  type SummaryData,
} from './constants';

const now = () => new Date().toISOString();

// Fecha "hoy" en Colombia (los cortes de vencimiento se evalúan en hora local
// del negocio, no en UTC). en-CA produce YYYY-MM-DD.
export function todayBogota(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Bogota' }).format(new Date());
}

// Los `pendiente` con fecha límite pasada se materializan como `vencido`
// antes de cualquier lectura, para que listado, resumen y CSV coincidan.
async function refreshVencidos(): Promise<void> {
  await db().execute({
    sql: `UPDATE finance_transactions SET payment_status = 'vencido', updated_at = ?
          WHERE deleted_at IS NULL AND payment_status = 'pendiente' AND due_date <> '' AND due_date < ?`,
    args: [now(), todayBogota()],
  });
}

// ── Filtros de movimientos ─────────────────────────────────────────
export interface TxFilters {
  from: string;
  to: string;
  type: TxType | '';
  category: string;
  client_id: number | 0;
  contract_id: number | 0;
  payment_status: PaymentStatus | '';
  q: string;
  page: number;
  per_page: number;
}

// Construye el WHERE desde una whitelist fija de predicados (alias t).
function whereFrom(f: TxFilters): { sql: string; args: (string | number)[] } {
  const conds = ['t.deleted_at IS NULL'];
  const args: (string | number)[] = [];
  if (f.from) { conds.push('t.tx_date >= ?'); args.push(f.from); }
  if (f.to) { conds.push('t.tx_date <= ?'); args.push(f.to); }
  if (f.type) { conds.push('t.type = ?'); args.push(f.type); }
  if (f.category) { conds.push('t.category = ?'); args.push(f.category); }
  if (f.client_id) { conds.push('t.client_id = ?'); args.push(f.client_id); }
  if (f.contract_id) { conds.push('t.contract_id = ?'); args.push(f.contract_id); }
  if (f.payment_status) { conds.push('t.payment_status = ?'); args.push(f.payment_status); }
  if (f.q) {
    conds.push("t.description LIKE ? ESCAPE '\\'");
    args.push('%' + f.q.replace(/[\\%_]/g, (m) => '\\' + m) + '%');
  }
  return { sql: conds.join(' AND '), args };
}

export interface TxList {
  items: TxRow[];
  total: number;
  page: number;
  per_page: number;
  sums: { ingresos: number; gastos: number };
}

export async function listTransactions(f: TxFilters): Promise<TxList> {
  await ensureFinanceSchema();
  await refreshVencidos();
  const w = whereFrom(f);
  const offset = (f.page - 1) * f.per_page;

  const rows = await db().execute({
    sql: `SELECT t.id, t.type, t.category, t.amount, t.tx_date, t.description,
                 t.client_id, t.contract_id, t.payment_status, t.due_date, t.method,
                 t.created_at, t.updated_at,
                 c.name AS client_name, k.title AS contract_title,
                 (SELECT COUNT(*) FROM finance_attachments a WHERE a.transaction_id = t.id) AS attachment_count
          FROM finance_transactions t
          LEFT JOIN finance_clients c ON c.id = t.client_id
          LEFT JOIN finance_contracts k ON k.id = t.contract_id
          WHERE ${w.sql}
          ORDER BY t.tx_date DESC, t.id DESC
          LIMIT ? OFFSET ?`,
    args: [...w.args, f.per_page, offset],
  });

  const agg = await db().execute({
    sql: `SELECT COUNT(*) AS total,
                 COALESCE(SUM(CASE WHEN t.type = 'ingreso' THEN t.amount END), 0) AS ingresos,
                 COALESCE(SUM(CASE WHEN t.type = 'gasto' THEN t.amount END), 0) AS gastos
          FROM finance_transactions t
          WHERE ${w.sql}`,
    args: w.args,
  });
  const a = agg.rows[0] as unknown as { total: number; ingresos: number; gastos: number };

  return {
    items: rows.rows as unknown as TxRow[],
    total: Number(a.total),
    page: f.page,
    per_page: f.per_page,
    sums: { ingresos: Number(a.ingresos), gastos: Number(a.gastos) },
  };
}

export interface TxInput {
  type: TxType;
  category: string;
  amount: number;
  tx_date: string;
  description: string;
  client_id: number | null;
  contract_id: number | null;
  payment_status: PaymentStatus;
  due_date: string;
  method: PaymentMethod;
}

// Integridad referencial en aplicación (Turso por HTTP no fuerza las FK):
// valida existencia y coherencia cliente↔contrato. Devuelve error legible.
async function checkRefs(input: TxInput): Promise<string | null> {
  if (input.contract_id) {
    const r = await db().execute({ sql: 'SELECT client_id FROM finance_contracts WHERE id = ?', args: [input.contract_id] });
    if (!r.rows.length) return 'El contrato indicado no existe.';
    const owner = Number((r.rows[0] as unknown as { client_id: number }).client_id);
    if (input.client_id && input.client_id !== owner) return 'El contrato no pertenece a ese cliente.';
    input.client_id = owner;
  } else if (input.client_id) {
    const r = await db().execute({ sql: 'SELECT id FROM finance_clients WHERE id = ?', args: [input.client_id] });
    if (!r.rows.length) return 'El cliente indicado no existe.';
  }
  const cats = input.type === 'ingreso' ? INGRESO_CATEGORIES : GASTO_CATEGORIES;
  if (!(input.category in cats)) return 'Categoría inválida para ese tipo.';
  return null;
}

export async function createTransaction(input: TxInput): Promise<{ id: number } | { error: string }> {
  await ensureFinanceSchema();
  const refErr = await checkRefs(input);
  if (refErr) return { error: refErr };
  const ts = now();
  const r = await db().execute({
    sql: `INSERT INTO finance_transactions
          (type, category, amount, tx_date, description, client_id, contract_id, payment_status, due_date, method, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [input.type, input.category, input.amount, input.tx_date, input.description,
           input.client_id, input.contract_id, input.payment_status, input.due_date, input.method, ts, ts],
  });
  return { id: Number(r.lastInsertRowid) };
}

export async function updateTransaction(id: number, input: TxInput): Promise<{ ok: true } | { error: string }> {
  await ensureFinanceSchema();
  const existing = await db().execute({ sql: 'SELECT id FROM finance_transactions WHERE id = ? AND deleted_at IS NULL', args: [id] });
  if (!existing.rows.length) return { error: 'El movimiento no existe.' };
  const refErr = await checkRefs(input);
  if (refErr) return { error: refErr };
  await db().execute({
    sql: `UPDATE finance_transactions SET type = ?, category = ?, amount = ?, tx_date = ?, description = ?,
          client_id = ?, contract_id = ?, payment_status = ?, due_date = ?, method = ?, updated_at = ?
          WHERE id = ?`,
    args: [input.type, input.category, input.amount, input.tx_date, input.description,
           input.client_id, input.contract_id, input.payment_status, input.due_date, input.method, now(), id],
  });
  return { ok: true };
}

// Soft delete: la fila queda en BD (trazabilidad) pero sale de listas y sumas.
export async function softDeleteTransaction(id: number): Promise<{ ok: true } | { error: string }> {
  await ensureFinanceSchema();
  const r = await db().execute({
    sql: 'UPDATE finance_transactions SET deleted_at = ?, updated_at = ? WHERE id = ? AND deleted_at IS NULL',
    args: [now(), now(), id],
  });
  if (!r.rowsAffected) return { error: 'El movimiento no existe.' };
  return { ok: true };
}

export async function transactionExists(id: number): Promise<boolean> {
  await ensureFinanceSchema();
  const r = await db().execute({ sql: 'SELECT id FROM finance_transactions WHERE id = ? AND deleted_at IS NULL', args: [id] });
  return r.rows.length > 0;
}

// ── Clientes ───────────────────────────────────────────────────────
export async function listClients(q: string): Promise<ClientRow[]> {
  await ensureFinanceSchema();
  const conds = q ? "WHERE c.name LIKE ? ESCAPE '\\'" : '';
  const args = q ? ['%' + q.replace(/[\\%_]/g, (m) => '\\' + m) + '%'] : [];
  const r = await db().execute({
    sql: `SELECT c.*,
                 (SELECT COUNT(*) FROM finance_contracts k WHERE k.client_id = c.id) AS contract_count,
                 (SELECT COUNT(*) FROM finance_transactions t WHERE t.client_id = c.id AND t.deleted_at IS NULL) AS tx_count,
                 COALESCE((SELECT SUM(t.amount) FROM finance_transactions t
                           WHERE t.client_id = c.id AND t.deleted_at IS NULL AND t.type = 'ingreso'), 0) AS total_ingresos
          FROM finance_clients c ${conds} ORDER BY c.name COLLATE NOCASE`,
    args,
  });
  return r.rows as unknown as ClientRow[];
}

export interface ClientInput { name: string; phone: string; email: string; document_id: string; notes: string }

export async function createClient(input: ClientInput): Promise<{ id: number }> {
  await ensureFinanceSchema();
  const ts = now();
  const r = await db().execute({
    sql: 'INSERT INTO finance_clients (name, phone, email, document_id, notes, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
    args: [input.name, input.phone, input.email, input.document_id, input.notes, ts, ts],
  });
  return { id: Number(r.lastInsertRowid) };
}

export async function updateClient(id: number, input: ClientInput): Promise<{ ok: true } | { error: string }> {
  await ensureFinanceSchema();
  const r = await db().execute({
    sql: 'UPDATE finance_clients SET name = ?, phone = ?, email = ?, document_id = ?, notes = ?, updated_at = ? WHERE id = ?',
    args: [input.name, input.phone, input.email, input.document_id, input.notes, now(), id],
  });
  if (!r.rowsAffected) return { error: 'El cliente no existe.' };
  return { ok: true };
}

// Bloquea el borrado si hay contratos o movimientos (incluso eliminados:
// los soft-deleted siguen referenciando al cliente para trazabilidad).
export async function deleteClient(id: number): Promise<{ ok: true } | { error: string; referenced?: boolean }> {
  await ensureFinanceSchema();
  const refs = await db().execute({
    sql: `SELECT (SELECT COUNT(*) FROM finance_contracts WHERE client_id = ?) +
                 (SELECT COUNT(*) FROM finance_transactions WHERE client_id = ?) AS n`,
    args: [id, id],
  });
  if (Number((refs.rows[0] as unknown as { n: number }).n) > 0) {
    return { error: 'No se puede eliminar: el cliente tiene contratos o movimientos asociados.', referenced: true };
  }
  const r = await db().execute({ sql: 'DELETE FROM finance_clients WHERE id = ?', args: [id] });
  if (!r.rowsAffected) return { error: 'El cliente no existe.' };
  return { ok: true };
}

// ── Contratos ──────────────────────────────────────────────────────
export async function listContracts(clientId: number | 0): Promise<ContractRow[]> {
  await ensureFinanceSchema();
  const conds = clientId ? 'WHERE k.client_id = ?' : '';
  const args = clientId ? [clientId] : [];
  const r = await db().execute({
    sql: `SELECT k.*,
                 COALESCE((SELECT SUM(t.amount) FROM finance_transactions t
                           WHERE t.contract_id = k.id AND t.deleted_at IS NULL
                             AND t.type = 'ingreso' AND t.payment_status = 'pagado'), 0) AS paid_total
          FROM finance_contracts k ${conds} ORDER BY k.created_at DESC`,
    args,
  });
  return r.rows as unknown as ContractRow[];
}

export interface ContractInput {
  client_id: number;
  title: string;
  kind: ContractKind;
  start_date: string;
  end_date: string;
  total_agreed: number;
  status: ContractStatus;
  notes: string;
}

export async function createContract(input: ContractInput): Promise<{ id: number } | { error: string }> {
  await ensureFinanceSchema();
  const c = await db().execute({ sql: 'SELECT id FROM finance_clients WHERE id = ?', args: [input.client_id] });
  if (!c.rows.length) return { error: 'El cliente indicado no existe.' };
  const ts = now();
  const r = await db().execute({
    sql: `INSERT INTO finance_contracts (client_id, title, kind, start_date, end_date, total_agreed, status, notes, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [input.client_id, input.title, input.kind, input.start_date, input.end_date, input.total_agreed, input.status, input.notes, ts, ts],
  });
  return { id: Number(r.lastInsertRowid) };
}

export async function updateContract(id: number, input: ContractInput): Promise<{ ok: true } | { error: string }> {
  await ensureFinanceSchema();
  const c = await db().execute({ sql: 'SELECT id FROM finance_clients WHERE id = ?', args: [input.client_id] });
  if (!c.rows.length) return { error: 'El cliente indicado no existe.' };
  const r = await db().execute({
    sql: `UPDATE finance_contracts SET client_id = ?, title = ?, kind = ?, start_date = ?, end_date = ?,
          total_agreed = ?, status = ?, notes = ?, updated_at = ? WHERE id = ?`,
    args: [input.client_id, input.title, input.kind, input.start_date, input.end_date, input.total_agreed, input.status, input.notes, now(), id],
  });
  if (!r.rowsAffected) return { error: 'El contrato no existe.' };
  return { ok: true };
}

export async function deleteContract(id: number): Promise<{ ok: true } | { error: string; referenced?: boolean }> {
  await ensureFinanceSchema();
  const refs = await db().execute({ sql: 'SELECT COUNT(*) AS n FROM finance_transactions WHERE contract_id = ?', args: [id] });
  if (Number((refs.rows[0] as unknown as { n: number }).n) > 0) {
    return { error: 'No se puede eliminar: el contrato tiene movimientos asociados.', referenced: true };
  }
  const r = await db().execute({ sql: 'DELETE FROM finance_contracts WHERE id = ?', args: [id] });
  if (!r.rowsAffected) return { error: 'El contrato no existe.' };
  return { ok: true };
}

// ── Resumen (dashboard) ────────────────────────────────────────────
export async function summary(): Promise<SummaryData> {
  await ensureFinanceSchema();
  await refreshVencidos();

  const bal = await db().execute(
    `SELECT COALESCE(SUM(CASE WHEN type = 'ingreso' THEN amount ELSE -amount END), 0) AS balance
     FROM finance_transactions WHERE deleted_at IS NULL`,
  );
  const balance = Number((bal.rows[0] as unknown as { balance: number }).balance);

  // Últimos 12 meses (incluido el actual) en hora de Colombia.
  const today = todayBogota();
  const [cy, cm] = today.split('-').map(Number);
  const months: { ym: string; ingresos: number; gastos: number }[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(Date.UTC(cy, cm - 1 - i, 1));
    months.push({ ym: `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`, ingresos: 0, gastos: 0 });
  }
  const from = months[0].ym + '-01';
  const grouped = await db().execute({
    sql: `SELECT substr(tx_date, 1, 7) AS ym, type, COALESCE(SUM(amount), 0) AS total
          FROM finance_transactions WHERE deleted_at IS NULL AND tx_date >= ?
          GROUP BY ym, type`,
    args: [from],
  });
  for (const row of grouped.rows as unknown as { ym: string; type: TxType; total: number }[]) {
    const m = months.find((x) => x.ym === row.ym);
    if (m) m[row.type === 'ingreso' ? 'ingresos' : 'gastos'] = Number(row.total);
  }

  const current = months[months.length - 1];

  const pend = await db().execute(
    `SELECT payment_status AS st, COUNT(*) AS n, COALESCE(SUM(amount), 0) AS total
     FROM finance_transactions
     WHERE deleted_at IS NULL AND payment_status IN ('pendiente', 'vencido')
     GROUP BY payment_status`,
  );
  const byStatus: Record<string, { count: number; total: number }> = {};
  for (const row of pend.rows as unknown as { st: string; n: number; total: number }[]) {
    byStatus[row.st] = { count: Number(row.n), total: Number(row.total) };
  }

  return {
    balance,
    month: { ym: current.ym, ingresos: current.ingresos, gastos: current.gastos },
    pendiente: byStatus['pendiente'] || { count: 0, total: 0 },
    vencido: byStatus['vencido'] || { count: 0, total: 0 },
    months,
  };
}

// ── Adjuntos ───────────────────────────────────────────────────────
export interface AttachmentFull extends AttachmentRow { blob_url: string; blob_path: string }

export async function listAttachments(txId: number): Promise<AttachmentRow[]> {
  await ensureFinanceSchema();
  const r = await db().execute({
    sql: `SELECT id, transaction_id, filename, content_type, size, created_at
          FROM finance_attachments WHERE transaction_id = ? ORDER BY id`,
    args: [txId],
  });
  return r.rows as unknown as AttachmentRow[];
}

export async function countAttachments(txId: number): Promise<number> {
  await ensureFinanceSchema();
  const r = await db().execute({ sql: 'SELECT COUNT(*) AS n FROM finance_attachments WHERE transaction_id = ?', args: [txId] });
  return Number((r.rows[0] as unknown as { n: number }).n);
}

export async function insertAttachment(a: Omit<AttachmentFull, 'id' | 'created_at'>): Promise<{ id: number }> {
  await ensureFinanceSchema();
  const r = await db().execute({
    sql: `INSERT INTO finance_attachments (transaction_id, blob_url, blob_path, filename, content_type, size, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?)`,
    args: [a.transaction_id, a.blob_url, a.blob_path, a.filename, a.content_type, a.size, now()],
  });
  return { id: Number(r.lastInsertRowid) };
}

export async function getAttachment(id: number): Promise<AttachmentFull | null> {
  await ensureFinanceSchema();
  const r = await db().execute({ sql: 'SELECT * FROM finance_attachments WHERE id = ?', args: [id] });
  return r.rows.length ? (r.rows[0] as unknown as AttachmentFull) : null;
}

export async function deleteAttachmentRow(id: number): Promise<void> {
  await ensureFinanceSchema();
  await db().execute({ sql: 'DELETE FROM finance_attachments WHERE id = ?', args: [id] });
}
