import { Link } from 'react-router-dom';
import { safeUrl } from '@/lib/theme';
import { useSite } from '@/site/SiteProvider';

export default function Footer() {
  const { store, lookbooks, videos } = useSite();
  const socials = Object.entries(store.social_links ?? {}).map(([k, v]) => [k, safeUrl(v)] as const).filter((x): x is readonly [string, string] => Boolean(x[1]));
  const col = 'mb-4 text-xs font-medium uppercase tracking-[0.22em] text-white/55';
  const a = 'underline-offset-4 hover:underline';
  return (
    <footer className="mt-28 border-t border-white/15">
      <div className="mx-auto grid max-w-[90rem] gap-10 px-4 py-14 text-sm sm:px-8 md:grid-cols-4">
        <div>
          <p className={col}>Shop</p>
          <ul className="space-y-2">
            <li><Link className={a} to="/shop">All products</Link></li>
            <li><Link className={a} to="/shop?c=new">What’s new</Link></li>
            {lookbooks.length > 0 && <li><Link className={a} to="/lookbook">Lookbook</Link></li>}
            {videos.length > 0 && <li><Link className={a} to="/videos">Videos</Link></li>}
          </ul>
        </div>
        <div>
          <p className={col}>Info</p>
          <ul className="space-y-2">
            <li><Link className={a} to="/shipping">Shipping &amp; payment</Link></li>
            <li><Link className={a} to="/contact">Contact</Link></li>
          </ul>
        </div>
        <div>
          <p className={col}>Contact</p>
          <ul className="space-y-2 text-white/80">
            {store.contact_email && <li><a className={a} href={`mailto:${store.contact_email}`}>{store.contact_email}</a></li>}
            {store.contact_phone && <li><a className={a} href={`tel:${store.contact_phone.replace(/\s+/g, '')}`}>{store.contact_phone}</a></li>}
            {store.contact_address && <li>{store.contact_address}</li>}
            {!store.contact_email && !store.contact_phone && !store.contact_address && <li className="text-white/45">Coming soon</li>}
          </ul>
        </div>
        {socials.length > 0 && (
          <div>
            <p className={col}>Follow</p>
            <ul className="space-y-2">{socials.map(([k, url]) => <li key={k}><a href={url} target="_blank" rel="noopener noreferrer" className={`${a} capitalize`}>{k}</a></li>)}</ul>
          </div>
        )}
      </div>
      <p aria-hidden className="select-none overflow-hidden whitespace-nowrap px-4 text-[clamp(3.5rem,17vw,15rem)] uppercase leading-[0.85] text-white/[0.06] sm:px-8" style={{ fontFamily: 'var(--font-heading)' }}>{store.name}</p>
      <p className="px-4 pb-8 pt-4 text-xs text-white/45 sm:px-8">© {new Date().getFullYear()} {store.name}</p>
    </footer>
  );
}
