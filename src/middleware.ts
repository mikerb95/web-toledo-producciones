// Calcula el estado de autenticación del admin (cookie de sesión firmada) y lo
// expone en context.locals.authed para que las páginas/endpoints decidan.
import { defineMiddleware } from 'astro:middleware';
import { SESSION_COOKIE, verifySession } from './lib/auth';

export const onRequest = defineMiddleware((context, next) => {
  const token = context.cookies.get(SESSION_COOKIE)?.value;
  context.locals.authed = verifySession(token);
  return next();
});
