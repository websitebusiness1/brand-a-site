import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { formatPHP } from '@/lib/format';
import { publicImageUrl } from '@/lib/storage';
import { useCart, CartItem } from '@/lib/cart';
import { useSite, STORE_SLUG } from '@/site/SiteProvider';

const SIZE_ORDER = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
const rank = (s: string) => { const i = SIZE_ORDER.indexOf(s.toUpperCase()); return i === -1 ? 99 : i; };
const unique = (l: (string | null)[]) => Array.from(new Set(l.filter((x): x is string => Boolean(x))));

export default function ProductPage() {
  const { slug } = useParams();
  const { products, imagesBy, variantsBy, catalogLoading, openCart } = useSite();
  const cart = useCart();
  const product = products.find((p) => p.slug === slug);
  const images = product ? imagesBy.get(product.id) ?? [] : [];
  const variants = useMemo(() => (product ? variantsBy.get(product.id) ?? [] : []), [product, variantsBy]);

  const [size, setSize] = useState<string | null>(null);
  const [color, setColor] = useState<string | null>(null);
  const [qty, setQty] = useState(1);

  const sizes = useMemo(() => unique(variants.map((v) => v.size)).sort((a, b) => rank(a) - rank(b) || a.localeCompare(b)), [variants]);
  const colors = useMemo(() => unique(variants.map((v) => v.color)), [variants]);

  useEffect(() => {
    setSize(sizes.length === 1 ? sizes[0] : null);
    setColor(colors.length === 1 ? colors[0] : null);
    setQty(1);
    window.scrollTo(0, 0);
  }, [product?.id, sizes, colors]);

  const selected = variants.find((v) => (sizes.length ? v.size === size : !v.size) && (colors.length ? v.color === color : !v.color));
  const totalStock = variants.reduce((n, v) => n + v.stock_quantity, 0);
  const inCart = selected ? cart.items.find((i) => i.variantId === selected.id)?.quantity ?? 0 : 0;
  const canAdd = selected ? Math.max(0, Math.min(selected.stock_quantity - inCart, 10)) : 0;
  useEffect(() => { setQty((q) => Math.max(1, Math.min(q, canAdd || 1))); }, [selected?.id, canAdd]);

  if (catalogLoading) return <p className="py-40 text-center text-sm uppercase tracking-[0.3em] text-white/50">Loading</p>;
  if (!product) {
    return (
      <div className="mx-auto max-w-xl px-4 py-32 text-center">
        <h1 className="h-display text-2xl">Not found</h1>
        <p className="mt-4 text-white/60">This product isn’t available right now.</p>
        <Link to="/shop" className="btn-line mt-8">Back to shop</Link>
      </div>
    );
  }

  const sizeOk = (s: string) => variants.some((v) => v.size === s && v.stock_quantity > 0 && (!colors.length || !color || v.color === color));
  const colorOk = (c: string) => variants.some((v) => v.color === c && v.stock_quantity > 0 && (!sizes.length || !size || v.size === size));
  const onSale = product.compare_at_price != null && product.compare_at_price > product.price;
  const need = [sizes.length && !size ? 'a size' : '', colors.length && !color ? 'a color' : ''].filter(Boolean).join(' and ');
  const optionLabel = [selected?.size, selected?.color].filter(Boolean).join(' / ') || 'Standard';

  function add() {
    if (!selected || !product) return;
    const item: CartItem = {
      variantId: selected.id, productId: product.id, productSlug: product.slug, name: product.name, optionLabel,
      price: product.price, quantity: qty, image: images[0]?.storage_path ?? null, stock: selected.stock_quantity,
    };
    cart.addItem(STORE_SLUG, item);
    openCart();
  }

  return (
    <div className="mx-auto max-w-[90rem] px-4 py-8 sm:px-8 sm:py-12">
      <Link to="/shop" className="eyebrow hover:text-bone">← Shop</Link>
      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_26rem] lg:gap-14">
        <div>
          {images.length === 0 ? (
            <div className="flex aspect-[4/5] items-center justify-center bg-white/[0.06] px-6 text-center text-xl uppercase tracking-[0.2em] text-white/40">{product.name}</div>
          ) : (
            <>
              <ul className="-mx-4 flex snap-x snap-mandatory gap-2 overflow-x-auto px-4 lg:hidden" aria-label="Product photos">
                {images.map((img, i) => <li key={img.id} className="w-[86vw] shrink-0 snap-center"><img src={publicImageUrl(img.storage_path) ?? ''} alt={img.alt_text || `${product.name} photo ${i + 1}`} className="aspect-[4/5] w-full object-cover" /></li>)}
              </ul>
              <ul className="hidden gap-3 lg:grid lg:grid-cols-2" aria-label="Product photos">
                {images.map((img, i) => (
                  <li key={img.id} className={images.length % 2 === 1 && i === 0 ? 'col-span-2' : ''}>
                    <img src={publicImageUrl(img.storage_path) ?? ''} alt={img.alt_text || `${product.name} photo ${i + 1}`} className="aspect-[4/5] w-full object-cover" />
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>

        <div className="lg:sticky lg:top-28 lg:self-start">
          <p className="eyebrow">{product.category}</p>
          <h1 className="h-display mt-2 text-2xl sm:text-3xl">{product.name}</h1>
          <p className="mt-4 text-xl">
            {formatPHP(product.price)}
            {onSale && <span className="ml-3 text-base text-white/50 line-through">{formatPHP(product.compare_at_price as number)}</span>}
          </p>
          {product.description && <p className="mt-6 whitespace-pre-line text-sm leading-relaxed text-white/80">{product.description}</p>}

          {totalStock <= 0 ? (
            <p className="mt-8 border border-white/30 px-4 py-4 text-center text-sm font-semibold uppercase tracking-[0.14em]" role="status">Sold out</p>
          ) : (
            <div className="mt-8 space-y-6">
              {sizes.length > 0 && (
                <div role="radiogroup" aria-label="Size">
                  <p className="eyebrow mb-3">Size{size ? ` — ${size}` : ''}</p>
                  <div className="flex flex-wrap gap-2">{sizes.map((s) => <button key={s} type="button" role="radio" aria-checked={size === s} disabled={!sizeOk(s)} className="size" onClick={() => setSize(s)}>{s}</button>)}</div>
                </div>
              )}
              {colors.length > 0 && (
                <div role="radiogroup" aria-label="Color">
                  <p className="eyebrow mb-3">Color{color ? ` — ${color}` : ''}</p>
                  <div className="flex flex-wrap gap-2">{colors.map((c) => <button key={c} type="button" role="radio" aria-checked={color === c} disabled={!colorOk(c)} className="size px-4" onClick={() => setColor(c)}>{c}</button>)}</div>
                </div>
              )}
              <p className="text-sm text-white/70" role="status">
                {!selected ? (need ? `Choose ${need}.` : 'This combination isn’t available.')
                  : selected.stock_quantity <= 0 ? 'Sold out in this option.'
                  : selected.stock_quantity <= 5 ? `Only ${selected.stock_quantity} left.` : 'In stock.'}
              </p>
              <div className="flex gap-3">
                <div className="flex items-center border border-white/30" role="group" aria-label="Quantity">
                  <button type="button" className="px-4 py-4 disabled:opacity-40" disabled={qty <= 1} onClick={() => setQty(qty - 1)} aria-label="Decrease quantity">−</button>
                  <span className="min-w-[2rem] text-center text-sm" aria-live="polite">{qty}</span>
                  <button type="button" className="px-4 py-4 disabled:opacity-40" disabled={qty >= canAdd} onClick={() => setQty(qty + 1)} aria-label="Increase quantity">+</button>
                </div>
                <button type="button" className="btn flex-1" disabled={!selected || canAdd < 1} onClick={add}>
                  {selected && selected.stock_quantity > 0 && canAdd < 1 ? 'All in your cart' : 'Add to cart'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
