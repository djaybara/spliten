// src/lib/clerkSafeServer.ts
// ⚙️ Kill switch côté serveur (RSC, route handlers)
const disabled = process.env.CLERK_DISABLED === '1';

import * as ClerkServer from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// ——— auth() ———
export function auth() {
  if (disabled) {
    return {
      userId: 'dev-user',
      sessionId: 'dev-session',
      getToken: async () => null,
      protect: () => { /* noop en DEV */ },
    };
  }
  return (ClerkServer as any).auth();
}

// ——— clerkMiddleware passthrough (si tu l’utilises côté server utils) ———
export const clerkMiddleware = (ClerkServer as any).clerkMiddleware;
export const createRouteMatcher = (ClerkServer as any).createRouteMatcher;

// ——— Helpers génériques si besoin ———
export function requireAuthOrRedirect(req: Request, url = '/sign-in') {
  if (disabled) return null; // DEV: jamais de redirect
  const { userId } = (ClerkServer as any).auth();
  if (!userId) return NextResponse.redirect(`${url}?redirect_url=${(req as any).url}`);
  return null;
}
