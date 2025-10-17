// src/lib/clerkSafe.tsx
'use client';

// ⚙️ Kill switch côté client
const disabled = process.env.NEXT_PUBLIC_CLERK_DISABLED === '1';

// On importe quand même Clerk pour la PROD.
// En DEV (disabled), on expose des shims inoffensifs.
import * as Clerk from '@clerk/nextjs';
import React from 'react';

// ——— Composants ———
export const SignedIn: React.FC<React.PropsWithChildren> = disabled
  ? ({ children }) => <>{children}</>
  : (Clerk as any).SignedIn;

export const SignedOut: React.FC<React.PropsWithChildren> = disabled
  ? () => null
  : (Clerk as any).SignedOut;

export const UserButton = disabled
  ? (props: any) => null
  : (Clerk as any).UserButton;

export const SignInButton = disabled
  ? (props: any) => <button {...props} onClick={() => alert('Auth off (DEV)')} />
  : (Clerk as any).SignInButton;

export const SignUpButton = disabled
  ? (props: any) => <button {...props} onClick={() => alert('Auth off (DEV)')} />
  : (Clerk as any).SignUpButton;

// ——— Hooks ———
export const useUser = disabled
  ? () => ({ isSignedIn: true, user: { id: 'dev-user', username: 'dev' } })
  : (Clerk as any).useUser;

export const useSession = disabled
  ? () => ({ isSignedIn: true, session: { id: 'dev-session' } })
  : (Clerk as any).useSession;

// ——— API util ———
export const redirectToSignIn = disabled
  ? (_opts?: any) => {}
  : (Clerk as any).redirectToSignIn;

export const ClerkProvider = disabled
  ? ({ children }: { children: React.ReactNode }) => <>{children}</>
  : (Clerk as any).ClerkProvider;
