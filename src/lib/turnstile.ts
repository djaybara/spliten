// src/lib/turnstile.ts
export async function verifyTurnstile(token?: string) {
  // Bypass en dev si pas de clé (évite de bloquer)
  if (!process.env.TURNSTILE_SECRET_KEY) return true;
  if (!token) return false;

  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body:
      `secret=${encodeURIComponent(process.env.TURNSTILE_SECRET_KEY)}` +
      `&response=${encodeURIComponent(token)}`,
  });
  const data = await res.json();
  return !!data?.success;
}
