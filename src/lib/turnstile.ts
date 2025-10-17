// src/lib/turnstile.ts
export async function verifyTurnstile(token?: string) {
  // Bypass en mode test/dev
  if (process.env.NEXT_PUBLIC_TURNSTILE_MODE === 'test' || process.env.TURNSTILE_DISABLED === '1') {
    return { success: true };
  }

  if (!token) return { success: false, error: 'missing-token' };

  try {
    const secret = process.env.TURNSTILE_SECRET_KEY || '';
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ secret, response: token }),
      cache: 'no-store',
    });
    return await res.json();
  } catch (e) {
    return { success: false, error: 'verify-failed' };
  }
}
