// Contenido por defecto de Toledo Producciones.
// Portado de `project/data.js` (TOLEDO_DEFAULTS) del handoff de diseño.
// Sirve como: (a) seed inicial de la base de datos, (b) fallback si la BD
// aún no tiene la fila de contenido, y (c) base para "Restablecer" en el admin.

export interface Contact {
  phone: string;
  whatsapp: string;
  email: string;
  instagram: string;
  cityEs: string;
  cityEn: string;
}

export interface HeroLang {
  kicker: string;
  title: string;
  sub: string;
}

export interface Hero {
  es: HeroLang;
  en: HeroLang;
}

export interface Coverage {
  es: string[];
  en: string[];
}

export interface Package {
  id: string;
  accent: string;
  popular: boolean;
  drone: boolean;
  price: string;
  priceNoteEs: string;
  priceNoteEn: string;
  nameEs: string;
  nameEn: string;
  tagEs: string;
  tagEn: string;
  badgeEs: string;
  badgeEn: string;
  featuresEs: string[];
  featuresEn: string[];
}

export interface SiteContent {
  version: number;
  contact: Contact;
  hero: Hero;
  coverage: Coverage;
  packages: Package[];
}

export const DEFAULTS: SiteContent = {
  version: 1,
  contact: {
    phone: '3214174621',
    whatsapp: '573214174621',
    email: 'Infotoledoproducciones@gmail.com',
    instagram: 'toledoproduccionessj',
    cityEs: 'Bogotá y municipios aledaños',
    cityEn: 'Bogotá and surrounding towns',
  },
  hero: {
    es: {
      kicker: 'Producción de eventos · Bogotá',
      title: 'Hacemos que tu evento brille',
      sub: 'No alquilamos solo luces y sonido. Creamos momentos que tus invitados van a recordar — sonido e iluminación de calidad superior, show láser, luces robóticas y cubrimiento 4K.',
    },
    en: {
      kicker: 'Event production · Bogotá',
      title: 'We make your event shine',
      sub: "We don't just rent lights and sound. We create moments your guests will remember — superior sound and lighting, laser shows, robotic lights and 4K coverage.",
    },
  },
  coverage: {
    es: ['Bogotá', 'Chía', 'Cota', 'Cajicá', 'Zipaquirá', 'La Calera', 'Soacha', 'Mosquera', 'Funza', 'Madrid', 'Sopó', 'Tabio'],
    en: ['Bogotá', 'Chía', 'Cota', 'Cajicá', 'Zipaquirá', 'La Calera', 'Soacha', 'Mosquera', 'Funza', 'Madrid', 'Sopó', 'Tabio'],
  },
  packages: [
    {
      id: 'esencial',
      accent: '#C8A24A',
      popular: false,
      drone: false,
      price: '1.200.000',
      priceNoteEs: 'COP · desde',
      priceNoteEn: 'COP · from',
      nameEs: 'Esencial',
      nameEn: 'Essential',
      tagEs: 'Sonido y DJ para una celebración impecable',
      tagEn: 'Sound & DJ for a flawless celebration',
      badgeEs: 'Ideal para cumpleaños e íntimos',
      badgeEn: 'Great for birthdays & intimate events',
      featuresEs: [
        'DJ profesional (5 horas de música)',
        'Sistema de sonido profesional hasta 120 invitados',
        'Iluminación ambiental LED de color',
        'Micrófono inalámbrico para brindis',
        'Montaje, operador y desmontaje incluidos',
      ],
      featuresEn: [
        'Professional DJ (5 hours of music)',
        'Pro sound system for up to 120 guests',
        'Ambient LED color lighting',
        'Wireless microphone for toasts',
        'Setup, operator and teardown included',
      ],
    },
    {
      id: 'estelar',
      accent: '#E2A82E',
      popular: true,
      drone: false,
      price: '2.800.000',
      priceNoteEs: 'COP · desde',
      priceNoteEn: 'COP · from',
      nameEs: 'Estelar',
      nameEn: 'Stellar',
      tagEs: 'El show completo: luces robóticas, láser y video 4K',
      tagEn: 'The full show: robotic lights, laser & 4K video',
      badgeEs: 'El más elegido para bodas y 15 años',
      badgeEn: 'Most chosen for weddings & quinceañeras',
      featuresEs: [
        'DJ profesional + animación (8 horas)',
        'Sonido de alta potencia hasta 300 invitados',
        'Luces robóticas de alta tecnología',
        'Show láser sincronizado a la música',
        'Máquina de humo y efectos especiales',
        'Cobertura foto y video en calidad 4K',
        'Pantalla LED para mensajes y visuales',
      ],
      featuresEn: [
        'Professional DJ + hosting (8 hours)',
        'High-power sound for up to 300 guests',
        'High-tech robotic lights',
        'Laser show synced to the music',
        'Fog machine and special effects',
        '4K photo and video coverage',
        'LED screen for messages and visuals',
      ],
    },
    {
      id: 'elite',
      accent: '#F4C752',
      popular: false,
      drone: true,
      price: '4.900.000',
      priceNoteEs: 'COP · desde',
      priceNoteEn: 'COP · from',
      nameEs: 'Élite',
      nameEn: 'Elite',
      tagEs: 'Producción cinematográfica con cubrimiento aéreo en dron',
      tagEn: 'Cinematic production with aerial drone coverage',
      badgeEs: 'Experiencia premium de principio a fin',
      badgeEn: 'Premium experience from start to finish',
      featuresEs: [
        'Todo lo del paquete Estelar, ampliado',
        'Show láser de gran formato',
        'Iluminación arquitectónica del lugar',
        'Dos operadores y coordinador de evento',
        'Cobertura cinematográfica 4K multicámara',
        'Cubrimiento aéreo con DRON de un momento clave',
        'Video highlight editado y entregado',
      ],
      featuresEn: [
        'Everything in Stellar, expanded',
        'Large-format laser show',
        'Architectural venue lighting',
        'Two operators and an event coordinator',
        'Cinematic 4K multi-camera coverage',
        'Aerial DRONE coverage of a key moment',
        'Edited highlight video delivered',
      ],
    },
  ],
};
