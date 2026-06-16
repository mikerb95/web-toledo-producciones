// Panel de administración (cliente). Renderiza las 3 pestañas a partir del
// contenido embebido, registra cambios y persiste vía /api/content.
import type { SiteContent, Package } from '../data/defaults';

interface Bootstrap { content: SiteContent; defaults: SiteContent; }

const boot = JSON.parse(document.getElementById('admin-bootstrap')?.textContent || '{}') as Bootstrap;
let data: SiteContent = structuredClone(boot.content);
const defaults: SiteContent = boot.defaults;

let tab: 'paquetes' | 'hero' | 'contacto' = 'paquetes';
let dirty = false;

const root = document.getElementById('admin-root')!;
const titleEl = document.getElementById('adm-title')!;
const subEl = document.getElementById('adm-sub')!;
const dirtyEl = document.getElementById('adm-dirty')!;
const toastEl = document.getElementById('adm-toast')!;

const ACCENTS = ['#C8A24A', '#E2A82E', '#F4C752', '#D98E3B', '#B8862F', '#EBC25A'];
const TITLES: Record<string, [string, string]> = {
  paquetes: ['Paquetes', 'Edita nombres, precios, características y destacados de los 3 paquetes'],
  hero: ['Portada', 'Texto principal que ven los visitantes al entrar'],
  contacto: ['Contacto y cobertura', 'Datos de contacto, redes y municipios donde prestas servicio'],
};

const esc = (s: string) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function markDirty() { dirty = true; dirtyEl.hidden = false; }

function field(label: string, scope: string, attrs: string, value: string, multiline = false) {
  const common = `class="adm-field" data-scope="${scope}" ${attrs}`;
  const control = multiline
    ? `<textarea ${common} rows="3">${esc(value)}</textarea>`
    : `<input type="text" ${common} value="${esc(value)}" />`;
  return `<label style="display:block"><span class="adm-lbl">${label}</span>${control}</label>`;
}

function renderPaquetes() {
  root.innerHTML = `<div style="display:flex;flex-direction:column;gap:22px">${data.packages.map((p, i) => `
    <div class="adm-card" style="overflow:hidden">
      <div style="display:flex;align-items:center;justify-content:space-between;gap:14px;flex-wrap:wrap;padding:14px 20px;background:linear-gradient(90deg,${p.accent},${p.accent}cc)">
        <div style="display:flex;align-items:center;gap:11px">
          <span style="font-family:var(--font-display);font-weight:700;font-size:13px;color:#1a1206;background:rgba(0,0,0,.18);width:26px;height:26px;border-radius:8px;display:flex;align-items:center;justify-content:center">0${i + 1}</span>
          <span style="font-family:var(--font-display);font-weight:700;font-size:16px;color:#1a1206">${esc(p.nameEs)}</span>
        </div>
        <div style="display:flex;align-items:center;gap:16px">
          <label style="display:flex;align-items:center;gap:7px;font-size:12.5px;font-weight:700;color:#1a1206;cursor:pointer"><input type="checkbox" data-scope="pkg" data-idx="${i}" data-field="popular" ${p.popular ? 'checked' : ''} style="width:15px;height:15px;accent-color:#1a1206" />Destacado</label>
          <label style="display:flex;align-items:center;gap:7px;font-size:12.5px;font-weight:700;color:#1a1206;cursor:pointer"><input type="checkbox" data-scope="pkg" data-idx="${i}" data-field="drone" ${p.drone ? 'checked' : ''} style="width:15px;height:15px;accent-color:#1a1206" />Dron</label>
        </div>
      </div>
      <div style="padding:22px 22px 24px">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px">
          ${field('Nombre (ES)', 'pkg', `data-idx="${i}" data-field="nameEs"`, p.nameEs)}
          ${field('Nombre (EN)', 'pkg', `data-idx="${i}" data-field="nameEn"`, p.nameEn)}
          ${field('Precio', 'pkg', `data-idx="${i}" data-field="price"`, p.price)}
          ${field('Nota de precio (ES)', 'pkg', `data-idx="${i}" data-field="priceNoteEs"`, p.priceNoteEs)}
          ${field('Eslogan (ES)', 'pkg', `data-idx="${i}" data-field="tagEs"`, p.tagEs)}
          ${field('Eslogan (EN)', 'pkg', `data-idx="${i}" data-field="tagEn"`, p.tagEn)}
          ${field('Etiqueta (ES)', 'pkg', `data-idx="${i}" data-field="badgeEs"`, p.badgeEs)}
          ${field('Etiqueta (EN)', 'pkg', `data-idx="${i}" data-field="badgeEn"`, p.badgeEn)}
        </div>
        <div style="margin-bottom:18px">
          <span class="adm-lbl">Color de acento</span>
          <div style="display:flex;gap:9px;flex-wrap:wrap">
            ${ACCENTS.map((c) => `<button type="button" class="adm-swatch" data-action="accent" data-idx="${i}" data-color="${c}" style="background:${c};border:2px solid ${c === p.accent ? '#fff' : 'transparent'};box-shadow:${c === p.accent ? '0 0 0 2px ' + c : 'none'}"></button>`).join('')}
          </div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px">
          ${featCol(i, 'featuresEs', 'Incluye (ES)', '+ Agregar característica', p.featuresEs)}
          ${featCol(i, 'featuresEn', 'Includes (EN)', '+ Add feature', p.featuresEn)}
        </div>
      </div>
    </div>`).join('')}</div>`;
}

