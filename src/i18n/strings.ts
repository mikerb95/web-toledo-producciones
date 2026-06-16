// Textos de interfaz bilingües (ES/EN). Portado de la función L() del
// prototipo (`project/Toledo Producciones.dc.html`).
//
// Estos textos NO son editables desde el admin (en el prototipo viven en
// código): nav, labels del hero, items de Servicios (7), labels de Dron,
// items de Tipos de evento (4), galería, cobertura y formulario de contacto.
// El contenido editable (paquetes, portada, contacto, cobertura) vive en la BD.

export type Lang = 'es' | 'en';

export interface ServiceItem { t: string; d: string; }
export interface EventItem { t: string; d: string; }

export interface UIStrings {
  nav: { servicios: string; paquetes: string; dron: string; galeria: string; contacto: string; reservar: string; admin: string };
  hero: { cta1: string; cta2: string; tag1: string; tag2: string; tag3: string; tag4: string; scroll: string };
  serv: { kicker: string; title: string; sub: string; items: ServiceItem[] };
  pkg: { kicker: string; title: string; sub: string; cta: string; popular: string; includes: string; reserve: string; from: string; back: string; droneTag: string };
  drone: { kicker: string; title: string; sub: string; s1: string; s2: string; s3: string; s4: string; v1: string; v2: string; v3: string; v4: string; hud: string; cta: string };
  ev: { kicker: string; title: string; items: EventItem[] };
  gal: { kicker: string; title: string; sub: string; ph: string };
  cov: { kicker: string; title: string; sub: string };
  contact: { kicker: string; title: string; sub: string; f_name: string; f_event: string; f_date: string; f_msg: string; send: string; or: string; wa: string; ig: string; mail: string; evOpts: string[] };
  footer: { tagline: string; contact: string; zone: string; slogan: string; rights: string };
}

const es: UIStrings = {
  nav: { servicios: 'Servicios', paquetes: 'Paquetes', dron: 'Dron', galeria: 'Galería', contacto: 'Contacto', reservar: 'Reservar fecha', admin: 'Admin' },
  hero: { cta1: 'Ver paquetes', cta2: 'Reservar por WhatsApp', tag1: 'DJ profesional', tag2: 'Show láser y robóticas', tag3: 'Cubrimiento 4K', tag4: 'Cubrimiento en dron', scroll: 'DESLIZA' },
  serv: {
    kicker: 'Lo que hacemos',
    title: 'Todo para que tu evento brille',
    sub: 'Equipos de alta tecnología y personal calificado. Una sola producción, cada detalle cuidado.',
    items: [
      { t: 'DJ Profesional', d: 'Lectura de pista, mezcla en vivo y animación para mantener la energía toda la noche.' },
      { t: 'Sonido de alta calidad', d: 'Sistemas profesionales de potencia limpia, calibrados para cada espacio e invitados.' },
      { t: 'Iluminación para eventos', d: 'Iluminación ambiental y de color que transforma cualquier salón en una experiencia.' },
      { t: 'Show láser', d: 'Haces láser sincronizados a la música para momentos de máximo impacto.' },
      { t: 'Luces robóticas', d: 'Cabezas móviles de alta tecnología programadas al ritmo de tu celebración.' },
      { t: 'Cubrimiento 4K', d: 'Foto y video profesional en calidad 4K para revivir cada instante.' },
      { t: 'Cubrimiento en dron', d: 'Tomas aéreas cinematográficas que cuentan tu evento desde otra perspectiva.' },
    ],
  },
  pkg: { kicker: 'Paquetes', title: 'Elige cómo quieres brillar', sub: 'Tres producciones pensadas para cada tipo de celebración. Toca un paquete para ver todo lo que incluye.', cta: 'Ver detalle', popular: 'Más elegido', includes: 'Incluye', reserve: 'Reservar este paquete', from: 'desde', back: 'Volver a paquetes', droneTag: 'Con cubrimiento en DRON' },
  drone: {
    kicker: 'Diferencial Élite',
    title: 'Tu evento desde el cielo',
    sub: 'Solo en el paquete Élite: una aeronave 4K captura un momento clave de tu celebración con tomas aéreas cinematográficas — la entrada, el brindis, el primer baile o la foto grupal vista como nunca antes.',
    s1: 'Altitud de vuelo', s2: 'Resolución', s3: 'Estabilización', s4: 'Momento capturado',
    v1: '40 m', v2: '4K / 60fps', v3: 'Gimbal 3 ejes', v4: 'A tu elección', hud: 'DRON · EN VIVO', cta: 'Quiero el plan Élite',
  },
  ev: {
    kicker: 'Para cada ocasión',
    title: 'Celebraciones que producimos',
    items: [
      { t: 'Bodas', d: 'Una atmósfera de cuento: luz cálida, primer baile inolvidable y registro 4K.' },
      { t: '15 Años', d: 'El show que tu quinceañera merece — láser, robóticas y energía de fiesta.' },
      { t: 'Cumpleaños', d: 'Desde lo íntimo hasta la gran fiesta, con la música y las luces perfectas.' },
      { t: 'Eventos empresariales', d: 'Producción impecable y profesional para lanzamientos, galas y fin de año.' },
    ],
  },
  gal: { kicker: 'Portafolio', title: 'Momentos que hemos creado', sub: 'Galería de eventos reales — próximamente con fotos y video de nuestras producciones.', ph: 'Foto / video del evento' },
  cov: { kicker: 'Cobertura', title: 'Bogotá y municipios aledaños', sub: 'Llevamos la producción completa a la capital y a los municipios cercanos de Cundinamarca. ¿Tu evento es en otra zona? Escríbenos y lo coordinamos.' },
  contact: {
    kicker: 'Reserva tu fecha', title: 'Hagamos que brille', sub: 'Cuéntanos de tu evento y arma tu producción ideal. Te respondemos rápido por WhatsApp.',
    f_name: 'Nombre', f_event: 'Tipo de evento', f_date: 'Fecha tentativa', f_msg: 'Cuéntanos de tu evento', send: 'Enviar por WhatsApp', or: 'o escríbenos directo', wa: 'WhatsApp', ig: 'Instagram', mail: 'Correo',
    evOpts: ['Boda', '15 Años', 'Cumpleaños', 'Evento empresarial', 'Otro'],
  },
  footer: { tagline: 'Producción de eventos con sonido, iluminación, láser y cubrimiento 4K al precio justo.', contact: 'Contacto', zone: 'Zona de cobertura', slogan: 'Hacemos que tu evento brille', rights: '' },
};

