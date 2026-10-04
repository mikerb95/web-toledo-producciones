// Fotos de cada paquete, por id. Las usan la tarjeta de la portada y la
// página de detalle (/paquetes/[id]).
import esencial1 from './esencial-1.jpeg';
import esencial2 from './esencial-2.jpeg';
import estelar1 from './estelar-1.jpeg';
import estelar2 from './estelar-2.jpeg';
import elite1 from './elite-1.jpeg';
import elite2 from './elite-2.jpeg';

export const FOTOS_PAQUETE: Record<string, [ImageMetadata, ImageMetadata]> = {
  esencial: [esencial1, esencial2],
  estelar: [estelar1, estelar2],
  elite: [elite1, elite2],
};
