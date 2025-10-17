// middleware.ts
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const PROTECTED_ROUTES = [/^\/ask$/, /^\/api\/(opinion|argument)\//];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Exemple de garde (à activer quand Clerk sera branché)
  if (PROTECTED_ROUTES.some(rx => rx.test(pathname))) {
    // TODO:
    // - vérifier session (Clerk)
    // - si non loggé: soit NextResponse.redirect('/'), soit renvoyer 401 JSON pour API
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/(.*)'],
};
