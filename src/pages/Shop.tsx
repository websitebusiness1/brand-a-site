import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSite } from '@/site/SiteProvider';
import ProductCard from '@/components/ProductCard';

type Sort = 'new' | 'low' | 'high';

export default function Shop() {
  const { products, imagesBy, stockOf, catalogLoading, catalogError } = useSite();
  const [params, setParams] = useSearchParams();
  const cat = params.get('c') ?? 'all';
  const [sort, setSort] = useState<Sort>('new');
  const [hideSold, setHideSold] = useState(false);

  const categories = useMemo(() => Array.from(new Set(products.map((p) => p.category))).sort(), [products]);
  const isNew = cat === 'new';

  const shown = useMemo(() => {
    const base = isNew ? products.slice(0, 12) : products;
    const list = base.filter((p) => (cat === 'all' || isNew || p.category === cat) && (!hideSold || stockOf(p.id) > 0));
    if (sort === 'low') list.sort((a, b) => a.price - b.price);
    if (sort === 'high') list.sort((a, b) => b.price - a.price);
    return list;
  }, [products, cat, isNew, sort, hideSold, stockOf]);

  const setCat = (c: string) => { const next = new URLSearchParams(params); if (c === 'all') next.delete('c'); else next.set('c', c); setParams(next, { replace: true }); };
  const title = isNew ? 'What’s new?' : cat === 'all' ? 'Shop' : cat;

  return (
    <div className="mx-auto max-w-[90rem] px-4 py-10 sm:px-8 sm:py-14">
      <h1 className="text-2xl uppercase tracking-[0.06em] sm:text-3xl">{title}</h1>

      <div className="mt-6 flex flex-wrap gap-2" role="group" aria-label="Collections">
        {['all', 'new', ...categories].map((c) => (
          <button key={c} type="button" aria-pressed={cat === c}
            className={`rounded-full border px-4 py-2 text-xs uppercase tracking-[0.14em] transition-colors ${cat === c ? 'border-bone bg-bone text-ink' : 'border-white/40 hover:border-bone'}`}
            onClick={() => setCat(c)}>{c === 'all' ? 'All' : c === 'new' ? 'What’s new?' : c}</button>
        ))}
      </div>
      <div className="mb-10 mt-4 flex flex-wrap items-center gap-4">
        <select aria-label="Sort products" className="field w-auto py-2.5" value={sort} onChange={(e) => setSort(e.target.value as Sort)}>
          <option value="new" className="text-black">Newest</option>
          <option value="low" className="text-black">Price: low to high</option>
          <option value="high" className="text-black">Price: high to low</option>
        </select>
        <label className="flex items-center gap-2 text-sm uppercase tracking-[0.12em]">
          <input type="checkbox" className="h-4 w-4" style={{ accentColor: '#fff' }} checked={hideSold} onChange={(e) => setHideSold(e.target.checked)} />
          Hide sold out
        </label>
      </div>

      {catalogLoading ? <p className="py-24 text-center text-sm uppercase tracking-[0.3em] text-white/50">Loading</p>
        : catalogError ? <p className="py-24 text-center text-white/70">We couldn’t load the products right now. Please refresh in a moment.</p>
        : products.length === 0 ? <p className="py-24 text-center text-xl uppercase tracking-[0.2em] text-white/60">Coming soon</p>
        : shown.length === 0 ? (
          <div className="py-24 text-center">
            <p className="text-xl uppercase tracking-[0.2em]">Nothing matches</p>
            <button type="button" className="btn-line mt-6" onClick={() => { setHideSold(false); setCat('all'); }}>Clear filters</button>
          </div>
        ) : (
          <ul className="grid grid-cols-2 gap-x-3 gap-y-12 sm:gap-x-6 md:grid-cols-3 lg:grid-cols-4">
            {shown.map((p) => <li key={p.id}><ProductCard product={p} images={imagesBy.get(p.id) ?? []} soldOut={stockOf(p.id) <= 0} /></li>)}
          </ul>
        )}
    </div>
  );
}
