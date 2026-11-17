import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { publicMediaUrl } from '@/lib/media';
import { useSite } from '@/site/SiteProvider';
import LookbookCard, { lookbookMeta } from '@/components/LookbookCard';
import Lightbox from '@/components/Lightbox';

export function LookbookIndex() {
  const { lookbooks, photosBy } = useSite();
  return (
    <div className="mx-auto max-w-[90rem] px-4 py-12 sm:px-8 sm:py-16">
      <h1 className="text-5xl sm:text-7xl">Lookbook</h1>
      {lookbooks.length === 0 ? (
        <p className="py-24 text-center text-xl uppercase tracking-[0.2em] text-white/60">Coming soon</p>
      ) : (
        <ul className="mt-10 grid gap-x-8 gap-y-16 md:grid-cols-2">
          {lookbooks.map((l, i) => (
            <li key={l.id} className={i % 2 === 1 ? 'md:mt-28' : ''}><LookbookCard lookbook={l} photos={photosBy.get(l.id) ?? []} /></li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function LookbookDetail() {
  const { slug } = useParams();
  const { lookbooks, photosBy } = useSite();
  const [open, setOpen] = useState<number | null>(null);
  const idx = lookbooks.findIndex((l) => l.slug === slug);
  const lookbook = idx >= 0 ? lookbooks[idx] : null;
  const photos = useMemo(() => (lookbook ? photosBy.get(lookbook.id) ?? [] : []), [lookbook, photosBy]);

  if (!lookbook) {
    return (
      <div className="mx-auto max-w-xl px-4 py-32 text-center">
        <h1 className="text-3xl uppercase tracking-[0.12em]">Not found</h1>
        <p className="mt-4 text-white/60">This lookbook isn’t available right now.</p>
        <Link to="/lookbook" className="btn-line mt-8">All lookbooks</Link>
      </div>
    );
  }
  const meta = lookbookMeta(lookbook);
  const next = lookbooks[(idx + 1) % lookbooks.length];

  return (
    <div className="mx-auto max-w-[90rem] px-4 py-10 sm:px-8 sm:py-14">
      <Link to="/lookbook" className="eyebrow hover:text-bone">← Lookbook</Link>
      <header className="mb-12 mt-8 max-w-3xl">
        {meta && <p className="eyebrow mb-3">{meta}</p>}
        <h1 className="text-4xl sm:text-6xl">{lookbook.title}</h1>
        {lookbook.description && <p className="mt-6 whitespace-pre-line leading-8 text-white/75">{lookbook.description}</p>}
      </header>

      {photos.length === 0 ? <p className="py-16 text-center text-white/60">Photos coming soon.</p> : (
        <ul className="columns-2 gap-3 sm:gap-5 lg:columns-3">
          {photos.map((p, i) => (
            <li key={p.id} className="mb-3 break-inside-avoid sm:mb-5">
              <button type="button" className="group block w-full overflow-hidden" onClick={() => setOpen(i)} aria-label={`Open photo ${i + 1} of ${photos.length}`}>
                <img src={publicMediaUrl(p.storage_path) ?? ''} alt={p.alt_text || `${lookbook.title}, photo ${i + 1}`} loading={i < 4 ? 'eager' : 'lazy'} className="w-full transition-transform duration-700 group-hover:scale-[1.02]" />
              </button>
              {p.caption && <p className="mt-2 text-xs text-white/60">{p.caption}</p>}
            </li>
          ))}
        </ul>
      )}

      {lookbooks.length > 1 && (
        <div className="mt-20 border-t border-white/20 pt-10 text-center">
          <p className="eyebrow">Next lookbook</p>
          <Link to={`/lookbook/${next.slug}`} className="mt-3 inline-block text-2xl uppercase tracking-[0.1em] underline-offset-8 hover:underline sm:text-4xl">{next.title}</Link>
        </div>
      )}
      {open !== null && <Lightbox photos={photos} index={open} title={lookbook.title} onIndex={setOpen} onClose={() => setOpen(null)} />}
    </div>
  );
}
