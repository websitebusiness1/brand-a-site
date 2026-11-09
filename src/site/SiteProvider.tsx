import { createContext, CSSProperties, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { errorMessage } from '@/lib/format';
import { contrast, readableOn } from '@/lib/theme';
import type { Product, ProductImage, ProductVariant, Store, StoreSettings } from '@/lib/types';

export const STORE_SLUG = (import.meta.env.VITE_STORE_SLUG as string | undefined) || 'brand-a';
const INK = '#050505';
const HEX = /^#[0-9a-f]{6}$/i;

interface Site {
  store: Store;
  settings: StoreSettings | null;
  products: Product[];
  imagesBy: Map<string, ProductImage[]>;
  variantsBy: Map<string, ProductVariant[]>;
  stockOf: (productId: string) => number;
  catalogLoading: boolean;
  catalogError: string | null;
  reloadCatalog: () => Promise<void>;
  cartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
}

const Ctx = createContext<Site | null>(null);
export const useSite = (): Site => {
  const c = useContext(Ctx);
  if (!c) throw new Error('useSite must be used inside SiteProvider');
  return c;
};

type Boot = { status: 'loading' } | { status: 'missing' } | { status: 'ready'; store: Store; settings: StoreSettings | null };

export function SiteProvider({ children }: { children: ReactNode }) {
  const [boot, setBoot] = useState<Boot>({ status: 'loading' });
  const [products, setProducts] = useState<Product[]>([]);
  const [images, setImages] = useState<ProductImage[]>([]);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [catalogError, setCatalogError] = useState<string | null>(null);
  const [cartOpen, setCartOpen] = useState(false);

  const storeId = boot.status === 'ready' ? boot.store.id : null;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      // Suspended or archived stores are hidden by the database, so the site shows "unavailable".
      const { data: store } = await supabase.from('stores').select('*').eq('slug', STORE_SLUG).eq('status', 'active').maybeSingle();
      if (cancelled) return;
      if (!store) { setBoot({ status: 'missing' }); return; }
      const { data: settings } = await supabase.from('store_settings').select('*').eq('store_id', (store as Store).id).maybeSingle();
      if (cancelled) return;
      setBoot({ status: 'ready', store: store as Store, settings: (settings ?? null) as StoreSettings | null });
    })();
    return () => { cancelled = true; };
  }, []);

  const reloadCatalog = useCallback(async () => {
    if (!storeId) return;
    const [p, i, v] = await Promise.all([
      supabase.from('products').select('*').eq('store_id', storeId).eq('status', 'published').order('created_at', { ascending: false }),
      supabase.from('product_images').select('*').eq('store_id', storeId),
      supabase.from('product_variants').select('*').eq('store_id', storeId),
    ]);
    const err = p.error ?? i.error ?? v.error;
    setCatalogError(err ? errorMessage(err) : null);
    setProducts((p.data ?? []) as Product[]);
    setImages(((i.data ?? []) as ProductImage[]).sort((a, b) => Number(b.is_cover) - Number(a.is_cover) || a.sort_order - b.sort_order));
    setVariants((v.data ?? []) as ProductVariant[]);
    setCatalogLoading(false);
  }, [storeId]);

  useEffect(() => { reloadCatalog(); }, [reloadCatalog]);

  const store = boot.status === 'ready' ? boot.store : null;
  useEffect(() => {
    if (!store) return;
    document.title = store.name;
  }, [store]);

  const imagesBy = useMemo(() => {
    const m = new Map<string, ProductImage[]>();
    images.forEach((i) => m.set(i.product_id, [...(m.get(i.product_id) ?? []), i]));
    return m;
  }, [images]);
  const variantsBy = useMemo(() => {
    const m = new Map<string, ProductVariant[]>();
    variants.filter((v) => v.is_active).forEach((v) => m.set(v.product_id, [...(m.get(v.product_id) ?? []), v]));
    return m;
  }, [variants]);

  const value = useMemo<Site | null>(() => boot.status !== 'ready' ? null : ({
    store: boot.store,
    settings: boot.settings,
    products, imagesBy, variantsBy,
    stockOf: (id) => (variantsBy.get(id) ?? []).reduce((n, v) => n + v.stock_quantity, 0),
    catalogLoading, catalogError, reloadCatalog,
    cartOpen, openCart: () => setCartOpen(true), closeCart: () => setCartOpen(false),
  }), [boot, products, imagesBy, variantsBy, catalogLoading, catalogError, reloadCatalog, cartOpen]);

  if (boot.status === 'loading') {
    return <div className="flex min-h-screen items-center justify-center"><span className="text-sm uppercase tracking-[0.3em] text-white/50">Loading</span></div>;
  }
  if (boot.status === 'missing' || !value) {
    return (
      <div className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-6">
        <h1 className="h-display text-2xl">Store unavailable</h1>
        <p className="mt-4 text-white/60">This store isn’t open right now. Please check back soon.</p>
      </div>
    );
  }

  // The brand's accent color, but never one that's unreadable on black.
  const raw = boot.store.brand_colors?.accent;
  const accent = typeof raw === 'string' && HEX.test(raw) && contrast(raw, INK) >= 4.5 ? raw.toLowerCase() : '#f1efe9';
  const vars = { '--accent': accent, '--on-accent': readableOn(accent) } as CSSProperties;

  return <Ctx.Provider value={value}><div style={vars} className="min-h-screen">{children}</div></Ctx.Provider>;
}
