// middleware.ts — Clerk v5 (fix)
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// On protège /ask et le POST /api/questions (création).
// La lecture GET /api/questions/[slug] reste publique.
const isProtectedRoute = createRouteMatcher(['/ask(.*)', '/api/questions']);

export default clerkMiddleware((auth, req) => {
  if (isProtectedRoute(req)) {
    const { userId } = auth();
    if (!userId) {
      // Redirige vers la page Clerk /sign-in
      // et renvoie l'utilisateur sur la page d'origine après login
      const signInUrl = new URL('/sign-in', req.url);
      signInUrl.searchParams.set('redirect_url', req.url); // param Clerk supporté
      return NextResponse.redirect(signInUrl);
    }
  }
  return NextResponse.next();
});

// Le middleware ne tourne QUE sur ces chemins
export const config = {
  matcher: ['/ask(.*)', '/api/questions'],
};
