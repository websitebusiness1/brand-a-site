import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useCart } from '@/lib/cart';
import { useCartSync } from '@/lib/useCartSync';
import { errorMessage, formatPHP } from '@/lib/format';
import { METHOD_LABELS } from '@/lib/orders';
import { useSite, STORE_SLUG } from '@/site/SiteProvider';

export default function Checkout() {
  const { settings, reloadCatalog } = useSite();
  const cart = useCart();
  const navigate = useNavigate();
  const [resync, setResync] = useState(0);
  const { syncing, notes } = useCartSync(resync);

  const methods = settings?.payment_methods?.length ? settings.payment_methods : ['cod'];
  const [method, setMethod] = useState(methods[0]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fee = settings?.shipping_fee ?? 0;
  const threshold = settings?.free_shipping_threshold;
  const shipping = threshold != null && cart.subtotal >= threshold ? 0 : fee;
  const manual = method !== 'cod';
  const instructions = settings?.payment_instructions?.[method];

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (busy || syncing || cart.items.length === 0) return;
    setError(null);
    setBusy(true);
    const { data, error: err } = await supabase.rpc('place_order', {
      p_store_slug: STORE_SLUG,
      p_customer_name: name, p_customer_email: email, p_customer_phone: phone,
      p_delivery_address: address, p_notes: orderNotes.trim() || null, p_payment_method: method,
      p_items: cart.items.map((i) => ({ variant_id: i.variantId, quantity: i.quantity })),
    });
    setBusy(false);
    if (err) { setError(errorMessage(err)); setResync((n) => n + 1); return; }
    navigate(`/order/${encodeURIComponent(data as string)}`, { replace: true });
    cart.clear();
    reloadCatalog();
  }

  if (cart.items.length === 0 && !syncing) {
    return (
      <div className="mx-auto max-w-xl px-4 py-32 text-center">
        <h1 className="h-display text-2xl">Nothing here</h1>
        <p className="mt-4 text-white/60">Your cart is empty.</p>
        <Link to="/shop" className="btn-line mt-8">Shop all</Link>
      </div>
    );
  }
  if (syncing) return <p className="py-40 text-center text-sm uppercase tracking-[0.3em] text-white/50">Loading</p>;

  return (
    <div className="mx-auto max-w-[70rem] px-4 py-12 sm:px-8 sm:py-16">
      <h1 className="h-display text-2xl sm:text-3xl">Checkout</h1>
      {notes.length > 0 && <div className="mt-6 space-y-2 border border-white/20 p-4 text-sm text-white/80">{notes.map((n) => <p key={n}>{n}</p>)}</div>}

      <form onSubmit={submit} className="mt-10 grid gap-12 lg:grid-cols-[1fr_24rem]">
        <div className="space-y-10">
          {error && <p role="alert" className="border border-red-400/60 bg-red-950/40 px-4 py-3 text-sm text-red-200">{error}</p>}

          <fieldset className="space-y-4">
            <legend className="eyebrow mb-4">Your details</legend>
            <div><label htmlFor="c-name" className="mb-1.5 block text-sm">Full name</label><input id="c-name" required autoComplete="name" maxLength={120} className="field" value={name} onChange={(e) => setName(e.target.value)} /></div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div><label htmlFor="c-email" className="mb-1.5 block text-sm">Email</label><input id="c-email" type="email" required autoComplete="email" className="field" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
              <div><label htmlFor="c-phone" className="mb-1.5 block text-sm">Mobile number</label><input id="c-phone" type="tel" required autoComplete="tel" inputMode="tel" maxLength={25} placeholder="09XX XXX XXXX" className="field" value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
            </div>
            <div><label htmlFor="c-addr" className="mb-1.5 block text-sm">Delivery address</label><textarea id="c-addr" required rows={3} autoComplete="street-address" maxLength={500} placeholder="House no., street, barangay, city, province, postal code" className="field" value={address} onChange={(e) => setAddress(e.target.value)} /></div>
            <div><label htmlFor="c-notes" className="mb-1.5 block text-sm">Order notes (optional)</label><textarea id="c-notes" rows={2} maxLength={1000} className="field" value={orderNotes} onChange={(e) => setOrderNotes(e.target.value)} /></div>
          </fieldset>

          <fieldset>
            <legend className="eyebrow mb-4">Payment</legend>
            <div className="space-y-2">
              {methods.map((m) => (
                <label key={m} className="flex cursor-pointer items-center gap-3 border border-white/25 px-4 py-4 text-sm has-[:checked]:border-bone">
                  <input type="radio" name="payment" style={{ accentColor: 'var(--accent)' }} checked={method === m} onChange={() => setMethod(m)} />
                  {METHOD_LABELS[m] ?? m}
                </label>
              ))}
            </div>
            <div className="mt-3 border border-white/15 px-4 py-4 text-sm text-white/80">
              {manual ? (<><p>Place your order first, then send your payment. It shows as <strong>pending</strong> until the store confirms it has received it.</p>{instructions && <p className="mt-2 whitespace-pre-line">{instructions}</p>}</>) : <p>Pay in cash when your order is delivered.</p>}
            </div>
          </fieldset>
        </div>

        <aside className="lg:sticky lg:top-28 lg:self-start">
          <p className="eyebrow mb-4">Order summary</p>
          <ul className="space-y-3 border-y border-white/15 py-4 text-sm">
            {cart.items.map((i) => (
              <li key={i.variantId} className="flex justify-between gap-3"><span>{i.quantity} × {i.name}<span className="block text-white/60">{i.optionLabel}</span></span><span>{formatPHP(i.price * i.quantity)}</span></li>
            ))}
          </ul>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between"><dt>Subtotal</dt><dd>{formatPHP(cart.subtotal)}</dd></div>
            <div className="flex justify-between"><dt>Shipping</dt><dd>{shipping === 0 ? 'Free' : formatPHP(shipping)}</dd></div>
            <div className="flex justify-between border-t border-white/15 pt-3 text-lg font-semibold"><dt>Total</dt><dd>{formatPHP(cart.subtotal + shipping)}</dd></div>
          </dl>
          <p className="mt-2 text-xs text-white/50">Prices and stock are confirmed when you place the order.</p>
          <button type="submit" className="btn mt-6 w-full" disabled={busy}>{busy ? 'Placing order…' : 'Place order'}</button>
          <Link to="/shop" className="mt-4 block text-center text-xs uppercase tracking-widest text-white/60 underline underline-offset-4">Keep shopping</Link>
        </aside>
      </form>
    </div>
  );
}
