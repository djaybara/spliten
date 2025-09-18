// middleware.ts (à la racine)
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

// Pages GET protégées (ex: /ask) et API "écriture" protégées
const PROTECTED_GET_ROUTES = [/^\/ask$/];
const PROTECTED_WRITE_ROUTES = [
  { path: /^\/api\/questions$/, methods: ['POST'] },
  { path: /^\/api\/(opinion|argument)\//, methods: ['POST','PUT','PATCH','DELETE'] },
];

// Dev-only : on simule l'auth avec un cookie spliten_auth=1
function isDevAuthed(req: NextRequest) {
  return req.cookies.get('spliten_auth')?.value === '1';
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const method = req.method;

  const isProtectedGet = PROTECTED_GET_ROUTES.some(rx => rx.test(pathname));
  const isProtectedWrite = PROTECTED_WRITE_ROUTES.some(
    rule => rule.path.test(pathname) && rule.methods.includes(method)
  );

  // Si route protégée et pas "auth" (dev), on bloque
  if ((isProtectedGet || isProtectedWrite) && !isDevAuthed(req)) {
    if (pathname.startsWith('/api/')) {
      // API -> 401 JSON
      return NextResponse.json({ error: 'AUTH_REQUIRED' }, { status: 401 });
    }
    // Page -> redirect home avec un flag
    const url = req.nextUrl.clone();
    url.pathname = '/';
    url.searchParams.set('auth', 'required');
    return NextResponse.redirect(url);
  }

  // (placeholder Turnstile/rate-limit à activer plus tard)
  // const token = req.headers.get('x-turnstile-token');
  // if (isProtectedWrite && !token) {
  //   return NextResponse.json({ error: 'TURNSTILE_MISSING' }, { status: 400 });
  // }

  // Sécurité basique
  const res = NextResponse.next();
  res.headers.set('X-Frame-Options', 'SAMEORIGIN');
  res.headers.set('X-Content-Type-Options', 'nosniff');
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  return res;
}

// Exclut les assets Next de la middleware (performances)
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
