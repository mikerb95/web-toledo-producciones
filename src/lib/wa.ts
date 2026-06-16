// Constructores de enlaces de contacto y del mensaje de WhatsApp.
// Portado de la lógica del prototipo (waLink, igLink, sendWa, etc.).
import type { Contact } from '../data/defaults';
import type { Lang } from '../i18n/strings';

export function waLink(whatsapp: string, text: string): string {
  return `https://wa.me/${whatsapp}?text=${encodeURIComponent(text)}`;
}

export function igLink(instagram: string): string {
  return `https://instagram.com/${instagram}`;
}

export function mailLink(email: string): string {
  return `mailto:${email}`;
}

export function telLink(phone: string): string {
  return `tel:${phone}`;
}

// Mensaje genérico de "reservar fecha".
export function reserveText(lang: Lang): string {
  return lang === 'es'
    ? 'Hola Toledo Producciones, quiero reservar mi fecha ✨'
    : 'Hi Toledo Producciones, I want to book my date ✨';
}

// Mensaje de interés en un paquete concreto.
export function packageText(lang: Lang, name: string): string {
  return lang === 'es'
    ? `Hola Toledo Producciones, me interesa el paquete ${name} ✨`
    : `Hi Toledo Producciones, I am interested in the ${name} package ✨`;
}

// Enlaces principales precomputados para una vista dada.
export function contactLinks(contact: Contact, lang: Lang) {
  return {
    wa: waLink(contact.whatsapp, reserveText(lang)),
    ig: igLink(contact.instagram),
    mail: mailLink(contact.email),
    tel: telLink(contact.phone),
  };
}
