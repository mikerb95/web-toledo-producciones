import { createClient } from '@libsql/client';

const { DEFAULTS } = await import('../src/data/defaults.ts');

const client = createClient({ url: 'file:./local.db' });

await client.execute(`
  CREATE TABLE IF NOT EXISTS site_content (
    id INTEGER PRIMARY KEY,
    data TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )
`);

await client.execute({
  sql: `INSERT INTO site_content (id, data, updated_at) VALUES (1, ?, ?)
        ON CONFLICT(id) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at`,
  args: [JSON.stringify(DEFAULTS), new Date().toISOString()],
});

console.log('✓ site_content restablecido con los nuevos DEFAULTS.');
process.exit(0);
