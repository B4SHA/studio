
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import Loading from '@/app/loading';
import { getRedirectResult } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

export default function AuthCallbackPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
        router.push('/dashboard');
        return;
    }

    const handleRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result) {
          // This will trigger the onAuthStateChanged listener in AuthProvider
          // and redirect to dashboard.
          toast({ title: 'Login Successful', description: 'Welcome!' });
          router.push('/dashboard');
        } else if (!loading) {
            // No result and not loading, maybe direct navigation to this page
            router.push('/login');
        }
      } catch (error: any) {
        console.error('Auth callback error:', error);
        toast({ variant: 'destructive', title: 'Login Failed', description: error.message });
        router.push('/login');
      }
    };
    
    handleRedirectResult();

  }, [user, router, loading, toast]);

  return <Loading />;
}
