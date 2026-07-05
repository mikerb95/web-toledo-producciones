import { createClient } from '@libsql/client';
import { readFileSync } from 'node:fs';
const env = readFileSync('.env', 'utf8');
for (const line of env.split('\n')) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
  if (m) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
}
const client = createClient({ url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN });
await client.execute("DELETE FROM finance_transactions WHERE description LIKE '__TEST__%' OR description LIKE '%comillas%'");
await client.execute("DELETE FROM finance_contracts WHERE title LIKE '__TEST__%'");
await client.execute("DELETE FROM finance_clients WHERE name LIKE '__TEST__%'");
const t = await client.execute('SELECT COUNT(*) AS n FROM finance_transactions');
const c = await client.execute('SELECT COUNT(*) AS n FROM finance_clients');
const k = await client.execute('SELECT COUNT(*) AS n FROM finance_contracts');
console.log('transactions:', t.rows[0], 'clients:', c.rows[0], 'contracts:', k.rows[0]);
process.exit(0);
