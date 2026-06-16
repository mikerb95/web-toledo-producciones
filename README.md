# Toledo Producciones

Sitio web de Toledo Producciones — productora de eventos en Bogotá (DJ, sonido,
iluminación, show láser, luces robóticas, cubrimiento 4K y cubrimiento en dron).

Implementado a partir del diseño de Claude Design. Landing one-page bilingüe
(ES/EN) + panel de administración para editar contenido.

## Stack

- **Astro** (SSR, `output: 'server'`) + adaptador **@astrojs/vercel**.
- **Turso / libSQL** (`@libsql/client`) para el contenido editable.
- Interactividad en **JavaScript vanilla** (sin frameworks de UI).
- Auth del admin por **contraseña única** (env var) + cookie de sesión firmada (HMAC).

## Estructura

```
src/
  data/defaults.ts     Contenido por defecto + tipos (seed y fallback)
  i18n/strings.ts      Textos de UI bilingües (no editables)
  lib/                 db, content (CRUD), auth, wa, viewmodel
  components/          Secciones del sitio (.astro)
  scripts/             Islands JS: lang-toggle, package-modal, contact-form, reveal, login, admin
  pages/
    index.astro        Sitio público (SSR desde BD)
    admin/index.astro  Panel admin (login + 3 pestañas)
    api/               login, logout, content
  middleware.ts        Calcula locals.authed desde la cookie
scripts/db-setup.ts    Crea el esquema y siembra el contenido por defecto
```

El contenido editable (paquetes, portada, contacto, cobertura) se guarda como un
único documento JSON en la tabla `site_content` (fila id=1). El sitio público lo
lee en cada request (SSR), por lo que las ediciones del admin se reflejan para
todos los visitantes sin rebuild.

## Desarrollo local

1. Copia las variables de entorno:

   ```bash
   cp .env.example .env
   ```

   Para local basta con `TURSO_DATABASE_URL="file:./local.db"` (SQLite en archivo).
   Define `ADMIN_PASSWORD` y un `SESSION_SECRET` largo.

2. Instala dependencias y siembra la base:

   ```bash
   npm install
   npm run db:setup
   ```

3. Levanta el servidor:

   ```bash
   npm run dev
   ```

   - Sitio: http://localhost:4321/
   - Admin: http://localhost:4321/admin (entra con `ADMIN_PASSWORD`)

> El seed es opcional: si la tabla no existe, el sitio usa los valores por
> defecto y la tabla se crea en el primer guardado del admin.

## Despliegue en Vercel

1. Crea una base de datos en [Turso](https://turso.tech) y obtén su URL y token.
2. En el proyecto de Vercel define las variables de entorno:
   - `TURSO_DATABASE_URL` = `libsql://tu-base.turso.io`
   - `TURSO_AUTH_TOKEN` = token de Turso
   - `ADMIN_PASSWORD` = contraseña del panel
   - `SESSION_SECRET` = cadena larga y aleatoria
3. Siembra la base remota una vez (localmente, apuntando las env vars a Turso):

   ```bash
   npm run db:setup
   ```

4. Despliega (`vercel` o conectando el repo). El adaptador `@astrojs/vercel`
   produce las funciones SSR automáticamente.

## Imágenes

Las secciones de Dron, Eventos y Galería usan placeholders estilizados. Para
fotos reales, coloca los archivos en `src/assets/` y referencia con el
componente `<Image>` de Astro (ya usado en `src/components/Dron.astro`).
