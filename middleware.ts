// middleware.ts — DEV PASS-THROUGH (désactive toute auth/redirect)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export default function middleware(_req: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next|.*\\..*).*)'],
};