const en: UIStrings = {
  nav: { servicios: 'Services', paquetes: 'Packages', dron: 'Drone', galeria: 'Gallery', contacto: 'Contact', reservar: 'Book a date', admin: 'Admin' },
  hero: { cta1: 'See packages', cta2: 'Book on WhatsApp', tag1: 'Professional DJ', tag2: 'Laser & robotic lights', tag3: '4K coverage', tag4: 'Drone coverage', scroll: 'SCROLL' },
  serv: {
    kicker: 'What we do',
    title: 'Everything to make your event shine',
    sub: 'High-tech equipment and qualified crew. One production, every detail handled.',
    items: [
      { t: 'Professional DJ', d: 'Reading the room, live mixing and hosting to keep the energy all night long.' },
      { t: 'High-quality sound', d: 'Professional clean-power systems, calibrated for every venue and guest count.' },
      { t: 'Event lighting', d: 'Ambient and color lighting that turns any hall into an experience.' },
      { t: 'Laser show', d: 'Laser beams synced to the music for moments of maximum impact.' },
      { t: 'Robotic lights', d: 'High-tech moving heads programmed to the rhythm of your celebration.' },
      { t: '4K coverage', d: 'Professional 4K photo and video to relive every single moment.' },
      { t: 'Drone coverage', d: 'Cinematic aerial shots that tell your event from another perspective.' },
    ],
  },
  pkg: { kicker: 'Packages', title: 'Choose how you want to shine', sub: 'Three productions designed for every kind of celebration. Tap a package to see everything it includes.', cta: 'See detail', popular: 'Most chosen', includes: 'Includes', reserve: 'Book this package', from: 'from', back: 'Back to packages', droneTag: 'With DRONE coverage' },
  drone: {
    kicker: 'Elite differentiator',
    title: 'Your event from the sky',
    sub: 'Only in the Elite package: a 4K aircraft captures a key moment of your celebration with cinematic aerial shots — the entrance, the toast, the first dance or the group photo seen like never before.',
    s1: 'Flight altitude', s2: 'Resolution', s3: 'Stabilization', s4: 'Captured moment',
    v1: '40 m', v2: '4K / 60fps', v3: '3-axis gimbal', v4: 'Your choice', hud: 'DRONE · LIVE', cta: 'I want the Elite plan',
  },
  ev: {
    kicker: 'For every occasion',
    title: 'Celebrations we produce',
    items: [
      { t: 'Weddings', d: 'A fairytale atmosphere: warm light, unforgettable first dance and 4K coverage.' },
      { t: 'Quinceañeras', d: 'The show your quinceañera deserves — laser, robotics and party energy.' },
      { t: 'Birthdays', d: 'From intimate to the big party, with the perfect music and lights.' },
      { t: 'Corporate events', d: 'Flawless, professional production for launches, galas and year-end parties.' },
    ],
  },
  gal: { kicker: 'Portfolio', title: 'Moments we have created', sub: 'Gallery of real events — coming soon with photos and video of our productions.', ph: 'Event photo / video' },
  cov: { kicker: 'Coverage', title: 'Bogotá and surrounding towns', sub: 'We bring the full production to the capital and nearby towns of Cundinamarca. Is your event somewhere else? Write to us and we will arrange it.' },
  contact: {
    kicker: 'Book your date', title: 'Let us make it shine', sub: 'Tell us about your event and build your ideal production. We reply fast on WhatsApp.',
    f_name: 'Name', f_event: 'Event type', f_date: 'Tentative date', f_msg: 'Tell us about your event', send: 'Send on WhatsApp', or: 'or reach us directly', wa: 'WhatsApp', ig: 'Instagram', mail: 'Email',
    evOpts: ['Wedding', 'Quinceañera', 'Birthday', 'Corporate event', 'Other'],
  },
  footer: { tagline: 'Event production with sound, lighting, laser and 4K coverage at a fair price.', contact: 'Contact', zone: 'Coverage area', slogan: 'We make your event shine', rights: '' },
};

export const STRINGS: Record<Lang, UIStrings> = { es, en };
