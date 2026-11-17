import { Link } from 'react-router-dom';
import { formatPHP } from '@/lib/format';
import { publicImageUrl } from '@/lib/storage';
import type { Product, ProductImage } from '@/lib/types';
import Reveal from './Reveal';

export default function ProductCard({ product, images, soldOut, delay = 0 }: { product: Product; images: ProductImage[]; soldOut: boolean; delay?: number }) {
  const main = publicImageUrl(images[0]?.storage_path);
  const second = publicImageUrl(images[1]?.storage_path);
  const onSale = product.compare_at_price != null && product.compare_at_price > product.price;
  return (
    <Reveal delay={delay}>
      <Link to={`/product/${product.slug}`} className="group block">
        <div className="relative aspect-[4/5] overflow-hidden bg-white/[0.05]">
          {main ? (
            <>
              <img src={main} alt={product.name} loading="lazy" className={`h-full w-full object-cover transition-all duration-700 group-hover:scale-105 ${second ? 'group-hover:opacity-0' : ''} ${soldOut ? 'opacity-60' : ''}`} />
              {second && <img src={second} alt="" aria-hidden loading="lazy" className="absolute inset-0 h-full w-full scale-105 object-cover opacity-0 transition-all duration-700 group-hover:scale-100 group-hover:opacity-100" />}
            </>
          ) : (
            <div className="flex h-full items-center justify-center border border-white/15 px-4 text-center text-sm uppercase tracking-[0.16em] text-white/50">{product.name}</div>
          )}
          {(soldOut || onSale) && <span className={`pill absolute left-3 top-3 ${!soldOut ? 'border-transparent bg-accent' : ''}`} style={!soldOut ? { color: 'var(--on-accent)' } : undefined}>{soldOut ? 'Sold out' : 'Sale'}</span>}
        </div>
        <div className="mt-4 flex items-start justify-between gap-3">
          <h3 className="nav-font text-sm font-medium uppercase leading-snug tracking-[0.1em]" style={{ fontFamily: 'var(--font-nav)' }}>{product.name}</h3>
          <p className="nav-font shrink-0 text-sm">
            {formatPHP(product.price)}
            {onSale && <span className="ml-2 text-white/45 line-through">{formatPHP(product.compare_at_price as number)}</span>}
          </p>
        </div>
      </Link>
    </Reveal>
  );
}
