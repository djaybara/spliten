// middleware.ts — AUTH SOFT (sans Clerk)
// Règles :
// - GET autorisé partout
// - POST bloqué sur /api/questions* et /api/opinion* si pas "connecté"
// - En DEV : on considère "connecté" si cookie demo_auth=1
// - On ignore totalement /_next/*, /public/*, /api/ai/*

import { NextResponse, type NextRequest } from 'next/server';

const IGNORE = [/^\/_next\//, /^\/public\//, /^\/api\/ai\//];
const PROTECTED_POST = [/^\/api\/questions(\/.*)?$/, /^\/api\/opinion(\/.*)?$/];

function isIgnored(pathname: string) {
  return IGNORE.some((re) => re.test(pathname));
}

function isProtectedPost(method: string, pathname: string) {
  if (method !== 'POST') return false;
  return PROTECTED_POST.some((re) => re.test(pathname));
}

function isDevAuthed(req: NextRequest) {
  // Bypass dev via cookie demo_auth=1
  if (process.env.NODE_ENV !== 'development') return false;
  return req.cookies.get('demo_auth')?.value === '1';
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const method = req.method.toUpperCase();

  // 1) Ignorer assets/IA
  if (isIgnored(pathname)) return NextResponse.next();

  // 2) Autoriser tous les GET partout
  if (method === 'GET') return NextResponse.next();

  // 3) Sur POST protégés : exiger "auth" (en dev via cookie)
  if (isProtectedPost(method, pathname)) {
    if (isDevAuthed(req)) return NextResponse.next();
    return new NextResponse(
      JSON.stringify({ ok: false, error: 'Unauthorized (soft auth middleware)' }),
      { status: 401, headers: { 'content-type': 'application/json' } }
    );
  }

  // 4) Tout le reste passe
  return NextResponse.next();
}

export const config = {
  matcher: '/:path*',
};
