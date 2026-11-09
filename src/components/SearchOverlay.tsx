import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { formatPHP } from '@/lib/format';
import { publicImageUrl } from '@/lib/storage';
import { useSite } from '@/site/SiteProvider';
import { CloseIcon, SearchIcon } from './icons';

export default function SearchOverlay({ onClose }: { onClose: () => void }) {
  const { products, imagesBy } = useSite();
  const [q, setQ] = useState('');
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => { input.current?.focus(); }, []);

  const results = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return [];
    return products.filter((p) => p.name.toLowerCase().includes(needle) || p.category.toLowerCase().includes(needle)).slice(0, 12);
  }, [q, products]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-ink px-3 pt-3 sm:px-8" role="dialog" aria-modal="true" aria-label="Search">
      <div className="mx-auto flex w-full max-w-3xl items-center gap-3 border-b border-white py-3">
        <SearchIcon />
        <input ref={input} type="search" aria-label="Search products" placeholder="Search" className="flex-1 bg-transparent py-2 text-lg uppercase tracking-[0.12em] placeholder:text-white/40 focus:outline-none" value={q} onChange={(e) => setQ(e.target.value)} />
        <button type="button" className="p-2" onClick={onClose} aria-label="Close search"><CloseIcon /></button>
      </div>
      <div className="mx-auto w-full max-w-3xl pb-10 pt-6">
        {q.trim() === '' ? null : results.length === 0 ? (
          <p className="py-10 text-center text-sm uppercase tracking-[0.16em] text-white/60">No results for “{q.trim()}”</p>
        ) : (
          <ul>
            {results.map((p) => {
              const img = publicImageUrl(imagesBy.get(p.id)?.[0]?.storage_path);
              return (
                <li key={p.id} className="border-b border-white/15">
                  <Link to={`/product/${p.slug}`} className="flex items-center gap-4 py-4">
                    <span className="h-20 w-16 shrink-0 overflow-hidden bg-white/[0.06]">{img && <img src={img} alt="" className="h-full w-full object-cover" />}</span>
                    <span className="min-w-0 flex-1 text-sm uppercase tracking-[0.12em]">{p.name}</span>
                    <span className="shrink-0 text-sm">{formatPHP(p.price)}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
