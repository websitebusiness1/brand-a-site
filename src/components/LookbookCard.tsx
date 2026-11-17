import { Link } from 'react-router-dom';
import { publicMediaUrl } from '@/lib/media';
import type { Lookbook, LookbookPhoto } from '@/lib/types';

export const lookbookMeta = (l: Lookbook) => [l.collection_name, l.shoot_date ? new Date(l.shoot_date + 'T00:00:00').toLocaleDateString('en-PH', { year: 'numeric', month: 'long' }) : null].filter(Boolean).join(' · ');

export default function LookbookCard({ lookbook, photos }: { lookbook: Lookbook; photos: LookbookPhoto[] }) {
  const cover = photos.find((p) => p.is_cover) ?? photos[0];
  const img = publicMediaUrl(cover?.storage_path);
  const meta = lookbookMeta(lookbook);
  return (
    <Link to={`/lookbook/${lookbook.slug}`} className="group block">
      <div className="relative aspect-[4/5] overflow-hidden bg-white/[0.04]">
        {img ? <img src={img} alt={cover?.alt_text || lookbook.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
          : <div className="flex h-full items-center justify-center text-sm uppercase tracking-[0.16em] text-white/40">{lookbook.title}</div>}
      </div>
      <div className="mt-4 flex items-baseline justify-between gap-4">
        <h3 className="text-lg uppercase tracking-[0.1em]">{lookbook.title}</h3>
        <span className="shrink-0 text-xs uppercase tracking-[0.16em] text-white/60">{photos.length} photo{photos.length === 1 ? '' : 's'}</span>
      </div>
      {meta && <p className="mt-1 text-sm text-white/60">{meta}</p>}
    </Link>
  );
}
