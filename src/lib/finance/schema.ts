// DDL del módulo de finanzas. Se ejecuta de forma perezosa desde los handlers
// de API (memoizado) y también desde scripts/db-setup.ts — una sola fuente.
import { db } from '../db';

export const FINANCE_DDL: string[] = [
  `CREATE TABLE IF NOT EXISTS finance_clients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT NOT NULL DEFAULT '',
    email TEXT NOT NULL DEFAULT '',
    document_id TEXT NOT NULL DEFAULT '',
    notes TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS finance_contracts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_id INTEGER NOT NULL REFERENCES finance_clients(id),
    title TEXT NOT NULL,
    kind TEXT NOT NULL CHECK (kind IN ('arrendamiento','evento','otro')),
    start_date TEXT NOT NULL DEFAULT '',
    end_date TEXT NOT NULL DEFAULT '',
    total_agreed INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'activo' CHECK (status IN ('activo','finalizado','cancelado')),
    notes TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS finance_transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL CHECK (type IN ('ingreso','gasto')),
    category TEXT NOT NULL,
    amount INTEGER NOT NULL CHECK (amount > 0),
    tx_date TEXT NOT NULL CHECK (tx_date GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]'),
    description TEXT NOT NULL DEFAULT '',
    client_id INTEGER REFERENCES finance_clients(id),
    contract_id INTEGER REFERENCES finance_contracts(id),
    payment_status TEXT NOT NULL DEFAULT 'pagado' CHECK (payment_status IN ('pendiente','pagado','vencido')),
    due_date TEXT NOT NULL DEFAULT '',
    method TEXT NOT NULL DEFAULT '',
    deleted_at TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS idx_ftx_date ON finance_transactions(tx_date)`,
  `CREATE INDEX IF NOT EXISTS idx_ftx_client ON finance_transactions(client_id)`,
  `CREATE TABLE IF NOT EXISTS finance_attachments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    transaction_id INTEGER NOT NULL REFERENCES finance_transactions(id),
    blob_url TEXT NOT NULL,
    blob_path TEXT NOT NULL,
    filename TEXT NOT NULL,
    content_type TEXT NOT NULL,
    size INTEGER NOT NULL,
    created_at TEXT NOT NULL
  )`,
];

let ensured = false;

export async function ensureFinanceSchema(): Promise<void> {
  if (ensured) return;
  for (const ddl of FINANCE_DDL) await db().execute(ddl);
  ensured = true;
}
