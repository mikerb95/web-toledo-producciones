// Páginas por tipo de evento (/bodas, /quince-anos, /cumpleanos,
// /eventos-empresariales). El orden es el de t.ev.items y t.contact.evOpts en
// src/i18n/strings.ts: el índice del array es el índice del evento.
//
// Por ahora el texto vive en código, no en la BD: el admin todavía no lo edita.
import type { Lang } from '../i18n/strings';

export interface Momento { t: string; d: string }

export interface EventoTexto {
  /** <title> y meta description. */
  metaTitle: string;
  metaDesc: string;
  h1: string;
  sub: string;
  momentos: Momento[];
  /** Mensaje precargado de WhatsApp. */
  wa: string;
  /** El evento con artículo, para armar las preguntas frecuentes. */
  conArticulo: string;
}

export interface EventoPagina {
  slug: string;
  /** id del paquete recomendado (ver DEFAULTS.packages). */
  paquete: string;
  /** Índices de t.serv.items que más aplican, en orden de importancia. */
  servicios: number[];
  fotos: string[];
  /** Tinte de luz sobre el video (también lo usa la sección Eventos de la portada). */
  ambiente: string;
  es: EventoTexto;
  en: EventoTexto;
}

export const EVENTOS: EventoPagina[] = [
  {
    slug: 'bodas',
    paquete: 'estelar',
    servicios: [0, 2, 5, 6],
    fotos: ['/images/galeria/montaje-terraza.jpeg', '/images/galeria/dj-terraza.jpeg'],
    ambiente: 'radial-gradient(80% 90% at 50% 0%,rgba(244,199,82,.55),transparent 70%)',
    es: {
      metaTitle: 'DJ, sonido y luces para bodas en Bogotá | Toledo Producciones',
      metaDesc: 'DJ profesional, sonido, iluminación, show láser y cubrimiento 4K para bodas en Bogotá y municipios aledaños. Cotiza tu fecha por WhatsApp.',
      h1: 'DJ, sonido y luces para bodas en Bogotá',
      sub: 'Producimos la fiesta de tu boda de principio a fin: música para cada momento, luz cálida que acompaña la noche y video 4K para revivirlo todo.',
      momentos: [
        { t: 'La entrada', d: 'Música y luz listas para el momento en que entran al salón.' },
        { t: 'El primer baile', d: 'Luz cálida sobre la pista y la canción que eligieron, en el momento justo.' },
        { t: 'Los brindis', d: 'Sonido limpio para que cada palabra se escuche en todo el salón.' },
        { t: 'La fiesta', d: 'Luces robóticas, láser y un DJ que lee la pista para que nadie se siente.' },
      ],
      wa: 'Hola Toledo Producciones, quiero cotizar la producción de mi boda ✨',
      conArticulo: 'una boda',
    },
    en: {
      metaTitle: 'Wedding DJ, sound and lighting in Bogotá | Toledo Producciones',
      metaDesc: 'Professional DJ, sound, lighting, laser show and 4K coverage for weddings in Bogotá and nearby towns. Check your date on WhatsApp.',
      h1: 'DJ, sound and lighting for weddings in Bogotá',
      sub: 'We produce your wedding party from start to finish: music for every moment, warm light all night long and 4K video to relive it all.',
      momentos: [
        { t: 'The entrance', d: 'Music and light ready for the moment you walk into the room.' },
        { t: 'The first dance', d: 'Warm light on the dance floor and the song you chose, right on cue.' },
        { t: 'The toasts', d: 'Clean sound so every word is heard across the room.' },
        { t: 'The party', d: 'Robotic lights, laser and a DJ who reads the floor so nobody sits down.' },
      ],
      wa: 'Hi Toledo Producciones, I want a quote for my wedding ✨',
      conArticulo: 'a wedding',
    },
  },
  {
    slug: 'quince-anos',
    paquete: 'estelar',
    servicios: [3, 4, 0, 6],
    fotos: ['/images/galeria/luces-laser.jpeg', '/images/galeria/dj-pista.jpeg'],
    ambiente: 'radial-gradient(70% 90% at 30% 0%,rgba(226,120,210,.6),transparent 70%),radial-gradient(60% 80% at 80% 10%,rgba(244,199,82,.3),transparent 70%)',
    es: {
      metaTitle: 'Show de luces y DJ para 15 años en Bogotá | Toledo Producciones',
      metaDesc: 'Show láser, luces robóticas, DJ y humo para fiestas de 15 años en Bogotá y municipios aledaños. Cotiza la fiesta por WhatsApp.',
      h1: 'Show de luces y DJ para fiestas de 15 años en Bogotá',
      sub: 'La noche de la quinceañera merece un show: láser, luces robóticas y un DJ que mantiene la pista llena hasta el final.',
      momentos: [
        { t: 'La entrada', d: 'Humo, luces y su canción para una entrada de película.' },
        { t: 'El vals', d: 'Luz suave y la música lista para el baile con la familia.' },
        { t: 'La hora loca', d: 'Láser y robóticas al ritmo de la música en el pico de la fiesta.' },
        { t: 'La foto desde el cielo', d: 'Como adicional, el dron captura la foto grupal desde el aire.' },
      ],
      wa: 'Hola Toledo Producciones, quiero cotizar una fiesta de 15 años ✨',
      conArticulo: 'una fiesta de 15 años',
    },
    en: {
      metaTitle: 'Quinceañera light show and DJ in Bogotá | Toledo Producciones',
      metaDesc: 'Laser show, robotic lights, DJ and fog for quinceañeras in Bogotá and nearby towns. Get a quote on WhatsApp.',
      h1: 'Light show and DJ for quinceañeras in Bogotá',
      sub: 'Her night deserves a show: laser, robotic lights and a DJ who keeps the dance floor full until the very end.',
      momentos: [
        { t: 'The entrance', d: 'Fog, lights and her song for a movie-style entrance.' },
        { t: 'The waltz', d: 'Soft light and the music ready for the family dance.' },
        { t: 'Crazy hour', d: 'Laser and robotic lights on the beat at the peak of the party.' },
        { t: 'The shot from above', d: 'As an add-on, the drone captures the group photo from the air.' },
      ],
      wa: 'Hi Toledo Producciones, I want a quote for a quinceañera ✨',
      conArticulo: 'a quinceañera',
    },
  },
  {
    slug: 'cumpleanos',
    paquete: 'esencial',
    servicios: [0, 1, 2, 5],
    fotos: ['/images/galeria/cumpleanos-1.jpeg', '/images/galeria/cumpleanos-60.jpeg'],
    ambiente: 'radial-gradient(50% 80% at 15% 0%,rgba(244,199,82,.5),transparent 70%),radial-gradient(50% 80% at 50% 0%,rgba(226,120,210,.45),transparent 70%),radial-gradient(50% 80% at 85% 0%,rgba(120,180,255,.5),transparent 70%)',
    es: {
      metaTitle: 'DJ y luces para cumpleaños en Bogotá | Toledo Producciones',
      metaDesc: 'DJ, sonido profesional e iluminación LED para cumpleaños en Bogotá y municipios aledaños, con montaje incluido. Cotiza por WhatsApp.',
      h1: 'DJ, sonido y luces para cumpleaños en Bogotá',
      sub: 'Desde una reunión íntima hasta la gran fiesta: llevamos la música, el sonido y las luces que tu celebración necesita.',
      momentos: [
        { t: 'Música a tu medida', d: 'El DJ arma la música según tus invitados y el ambiente que quieres.' },
        { t: 'Ambiente de color', d: 'Iluminación LED que transforma la casa, la terraza o el salón.' },
        { t: 'Unas palabras', d: 'Micrófono inalámbrico para el brindis por el cumpleañero.' },
        { t: 'Cero preocupaciones', d: 'Montamos, operamos y desmontamos. Tú solo celebras.' },
      ],
      wa: 'Hola Toledo Producciones, quiero cotizar un cumpleaños ✨',
      conArticulo: 'un cumpleaños',
    },
    en: {
      metaTitle: 'Birthday party DJ and lights in Bogotá | Toledo Producciones',
      metaDesc: 'DJ, professional sound and LED lighting for birthday parties in Bogotá and nearby towns, setup included. Get a quote on WhatsApp.',
      h1: 'DJ, sound and lighting for birthday parties in Bogotá',
      sub: 'From an intimate get-together to the big party: we bring the music, sound and lights your celebration needs.',
      momentos: [
        { t: 'Music your way', d: 'The DJ builds the set around your guests and the vibe you want.' },
        { t: 'A splash of color', d: 'LED lighting that transforms your home, terrace or venue.' },
        { t: 'A few words', d: 'Wireless microphone for the birthday toast.' },
        { t: 'Zero worries', d: 'We set up, run and tear down. You just celebrate.' },
      ],
      wa: 'Hi Toledo Producciones, I want a quote for a birthday party ✨',
      conArticulo: 'a birthday party',
    },
  },
  {
    slug: 'eventos-empresariales',
    paquete: 'elite',
    servicios: [1, 5, 2, 0],
    fotos: ['/images/galeria/equipo-dj.jpeg', '/images/galeria/montaje-terraza.jpeg'],
    ambiente: 'radial-gradient(80% 90% at 50% 0%,rgba(120,180,255,.5),transparent 70%)',
    es: {
      metaTitle: 'Producción de eventos empresariales en Bogotá | Toledo Producciones',
      metaDesc: 'Sonido, iluminación, pantalla y video 4K para lanzamientos, galas y fiestas de fin de año en Bogotá. Cotiza tu evento por WhatsApp.',
      h1: 'Producción de eventos empresariales en Bogotá',
      sub: 'Sonido, iluminación y video para lanzamientos, galas y fiestas de fin de año, con un equipo que se encarga del montaje y la operación.',
      momentos: [
        { t: 'Discursos y presentaciones', d: 'Sonido claro para que cada palabra llegue a todo el salón.' },
        { t: 'Pantalla para tu marca', d: 'Mensajes y visuales en pantalla durante el evento.' },
        { t: 'Registro en 4K', d: 'Video del evento para comunicaciones internas y redes.' },
        { t: 'La fiesta de cierre', d: 'DJ, robóticas y láser para cerrar la noche con energía.' },
      ],
      wa: 'Hola Toledo Producciones, quiero cotizar un evento empresarial ✨',
      conArticulo: 'un evento empresarial',
    },
    en: {
      metaTitle: 'Corporate event production in Bogotá | Toledo Producciones',
      metaDesc: 'Sound, lighting, screens and 4K video for launches, galas and year-end parties in Bogotá. Get a quote on WhatsApp.',
      h1: 'Corporate event production in Bogotá',
      sub: 'Sound, lighting and video for launches, galas and year-end parties, with a crew that handles setup and operation.',
      momentos: [
        { t: 'Speeches and presentations', d: 'Clear sound so every word reaches the whole room.' },
        { t: 'A screen for your brand', d: 'Messages and visuals on screen throughout the event.' },
        { t: '4K coverage', d: 'Event video for internal communications and social media.' },
        { t: 'The closing party', d: 'DJ, robotic lights and laser to end the night with energy.' },
      ],
      wa: 'Hi Toledo Producciones, I want a quote for a corporate event ✨',
      conArticulo: 'a corporate event',
    },
  },
];

