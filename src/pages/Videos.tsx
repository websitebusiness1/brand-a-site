import { useState } from 'react';
import type { Video } from '@/lib/types';
import { useSite } from '@/site/SiteProvider';
import { VideoCard, VideoModal } from '@/components/VideoCard';

export default function Videos() {
  const { videos } = useSite();
  const [playing, setPlaying] = useState<Video | null>(null);
  return (
    <div className="mx-auto max-w-[90rem] px-4 py-12 sm:px-8 sm:py-16">
      <h1 className="text-5xl sm:text-7xl">Videos</h1>
      {videos.length === 0 ? (
        <p className="py-24 text-center text-xl uppercase tracking-[0.2em] text-white/60">Coming soon</p>
      ) : (
        <ul className="mt-10 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {videos.map((v) => <li key={v.id}><VideoCard video={v} onPlay={setPlaying} /></li>)}
        </ul>
      )}
      {playing && <VideoModal video={playing} onClose={() => setPlaying(null)} />}
    </div>
  );
}
