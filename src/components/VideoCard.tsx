import { useEffect, useState } from 'react';
import { publicMediaUrl } from '@/lib/media';
import { parseVideoUrl } from '@/lib/video';
import type { Video } from '@/lib/types';
import { CloseIcon } from './icons';

export function VideoCard({ video, onPlay }: { video: Video; onPlay: (v: Video) => void }) {
  const parsed = video.source_type === 'url' && video.video_url ? parseVideoUrl(video.video_url) : null;
  const thumb = video.thumbnail_path ? publicMediaUrl(video.thumbnail_path) : parsed?.kind === 'youtube' ? parsed.thumbUrl : null;
  const file = video.source_type === 'upload' ? publicMediaUrl(video.video_path) : parsed?.kind === 'file' ? parsed.fileUrl : null;
  return (
    <button type="button" onClick={() => onPlay(video)} className="group block w-full text-left" aria-label={`Play ${video.title}`}>
      <span className="relative block aspect-video overflow-hidden bg-white/[0.06]">
        {thumb ? <img src={thumb} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
          : file ? <video src={`${file}#t=0.1`} preload="metadata" muted playsInline className="h-full w-full object-cover" />
          : <span className="flex h-full items-center justify-center text-sm uppercase tracking-[0.16em] text-white/40">{video.title}</span>}
        <span className="absolute inset-0 flex items-center justify-center bg-black/20 transition-colors group-hover:bg-black/35">
          <span className="flex h-14 w-14 items-center justify-center rounded-full border border-white bg-black/50 pl-1 text-xl" aria-hidden>▶</span>
        </span>
      </span>
      <span className="mt-3 block text-[15px] uppercase tracking-[0.1em]">{video.title}</span>
      {video.description && <span className="mt-1 line-clamp-2 block text-sm text-white/60">{video.description}</span>}
    </button>
  );
}

export function VideoModal({ video, onClose }: { video: Video; onClose: () => void }) {
  const parsed = video.source_type === 'url' && video.video_url ? parseVideoUrl(video.video_url) : null;
  const file = video.source_type === 'upload' ? publicMediaUrl(video.video_path) : parsed?.kind === 'file' ? parsed.fileUrl : null;
  const [ready] = useState(true);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-[70] flex flex-col bg-black/95 p-3 sm:p-8" role="dialog" aria-modal="true" aria-label={video.title} onClick={onClose}>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm uppercase tracking-[0.16em]">{video.title}</h2>
        <button type="button" className="p-2" onClick={onClose} aria-label="Close video"><CloseIcon /></button>
      </div>
      <div className="mx-auto flex w-full max-w-5xl flex-1 items-center" onClick={(e) => e.stopPropagation()}>
        <div className="aspect-video w-full bg-black">
          {ready && file ? <video src={file} controls autoPlay playsInline className="h-full w-full" />
            : parsed && parsed.kind !== 'file' ? <iframe title={video.title} src={`${parsed.embedUrl}${parsed.kind === 'youtube' ? '?autoplay=1&rel=0' : '?autoplay=1'}`} className="h-full w-full border-0" allow="autoplay; fullscreen; picture-in-picture" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" />
            : <p className="p-6 text-white/60">This video can’t be played.</p>}
        </div>
      </div>
      {video.description && <p className="mx-auto mt-3 max-w-5xl text-sm text-white/70" onClick={(e) => e.stopPropagation()}>{video.description}</p>}
    </div>
  );
}
