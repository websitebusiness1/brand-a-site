import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '@/lib/cart';
import { useCartSync } from '@/lib/useCartSync';
import { formatPHP } from '@/lib/format';
import { publicImageUrl } from '@/lib/storage';
import { useSite } from '@/site/SiteProvider';
import { CloseIcon } from './icons';

export default function CartDrawer() {
  const { cartOpen, closeCart } = useSite();
  const cart = useCart();
  const { notes } = useCartSync();
  const closeRef = useRef<HTMLButtonElement>(null);
  const t = cartOpen ? 0 : -1;

  useEffect(() => {
    if (!cartOpen) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeCart(); };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [cartOpen, closeCart]);

  return (
    <div className={`fixed inset-0 z-[60] ${cartOpen ? '' : 'pointer-events-none'}`} aria-hidden={!cartOpen}>
      <div className={`absolute inset-0 bg-black/70 transition-opacity duration-300 ${cartOpen ? 'opacity-100' : 'opacity-0'}`} onClick={closeCart} />
      <aside role="dialog" aria-modal="true" aria-label="Shopping cart"
        className={`absolute right-0 top-0 flex h-full w-full max-w-md flex-col border-l border-white/20 bg-ink transition-transform duration-300 ${cartOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex items-center justify-between border-b border-white/20 px-5 py-4">
          <h2 className="text-lg uppercase tracking-[0.18em]">Cart ({cart.count})</h2>
          <button ref={closeRef} type="button" onClick={closeCart} className="p-2" aria-label="Close cart" tabIndex={t}><CloseIcon /></button>
        </div>

        {notes.length > 0 && <div className="space-y-1 border-b border-white/20 px-5 py-3 text-xs text-white/70">{notes.map((n) => <p key={n}>{n}</p>)}</div>}

        {cart.items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 text-center">
            <p className="text-lg uppercase tracking-[0.18em]">Your cart is empty</p>
            <Link to="/shop" onClick={closeCart} className="btn-line" tabIndex={t}>Continue shopping</Link>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-white/20 overflow-y-auto px-5">
              {cart.items.map((i) => {
                const img = publicImageUrl(i.image);
                return (
                  <li key={i.variantId} className="flex gap-4 py-5">
                    <Link to={`/product/${i.productSlug}`} onClick={closeCart} className="block h-28 w-24 shrink-0 overflow-hidden bg-white/[0.06]" tabIndex={t}>
                      {img && <img src={img} alt={i.name} className="h-full w-full object-cover" />}
                    </Link>
                    <div className="flex min-w-0 flex-1 flex-col text-sm">
                      <div className="flex justify-between gap-3">
                        <div className="min-w-0"><p className="uppercase tracking-[0.12em]">{i.name}</p><p className="mt-1 text-white/60">{i.optionLabel}</p></div>
                        <p className="shrink-0">{formatPHP(i.price * i.quantity)}</p>
                      </div>
                      <div className="mt-auto flex items-center justify-between pt-3">
                        <div className="flex items-center rounded-full border border-white/40" role="group" aria-label={`Quantity for ${i.name}`}>
                          <button type="button" className="px-4 py-2 disabled:opacity-40" disabled={i.quantity <= 1} onClick={() => cart.setQuantity(i.variantId, i.quantity - 1)} aria-label="Decrease quantity" tabIndex={t}>−</button>
                          <span className="min-w-[1.5rem] text-center" aria-live="polite">{i.quantity}</span>
                          <button type="button" className="px-4 py-2 disabled:opacity-40" disabled={i.quantity >= i.stock} onClick={() => cart.setQuantity(i.variantId, i.quantity + 1)} aria-label="Increase quantity" tabIndex={t}>+</button>
                        </div>
                        <button type="button" className="text-xs uppercase tracking-[0.16em] text-white/60 underline underline-offset-4 hover:text-bone" onClick={() => cart.remove(i.variantId)} aria-label={`Remove ${i.name}`} tabIndex={t}>Remove</button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
            <div className="border-t border-white/20 px-5 py-5">
              <div className="flex items-center justify-between uppercase tracking-[0.14em]"><span>Subtotal</span><span>{formatPHP(cart.subtotal)}</span></div>
              <p className="mt-1 text-xs text-white/60">Shipping is calculated at checkout.</p>
              <Link to="/checkout" onClick={closeCart} className="btn mt-4 w-full" tabIndex={t}>Check out</Link>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
