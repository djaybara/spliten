// src/lib/authSoft.ts
import { NextRequest } from 'next/server';

export function softIsAuthed(req: NextRequest) {
  if (process.env.NODE_ENV === 'development') {
    return req.cookies.get('demo_auth')?.value === '1';
  }
  return false; // En prod: false (tu mettras Clerk ensuite)
}
