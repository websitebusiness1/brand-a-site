import { Link } from 'react-router-dom';
import { formatPHP } from '@/lib/format';
import { METHOD_LABELS } from '@/lib/orders';
import { safeUrl } from '@/lib/theme';
import { useSite } from '@/site/SiteProvider';

export function ShippingPage() {
  const { settings } = useSite();
  const fee = settings?.shipping_fee ?? 0;
  const threshold = settings?.free_shipping_threshold;
  const methods = settings?.payment_methods?.length ? settings.payment_methods : ['cod'];
  return (
    <div className="mx-auto max-w-2xl px-4 py-14 sm:py-20">
      <h1 className="text-2xl uppercase tracking-[0.06em] sm:text-3xl">Shipping &amp; payment</h1>
      <h2 className="mt-10 text-sm uppercase tracking-[0.2em] text-white/65">Shipping</h2>
      <p className="mt-3 leading-7">{fee === 0 ? 'Shipping is free.' : `Shipping is ${formatPHP(fee)} per order.`}{fee > 0 && threshold != null && ` Orders of ${formatPHP(threshold)} or more ship free.`}</p>
      <h2 className="mt-10 text-sm uppercase tracking-[0.2em] text-white/65">Payment</h2>
      <ul className="mt-3 list-disc space-y-1 pl-5 leading-7">{methods.map((m) => <li key={m}>{METHOD_LABELS[m] ?? m}</li>)}</ul>
      {methods.some((m) => m !== 'cod') && <p className="mt-4 text-sm leading-7 text-white/70">For bank transfer and GCash, the payment details are shown at checkout. Your payment is marked pending until the store confirms it has received it.</p>}
      <Link to="/shop" className="btn-line mt-12">Continue shopping</Link>
    </div>
  );
}

export function ContactPage() {
  const { store } = useSite();
  const socials = Object.entries(store.social_links ?? {}).map(([k, v]) => [k, safeUrl(v)] as const).filter((x): x is readonly [string, string] => Boolean(x[1]));
  const none = !store.contact_email && !store.contact_phone && !store.contact_address && socials.length === 0;
  return (
    <div className="mx-auto max-w-2xl px-4 py-14 sm:py-20">
      <h1 className="text-2xl uppercase tracking-[0.06em] sm:text-3xl">Contact</h1>
      {none ? <p className="mt-8 text-white/70">Contact details coming soon.</p> : (
        <ul className="mt-8 space-y-3 leading-7">
          {store.contact_email && <li><a className="underline underline-offset-4" href={`mailto:${store.contact_email}`}>{store.contact_email}</a></li>}
          {store.contact_phone && <li><a className="underline underline-offset-4" href={`tel:${store.contact_phone.replace(/\s+/g, '')}`}>{store.contact_phone}</a></li>}
          {store.contact_address && <li>{store.contact_address}</li>}
          {socials.map(([k, url]) => <li key={k}><a href={url} target="_blank" rel="noopener noreferrer" className="capitalize underline underline-offset-4">{k}</a></li>)}
        </ul>
      )}
    </div>
  );
}
