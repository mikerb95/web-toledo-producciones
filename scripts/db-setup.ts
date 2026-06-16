// Crea el esquema y siembra el contenido por defecto si la fila aún no existe.
// Uso: npm run db:setup   (lee TURSO_* desde .env)
import { createClient } from '@libsql/client';
import { readFileSync } from 'node:fs';

// Carga mínima de .env (sin dependencias) para ejecutar fuera de Astro.
try {
  const env = readFileSync(new URL('../.env', import.meta.url), 'utf8');
  for (const line of env.split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
} catch {}

const { DEFAULTS } = await import('../src/data/defaults.ts');

const client = createClient({
  url: process.env.TURSO_DATABASE_URL || 'file:./local.db',
  authToken: process.env.TURSO_AUTH_TOKEN || undefined,
});

await client.execute(`
  CREATE TABLE IF NOT EXISTS site_content (
    id INTEGER PRIMARY KEY,
    data TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )
`);

const existing = await client.execute('SELECT id FROM site_content WHERE id = 1');
if (existing.rows.length === 0) {
  await client.execute({
    sql: 'INSERT INTO site_content (id, data, updated_at) VALUES (1, ?, ?)',
    args: [JSON.stringify(DEFAULTS), new Date().toISOString()],
  });
  console.log('✓ site_content sembrado con el contenido por defecto.');
} else {
  console.log('• site_content ya existe; no se sobreescribe.');
}
process.exit(0);
