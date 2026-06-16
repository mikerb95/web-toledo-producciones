// @ts-check
import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';

// SSR en Vercel: el sitio público y el admin leen el contenido desde la BD
// (Turso/libSQL) en cada request, de modo que las ediciones del panel se
// reflejan para todos los visitantes sin necesidad de un rebuild.
export default defineConfig({
  output: 'server',
  adapter: vercel(),
  site: 'https://toledoproducciones.com',
});
