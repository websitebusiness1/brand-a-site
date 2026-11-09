import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { formatDate, formatPHP } from '@/lib/format';
import { METHOD_LABELS, cap } from '@/lib/orders';
import type { OrderConfirmationData } from '@/lib/types';

export default function Confirmation() {
  const { orderReference } = useParams();
  const [order, setOrder] = useState<OrderConfirmationData | null | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    supabase.rpc('get_order_confirmation', { p_order_reference: orderReference ?? '' }).then(({ data }) => {
      if (!cancelled) setOrder((data ?? null) as OrderConfirmationData | null);
    });
    return () => { cancelled = true; };
  }, [orderReference]);

  if (order === undefined) return <p className="py-40 text-center text-sm uppercase tracking-[0.3em] text-white/50">Loading</p>;
  if (!order) {
    return (
      <div className="mx-auto max-w-xl px-4 py-32 text-center">
        <h1 className="h-display text-2xl">Order not found</h1>
        <p className="mt-4 text-white/60">Check the order reference and try again.</p>
        <Link to="/" className="btn-line mt-8">Back home</Link>
      </div>
    );
  }
  const manual = order.payment_method !== 'cod';
  const contact = [order.store.contact_email, order.store.contact_phone].filter(Boolean).join(' · ');

  return (
    <div className="mx-auto max-w-2xl px-4 py-14 sm:py-20">
      <p className="eyebrow">Thank you. Your order has been placed.</p>
      <h1 className="h-display mt-3 text-2xl sm:text-3xl [overflow-wrap:anywhere]">{order.order_reference}</h1>
      <p className="mt-3 text-sm text-white/60">Keep this reference. You’ll need it if you contact {order.store.name} about your order. Placed {formatDate(order.created_at)}.</p>

      <div className="mt-8 space-y-3 border border-white/20 px-5 py-4 text-sm">
        <p><span className="font-semibold">Order status:</span> {cap(order.status)}</p>
        <p><span className="font-semibold">Payment:</span> {METHOD_LABELS[order.payment_method] ?? order.payment_method} · {cap(order.payment_status)}</p>
        {order.payment_status === 'pending' && (manual
          ? <p>Please send your payment of <strong>{formatPHP(order.total)}</strong>. It stays <strong>pending</strong> until {order.store.name} confirms it has received it.</p>
          : <p>Please prepare <strong>{formatPHP(order.total)}</strong> to pay in cash on delivery.</p>)}
        {manual && order.payment_instructions && <p className="whitespace-pre-line border-t border-white/15 pt-3">{order.payment_instructions}</p>}
      </div>

      <h2 className="eyebrow mb-3 mt-10">Items</h2>
      <ul className="divide-y divide-white/15 border-y border-white/15 text-sm">
        {order.items.map((i, idx) => (
          <li key={idx} className="flex justify-between gap-3 py-3"><span>{i.quantity} × {i.product_name}{i.variant_label && <span className="block text-white/60">{i.variant_label}</span>}</span><span>{formatPHP(i.line_total)}</span></li>
        ))}
      </ul>
      <dl className="mt-4 space-y-2 text-sm">
        <div className="flex justify-between"><dt>Subtotal</dt><dd>{formatPHP(order.subtotal)}</dd></div>
        <div className="flex justify-between"><dt>Shipping</dt><dd>{order.shipping_fee === 0 ? 'Free' : formatPHP(order.shipping_fee)}</dd></div>
        {order.discount > 0 && <div className="flex justify-between"><dt>Discount</dt><dd>−{formatPHP(order.discount)}</dd></div>}
        <div className="flex justify-between border-t border-white/15 pt-3 text-lg font-semibold"><dt>Total</dt><dd>{formatPHP(order.total)}</dd></div>
      </dl>
      {contact && <p className="mt-8 text-sm text-white/60">Questions? Contact {order.store.name}: {contact}</p>}
      <Link to="/shop" className="btn mt-8">Continue shopping</Link>
    </div>
  );
}
