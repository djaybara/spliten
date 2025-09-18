'use client';
import { SignUp } from '@clerk/nextjs';
import { useSearchParams } from 'next/navigation';

export default function SignUpPage() {
  const sp = useSearchParams();
  const back = sp.get('redirect_url') || '/';
  return (
    <main style={{minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:16}}>
      <SignUp routing="path" signInUrl="/sign-in" afterSignUpUrl={back} />
    </main>
  );
}
