
'use client';

import { Icons } from '@/components/icons';
import dynamic from 'next/dynamic';

const VideoIntegrity = dynamic(
  () => import('@/components/video-integrity').then((mod) => mod.VideoIntegrity),
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

export default function VideoIntegrityPage() {
  return (
    <div className="container py-8 flex flex-col items-center justify-center">
      <VideoIntegrity />
    </div>
  );
}
