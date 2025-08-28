import { Icons } from '@/components/icons';
import dynamic from 'next/dynamic';

const AudioAuthenticator = dynamic(
  () => import('@/components/audio-authenticator').then((mod) => mod.AudioAuthenticator),
  {
    ssr: false,
    loading: () => (
      <div className="flex flex-col items-center gap-4">
        <Icons.spinner className="h-12 w-12 text-primary" />
        <p className="text-muted-foreground">Loading Tool...</p>
      </div>
    ),
  }
);

export default function AudioAuthenticatorPage() {
  return (
    <div className="container py-8 flex-1 flex items-center justify-center">
      <AudioAuthenticator />
    </div>
  );
}