export interface Pregunta { q: string; a: string }

/** Preguntas frecuentes de una página de evento, armadas con los datos reales. */
export function preguntas(
  lang: Lang,
  evento: EventoTexto,
  paquete: { name: string; price: string; features: string[] },
  desde: string,
  ciudades: string[],
): Pregunta[] {
  const lista = (xs: string[], y: string) => (xs.length > 1 ? `${xs.slice(0, -1).join(', ')} ${y} ${xs[xs.length - 1]}` : xs.join(''));
  if (lang === 'es') {
    return [
      {
        q: `¿Cuánto cuesta la producción de ${evento.conArticulo}?`,
        a: `Nuestros paquetes van desde ${desde} COP. Para ${evento.conArticulo} recomendamos el paquete ${paquete.name}, desde ${paquete.price} COP. El valor final depende de los adicionales y del lugar.`,
      },
      { q: `¿Qué incluye el paquete ${paquete.name}?`, a: `${lista(paquete.features, 'y')}.` },
      { q: '¿Llegan a mi municipio?', a: `Trabajamos en ${lista(ciudades, 'y')}. Si tu evento es en otra zona, escríbenos y lo revisamos.` },
      { q: '¿Cómo reservo la fecha?', a: 'Escríbenos por WhatsApp con la fecha, el lugar y el número de invitados, y te respondemos con la disponibilidad y la cotización.' },
    ];
  }
  return [
    {
      q: `How much does it cost to produce ${evento.conArticulo}?`,
      a: `Our packages start at ${desde} COP. For ${evento.conArticulo} we recommend the ${paquete.name} package, from ${paquete.price} COP. The final price depends on add-ons and the venue.`,
    },
    { q: `What does the ${paquete.name} package include?`, a: `${lista(paquete.features, 'and')}.` },
    { q: 'Do you cover my town?', a: `We work in ${lista(ciudades, 'and')}. If your event is somewhere else, message us and we will check.` },
    { q: 'How do I book my date?', a: 'Message us on WhatsApp with the date, venue and number of guests, and we will reply with availability and a quote.' },
  ];
}
