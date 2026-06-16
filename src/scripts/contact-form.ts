// Formulario de contacto → arma el mensaje y abre WhatsApp. Portado de sendWa().
import { getLang } from './store';

const form = document.getElementById('contact-form') as HTMLFormElement | null;

form?.addEventListener('submit', (e) => {
  e.preventDefault();
  const whatsapp = form.dataset.whatsapp || '';
  const es = getLang() === 'es';
  const g = (id: string) => (document.getElementById(id) as HTMLInputElement | HTMLTextAreaElement | null)?.value.trim() || '';

  const name = g('c-name');
  const ev = g('c-event');
  const date = g('c-date');
  const msg = g('c-msg');

  let txt = (es ? 'Hola Toledo Producciones ✨' : 'Hi Toledo Producciones ✨') + '\n';
  if (name) txt += (es ? 'Soy ' : 'I am ') + name + '. ';
  if (ev) txt += (es ? 'Evento: ' : 'Event: ') + ev + '. ';
  if (date) txt += (es ? 'Fecha: ' : 'Date: ') + date + '. ';
  if (msg) txt += '\n' + msg;

  window.open(`https://wa.me/${whatsapp}?text=${encodeURIComponent(txt)}`, '_blank');
});
