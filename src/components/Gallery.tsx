import { useRef, useState } from 'react';
import { publicImageUrl } from '@/lib/storage';
import type { ProductImage } from '@/lib/types';

/** Product photos: big image with previous/next, thumbnails, swipe on phones and arrow keys. */
export default function Gallery({ images, name }: { images: ProductImage[]; name: string }) {
  const [i, setI] = useState(0);
  const touch = useRef<number | null>(null);
  const n = images.length;
  if (n === 0) return <div className="flex aspect-[4/5] items-center justify-center border border-white/15 px-6 text-center text-sm uppercase tracking-[0.16em] text-white/50">{name}</div>;
  const go = (d: number) => setI((x) => (x + d + n) % n);
  const url = (k: number) => publicImageUrl(images[k].storage_path) ?? '';

  return (
    <div className="grid gap-3 md:grid-cols-[5rem_1fr]">
      {n > 1 && (
        <ul className="order-2 flex gap-2 overflow-x-auto md:order-1 md:max-h-[44rem] md:flex-col md:overflow-y-auto md:overflow-x-hidden" aria-label="Product photos">
          {images.map((img, k) => (
            <li key={img.id} className="shrink-0">
              <button type="button" onClick={() => setI(k)} aria-label={`Show photo ${k + 1} of ${n}`} aria-current={k === i}
                className={`block h-20 w-16 overflow-hidden border ${k === i ? 'border-white' : 'border-white/20 opacity-60 hover:opacity-100'}`}>
                <img src={url(k)} alt="" loading="lazy" className="h-full w-full object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="order-1 md:order-2">
        <div className="relative aspect-[4/5] overflow-hidden bg-white/[0.04] outline-none" tabIndex={0} role="group" aria-roledescription="carousel" aria-label={`${name} photos`}
          onKeyDown={(e) => { if (e.key === 'ArrowLeft') go(-1); if (e.key === 'ArrowRight') go(1); }}
          onTouchStart={(e) => { touch.current = e.touches[0].clientX; }}
          onTouchEnd={(e) => { if (touch.current == null) return; const dx = e.changedTouches[0].clientX - touch.current; touch.current = null; if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1); }}>
          <img src={url(i)} alt={images[i].alt_text || `${name}, photo ${i + 1}`} className="h-full w-full object-cover" />
          {n > 1 && (
            <>
              <button type="button" onClick={() => go(-1)} aria-label="Previous photo" className="absolute left-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center bg-black/55 text-xl hover:bg-black">‹</button>
              <button type="button" onClick={() => go(1)} aria-label="Next photo" className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center bg-black/55 text-xl hover:bg-black">›</button>
              <span className="absolute bottom-2 right-2 bg-black/60 px-2 py-0.5 text-xs" aria-live="polite">{i + 1} / {n}</span>
            </>
          )}
        </div>
        {n > 1 && <img src={url((i + 1) % n)} alt="" aria-hidden className="hidden" />}
      </div>
    </div>
  );
}
