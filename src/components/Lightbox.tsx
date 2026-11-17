import { useEffect, useRef } from 'react';
import { publicMediaUrl } from '@/lib/media';
import type { LookbookPhoto } from '@/lib/types';
import { CloseIcon } from './icons';

export default function Lightbox({ photos, index, title, onIndex, onClose }: { photos: LookbookPhoto[]; index: number; title: string; onIndex: (i: number) => void; onClose: () => void }) {
  const n = photos.length;
  const touch = useRef<number | null>(null);
  const go = (d: number) => onIndex((index + d + n) % n);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); if (e.key === 'ArrowLeft') go(-1); if (e.key === 'ArrowRight') go(1); };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, n]);
  const p = photos[index];
  return (
    <div className="fixed inset-0 z-[70] flex flex-col bg-black" role="dialog" aria-modal="true" aria-label={`${title} photos`}
      onTouchStart={(e) => { touch.current = e.touches[0].clientX; }}
      onTouchEnd={(e) => { if (touch.current == null) return; const dx = e.changedTouches[0].clientX - touch.current; touch.current = null; if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1); }}>
      <div className="flex items-center justify-between px-4 py-3 text-sm">
        <span className="uppercase tracking-[0.16em] text-white/70">{index + 1} / {n}</span>
        <button type="button" className="p-2" onClick={onClose} aria-label="Close"><CloseIcon /></button>
      </div>
      <div className="relative flex min-h-0 flex-1 items-center justify-center px-2" onClick={onClose}>
        <img src={publicMediaUrl(p.storage_path) ?? ''} alt={p.alt_text || `${title}, photo ${index + 1}`} className="max-h-full max-w-full object-contain" onClick={(e) => e.stopPropagation()} />
        {n > 1 && (
          <>
            <button type="button" className="absolute left-2 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center bg-black/60 text-2xl hover:bg-white hover:text-black" onClick={(e) => { e.stopPropagation(); go(-1); }} aria-label="Previous photo">‹</button>
            <button type="button" className="absolute right-2 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center bg-black/60 text-2xl hover:bg-white hover:text-black" onClick={(e) => { e.stopPropagation(); go(1); }} aria-label="Next photo">›</button>
          </>
        )}
      </div>
      <p className="min-h-[3rem] px-4 py-3 text-center text-sm text-white/75">{p.caption || ''}</p>
    </div>
  );
}
