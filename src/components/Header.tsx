import { useEffect, useMemo, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useCart } from '@/lib/cart';
import { safeUrl } from '@/lib/theme';
import { publicImageUrl } from '@/lib/storage';
import { useSite } from '@/site/SiteProvider';
import Marquee from './Marquee';
import SearchOverlay from './SearchOverlay';
import { ArrowIcon, BackIcon, CartIcon, CloseIcon, FacebookIcon, InstagramIcon, MenuIcon, SearchIcon } from './icons';

export default function Header() {
  const { store, settings, products, lookbooks, videos, openCart } = useSite();
  const { count } = useCart();
  const { pathname } = useLocation();
  const [menu, setMenu] = useState<'closed' | 'main' | 'shop'>('closed');
  const [searching, setSearching] = useState(false);
  const logo = publicImageUrl(store.logo_path);
  const collections = useMemo(() => Array.from(new Set(products.map((p) => p.category))).sort(), [products]);
  const fb = safeUrl(store.social_links?.facebook);
  const ig = safeUrl(store.social_links?.instagram);

  useEffect(() => { setMenu('closed'); setSearching(false); }, [pathname]);
  useEffect(() => {
    const lock = menu !== 'closed' || searching;
    document.body.style.overflow = lock ? 'hidden' : '';
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { setMenu('closed'); setSearching(false); } };
    window.addEventListener('keydown', onKey);
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [menu, searching]);

  const cartButton = (
    <button type="button" onClick={() => { setMenu('closed'); openCart(); }} className="relative p-2" aria-label={`Open cart, ${count} item${count === 1 ? '' : 's'}`}>
      <CartIcon />
      {count > 0 && <span className="absolute -right-0.5 top-0 flex h-[18px] min-w-[18px] items-center justify-center bg-accent px-1 text-[11px] font-bold leading-none">{count}</span>}
    </button>
  );
  const brand = logo
    ? <img src={logo} alt={store.name} className="h-9 w-auto max-w-[11rem] object-contain" />
    : <span className="text-xl uppercase tracking-[0.12em] sm:text-2xl" style={{ fontFamily: 'var(--font-heading)' }}>{store.name}</span>;
  const link = ({ isActive }: { isActive: boolean }) => `px-3 py-2 text-xs font-medium uppercase tracking-[0.2em] transition-colors ${isActive ? 'text-bone' : 'text-white/60 hover:text-bone'}`;

  return (
    <>
      <header className="sticky top-0 z-40 bg-ink/90 backdrop-blur">
        {settings?.announcement && <Marquee text={settings.announcement} />}
        <div className="mx-auto max-w-[90rem] border-b border-white/15 px-3 py-3 sm:px-8">
          <div className="grid grid-cols-[1fr_auto_1fr] items-center md:hidden">
            <div><button type="button" className="p-2" onClick={() => setMenu('main')} aria-label="Open menu" aria-expanded={menu !== 'closed'}><MenuIcon /></button></div>
            <Link to="/" className="flex justify-center px-2" aria-label={`${store.name} home`}>{brand}</Link>
            <div className="flex items-center justify-end gap-1">
              <button type="button" className="p-2" onClick={() => setSearching(true)} aria-label="Search"><SearchIcon /></button>
              {cartButton}
            </div>
          </div>
          <div className="hidden items-center justify-between gap-8 md:flex">
            <Link to="/" aria-label={`${store.name} home`}>{brand}</Link>
            <nav aria-label="Main" className="flex items-center">
              <NavLink to="/shop" end className={link}>Shop</NavLink>
              <NavLink to="/shop?c=new" className={link}>New</NavLink>
              {lookbooks.length > 0 && <NavLink to="/lookbook" className={link}>Lookbook</NavLink>}
              {videos.length > 0 && <NavLink to="/videos" className={link}>Videos</NavLink>}
              <NavLink to="/contact" className={link}>Contact</NavLink>
            </nav>
            <div className="flex items-center gap-1">
              <button type="button" className="p-2" onClick={() => setSearching(true)} aria-label="Search"><SearchIcon /></button>
              {cartButton}
            </div>
          </div>
        </div>
      </header>

      {menu !== 'closed' && (
        <div className="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-ink px-3 pb-8 pt-3 sm:px-8" role="dialog" aria-modal="true" aria-label="Menu">
          <div className="flex items-center justify-between">
            <button type="button" className="p-2" onClick={() => setMenu('closed')} aria-label="Close menu"><CloseIcon /></button>
            {cartButton}
          </div>
          <nav aria-label="Menu" className="mr-6 mt-16 sm:mr-auto sm:max-w-xl">
            {menu === 'main' ? (
              <ul>
                <li><button type="button" className="row-link w-full px-3 text-left" onClick={() => setMenu('shop')}>Shop <ArrowIcon /></button></li>
                <li><Link to="/shop?c=new" className="row-link px-3">What’s new?</Link></li>
                {lookbooks.length > 0 && <li><Link to="/lookbook" className="row-link px-3">Lookbook</Link></li>}
                {videos.length > 0 && <li><Link to="/videos" className="row-link px-3">Videos</Link></li>}
                <li><Link to="/shipping" className="row-link px-3">Shipping &amp; payment</Link></li>
                <li><Link to="/contact" className="row-link px-3">Contact</Link></li>
              </ul>
            ) : (
              <>
                <button type="button" className="mb-2 flex items-center gap-3 px-3 py-3 text-sm uppercase tracking-[0.16em] text-white/70" onClick={() => setMenu('main')}><BackIcon /> Back</button>
                <ul>
                  <li><Link to="/shop" className="row-link px-3">All products</Link></li>
                  {collections.map((c) => <li key={c}><Link to={`/shop?c=${encodeURIComponent(c)}`} className="row-link px-3">{c}</Link></li>)}
                </ul>
              </>
            )}
          </nav>
          {(fb || ig) && (
            <div className="mt-auto flex gap-8 px-3 pt-16">
              {fb && <a href={fb} target="_blank" rel="noopener noreferrer" aria-label="Facebook"><FacebookIcon /></a>}
              {ig && <a href={ig} target="_blank" rel="noopener noreferrer" aria-label="Instagram"><InstagramIcon /></a>}
            </div>
          )}
        </div>
      )}
      {searching && <SearchOverlay onClose={() => setSearching(false)} />}
    </>
  );
}
