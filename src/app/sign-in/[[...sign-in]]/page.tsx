'use client';
import { SignIn } from '@clerk/nextjs';
import { useSearchParams } from 'next/navigation';

export default function SignInPage() {
  const sp = useSearchParams();
  const back = sp.get('redirect_url') || '/';
  return (
    <main style={{minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:16}}>
      <SignIn routing="path" signUpUrl="/sign-up" afterSignInUrl={back} />
    </main>
  );
}
