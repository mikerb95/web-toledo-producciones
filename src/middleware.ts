// Calcula el estado de autenticación del admin (cookie de sesión firmada) y lo
// expone en context.locals.authed para que las páginas/endpoints decidan.
//
// Antes pasa el medidor de cómputo (src/lib/medidor.ts, copiado del
// portafolio de codebymike): mide lo que cada visita gasta de la cuota de
// Vercel y lo reporta al panel. Va primero para medir la petición entera.
// Sin COMPUTO_PROYECTO y COMPUTO_SECRETO no hace nada.
import { defineMiddleware, sequence } from 'astro:middleware';
import { SESSION_COOKIE, verifySession } from './lib/auth';
import { medidorDesdeEnv } from './lib/medidor';

const auth = defineMiddleware((context, next) => {
  const token = context.cookies.get(SESSION_COOKIE)?.value;
  context.locals.authed = verifySession(token);
  return next();
});

export const onRequest = sequence(medidorDesdeEnv().astro(), auth);
