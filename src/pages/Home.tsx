import { useMemo } from 'react';
import { publicImageUrl } from '@/lib/storage';
import type { HomepageSection } from '@/lib/types';
import { useSite } from '@/site/SiteProvider';
import Sections from '@/components/Sections';

const base = { body: null, image_path: null, image_alt: null, button_label: null, link_url: null, sort_order: 0 };

export default function Home() {
  const { sections, store, settings, products, lookbooks, videos, catalogError } = useSite();

  // Until the brand publishes homepage sections in the admin, show a sensible default built from what exists.
  const fallback = useMemo<HomepageSection[]>(() => {
    const list: HomepageSection[] = [
      { ...base, id: 'd-hero', type: 'hero', title: settings?.hero_heading?.trim() || store.name, body: settings?.hero_subheading?.trim() || null, button_label: 'Shop now', link_url: '/shop', config: {} },
      { ...base, id: 'd-new', type: 'products', title: 'New arrivals', config: { mode: 'latest', limit: 8 } },
      { ...base, id: 'd-col', type: 'collections', title: 'Collections', config: {} },
    ];
    if (lookbooks.length) list.push({ ...base, id: 'd-look', type: 'lookbook', title: 'Lookbook', config: { limit: 3 } });
    if (videos.length) list.push({ ...base, id: 'd-vid', type: 'videos', title: 'Videos', config: { limit: 3 } });
    return list;
  }, [settings, store.name, lookbooks.length, videos.length]);

  const published = sections.length > 0;
  return (
    <div>
      <Sections sections={published ? sections : fallback} heroImageUrl={published ? null : publicImageUrl(store.banner_path)} />
      {catalogError ? (
        <p className="mx-auto max-w-xl px-4 py-24 text-center text-white/70">We couldn’t load the products right now. Please refresh in a moment.</p>
      ) : !published && products.length === 0 ? (
        <section className="px-4 py-24 text-center">
          <p className="text-3xl sm:text-5xl">Coming soon</p>
          <p className="mx-auto mt-4 max-w-md text-sm text-white/60">Nothing is live yet. Check back soon.</p>
        </section>
      ) : null}
    </div>
  );
}
