import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { errorMessage } from '@/lib/format';
import { FontRole, FontsConfig, ROLES, cssFamily, findFont, googleFontsUrl } from '@/lib/fonts';
import { applyAccent } from '@/lib/accent';
import type { HomepageSection, Lookbook, LookbookPhoto, Product, ProductImage, ProductVariant, Store, StoreSettings, Video } from '@/lib/types';

export const STORE_SLUG = (import.meta.env.VITE_STORE_SLUG as string | undefined) || 'brand-a';

interface Site {
  store: Store;
  settings: StoreSettings | null;
  preview: boolean;
  sections: HomepageSection[];
  products: Product[];
  imagesBy: Map<string, ProductImage[]>;
  variantsBy: Map<string, ProductVariant[]>;
  lookbooks: Lookbook[];
  photosBy: Map<string, LookbookPhoto[]>;
  videos: Video[];
  stockOf: (productId: string) => number;
  catalogLoading: boolean;
  catalogError: string | null;
  reloadCatalog: () => Promise<void>;
  cartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
}

interface Content {
  preview: boolean; store: Store; settings: StoreSettings | null; site: { fonts?: FontsConfig } | null;
  sections: HomepageSection[]; products: Product[]; images: ProductImage[]; variants: ProductVariant[];
  lookbooks: Lookbook[]; lookbook_photos: LookbookPhoto[]; videos: Video[];
}

const Ctx = createContext<Site | null>(null);
export const SiteContext = Ctx;
export const useSite = (): Site => {
  const c = useContext(Ctx);
  if (!c) throw new Error('useSite must be used inside SiteProvider');
  return c;
};

/** The admin's Preview opens this site with ?preview=<key>. Remember it for the tab so page changes keep showing drafts. */
function previewKey(): string | null {
  const fromUrl = new URLSearchParams(window.location.search).get('preview');
  try {
    if (fromUrl) { sessionStorage.setItem('site-preview', fromUrl); return fromUrl; }
    return sessionStorage.getItem('site-preview');
  } catch { return fromUrl; }
}

const FONT_VARS: Record<FontRole, string> = { heading: '--font-heading', body: '--font-body', nav: '--font-nav', button: '--font-button' };

/** Applies the brand's chosen fonts. Only fonts on our own allow-list are ever loaded. */
function applyFonts(fonts: FontsConfig | undefined) {
  const root = document.documentElement;
  const families: string[] = [];
  ROLES.forEach(({ key }) => {
    const f = fonts?.[key]?.family;
    if (f && findFont(f)) { root.style.setProperty(FONT_VARS[key], cssFamily(f)); families.push(f); }
    else root.style.removeProperty(FONT_VARS[key]);
  });
  const url = googleFontsUrl(families);
  let link = document.getElementById('site-fonts') as HTMLLinkElement | null;
  if (!url) { link?.remove(); return; }
  if (!link) { link = document.createElement('link'); link.id = 'site-fonts'; link.rel = 'stylesheet'; document.head.appendChild(link); }
  if (link.href !== url) link.href = url;
}

type Boot = { status: 'loading' } | { status: 'missing' } | { status: 'ready'; content: Content };

export function SiteProvider({ children }: { children: ReactNode }) {
  const [boot, setBoot] = useState<Boot>({ status: 'loading' });
  const [catalogError, setCatalogError] = useState<string | null>(null);
  const [cartOpen, setCartOpen] = useState(false);

  const fetchContent = useCallback(async (): Promise<Content | null | 'error'> => {
    const { data, error } = await supabase.rpc('get_site_content', { p_store_slug: STORE_SLUG, p_preview_token: previewKey() });
    if (error) { setCatalogError(errorMessage(error)); return 'error'; }
    setCatalogError(null);
    return (data ?? null) as Content | null;
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetchContent().then((c) => {
      if (cancelled) return;
      if (c === 'error' || !c) setBoot({ status: 'missing' });
      else setBoot({ status: 'ready', content: c });
    });
    return () => { cancelled = true; };
  }, [fetchContent]);

  // After an order, stock has changed: refresh quietly.
  const reloadCatalog = useCallback(async () => {
    const c = await fetchContent();
    if (c && c !== 'error') setBoot({ status: 'ready', content: c });
  }, [fetchContent]);

  const content = boot.status === 'ready' ? boot.content : null;

  useEffect(() => { if (content) { applyFonts(content.site?.fonts); applyAccent(content.store.brand_colors?.accent); } }, [content]);
  useEffect(() => {
    if (!content) return;
    document.title = content.store.name;
    if (content.preview) {
      let m = document.querySelector('meta[name="robots"]') as HTMLMetaElement | null;
      if (!m) { m = document.createElement('meta'); m.name = 'robots'; document.head.appendChild(m); }
      m.content = 'noindex';
    }
  }, [content]);

  const imagesBy = useMemo(() => {
    const m = new Map<string, ProductImage[]>();
    (content?.images ?? []).slice().sort((a, b) => Number(b.is_cover) - Number(a.is_cover) || a.sort_order - b.sort_order)
      .forEach((i) => m.set(i.product_id, [...(m.get(i.product_id) ?? []), i]));
    return m;
  }, [content]);
  const variantsBy = useMemo(() => {
    const m = new Map<string, ProductVariant[]>();
    (content?.variants ?? []).forEach((v) => m.set(v.product_id, [...(m.get(v.product_id) ?? []), v]));
    return m;
  }, [content]);
  const photosBy = useMemo(() => {
    const m = new Map<string, LookbookPhoto[]>();
    (content?.lookbook_photos ?? []).slice().sort((a, b) => a.sort_order - b.sort_order)
      .forEach((p) => m.set(p.lookbook_id, [...(m.get(p.lookbook_id) ?? []), p]));
    return m;
  }, [content]);

  const value = useMemo<Site | null>(() => !content ? null : ({
    store: content.store, settings: content.settings, preview: content.preview,
    sections: content.sections ?? [], products: content.products ?? [], imagesBy, variantsBy,
    lookbooks: content.lookbooks ?? [], photosBy, videos: content.videos ?? [],
    stockOf: (id) => (variantsBy.get(id) ?? []).reduce((n, v) => n + v.stock_quantity, 0),
    catalogLoading: false, catalogError, reloadCatalog,
    cartOpen, openCart: () => setCartOpen(true), closeCart: () => setCartOpen(false),
  }), [content, imagesBy, variantsBy, photosBy, catalogError, reloadCatalog, cartOpen]);

  if (boot.status === 'loading') {
    return <div className="flex min-h-screen items-center justify-center"><span className="text-sm uppercase tracking-[0.3em] text-white/50">Loading</span></div>;
  }
  if (boot.status === 'missing' || !value) {
    return (
      <div className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-6">
        <h1 className="text-3xl uppercase tracking-[0.12em]">Store unavailable</h1>
        <p className="mt-4 text-white/60">This website isn’t open right now. Please check back soon.</p>
      </div>
    );
  }
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
