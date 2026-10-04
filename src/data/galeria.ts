// Fotos de producciones reales. Las 7 primeras salen en la portada; la página
// /galeria las muestra todas. `alta` ocupa dos filas en la rejilla de /galeria.
export interface Foto { src: string; alt: string; alta?: boolean }

export const GALERIA: Foto[] = [
  { src: '/images/galeria/dj-pista.jpeg', alt: 'DJ en cabina con la pista llena bajo luces robóticas amarillas', alta: true },
  { src: '/images/galeria/cumpleanos-1.jpeg', alt: 'Entrada a un salón de cumpleaños con haces de luz cálida' },
  { src: '/images/galeria/equipo-dj.jpeg', alt: 'Cabina de DJ junto al ventanal con controlador, mezclador y luces', alta: true },
  { src: '/images/galeria/cumpleanos-60.jpeg', alt: 'Montaje para un cumpleaños 60 con estructura de luces y sonido' },
  { src: '/images/galeria/luces-laser.jpeg', alt: 'Luces de colores barriendo el salón antes del evento' },
  { src: '/images/galeria/dj-terraza.jpeg', alt: 'Estructura de luces robóticas, sonido y cabina frente al ventanal' },
  { src: '/images/galeria/montaje-terraza.jpeg', alt: 'Montaje de sonido e iluminación en un salón con vista a la terraza' },
  { src: '/images/galeria/pista-llena.jpeg', alt: 'Invitados bailando bajo luces violetas y cabezas móviles', alta: true },
  { src: '/images/galeria/rig-ventanal.jpeg', alt: 'Cabezas móviles sobre la cabina de DJ frente a un ventanal' },
  { src: '/images/galeria/haces-dorados.jpeg', alt: 'Haces de luz dorada entre faroles de papel', alta: true },
  { src: '/images/galeria/salon-cumpleanos.jpeg', alt: 'Salón decorado en dorado con estructura de luces y sonido' },
  { src: '/images/galeria/montaje-salon.jpeg', alt: 'Técnico ajustando el montaje de luces y sonido antes del evento' },
];
