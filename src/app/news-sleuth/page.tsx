
'use client';

import { Icons } from '@/components/icons';
import dynamic from 'next/dynamic';

const NewsSleuth = dynamic(
  () => import('@/components/news-sleuth').then((mod) => mod.NewsSleuth),
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


export default function NewsSleuthPage() {
  return (
    <div className="container py-8 flex-1 flex justify-center">
      <NewsSleuth />
    </div>
  );
}
