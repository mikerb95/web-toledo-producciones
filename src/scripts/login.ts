// Maneja el formulario de login del admin: POST /api/login y recarga si ok.
const form = document.getElementById('login-form') as HTMLFormElement | null;
const pass = document.getElementById('login-pass') as HTMLInputElement | null;
const err = document.getElementById('login-err');

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
