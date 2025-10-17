'use client';

import dynamic from 'next/dynamic';

const authOff = process.env.NEXT_PUBLIC_CLERK_DISABLED === '1';

const SignUp = !authOff
  ? dynamic(() => import('@clerk/nextjs').then(m => m.SignUp), { ssr: false })
  : null;

export default function SignUpPage() {
  if (authOff) {
    return (
      <main style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',padding:16}}>
        <div style={{maxWidth:480,textAlign:'center'}}>
          <h1 style={{fontSize:24,marginBottom:8}}>Auth désactivée (DEV)</h1>
          <a href="/ask" style={{textDecoration:'underline'}}>← Retourner sur /ask</a>
        </div>
      </main>
    );
  }

  return (
    <main style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',padding:16}}>
      {/* @ts-expect-error */}
      <SignUp routing="path" signInUrl="/sign-in" afterSignUpUrl="/" />
    </main>
  );
}
