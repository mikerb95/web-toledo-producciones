// Construye el "view model" por idioma a partir del contenido de BD + los
// textos de UI. Se usa para el render inicial (ES) y se embebe completo (ES+EN)
// para que el toggle de idioma del cliente intercambie textos sin recargar.
import type { SiteContent } from '../data/defaults';
import { STRINGS, type Lang, type UIStrings } from '../i18n/strings';
import { waLink, igLink, mailLink, telLink, reserveText, packageText } from './wa';

export interface PackageVM {
  id: string;
  index: number;
  num: string;        // "01"
  accent: string;
  popular: boolean;
  drone: boolean;
  name: string;
  tag: string;
  badge: string;
  price: string;      // "$1.200.000"
  priceNote: string;
  features: string[];
  preview: string[];  // primeras 4
  extra: string;      // "+N más"
  hasExtra: boolean;
  waLink: string;
}

export interface ViewModel {
  lang: Lang;
  t: UIStrings;
  hero: { kicker: string; title: string; sub: string };
  contact: { phone: string; whatsapp: string; email: string; instagram: string };
  coverage: string[];
  coverageCity: string;
  packages: PackageVM[];
  events: { t: string; d: string }[];
  links: { wa: string; ig: string; mail: string; tel: string };
}

export function buildVM(content: SiteContent, lang: Lang): ViewModel {
  const es = lang === 'es';
  const t = STRINGS[lang];
  const c = content.contact;

  const packages: PackageVM[] = content.packages.map((p, i) => {
    const feats = es ? p.featuresEs : p.featuresEn;
    const name = es ? p.nameEs : p.nameEn;
    return {
      id: p.id,
      index: i + 1,
      num: '0' + (i + 1),
      accent: p.accent,
      popular: !!p.popular,
      drone: !!p.drone,
      name,
      tag: es ? p.tagEs : p.tagEn,
      badge: es ? p.badgeEs : p.badgeEn,
      price: '$' + p.price,
      priceNote: es ? p.priceNoteEs : p.priceNoteEn,
      features: feats,
      preview: feats.slice(0, 4),
      extra: feats.length > 4 ? '+' + (feats.length - 4) + (es ? ' más' : ' more') : '',
      hasExtra: feats.length > 4,
      waLink: waLink(c.whatsapp, packageText(lang, name)),
    };
  });

  return {
    lang,
    t,
    hero: es ? content.hero.es : content.hero.en,
    contact: { phone: c.phone, whatsapp: c.whatsapp, email: c.email, instagram: c.instagram },
    coverage: es ? content.coverage.es : content.coverage.en,
    coverageCity: es ? c.cityEs : c.cityEn,
    packages,
    events: t.ev.items.map((it) => ({ t: it.t, d: it.d })),
    links: {
      wa: waLink(c.whatsapp, reserveText(lang)),
      ig: igLink(c.instagram),
      mail: mailLink(c.email),
      tel: telLink(c.phone),
    },
  };
}
