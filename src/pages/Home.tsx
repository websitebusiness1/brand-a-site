import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { publicImageUrl } from '@/lib/storage';
import { useSite } from '@/site/SiteProvider';
import ProductCard from '@/components/ProductCard';

export default function Home() {
  const { store, settings, products, imagesBy, stockOf, catalogLoading, catalogError } = useSite();
  const banner = publicImageUrl(store.banner_path);
  const heading = settings?.hero_heading?.trim() || store.name;
  const sub = settings?.hero_subheading?.trim();

  const collections = useMemo(() => {
    const map = new Map<string, typeof products>();
    products.forEach((p) => map.set(p.category, [...(map.get(p.category) ?? []), p]));
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [products]);

  const grid = (list: typeof products) => (
    <ul className="grid grid-cols-2 gap-x-3 gap-y-12 sm:gap-x-6 md:grid-cols-4">
      {list.map((p) => <li key={p.id}><ProductCard product={p} images={imagesBy.get(p.id) ?? []} soldOut={stockOf(p.id) <= 0} /></li>)}
    </ul>
  );

  return (
    <div>
      <section aria-label="Welcome" className="relative">
        {banner ? (
          <div className="relative aspect-[4/5] w-full overflow-hidden sm:aspect-[16/8]">
            <img src={banner} alt="" className="h-full w-full object-cover" />
            <div className="absolute inset-0 flex flex-col justify-between bg-gradient-to-b from-black/30 via-transparent to-black/50 px-5 pb-8 pt-8 sm:px-10">
              <div className="max-w-[16rem] text-[11px] uppercase leading-relaxed tracking-[0.14em] sm:max-w-sm sm:self-end sm:text-xs">
                <p className="font-medium">{heading}</p>
                {sub && <p className="mt-1 text-white/85">{sub}</p>}
              </div>
              <Link to="/shop" className="self-center text-xs uppercase tracking-[0.2em] underline underline-offset-4">Shop now</Link>
            </div>
          </div>
        ) : (
          <div className="px-6 py-28 text-center sm:py-40">
            <h1 className="text-3xl uppercase tracking-[0.2em] sm:text-5xl">{heading}</h1>
            {sub && <p className="mx-auto mt-5 max-w-md text-sm uppercase leading-7 tracking-[0.14em] text-white/80">{sub}</p>}
            <Link to="/shop" className="mt-10 inline-block text-xs uppercase tracking-[0.2em] underline underline-offset-4">Shop now</Link>
          </div>
        )}
      </section>

      {catalogLoading ? (
        <p className="py-32 text-center text-sm uppercase tracking-[0.3em] text-white/50">Loading</p>
      ) : catalogError ? (
        <p className="mx-auto max-w-xl px-4 py-24 text-center text-white/70">We couldn’t load the products right now. Please refresh in a moment.</p>
      ) : products.length === 0 ? (
        <section className="px-4 py-32 text-center">
          <p className="text-2xl uppercase tracking-[0.2em]">Coming soon</p>
          <p className="mx-auto mt-4 max-w-md text-sm text-white/60">Nothing is live yet. Check back soon.</p>
        </section>
      ) : (
        collections.map(([name, list]) => (
          <section key={name} className="mx-auto max-w-[90rem] px-4 pt-16 sm:px-8" aria-labelledby={`c-${name}`}>
            <h2 id={`c-${name}`} className="mb-8 text-2xl uppercase tracking-[0.06em] sm:text-3xl">{name}</h2>
            {grid(list.slice(0, 4))}
            {list.length > 4 && (
              <div className="mt-10 text-center"><Link to={`/shop?c=${encodeURIComponent(name)}`} className="text-xs uppercase tracking-[0.2em] underline underline-offset-4">View all ({list.length})</Link></div>
            )}
          </section>
        ))
      )}
    </div>
  );
}
