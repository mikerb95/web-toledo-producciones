// Página de detalle de paquete (/paquetes/[id]). Arma el enlace de WhatsApp
// con el nombre, la fecha y los adicionales elegidos, y repinta las listas
// (características y adicionales) al cambiar de idioma: su largo puede variar
// entre ES y EN, así que no basta con data-i18n.
import { getStore, getLang } from './store';
import type { Lang } from '../i18n/strings';
import { waLink, packageQuoteText } from '../lib/wa';

const raiz = document.querySelector<HTMLElement>('[data-paquete]');
if (raiz) {
  const indice = Number(raiz.dataset.paquete);
  const nombre = document.getElementById('pkg-c-name') as HTMLInputElement;
  const fecha = document.getElementById('pkg-c-date') as HTMLInputElement;
  const reservar = document.getElementById('pkg-reserve') as HTMLAnchorElement;
  const caracteristicas = document.getElementById('pkg-features')!;
  const extras = document.getElementById('pkg-extras')!;
  const elegidos = new Set<number>();

  // Los elementos del servidor sirven de molde: el marcado vive en un solo lugar.
  const moldeCaracteristica = caracteristicas.firstElementChild?.cloneNode(true) as HTMLElement | undefined;
  const moldeExtra = extras.firstElementChild?.cloneNode(true) as HTMLElement | undefined;

  function actualizarEnlace(lang: Lang = getLang()): void {
    const vm = getStore()[lang];
    const p = vm?.packages[indice];
    if (!p) return;
    const adicionales = [...elegidos]
      .filter((ei) => ei < vm.additionalServices.items.length)
      .map((ei) => vm.additionalServices.items[ei]);
    reservar.href = waLink(vm.contact.whatsapp, packageQuoteText(lang, p.name, nombre.value.trim(), fecha.value.trim(), adicionales));
  }

  function pintar(lang: Lang): void {
    const vm = getStore()[lang];
    const p = vm?.packages[indice];
    if (!p) return;

    if (moldeCaracteristica) {
      caracteristicas.replaceChildren(...p.features.map((f) => {
        const li = moldeCaracteristica.cloneNode(true) as HTMLElement;
        li.querySelector('[data-texto]')!.textContent = f;
        return li;
      }));
    }

    if (moldeExtra) {
      extras.replaceChildren(...vm.additionalServices.items.map((item, ei) => {
        const label = moldeExtra.cloneNode(true) as HTMLElement;
        const input = label.querySelector('input')!;
        input.dataset.extra = String(ei);
        input.checked = elegidos.has(ei);
        label.querySelector('[data-texto]')!.textContent = item;
        return label;
      }));
    }

    nombre.placeholder = vm.t.pkg.f_namePh;
    actualizarEnlace(lang);
  }

  extras.addEventListener('change', (e) => {
    const input = e.target as HTMLInputElement;
    const ei = Number(input.dataset.extra);
    if (input.checked) elegidos.add(ei); else elegidos.delete(ei);
    actualizarEnlace();
  });
  nombre.addEventListener('input', () => actualizarEnlace());
  fecha.addEventListener('input', () => actualizarEnlace());

  // El toggle de idioma llama a este gancho después de aplicar los data-i18n.
  window.__toledoRefreshPage = pintar;
  pintar(getLang());
}