function featCol(idx: number, fieldName: string, label: string, addLabel: string, items: string[]) {
  return `<div><span class="adm-lbl">${label}</span><div style="display:flex;flex-direction:column;gap:8px">
    ${items.map((f, fi) => `<div style="display:flex;gap:7px;align-items:center"><input type="text" class="adm-field-sm" data-scope="feat" data-idx="${idx}" data-field="${fieldName}" data-fi="${fi}" value="${esc(f)}" /><button type="button" class="adm-del" data-action="delfeat" data-idx="${idx}" data-field="${fieldName}" data-fi="${fi}">✕</button></div>`).join('')}
    <button type="button" class="adm-add" data-action="addfeat" data-idx="${idx}" data-field="${fieldName}">${addLabel}</button>
  </div></div>`;
}

function renderHero() {
  const block = (lang: 'es' | 'en', heading: string, l: { kicker: string; title: string; sub: string }) => `
    <div class="adm-card" style="padding:24px">
      <div style="font-family:var(--font-display);font-weight:700;font-size:15px;color:#F4C752;margin-bottom:18px">${heading}</div>
      <div style="display:flex;flex-direction:column;gap:16px">
        ${field('Antetítulo', 'hero', `data-lang="${lang}" data-field="kicker"`, l.kicker)}
        ${field('Título principal', 'hero', `data-lang="${lang}" data-field="title"`, l.title)}
        ${field('Descripción', 'hero', `data-lang="${lang}" data-field="sub"`, l.sub, true)}
      </div>
    </div>`;
  root.innerHTML = `<div style="display:flex;flex-direction:column;gap:20px">${block('es', 'Español', data.hero.es)}${block('en', 'English', data.hero.en)}</div>`;
}

function renderContacto() {
  const c = data.contact;
  root.innerHTML = `<div style="display:flex;flex-direction:column;gap:20px">
    <div class="adm-card" style="padding:24px">
      <div style="font-family:var(--font-display);font-weight:700;font-size:15px;color:#F4C752;margin-bottom:18px">Datos de contacto</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
        ${field('Teléfono / celular', 'contact', `data-field="phone"`, c.phone)}
        ${field('WhatsApp (con código país)', 'contact', `data-field="whatsapp"`, c.whatsapp)}
        ${field('Correo electrónico', 'contact', `data-field="email"`, c.email)}
        ${field('Instagram (sin @)', 'contact', `data-field="instagram"`, c.instagram)}
        ${field('Ciudad / cobertura (ES)', 'contact', `data-field="cityEs"`, c.cityEs)}
        ${field('Ciudad / cobertura (EN)', 'contact', `data-field="cityEn"`, c.cityEn)}
      </div>
    </div>
    <div class="adm-card" style="padding:24px">
      <div style="font-family:var(--font-display);font-weight:700;font-size:15px;color:#F4C752;margin-bottom:6px">Cobertura</div>
      <p style="font-size:13px;color:#7d786f;margin:0 0 16px">Un municipio por línea. Aparecen como etiquetas en la sección de cobertura.</p>
      <textarea class="adm-field" data-scope="coverage" rows="7">${esc(data.coverage.es.join('\n'))}</textarea>
    </div>
  </div>`;
}

