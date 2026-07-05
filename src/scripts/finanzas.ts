// Panel de Finanzas (cliente). 3 pestañas: Resumen, Movimientos, Clientes y
// contratos. A diferencia de admin.ts (editor de documento con dirty-tracking),
// aquí cada acción guarda de inmediato y refresca la lista afectada.

interface Bootstrap {
  ingresoCategories: Record<string, string>;
  gastoCategories: Record<string, string>;
  paymentStatuses: Record<string, string>;
  methods: Record<string, string>;
  contractKinds: Record<string, string>;
  contractStatuses: Record<string, string>;
  blobEnabled: boolean;
}

const boot: Bootstrap = JSON.parse(document.getElementById('fin-bootstrap')?.textContent || '{}');

type Tab = 'resumen' | 'movimientos' | 'clientes';
let tab: Tab = 'resumen';

const root = document.getElementById('fin-root')!;
const titleEl = document.getElementById('fin-title')!;
const subEl = document.getElementById('fin-sub')!;
const actionsEl = document.getElementById('fin-actions')!;
const toastEl = document.getElementById('fin-toast')!;

const TITLES: Record<Tab, [string, string]> = {
  resumen: ['Resumen', 'Balance, ingresos y gastos del negocio'],
  movimientos: ['Movimientos', 'Registro de ingresos y gastos'],
  clientes: ['Clientes y contratos', 'Arrendatarios, eventos y sus contratos'],
};

const esc = (s: unknown) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const fmtCOP = (n: number) => '$' + new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 }).format(n);
const onlyDigits = (s: string) => s.replace(/\D/g, '');

let toastTimer: ReturnType<typeof setTimeout>;
function toast(msg: string, isError = false) {
  toastEl.textContent = msg;
  toastEl.style.background = isError ? 'linear-gradient(180deg,#ff9d8f,#ff6a56)' : 'linear-gradient(180deg,#F4C752,#D89A24)';
  toastEl.style.color = isError ? '#3a0e08' : '#1a1206';
  toastEl.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (toastEl.hidden = true), 2800);
}

async function api(path: string, options: RequestInit = {}): Promise<any> {
  const res = await fetch(path, { ...options, headers: { 'content-type': 'application/json', ...(options.headers || {}) } });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.ok === false) throw new Error(data.error || `Error (${res.status})`);
  return data;
}

document.getElementById('adm-logout')?.addEventListener('click', async () => {
  await fetch('/api/logout', { method: 'POST' });
  location.href = '/admin';
});

document.querySelectorAll<HTMLButtonElement>('.adm-nav[data-tab]').forEach((b) => {
  b.addEventListener('click', () => { tab = b.dataset.tab as Tab; render(); });
});

function render() {
  document.querySelectorAll<HTMLButtonElement>('.adm-nav[data-tab]').forEach((b) => b.setAttribute('aria-current', String(b.dataset.tab === tab)));
  titleEl.textContent = TITLES[tab][0];
  subEl.textContent = TITLES[tab][1];
  actionsEl.innerHTML = '';
  if (tab === 'resumen') renderResumen();
  else if (tab === 'movimientos') renderMovimientos();
  else renderClientes();
}

