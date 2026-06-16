// Acceso al contenido editable del sitio (paquetes, portada, contacto, cobertura).
// Lectura/escritura sobre la fila singleton `site_content` (id=1) en libSQL.
import { db, ensureSchema } from './db';
import { DEFAULTS, type SiteContent } from '../data/defaults';

// Normaliza el documento cargado contra los DEFAULTS para tolerar campos
// faltantes tras cambios de esquema de contenido.
function normalize(raw: Partial<SiteContent> | null | undefined): SiteContent {
  if (!raw) return structuredClone(DEFAULTS);
  return {
    version: raw.version ?? DEFAULTS.version,
    contact: { ...DEFAULTS.contact, ...(raw.contact || {}) },
    hero: {
      es: { ...DEFAULTS.hero.es, ...(raw.hero?.es || {}) },
      en: { ...DEFAULTS.hero.en, ...(raw.hero?.en || {}) },
    },
    coverage: {
      es: raw.coverage?.es ?? DEFAULTS.coverage.es,
      en: raw.coverage?.en ?? DEFAULTS.coverage.en,
    },
    packages: Array.isArray(raw.packages) && raw.packages.length ? raw.packages : DEFAULTS.packages,
  };
}

// Lee el contenido actual. Si la tabla/fila no existe todavía, devuelve los
// DEFAULTS (el sitio nunca queda vacío aunque no se haya corrido el seed).
export async function getContent(): Promise<SiteContent> {
  try {
    await ensureSchema();
    const res = await db().execute('SELECT data FROM site_content WHERE id = 1');
    const row = res.rows[0];
    if (!row) return structuredClone(DEFAULTS);
    return normalize(JSON.parse(String(row.data)));
  } catch {
    return structuredClone(DEFAULTS);
  }
}

// Persiste el documento completo (upsert sobre id=1).
export async function saveContent(content: SiteContent): Promise<SiteContent> {
  await ensureSchema();
  const clean = normalize(content);
  await db().execute({
    sql: `INSERT INTO site_content (id, data, updated_at) VALUES (1, ?, ?)
          ON CONFLICT(id) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at`,
    args: [JSON.stringify(clean), new Date().toISOString()],
  });
  return clean;
}

// Restablece el contenido a los valores por defecto.
export async function resetContent(): Promise<SiteContent> {
  return saveContent(structuredClone(DEFAULTS));
}
