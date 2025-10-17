'use client';

import dynamic from 'next/dynamic';

const authOff = process.env.NEXT_PUBLIC_CLERK_DISABLED === '1';

// ⚠️ On charge <SignIn/> UNIQUEMENT quand l’auth est active
const SignIn = !authOff
  ? dynamic(() => import('@clerk/nextjs').then(m => m.SignIn), { ssr: false })
  : null;

export default function SignInPage() {
  if (authOff) {
    // Fallback simple en DEV pour ne PAS appeler Clerk
    return (
      <main style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',padding:16}}>
        <div style={{maxWidth:480,textAlign:'center'}}>
          <h1 style={{fontSize:24,marginBottom:8}}>Auth désactivée (DEV)</h1>
          <p style={{opacity:0.8,marginBottom:16}}>
            Mets <code>NEXT_PUBLIC_CLERK_DISABLED=0</code> et configure tes clés pour activer la vraie page.
          </p>
          <a href="/ask" style={{textDecoration:'underline'}}>← Retourner sur /ask</a>
        </div>
      </main>
    );
  }

  return (
    <main style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',padding:16}}>
      {/* @ts-expect-error: dynamic component is null only when authOff */}
      <SignIn routing="path" signUpUrl="/sign-up" afterSignInUrl="/" />
    </main>
  );
}
