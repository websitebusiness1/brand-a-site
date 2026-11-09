import { Link } from 'react-router-dom';
import { formatPHP } from '@/lib/format';
import { publicImageUrl } from '@/lib/storage';
import type { Product, ProductImage } from '@/lib/types';

export default function ProductCard({ product, images, soldOut }: { product: Product; images: ProductImage[]; soldOut: boolean }) {
  const main = publicImageUrl(images[0]?.storage_path);
  const second = publicImageUrl(images[1]?.storage_path);
  const onSale = product.compare_at_price != null && product.compare_at_price > product.price;
  return (
    <Link to={`/product/${product.slug}`} className="group block text-center">
      <div className="relative aspect-[4/5] overflow-hidden">
        {main ? (
          <>
            <img src={main} alt={product.name} loading="lazy" className={`h-full w-full object-cover transition-opacity duration-500 ${second ? 'group-hover:opacity-0' : ''} ${soldOut ? 'opacity-70' : ''}`} />
            {second && <img src={second} alt="" aria-hidden loading="lazy" className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100" />}
          </>
        ) : (
          <div className="flex h-full items-center justify-center border border-white/15 px-4 text-sm uppercase tracking-[0.16em] text-white/50">{product.name}</div>
        )}
        {(soldOut || onSale) && <span className="pill absolute left-[10%] top-3 bg-black/50 backdrop-blur-[2px]">{soldOut ? 'Sold out' : 'Sale'}</span>}
      </div>
      <h3 className="mt-5 text-[15px] uppercase tracking-[0.12em]">{product.name}</h3>
      <p className="mt-2 text-[15px] tracking-[0.1em]">
        {formatPHP(product.price)}
        {onSale && <span className="ml-2 text-white/50 line-through">{formatPHP(product.compare_at_price as number)}</span>}
      </p>
    </Link>
  );
}
