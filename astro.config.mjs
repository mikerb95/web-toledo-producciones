// @ts-check
import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';
import sitemap from '@astrojs/sitemap';
import { DEFAULTS } from './src/data/defaults.ts';

const SITE = 'https://toledoproducciones.org';

// SSR en Vercel: el sitio público y el admin leen el contenido desde la BD
// (Turso/libSQL) en cada request, de modo que las ediciones del panel se
// reflejan para todos los visitantes sin necesidad de un rebuild.
export default defineConfig({
  output: 'server',
  adapter: vercel({
    imageService: true,
  }),
  site: SITE,
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/admin') && !page.includes('/api/'),
      // Las rutas dinámicas SSR no se descubren solas. Los ids de paquete son
      // fijos (el admin edita su contenido, no los crea ni los borra).
      customPages: DEFAULTS.packages.map((p) => `${SITE}/paquetes/${p.id}`),
      // Sin barra final (salvo la raíz), igual que el canonical de cada página.
      serialize: (item) => ({ ...item, url: item.url === `${SITE}/` ? item.url : item.url.replace(/\/$/, '') }),
    }),
  ],
});
