
'use client';

import { useAuth } from '@/context/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Loading from '../loading';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return <Loading />;
  }

  return (
    <div className="container py-8 flex flex-col items-center">
      <div className="w-full max-w-4xl">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tighter text-foreground mb-4">
          Welcome, {user.displayName || user.email}
        </h1>
        <p className="text-lg text-muted-foreground mb-8">
          This is your personal dashboard. Your content analysis history will be displayed here soon.
        </p>

        <Card>
          <CardHeader>
            <CardTitle>Analysis History</CardTitle>
            <CardDescription>
              A log of all the content you have analyzed will appear here. This feature is coming soon!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center text-center text-muted-foreground p-12 border-2 border-dashed rounded-lg">
                <p>No analysis history yet.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
