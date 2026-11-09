import { Link } from 'react-router-dom';
import { safeUrl } from '@/lib/theme';
import { useSite } from '@/site/SiteProvider';
import { FacebookIcon, InstagramIcon } from './icons';

export default function Footer() {
  const { store } = useSite();
  const fb = safeUrl(store.social_links?.facebook);
  const ig = safeUrl(store.social_links?.instagram);
  return (
    <footer className="mt-28 pb-10">
      <nav aria-label="Footer" className="mx-auto max-w-xl px-6 sm:px-0">
        <ul>
          <li className="border-b border-white"><Link to="/shipping" className="block py-5 uppercase tracking-[0.14em]">Shipping &amp; payment</Link></li>
          <li className="border-b border-white"><Link to="/contact" className="block py-5 uppercase tracking-[0.14em]">Contact</Link></li>
        </ul>
      </nav>
      {(fb || ig) && (
        <div className="mt-12 flex justify-center gap-8">
          {fb && <a href={fb} target="_blank" rel="noopener noreferrer" aria-label="Facebook"><FacebookIcon /></a>}
          {ig && <a href={ig} target="_blank" rel="noopener noreferrer" aria-label="Instagram"><InstagramIcon /></a>}
        </div>
      )}
      <p className="mt-12 text-center text-sm uppercase tracking-[0.16em] text-white/80">© {new Date().getFullYear()}, {store.name}</p>
    </footer>
  );
}