function render() {
  document.querySelectorAll<HTMLButtonElement>('.adm-nav').forEach((b) => b.setAttribute('aria-current', String(b.dataset.tab === tab)));
  titleEl.textContent = TITLES[tab][0];
  subEl.textContent = TITLES[tab][1];
  if (tab === 'paquetes') renderPaquetes();
  else if (tab === 'hero') renderHero();
  else renderContacto();
}

// ── Eventos ────────────────────────────────────────────────────────
root.addEventListener('input', (e) => {
  const el = e.target as HTMLInputElement | HTMLTextAreaElement;
  const scope = el.dataset.scope;
  if (!scope) return;
  if (scope === 'pkg') {
    const p = data.packages[+el.dataset.idx!] as any;
    p[el.dataset.field!] = (el as HTMLInputElement).type === 'checkbox' ? (el as HTMLInputElement).checked : el.value;
  } else if (scope === 'feat') {
    (data.packages[+el.dataset.idx!] as any)[el.dataset.field!][+el.dataset.fi!] = el.value;
  } else if (scope === 'hero') {
    (data.hero as any)[el.dataset.lang!][el.dataset.field!] = el.value;
  } else if (scope === 'contact') {
    (data.contact as any)[el.dataset.field!] = el.value;
  } else if (scope === 'coverage') {
    const arr = el.value.split('\n').map((s) => s.trim()).filter(Boolean);
    data.coverage = { es: arr, en: arr };
  }
  markDirty();
});

root.addEventListener('change', (e) => {
  const el = e.target as HTMLInputElement;
  if (el.type === 'checkbox' && el.dataset.scope === 'pkg') {
    (data.packages[+el.dataset.idx!] as any)[el.dataset.field!] = el.checked;
    markDirty();
  }
});

root.addEventListener('click', (e) => {
  const btn = (e.target as HTMLElement).closest<HTMLElement>('[data-action]');
  if (!btn) return;
  const action = btn.dataset.action;
  const idx = +btn.dataset.idx!;
  const fieldName = btn.dataset.field as 'featuresEs' | 'featuresEn';
  if (action === 'accent') {
    data.packages[idx].accent = btn.dataset.color!;
    markDirty(); renderPaquetes();
  } else if (action === 'addfeat') {
    data.packages[idx][fieldName].push(fieldName.endsWith('Es') ? 'Nueva característica' : 'New feature');
    markDirty(); renderPaquetes();
  } else if (action === 'delfeat') {
    data.packages[idx][fieldName].splice(+btn.dataset.fi!, 1);
    markDirty(); renderPaquetes();
  }
});

document.querySelectorAll<HTMLButtonElement>('.adm-nav').forEach((b) => {
  b.addEventListener('click', () => { tab = b.dataset.tab as typeof tab; render(); });
});

// ── Topbar / sidebar acciones ──────────────────────────────────────
let toastTimer: ReturnType<typeof setTimeout>;
function toast() { toastEl.hidden = false; clearTimeout(toastTimer); toastTimer = setTimeout(() => (toastEl.hidden = true), 2400); }

document.getElementById('adm-save')!.addEventListener('click', async () => {
  const res = await fetch('/api/content', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ content: data }),
  });
  if (res.ok) {
    const out = await res.json();
    data = structuredClone(out.content);
    dirty = false; dirtyEl.hidden = true; toast();
  } else {
    alert('No se pudo guardar. Revisa tu sesión e inténtalo de nuevo.');
  }
});

document.getElementById('adm-reset')!.addEventListener('click', async () => {
  if (!confirm('¿Restablecer todo el contenido a los valores por defecto? Se perderán tus cambios guardados.')) return;
  const res = await fetch('/api/content', {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ action: 'reset' }),
  });
  if (res.ok) {
    const out = await res.json();
    data = structuredClone(out.content);
    dirty = false; dirtyEl.hidden = true; render(); toast();
  }
});

document.getElementById('adm-export')!.addEventListener('click', () => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const u = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = u; a.download = 'toledo-contenido.json';
  document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(u);
});

document.getElementById('adm-logout')!.addEventListener('click', async () => {
  await fetch('/api/logout', { method: 'POST' });
  location.href = '/admin';
});

void defaults; // (los defaults viven en BD vía acción reset; se conservan por si se requieren en el cliente)
render();
