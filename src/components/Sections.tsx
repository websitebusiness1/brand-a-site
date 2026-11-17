import { ReactNode, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { publicMediaUrl } from '@/lib/media';
import { publicImageUrl } from '@/lib/storage';
import type { HomepageSection, Product, Video } from '@/lib/types';
import { useSite } from '@/site/SiteProvider';
import ProductCard from './ProductCard';
import LookbookCard from './LookbookCard';
import { VideoCard, VideoModal } from './VideoCard';
import LogoHero from './LogoHero';
import Marquee from './Marquee';
import Reveal from './Reveal';
import SmartLink from './SmartLink';

const num = (v: unknown, d: number) => (typeof v === 'number' && Number.isFinite(v) ? v : d);
const ids = (v: unknown): string[] => (Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : []);

function Head({ eyebrow, title, href, linkLabel }: { eyebrow: string; title: string; href?: string; linkLabel?: string }) {
  return (
    <Reveal>
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4 border-b border-white/15 pb-5">
        <div>
          <p className="eyebrow mb-3">{eyebrow}</p>
          <h2 className="text-4xl sm:text-6xl">{title}</h2>
        </div>
        {href && <Link to={href} className="nav-font pb-1 text-xs font-medium uppercase tracking-[0.22em] underline underline-offset-8">{linkLabel ?? 'View all'} →</Link>}
      </div>
    </Reveal>
  );
}

const wrap = 'mx-auto max-w-[90rem] px-4 pt-20 sm:px-8 sm:pt-28';

function Banner({ s }: { s: HomepageSection }) {
  const img = publicMediaUrl(s.image_path);
  if (!img) return <div className="mt-20 sm:mt-28"><Marquee tone="accent" text={s.title || s.body || 'New drop'} /></div>;
  return (
    <section aria-label={s.title || 'Campaign'} className={wrap}>
      <Reveal>
        <div className="relative flex min-h-[22rem] items-end overflow-hidden border border-white/15 sm:min-h-[32rem]">
          <img src={img} alt={s.image_alt || ''} className="absolute inset-0 h-full w-full object-cover opacity-70" />
          <div className="relative w-full bg-gradient-to-t from-black/85 via-black/30 to-transparent p-6 sm:p-12">
            {s.title && <h2 className="max-w-3xl text-4xl sm:text-7xl">{s.title}</h2>}
            {s.body && <p className="mt-4 max-w-xl whitespace-pre-line text-white/85">{s.body}</p>}
            {s.button_label && <SmartLink href={s.link_url} className="btn-accent mt-8">{s.button_label}</SmartLink>}
          </div>
        </div>
      </Reveal>
    </section>
  );
}

function Intro({ s }: { s: HomepageSection }) {
  const img = publicMediaUrl(s.image_path);
  return (
    <section aria-label={s.title || 'About'} className={wrap}>
      <div className={`grid items-center gap-10 ${img ? 'md:grid-cols-2' : 'mx-auto max-w-3xl text-center'}`}>
        <Reveal>
          <p className="eyebrow mb-4">The brand</p>
          {s.title && <h2 className="text-4xl sm:text-6xl">{s.title}</h2>}
          {s.body && <p className="mt-6 whitespace-pre-line text-lg leading-8 text-white/75">{s.body}</p>}
          {s.button_label && <SmartLink href={s.link_url} className="btn-line mt-8">{s.button_label}</SmartLink>}
        </Reveal>
        {img && <Reveal delay={120}><img src={img} alt={s.image_alt || ''} loading="lazy" className="aspect-[4/5] w-full object-cover" /></Reveal>}
      </div>
    </section>
  );
}

function Products({ s }: { s: HomepageSection }) {
  const { products, imagesBy, stockOf } = useSite();
  const list = useMemo(() => {
    const mode = String(s.config.mode ?? 'latest');
    const limit = Math.min(24, Math.max(1, num(s.config.limit, 8)));
    let out: Product[];
    if (mode === 'selected') { const by = new Map(products.map((p) => [p.id, p])); out = ids(s.config.product_ids).map((id) => by.get(id)).filter((p): p is Product => Boolean(p)); }
    else if (mode === 'featured') out = products.filter((p) => p.is_featured);
    else if (mode === 'category') out = products.filter((p) => p.category === s.config.category);
    else out = products;
    return out.slice(0, limit);
  }, [products, s.config]);
  if (list.length === 0) return null;
  const more = String(s.config.mode) === 'category' ? `/shop?c=${encodeURIComponent(String(s.config.category))}` : '/shop';
  return (
    <section className={wrap} aria-label={s.title || 'Products'}>
      <Head eyebrow="Shop" title={s.title || 'Products'} href={more} />
      <ul className="grid grid-cols-2 gap-x-3 gap-y-12 sm:gap-x-6 md:grid-cols-4">
        {list.map((p, i) => <li key={p.id}><ProductCard product={p} images={imagesBy.get(p.id) ?? []} soldOut={stockOf(p.id) <= 0} delay={(i % 4) * 90} /></li>)}
      </ul>
    </section>
  );
}

function Collections({ s }: { s: HomepageSection }) {
  const { products, imagesBy } = useSite();
  const cols = useMemo(() => {
    const map = new Map<string, { count: number; cover: string | null }>();
    products.forEach((p) => { const c = map.get(p.category) ?? { count: 0, cover: null }; map.set(p.category, { count: c.count + 1, cover: c.cover ?? imagesBy.get(p.id)?.[0]?.storage_path ?? null }); });
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [products, imagesBy]);
  if (cols.length === 0) return null;
  return (
    <section id="collections" className={`${wrap} scroll-mt-24`} aria-label={s.title || 'Collections'}>
      <Head eyebrow="Browse" title={s.title || 'Collections'} />
      <ul className="grid gap-3 sm:grid-cols-2 sm:gap-5">
        {cols.map(([name, info], i) => (
          <li key={name}>
            <Reveal delay={(i % 2) * 100}>
              <Link to={`/shop?c=${encodeURIComponent(name)}`} className="group relative block aspect-[16/10] overflow-hidden bg-white/[0.05]">
                {info.cover && <img src={publicImageUrl(info.cover) ?? ''} alt="" loading="lazy" className="h-full w-full object-cover opacity-70 transition duration-700 group-hover:scale-105 group-hover:opacity-90" />}
                <span className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/70 to-transparent p-5">
                  <span className="text-4xl sm:text-6xl" style={{ fontFamily: 'var(--font-heading)' }}>{name}</span>
                  <span className="nav-font mt-1 text-xs uppercase tracking-[0.22em] text-white/80">{info.count} piece{info.count === 1 ? '' : 's'} →</span>
                </span>
              </Link>
            </Reveal>
          </li>
        ))}
      </ul>
    </section>
  );
}

const LOOK_LAYOUT = ['md:col-span-7', 'md:col-span-5 md:mt-28', 'md:col-span-6 md:col-start-4'];
function LookbookSection({ s }: { s: HomepageSection }) {
  const { lookbooks, photosBy } = useSite();
  const list = lookbooks.slice(0, Math.min(12, Math.max(1, num(s.config.limit, 3))));
  if (list.length === 0) return null;
  return (
    <section className={wrap} aria-label={s.title || 'Lookbook'}>
      <Head eyebrow="Photoshoots" title={s.title || 'Lookbook'} href="/lookbook" />
      <ul className="grid gap-x-8 gap-y-14 md:grid-cols-12">
        {list.map((l, i) => <li key={l.id} className={LOOK_LAYOUT[i] ?? 'md:col-span-4'}><Reveal delay={(i % 3) * 100}><LookbookCard lookbook={l} photos={photosBy.get(l.id) ?? []} /></Reveal></li>)}
      </ul>
    </section>
  );
}

function VideosSection({ s }: { s: HomepageSection }) {
  const { videos } = useSite();
  const [playing, setPlaying] = useState<Video | null>(null);
  const list = videos.slice(0, Math.min(12, Math.max(1, num(s.config.limit, 3))));
  if (list.length === 0) return null;
  return (
    <section className={wrap} aria-label={s.title || 'Videos'}>
      <Head eyebrow="Watch" title={s.title || 'Videos'} href="/videos" />
      <ul className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((v, i) => <li key={v.id}><Reveal delay={(i % 3) * 100}><VideoCard video={v} onPlay={setPlaying} /></Reveal></li>)}
      </ul>
      {playing && <VideoModal video={playing} onClose={() => setPlaying(null)} />}
    </section>
  );
}

/** Renders homepage sections in the order set in the admin. `heroImageUrl` is used when a hero has no image of its own. */
export default function Sections({ sections, heroImageUrl = null }: { sections: HomepageSection[]; heroImageUrl?: string | null }) {
  const firstHero = sections.find((s) => s.type === 'hero')?.id;
  const out: ReactNode[] = sections.map((s) => {
    switch (s.type) {
      case 'hero': return (
        <LogoHero key={s.id} title={s.title} body={s.body} first={s.id === firstHero}
          imageUrl={publicMediaUrl(s.image_path) ?? heroImageUrl} videoUrl={publicMediaUrl(typeof s.config?.video_path === 'string' ? s.config.video_path : null)}
          buttonLabel={s.button_label} linkUrl={s.link_url ?? '/shop'} />
      );
      case 'banner': return <Banner key={s.id} s={s} />;
      case 'text': return <Intro key={s.id} s={s} />;
      case 'products': return <Products key={s.id} s={s} />;
      case 'collections': return <Collections key={s.id} s={s} />;
      case 'lookbook': return <LookbookSection key={s.id} s={s} />;
      case 'videos': return <VideosSection key={s.id} s={s} />;
      default: return null;
    }
  });
  return <>{out}</>;
}