// ══════════════════════════════════════════════════════════════════
// RESUMEN
// ══════════════════════════════════════════════════════════════════
async function renderResumen() {
  root.innerHTML = '<p style="color:#7d786f">Cargando…</p>';
  let data: any;
  try {
    ({ data } = await api('/api/finance/summary'));
  } catch (e: any) {
    root.innerHTML = `<p style="color:#ff8a7d">${esc(e.message)}</p>`;
    return;
  }

  const tile = (label: string, value: string, color = '#F4EFE3') => `
    <div class="adm-tile"><div class="adm-tile-lbl">${label}</div><div class="adm-tile-val" style="color:${color}">${value}</div></div>`;

  const maxVal = Math.max(1, ...data.months.flatMap((m: any) => [m.ingresos, m.gastos]));
  const barW = 100 / data.months.length;
  const bars = data.months.map((m: any, i: number) => {
    const x = i * barW;
    const hIn = (m.ingresos / maxVal) * 100;
    const hOut = (m.gastos / maxVal) * 100;
    const label = m.ym.slice(5, 7) + '/' + m.ym.slice(2, 4);
    return `
      <g>
        <rect x="${x + barW * 0.12}%" y="${100 - hIn}%" width="${barW * 0.32}%" height="${hIn}%" fill="#F4C752" rx="1.5"><title>Ingresos ${esc(m.ym)}: ${fmtCOP(m.ingresos)}</title></rect>
        <rect x="${x + barW * 0.52}%" y="${100 - hOut}%" width="${barW * 0.32}%" height="${hOut}%" fill="#ff8a7d" rx="1.5"><title>Gastos ${esc(m.ym)}: ${fmtCOP(m.gastos)}</title></rect>
        <text x="${x + barW * 0.5}%" y="99%" font-size="3" fill="#7d786f" text-anchor="middle">${esc(label)}</text>
      </g>`;
  }).join('');

  root.innerHTML = `
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:16px;margin-bottom:24px">
      ${tile('Balance total', fmtCOP(data.balance), data.balance >= 0 ? '#7fd9a8' : '#ff8a7d')}
      ${tile('Ingresos del mes', fmtCOP(data.month.ingresos), '#7fd9a8')}
      ${tile('Gastos del mes', fmtCOP(data.month.gastos), '#ff8a7d')}
      ${tile('Pendiente', `${fmtCOP(data.pendiente.total)} <span style="font-size:13px;color:#8b867c">(${data.pendiente.count})</span>`, '#E2C277')}
      ${tile('Vencido', `${fmtCOP(data.vencido.total)} <span style="font-size:13px;color:#8b867c">(${data.vencido.count})</span>`, '#ff8a7d')}
    </div>
    <div class="adm-card" style="padding:22px">
      <div style="display:flex;align-items:center;gap:18px;margin-bottom:16px;font-size:12.5px;color:#8b867c">
        <span><span style="display:inline-block;width:9px;height:9px;background:#F4C752;border-radius:2px;margin-right:6px"></span>Ingresos</span>
        <span><span style="display:inline-block;width:9px;height:9px;background:#ff8a7d;border-radius:2px;margin-right:6px"></span>Gastos</span>
      </div>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" style="width:100%;height:220px">${bars}</svg>
    </div>`;
}

// ══════════════════════════════════════════════════════════════════
// MOVIMIENTOS
// ══════════════════════════════════════════════════════════════════
interface TxFiltersState {
  from: string; to: string; type: string; category: string; client_id: string; payment_status: string; q: string; page: number;
}
const txFilters: TxFiltersState = { from: '', to: '', type: '', category: '', client_id: '', payment_status: '', q: '', page: 1 };
let txClientsCache: { id: number; name: string }[] = [];
let txFormOpen = false;
let txEditing: any = null;
let txAttachmentsFor: number | null = null;

function categoriesForType(type: string): Record<string, string> {
  return type === 'gasto' ? boot.gastoCategories : boot.ingresoCategories;
}

async function loadTxClients() {
  try {
    const { items } = await api('/api/finance/clients');
    txClientsCache = items;
  } catch { txClientsCache = []; }
}

function buildTxQuery(extra: Record<string, string | number> = {}): string {
  const p = new URLSearchParams();
  const f = { ...txFilters, ...extra };
  if (f.from) p.set('from', String(f.from));
  if (f.to) p.set('to', String(f.to));
  if (f.type) p.set('type', String(f.type));
  if (f.category) p.set('category', String(f.category));
  if (f.client_id) p.set('client_id', String(f.client_id));
  if (f.payment_status) p.set('payment_status', String(f.payment_status));
  if (f.q) p.set('q', String(f.q));
  p.set('page', String(f.page || 1));
  p.set('per_page', '25');
  return p.toString();
}

async function renderMovimientos() {
  actionsEl.innerHTML = `<button type="button" class="adm-btn-primary" data-action="tx-new">+ Nuevo movimiento</button>`;
  actionsEl.querySelector('[data-action="tx-new"]')!.addEventListener('click', () => { txEditing = null; txFormOpen = true; drawMovimientos(); });

  if (!txClientsCache.length) await loadTxClients();
  await drawMovimientos();
}

