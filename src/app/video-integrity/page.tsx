
'use client';

import dynamic from 'next/dynamic';
import Loading from '../loading';

const VideoIntegrity = dynamic(
  () => import('@/components/video-integrity').then((mod) => mod.VideoIntegrity),
  {
    ssr: false,
    loading: () => <Loading />,
  }
);

export default function VideoIntegrityPage() {
  return (
    <div className="container py-8 flex flex-col items-center justify-center">
      <VideoIntegrity />
    </div>
  );
}
