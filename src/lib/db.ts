// Cliente libSQL (Turso). En local apunta a un archivo SQLite (file:./local.db);
// en producción a una base Turso remota vía TURSO_DATABASE_URL + TURSO_AUTH_TOKEN.
import { createClient, type Client } from '@libsql/client';

let _client: Client | null = null;

export function db(): Client {
  if (_client) return _client;
  const url = import.meta.env.TURSO_DATABASE_URL || process.env.TURSO_DATABASE_URL || 'file:./local.db';
  const authToken = import.meta.env.TURSO_AUTH_TOKEN || process.env.TURSO_AUTH_TOKEN || undefined;
  _client = createClient({ url, authToken: authToken || undefined });
  return _client;
}

// Crea la tabla singleton de contenido si no existe. El contenido completo
// (contact, hero, coverage, packages) se guarda como un único documento JSON
// en la fila id=1 — mismo modelo que el objeto `data` del prototipo.
export async function ensureSchema(): Promise<void> {
  await db().execute(`
    CREATE TABLE IF NOT EXISTS site_content (
      id INTEGER PRIMARY KEY,
      data TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);
}
