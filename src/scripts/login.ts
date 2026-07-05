// Maneja el formulario de login del admin: POST /api/login y recarga si ok.
const form = document.getElementById('login-form') as HTMLFormElement | null;
const pass = document.getElementById('login-pass') as HTMLInputElement | null;
const passToggle = document.getElementById('login-pass-toggle');
const err = document.getElementById('login-err');

const EYE_OPEN = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z"/><circle cx="12" cy="12" r="3"/></svg>';
const EYE_CLOSED = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-7 0-11-7-11-7a20.3 20.3 0 0 1 5.06-5.94M9.9 4.24A10.94 10.94 0 0 1 12 4c7 0 11 7 11 7a20.29 20.29 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><path d="M1 1l22 22"/></svg>';

if (passToggle) passToggle.innerHTML = EYE_OPEN;

passToggle?.addEventListener('click', () => {
  if (!pass) return;
  const show = pass.type === 'password';
  pass.type = show ? 'text' : 'password';
  passToggle.innerHTML = show ? EYE_CLOSED : EYE_OPEN;
  passToggle.setAttribute('aria-label', show ? 'Ocultar contraseña' : 'Mostrar contraseña');
});

form?.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (err) err.hidden = true;
  const res = await fetch('/api/login', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ password: pass?.value || '' }),
  });
  if (res.ok) {
    location.reload();
  } else {
    const data = await res.json().catch(() => ({}));
    if (err) { err.textContent = data.error || 'Contraseña incorrecta.'; err.hidden = false; }
  }
});