async function drawMovimientos() {
  root.innerHTML = '<p style="color:#7d786f">Cargando…</p>';
  let result: any;
  try {
    result = await api(`/api/finance/transactions?${buildTxQuery()}`);
  } catch (e: any) {
    root.innerHTML = `<p style="color:#ff8a7d">${esc(e.message)}</p>`;
    return;
  }

  const clientOptions = (selected: number | null) => `<option value="">— Sin cliente —</option>` +
    txClientsCache.map((c) => `<option value="${c.id}" ${selected === c.id ? 'selected' : ''}>${esc(c.name)}</option>`).join('');

  const allCats = { ...boot.ingresoCategories, ...boot.gastoCategories };
  const categoryOptions = (type: string, selected: string) =>
    Object.entries(categoriesForType(type)).map(([k, v]) => `<option value="${k}" ${selected === k ? 'selected' : ''}>${esc(v)}</option>`).join('');

  const t = txEditing;
  const formHtml = txFormOpen ? `
    <div class="adm-card" style="padding:20px 22px;margin-bottom:20px">
      <form id="tx-form" style="display:grid;grid-template-columns:repeat(4,1fr);gap:14px">
        <label style="grid-column:span 1"><span class="adm-lbl">Tipo</span>
          <select class="adm-select" name="type">
            <option value="ingreso" ${t?.type !== 'gasto' ? 'selected' : ''}>Ingreso</option>
            <option value="gasto" ${t?.type === 'gasto' ? 'selected' : ''}>Gasto</option>
          </select>
        </label>
        <label style="grid-column:span 1"><span class="adm-lbl">Categoría</span>
          <select class="adm-select" name="category">${categoryOptions(t?.type || 'ingreso', t?.category || '')}</select>
        </label>
        <label style="grid-column:span 1"><span class="adm-lbl">Monto (COP)</span>
          <input class="adm-field" name="amount" inputmode="numeric" value="${t ? new Intl.NumberFormat('es-CO').format(t.amount) : ''}" placeholder="0" />
        </label>
        <label style="grid-column:span 1"><span class="adm-lbl">Fecha</span>
          <input class="adm-field" type="date" name="tx_date" value="${t?.tx_date || new Date().toISOString().slice(0, 10)}" />
        </label>
        <label style="grid-column:span 2"><span class="adm-lbl">Descripción</span>
          <input class="adm-field" name="description" value="${esc(t?.description || '')}" maxlength="500" />
        </label>
        <label style="grid-column:span 1"><span class="adm-lbl">Cliente</span>
          <select class="adm-select" name="client_id">${clientOptions(t?.client_id ?? null)}</select>
        </label>
        <label style="grid-column:span 1"><span class="adm-lbl">Estado de pago</span>
          <select class="adm-select" name="payment_status">
            ${Object.entries(boot.paymentStatuses).map(([k, v]) => `<option value="${k}" ${(t?.payment_status || 'pagado') === k ? 'selected' : ''}>${esc(v)}</option>`).join('')}
          </select>
        </label>
        <label style="grid-column:span 1"><span class="adm-lbl">Fecha límite</span>
          <input class="adm-field" type="date" name="due_date" value="${t?.due_date || ''}" />
        </label>
        <label style="grid-column:span 1"><span class="adm-lbl">Método</span>
          <select class="adm-select" name="method">
            <option value="">—</option>
            ${Object.entries(boot.methods).map(([k, v]) => `<option value="${k}" ${t?.method === k ? 'selected' : ''}>${esc(v)}</option>`).join('')}
          </select>
        </label>
        <div style="grid-column:span 4;display:flex;gap:10px;justify-content:flex-end;margin-top:4px">
          <button type="button" class="adm-btn-ghost" data-action="tx-cancel">Cancelar</button>
          <button type="submit" class="adm-btn-primary">${t ? 'Guardar cambios' : 'Crear movimiento'}</button>
        </div>
      </form>
    </div>` : '';

  const filterBar = `
    <div class="adm-card" style="padding:16px 18px;margin-bottom:18px;display:flex;flex-wrap:wrap;gap:10px;align-items:end">
      <label style="min-width:140px"><span class="adm-lbl">Desde</span><input class="adm-field" type="date" id="f-from" value="${txFilters.from}" /></label>
      <label style="min-width:140px"><span class="adm-lbl">Hasta</span><input class="adm-field" type="date" id="f-to" value="${txFilters.to}" /></label>
      <label style="min-width:130px"><span class="adm-lbl">Tipo</span>
        <select class="adm-select" id="f-type">
          <option value="">Todos</option>
          <option value="ingreso" ${txFilters.type === 'ingreso' ? 'selected' : ''}>Ingreso</option>
          <option value="gasto" ${txFilters.type === 'gasto' ? 'selected' : ''}>Gasto</option>
        </select>
      </label>
      <label style="min-width:170px"><span class="adm-lbl">Categoría</span>
        <select class="adm-select" id="f-category">
          <option value="">Todas</option>
          ${Object.entries(allCats).map(([k, v]) => `<option value="${k}" ${txFilters.category === k ? 'selected' : ''}>${esc(v)}</option>`).join('')}
        </select>
      </label>
      <label style="min-width:160px"><span class="adm-lbl">Cliente</span>
        <select class="adm-select" id="f-client">
          <option value="">Todos</option>
          ${txClientsCache.map((c) => `<option value="${c.id}" ${txFilters.client_id === String(c.id) ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}
        </select>
      </label>
      <label style="min-width:130px"><span class="adm-lbl">Estado</span>
        <select class="adm-select" id="f-status">
          <option value="">Todos</option>
          ${Object.entries(boot.paymentStatuses).map(([k, v]) => `<option value="${k}" ${txFilters.payment_status === k ? 'selected' : ''}>${esc(v)}</option>`).join('')}
        </select>
      </label>
      <label style="flex:1;min-width:160px"><span class="adm-lbl">Buscar</span><input class="adm-field" id="f-q" value="${esc(txFilters.q)}" placeholder="Descripción…" /></label>
      <button type="button" class="adm-btn-ghost" data-action="tx-export">⤓ Exportar CSV</button>
    </div>`;

  const rows = result.items.map((r: any) => `
    <tr>
      <td>${esc(r.tx_date)}</td>
      <td>${r.type === 'ingreso' ? '↑ Ingreso' : '↓ Gasto'}</td>
      <td>${esc(allCats[r.category] || r.category)}</td>
      <td class="${r.type === 'ingreso' ? 'adm-amt-in' : 'adm-amt-out'}">${r.type === 'ingreso' ? '+' : '−'}${fmtCOP(r.amount)}</td>
      <td>${esc(r.client_name || '—')}</td>
      <td><span class="adm-pill adm-pill-${r.payment_status}">${esc(boot.paymentStatuses[r.payment_status])}</span></td>
      <td>${esc(r.description || '')}</td>
      <td style="text-align:right;white-space:nowrap">
        <button type="button" class="adm-icon-btn" data-action="tx-attach" data-id="${r.id}" title="Adjuntos">📎${r.attachment_count ? ` ${r.attachment_count}` : ''}</button>
        <button type="button" class="adm-icon-btn" data-action="tx-edit" data-id="${r.id}" title="Editar">✎</button>
        <button type="button" class="adm-icon-btn" data-action="tx-delete" data-id="${r.id}" title="Eliminar">✕</button>
      </td>
    </tr>
    ${txAttachmentsFor === r.id ? `<tr><td colspan="8"><div id="tx-attach-panel"></div></td></tr>` : ''}
  `).join('');

  const totalPages = Math.max(1, Math.ceil(result.total / result.per_page));
  const pager = `
    <div style="display:flex;align-items:center;justify-content:space-between;padding:14px 4px;font-size:13px;color:#8b867c">
      <div>Ingresos: <span class="adm-amt-in">${fmtCOP(result.sums.ingresos)}</span> · Gastos: <span class="adm-amt-out">${fmtCOP(result.sums.gastos)}</span> · ${result.total} movimiento(s)</div>
      <div style="display:flex;gap:8px;align-items:center">
        <button type="button" class="adm-icon-btn" data-action="tx-page" data-dir="-1" ${result.page <= 1 ? 'disabled' : ''}>‹</button>
        <span>Página ${result.page} / ${totalPages}</span>
        <button type="button" class="adm-icon-btn" data-action="tx-page" data-dir="1" ${result.page >= totalPages ? 'disabled' : ''}>›</button>
      </div>
    </div>`;

  root.innerHTML = `
    ${filterBar}
    ${formHtml}
    <div class="adm-card" style="padding:6px 18px;overflow-x:auto">
      <table class="adm-table">
        <thead><tr><th>Fecha</th><th>Tipo</th><th>Categoría</th><th>Monto</th><th>Cliente</th><th>Estado</th><th>Descripción</th><th></th></tr></thead>
        <tbody>${rows || `<tr><td colspan="8" style="text-align:center;color:#7d786f;padding:26px">Sin movimientos.</td></tr>`}</tbody>
      </table>
    </div>
    ${pager}
  `;

  if (txAttachmentsFor != null) void drawAttachments(txAttachmentsFor);

  document.getElementById('tx-form')?.addEventListener('submit', onTxSubmit);
  root.querySelector('[data-action="tx-cancel"]')?.addEventListener('click', () => { txFormOpen = false; txEditing = null; drawMovimientos(); });
  root.querySelector('[data-action="tx-export"]')?.addEventListener('click', () => {
    window.open(`/api/finance/export?${buildTxQuery()}`, '_blank');
  });

  ['from', 'to', 'type', 'category', 'client', 'status', 'q'].forEach((key) => {
    const el = document.getElementById(`f-${key}`) as HTMLInputElement | HTMLSelectElement | null;
    el?.addEventListener('change', () => {
      const map: Record<string, keyof TxFiltersState> = { from: 'from', to: 'to', type: 'type', category: 'category', client: 'client_id', status: 'payment_status', q: 'q' };
      (txFilters as any)[map[key]] = el.value;
      txFilters.page = 1;
      drawMovimientos();
    });
  });
  document.getElementById('f-q')?.addEventListener('keydown', (e) => { if ((e as KeyboardEvent).key === 'Enter') { txFilters.q = (e.target as HTMLInputElement).value; txFilters.page = 1; drawMovimientos(); } });

  root.querySelectorAll<HTMLButtonElement>('[data-action="tx-edit"]').forEach((b) => b.addEventListener('click', () => {
    txEditing = result.items.find((r: any) => r.id === Number(b.dataset.id));
    txFormOpen = true;
    drawMovimientos();
  }));
  root.querySelectorAll<HTMLButtonElement>('[data-action="tx-delete"]').forEach((b) => b.addEventListener('click', async () => {
    if (!confirm('¿Eliminar este movimiento? Podrás seguir viéndolo en la base de datos, pero saldrá de los totales.')) return;
    try { await api(`/api/finance/transactions?id=${b.dataset.id}`, { method: 'DELETE' }); toast('Movimiento eliminado.'); drawMovimientos(); }
    catch (e: any) { toast(e.message, true); }
  }));
  root.querySelectorAll<HTMLButtonElement>('[data-action="tx-attach"]').forEach((b) => b.addEventListener('click', () => {
    const id = Number(b.dataset.id);
    txAttachmentsFor = txAttachmentsFor === id ? null : id;
    drawMovimientos();
  }));
  root.querySelectorAll<HTMLButtonElement>('[data-action="tx-page"]').forEach((b) => b.addEventListener('click', () => {
    txFilters.page = Math.max(1, txFilters.page + Number(b.dataset.dir));
    drawMovimientos();
  }));

  const typeSel = document.querySelector<HTMLSelectElement>('#tx-form [name="type"]');
  typeSel?.addEventListener('change', () => {
    const catSel = document.querySelector<HTMLSelectElement>('#tx-form [name="category"]')!;
    catSel.innerHTML = categoryOptions(typeSel.value, '');
  });
  const amountInput = document.querySelector<HTMLInputElement>('#tx-form [name="amount"]');
  amountInput?.addEventListener('input', () => {
    const digits = onlyDigits(amountInput.value);
    amountInput.value = digits ? new Intl.NumberFormat('es-CO').format(Number(digits)) : '';
  });
}

async function onTxSubmit(e: Event) {
  e.preventDefault();
  const form = e.target as HTMLFormElement;
  const fd = new FormData(form);
  const payload: any = {
    type: fd.get('type'),
    category: fd.get('category'),
    amount: Number(onlyDigits(String(fd.get('amount') || ''))),
    tx_date: fd.get('tx_date'),
    description: fd.get('description'),
    client_id: fd.get('client_id') ? Number(fd.get('client_id')) : null,
    payment_status: fd.get('payment_status'),
    due_date: fd.get('due_date'),
    method: fd.get('method'),
  };
  try {
    if (txEditing) await api('/api/finance/transactions', { method: 'PUT', body: JSON.stringify({ id: txEditing.id, ...payload }) });
    else await api('/api/finance/transactions', { method: 'POST', body: JSON.stringify(payload) });
    toast('Movimiento guardado.');
    txFormOpen = false; txEditing = null;
    drawMovimientos();
  } catch (err: any) {
    toast(err.message, true);
  }
}

async function drawAttachments(txId: number) {
  const panel = document.getElementById('tx-attach-panel');
  if (!panel) return;
  panel.innerHTML = '<p style="color:#7d786f;font-size:13px;padding:10px 0">Cargando adjuntos…</p>';
  if (!boot.blobEnabled) {
    panel.innerHTML = '<p style="color:#8b867c;font-size:13px;padding:10px 0">Adjuntos no configurados en este entorno.</p>';
    return;
  }
  let items: any[] = [];
  try { ({ items } = await api(`/api/finance/attachments?transaction_id=${txId}`)); } catch { items = []; }

  panel.innerHTML = `
    <div style="padding:14px 0;display:flex;flex-direction:column;gap:8px">
      ${items.map((a) => `
        <div style="display:flex;align-items:center;gap:10px;font-size:13px">
          <a href="/api/finance/attachments?id=${a.id}" style="color:#E2C277">${esc(a.filename)}</a>
          <span style="color:#7d786f">${(a.size / 1024).toFixed(0)} KB</span>
          <button type="button" class="adm-del" data-action="att-delete" data-id="${a.id}" style="width:24px;height:24px">✕</button>
        </div>`).join('') || '<p style="color:#7d786f;font-size:13px">Sin adjuntos.</p>'}
      <form id="att-upload-form" style="display:flex;gap:10px;align-items:center;margin-top:4px">
        <input type="file" name="file" accept="application/pdf,image/jpeg,image/png,image/webp" style="font-size:12.5px;color:#9a948a" />
        <button type="submit" class="adm-btn-ghost">Subir comprobante</button>
      </form>
    </div>`;

  panel.querySelectorAll<HTMLButtonElement>('[data-action="att-delete"]').forEach((b) => b.addEventListener('click', async () => {
    if (!confirm('¿Eliminar este adjunto?')) return;
    try { await api(`/api/finance/attachments?id=${b.dataset.id}`, { method: 'DELETE' }); drawAttachments(txId); }
    catch (e: any) { toast(e.message, true); }
  }));
  panel.querySelector('#att-upload-form')?.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    const form = ev.target as HTMLFormElement;
    const input = form.querySelector<HTMLInputElement>('input[type=file]')!;
    if (!input.files?.length) return;
    const fd = new FormData();
    fd.set('transaction_id', String(txId));
    fd.set('file', input.files[0]);
    try {
      const res = await fetch('/api/finance/attachments', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok || data.ok === false) throw new Error(data.error || 'Error al subir el archivo.');
      toast('Adjunto subido.');
      drawAttachments(txId);
      drawMovimientos();
    } catch (e: any) { toast(e.message, true); }
  });
}

// ══════════════════════════════════════════════════════════════════
// CLIENTES Y CONTRATOS
// ══════════════════════════════════════════════════════════════════
let clientQuery = '';
let clientFormOpen = false;
let clientEditing: any = null;
let expandedClient: number | null = null;
let contractFormOpenFor: number | null = null;
let contractEditing: any = null;

async function renderClientes() {
  actionsEl.innerHTML = `<button type="button" class="adm-btn-primary" data-action="cli-new">+ Nuevo cliente</button>`;
  actionsEl.querySelector('[data-action="cli-new"]')!.addEventListener('click', () => { clientEditing = null; clientFormOpen = true; drawClientes(); });
  await drawClientes();
}

async function drawClientes() {
  root.innerHTML = '<p style="color:#7d786f">Cargando…</p>';
  let items: any[] = [];
  try { ({ items } = await api(`/api/finance/clients?q=${encodeURIComponent(clientQuery)}`)); }
  catch (e: any) { root.innerHTML = `<p style="color:#ff8a7d">${esc(e.message)}</p>`; return; }

  const c = clientEditing;
  const clientForm = clientFormOpen ? `
    <div class="adm-card" style="padding:20px 22px;margin-bottom:20px">
      <form id="cli-form" style="display:grid;grid-template-columns:repeat(3,1fr);gap:14px">
        <label><span class="adm-lbl">Nombre</span><input class="adm-field" name="name" value="${esc(c?.name || '')}" required maxlength="120" /></label>
        <label><span class="adm-lbl">Teléfono</span><input class="adm-field" name="phone" value="${esc(c?.phone || '')}" maxlength="40" /></label>
        <label><span class="adm-lbl">Correo</span><input class="adm-field" name="email" value="${esc(c?.email || '')}" maxlength="120" /></label>
        <label><span class="adm-lbl">Documento (NIT/cédula)</span><input class="adm-field" name="document_id" value="${esc(c?.document_id || '')}" maxlength="40" /></label>
        <label style="grid-column:span 2"><span class="adm-lbl">Notas</span><input class="adm-field" name="notes" value="${esc(c?.notes || '')}" maxlength="1000" /></label>
        <div style="grid-column:span 3;display:flex;gap:10px;justify-content:flex-end">
          <button type="button" class="adm-btn-ghost" data-action="cli-cancel">Cancelar</button>
          <button type="submit" class="adm-btn-primary">${c ? 'Guardar cambios' : 'Crear cliente'}</button>
        </div>
      </form>
    </div>` : '';

  const rows = (await Promise.all(items.map(async (cl) => {
    const isOpen = expandedClient === cl.id;
    const detail = isOpen ? await contractsDetailHtml(cl) : '';
    return `
      <tr>
        <td>${esc(cl.name)}</td>
        <td>${esc(cl.phone || '—')}</td>
        <td>${esc(cl.email || '—')}</td>
        <td>${cl.contract_count}</td>
        <td class="adm-amt-in">${fmtCOP(cl.total_ingresos)}</td>
        <td style="text-align:right;white-space:nowrap">
          <button type="button" class="adm-icon-btn" data-action="cli-expand" data-id="${cl.id}">${isOpen ? '▾' : '▸'}</button>
          <button type="button" class="adm-icon-btn" data-action="cli-edit" data-id="${cl.id}">✎</button>
          <button type="button" class="adm-icon-btn" data-action="cli-delete" data-id="${cl.id}">✕</button>
        </td>
      </tr>
      ${isOpen ? `<tr><td colspan="6" style="padding:0">${detail}</td></tr>` : ''}
    `;
  }))).join('');

  root.innerHTML = `
    <div style="margin-bottom:16px;max-width:320px">
      <input class="adm-field" id="cli-search" placeholder="Buscar cliente…" value="${esc(clientQuery)}" />
    </div>
    ${clientForm}
    <div class="adm-card" style="padding:6px 18px;overflow-x:auto">
      <table class="adm-table">
        <thead><tr><th>Nombre</th><th>Teléfono</th><th>Correo</th><th>Contratos</th><th>Ingresos totales</th><th></th></tr></thead>
        <tbody>${rows || `<tr><td colspan="6" style="text-align:center;color:#7d786f;padding:26px">Sin clientes.</td></tr>`}</tbody>
      </table>
    </div>`;

  document.getElementById('cli-search')?.addEventListener('keydown', (e) => { if ((e as KeyboardEvent).key === 'Enter') { clientQuery = (e.target as HTMLInputElement).value; drawClientes(); } });
  document.getElementById('cli-form')?.addEventListener('submit', onClienteSubmit);
  root.querySelector('[data-action="cli-cancel"]')?.addEventListener('click', () => { clientFormOpen = false; clientEditing = null; drawClientes(); });

  root.querySelectorAll<HTMLButtonElement>('[data-action="cli-edit"]').forEach((b) => b.addEventListener('click', () => {
    clientEditing = items.find((c2) => c2.id === Number(b.dataset.id));
    clientFormOpen = true;
    drawClientes();
  }));
  root.querySelectorAll<HTMLButtonElement>('[data-action="cli-delete"]').forEach((b) => b.addEventListener('click', async () => {
    if (!confirm('¿Eliminar este cliente?')) return;
    try { await api(`/api/finance/clients?id=${b.dataset.id}`, { method: 'DELETE' }); toast('Cliente eliminado.'); drawClientes(); }
    catch (e: any) { toast(e.message, true); }
  }));
  root.querySelectorAll<HTMLButtonElement>('[data-action="cli-expand"]').forEach((b) => b.addEventListener('click', () => {
    const id = Number(b.dataset.id);
    expandedClient = expandedClient === id ? null : id;
    contractFormOpenFor = null;
    drawClientes();
  }));

  bindContractHandlers(items);
}

async function onClienteSubmit(e: Event) {
  e.preventDefault();
  const fd = new FormData(e.target as HTMLFormElement);
  const payload = { name: fd.get('name'), phone: fd.get('phone'), email: fd.get('email'), document_id: fd.get('document_id'), notes: fd.get('notes') };
  try {
    if (clientEditing) await api('/api/finance/clients', { method: 'PUT', body: JSON.stringify({ id: clientEditing.id, ...payload }) });
    else await api('/api/finance/clients', { method: 'POST', body: JSON.stringify(payload) });
    toast('Cliente guardado.');
    clientFormOpen = false; clientEditing = null;
    drawClientes();
  } catch (err: any) { toast(err.message, true); }
}

async function contractsDetailHtml(client: any): Promise<string> {
  let contracts: any[] = [];
  try { ({ items: contracts } = await api(`/api/finance/contracts?client_id=${client.id}`)); } catch { contracts = []; }

  const k = contractEditing;
  const form = contractFormOpenFor === client.id ? `
    <form class="cf-form" data-client="${client.id}" style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;padding:16px 0">
      <label><span class="adm-lbl">Título</span><input class="adm-field" name="title" value="${esc(k?.title || '')}" required maxlength="160" /></label>
      <label><span class="adm-lbl">Tipo</span>
        <select class="adm-select" name="kind">${Object.entries(boot.contractKinds).map(([kk, v]) => `<option value="${kk}" ${k?.kind === kk ? 'selected' : ''}>${esc(v)}</option>`).join('')}</select>
      </label>
      <label><span class="adm-lbl">Inicio</span><input class="adm-field" type="date" name="start_date" value="${k?.start_date || ''}" /></label>
      <label><span class="adm-lbl">Fin</span><input class="adm-field" type="date" name="end_date" value="${k?.end_date || ''}" /></label>
      <label><span class="adm-lbl">Valor acordado</span><input class="adm-field cf-amount" name="total_agreed" value="${k?.total_agreed ? new Intl.NumberFormat('es-CO').format(k.total_agreed) : ''}" placeholder="0" /></label>
      <label><span class="adm-lbl">Estado</span>
        <select class="adm-select" name="status">${Object.entries(boot.contractStatuses).map(([kk, v]) => `<option value="${kk}" ${(k?.status || 'activo') === kk ? 'selected' : ''}>${esc(v)}</option>`).join('')}</select>
      </label>
      <label style="grid-column:span 2"><span class="adm-lbl">Notas</span><input class="adm-field" name="notes" value="${esc(k?.notes || '')}" maxlength="1000" /></label>
      <div style="grid-column:span 4;display:flex;gap:10px;justify-content:flex-end">
        <button type="button" class="adm-btn-ghost" data-action="cf-cancel">Cancelar</button>
        <button type="submit" class="adm-btn-primary">${k ? 'Guardar cambios' : 'Crear contrato'}</button>
      </div>
    </form>` : '';

  const rows = contracts.map((ct) => `
    <tr>
      <td>${esc(ct.title)}</td>
      <td>${esc(boot.contractKinds[ct.kind])}</td>
      <td>${esc(ct.start_date || '—')} → ${esc(ct.end_date || '—')}</td>
      <td>${fmtCOP(ct.total_agreed)}</td>
      <td class="adm-amt-in">${fmtCOP(ct.paid_total)}</td>
      <td>${esc(boot.contractStatuses[ct.status])}</td>
      <td style="text-align:right;white-space:nowrap">
        <button type="button" class="adm-icon-btn ct-edit" data-id="${ct.id}">✎</button>
        <button type="button" class="adm-icon-btn ct-delete" data-id="${ct.id}">✕</button>
      </td>
    </tr>`).join('');

  return `
    <div style="padding:6px 24px 20px;background:rgba(0,0,0,.15)">
      <div style="display:flex;justify-content:space-between;align-items:center;padding:12px 0 4px">
        <span class="adm-lbl" style="margin:0">Contratos de ${esc(client.name)}</span>
        <button type="button" class="adm-btn-ghost ct-new" data-client="${client.id}">+ Nuevo contrato</button>
      </div>
      ${form}
      <table class="adm-table">
        <thead><tr><th>Título</th><th>Tipo</th><th>Fechas</th><th>Acordado</th><th>Pagado</th><th>Estado</th><th></th></tr></thead>
        <tbody>${rows || `<tr><td colspan="7" style="text-align:center;color:#7d786f;padding:18px">Sin contratos.</td></tr>`}</tbody>
      </table>
    </div>`;
}

function bindContractHandlers(clients: any[]) {
  root.querySelectorAll<HTMLButtonElement>('.ct-new').forEach((b) => b.addEventListener('click', () => {
    contractFormOpenFor = Number(b.dataset.client);
    contractEditing = null;
    drawClientes();
  }));
  root.querySelectorAll<HTMLFormElement>('.cf-form').forEach((f) => f.addEventListener('submit', async (e) => {
    e.preventDefault();
    const clientId = Number(f.dataset.client);
    const fd = new FormData(f);
    const payload: any = {
      client_id: clientId,
      title: fd.get('title'),
      kind: fd.get('kind'),
      start_date: fd.get('start_date'),
      end_date: fd.get('end_date'),
      total_agreed: Number(onlyDigits(String(fd.get('total_agreed') || '0'))),
      status: fd.get('status'),
      notes: fd.get('notes'),
    };
    try {
      if (contractEditing) await api('/api/finance/contracts', { method: 'PUT', body: JSON.stringify({ id: contractEditing.id, ...payload }) });
      else await api('/api/finance/contracts', { method: 'POST', body: JSON.stringify(payload) });
      toast('Contrato guardado.');
      contractFormOpenFor = null; contractEditing = null;
      drawClientes();
    } catch (err: any) { toast(err.message, true); }
  }));
  root.querySelectorAll<HTMLButtonElement>('.cf-form [data-action="cf-cancel"]').forEach((b) => b.addEventListener('click', () => {
    contractFormOpenFor = null; contractEditing = null; drawClientes();
  }));
  root.querySelectorAll<HTMLInputElement>('.cf-amount').forEach((inp) => inp.addEventListener('input', () => {
    const digits = onlyDigits(inp.value);
    inp.value = digits ? new Intl.NumberFormat('es-CO').format(Number(digits)) : '';
  }));
  root.querySelectorAll<HTMLButtonElement>('.ct-edit').forEach((b) => b.addEventListener('click', async () => {
    const id = Number(b.dataset.id);
    for (const cl of clients) {
      const { items } = await api(`/api/finance/contracts?client_id=${cl.id}`);
      const found = items.find((c: any) => c.id === id);
      if (found) { contractEditing = found; contractFormOpenFor = cl.id; expandedClient = cl.id; drawClientes(); return; }
    }
  }));
  root.querySelectorAll<HTMLButtonElement>('.ct-delete').forEach((b) => b.addEventListener('click', async () => {
    if (!confirm('¿Eliminar este contrato?')) return;
    try { await api(`/api/finance/contracts?id=${b.dataset.id}`, { method: 'DELETE' }); toast('Contrato eliminado.'); drawClientes(); }
    catch (e: any) { toast(e.message, true); }
  }));
}

render();
