import type { APIRoute } from 'astro';
import { put, get, del } from '@vercel/blob';
import {
  listAttachments, countAttachments, insertAttachment, getAttachment, deleteAttachmentRow, transactionExists,
} from '../../../lib/finance/repo';
import { vId } from '../../../lib/finance/validate';
import { ATTACHMENT_MAX_SIZE, ATTACHMENT_MAX_COUNT, ATTACHMENT_TYPES } from '../../../lib/finance/constants';

export const prerender = false;

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });

const unauthorized = () => json({ ok: false, error: 'No autorizado.' }, 401);

function blobToken(): string | undefined {
  return import.meta.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_READ_WRITE_TOKEN || undefined;
}

const notConfigured = () => json({ ok: false, error: 'Adjuntos no configurados (BLOB_READ_WRITE_TOKEN).' }, 503);

function sanitizeFilename(name: string): string {
  const base = name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(-100);
  return base || 'archivo';
}

export const GET: APIRoute = async ({ url, locals }) => {
  if (!locals.authed) return unauthorized();

  const attId = url.searchParams.get('id');
  if (attId) {
    // Descarga por proxy autenticado: la URL del blob nunca llega al cliente.
    const token = blobToken();
    if (!token) return notConfigured();
    const idv = vId(attId, 'Adjunto');
    if (!idv.ok) return json({ ok: false, error: idv.error }, 400);
    const att = await getAttachment(idv.value);
    if (!att) return json({ ok: false, error: 'Adjunto no encontrado.' }, 404);
    const result = await get(att.blob_url, { access: 'private', token });
    if (!result || !result.stream) return json({ ok: false, error: 'Archivo no encontrado en el almacenamiento.' }, 404);
    return new Response(result.stream, {
      status: 200,
      headers: {
        'content-type': att.content_type,
        'content-disposition': `attachment; filename="${att.filename.replace(/"/g, '')}"`,
        'cache-control': 'no-store',
      },
    });
  }

  const txId = vId(url.searchParams.get('transaction_id'), 'Movimiento');
  if (!txId.ok) return json({ ok: false, error: txId.error }, 400);
  const items = await listAttachments(txId.value);
  return json({ ok: true, items });
};

export const POST: APIRoute = async ({ request, locals }) => {
  if (!locals.authed) return unauthorized();
  const token = blobToken();
  if (!token) return notConfigured();

  let form: FormData;
  try { form = await request.formData(); } catch { return json({ ok: false, error: 'Formulario inválido.' }, 400); }

  const txIdv = vId(form.get('transaction_id'), 'Movimiento');
  if (!txIdv.ok) return json({ ok: false, error: txIdv.error }, 400);
  if (!(await transactionExists(txIdv.value))) return json({ ok: false, error: 'El movimiento no existe.' }, 404);

  const file = form.get('file');
  if (!(file instanceof File)) return json({ ok: false, error: 'Archivo requerido.' }, 400);
  if (!ATTACHMENT_TYPES.includes(file.type)) return json({ ok: false, error: 'Tipo de archivo no permitido (solo PDF, JPG, PNG, WEBP).' }, 400);
  if (file.size > ATTACHMENT_MAX_SIZE) return json({ ok: false, error: 'El archivo supera el tamaño máximo (8 MB).' }, 400);
  if (file.size === 0) return json({ ok: false, error: 'El archivo está vacío.' }, 400);

  const count = await countAttachments(txIdv.value);
  if (count >= ATTACHMENT_MAX_COUNT) return json({ ok: false, error: `Máximo ${ATTACHMENT_MAX_COUNT} adjuntos por movimiento.` }, 400);

  const filename = sanitizeFilename(file.name || 'archivo');
  const path = `finanzas/tx-${txIdv.value}/${Date.now()}-${filename}`;
  const blob = await put(path, file, { access: 'private', token, contentType: file.type });

  const row = await insertAttachment({
    transaction_id: txIdv.value,
    blob_url: blob.url,
    blob_path: path,
    filename,
    content_type: file.type,
    size: file.size,
  });
  return json({ ok: true, id: row.id }, 201);
};

export const DELETE: APIRoute = async ({ url, locals }) => {
  if (!locals.authed) return unauthorized();
  const token = blobToken();
  if (!token) return notConfigured();

  const idv = vId(url.searchParams.get('id'), 'Adjunto');
  if (!idv.ok) return json({ ok: false, error: idv.error }, 400);
  const att = await getAttachment(idv.value);
  if (!att) return json({ ok: false, error: 'Adjunto no encontrado.' }, 404);

  await del(att.blob_path, { token });
  await deleteAttachmentRow(idv.value);
  return json({ ok: true });
};
