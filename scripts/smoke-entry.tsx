import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import App from '@/App';
import { CartProvider } from '@/lib/cart';
import { SiteContext } from '@/site/SiteProvider';

const store: any = { id: 's1', name: 'PRESTIGE', slug: 'brand-a', logo_path: 's1/logo.png', banner_path: 's1/banner.jpg', brand_colors: { accent: '#b08d57' },
  contact_email: 'hi@prestige.test', contact_phone: '0917 000 0000', contact_address: 'Manila', social_links: { instagram: 'https://instagram.com/prestige', facebook: 'javascript:alert(1)' } };
const settings: any = { store_id: 's1', announcement: 'Free shipping over 2,000', shipping_fee: 100, free_shipping_threshold: 2000, payment_methods: ['cod', 'gcash'], payment_instructions: { gcash: '0917' }, hero_heading: null, hero_subheading: null };
const mk = (i: number) => ({ id: `p${i}`, store_id: 's1', name: `Tee ${i}`, slug: `tee-${i}`, description: 'Heavy cotton', price: 850, compare_at_price: i === 2 ? 1000 : null, category: i % 2 ? 'Tops' : 'Bottoms', status: 'published', is_featured: i < 2, created_at: '2026-01-01', updated_at: '2026-01-01' });
const products: any[] = [1, 2, 3, 4, 5].map(mk);
const images: any[] = products.flatMap((p) => [0, 1, 2].map((k) => ({ id: `${p.id}-i${k}`, product_id: p.id, store_id: 's1', storage_path: `s1/${p.id}-${k}.webp`, alt_text: null, sort_order: k, is_cover: k === 0, created_at: 'x' })));
const variants: any[] = products.flatMap((p) => ['S', 'M'].map((sz, k) => ({ id: `${p.id}-v${k}`, product_id: p.id, store_id: 's1', size: sz, color: 'Black', sku: null, stock_quantity: p.id === 'p5' ? 0 : 5, is_active: true, created_at: 'x' })));
const lookbooks: any[] = [{ id: 'l1', title: 'SS26 Shoot', slug: 'ss26-shoot', description: 'Summer story', collection_name: 'Summer', shoot_date: '2026-03-01', sort_order: 0 }, { id: 'l2', title: 'Night Run', slug: 'night-run', description: '', collection_name: null, shoot_date: null, sort_order: 1 }];
const photos: any[] = [{ id: 'lp1', lookbook_id: 'l1', storage_path: 's1/a.webp', alt_text: 'A', caption: 'Cap', sort_order: 0, is_cover: true }, { id: 'lp2', lookbook_id: 'l1', storage_path: 's1/b.webp', alt_text: null, caption: null, sort_order: 1, is_cover: false }];
const videos: any[] = [{ id: 'v1', title: 'Reel', description: 'Desc', source_type: 'url', video_path: null, video_url: 'https://youtu.be/dQw4w9WgXcQ', thumbnail_path: null, sort_order: 0 }, { id: 'v2', title: 'Upload', description: '', source_type: 'upload', video_path: 's1/v.mp4', video_url: null, thumbnail_path: 's1/t.webp', sort_order: 1 }];
const base = { body: null, image_path: null, image_alt: null, button_label: null, link_url: null, config: {}, sort_order: 0 };
const fullSections: any[] = [
  { ...base, id: 'h', type: 'hero', title: 'New drop', body: 'Out now', button_label: 'Shop', link_url: '/shop', config: { video_path: 's1/hero.mp4' } },
  { ...base, id: 'b1', type: 'banner', title: 'FREE SHIPPING THIS WEEK' },
  { ...base, id: 'b2', type: 'banner', title: 'Campaign', body: 'Story', image_path: 's1/c.webp', button_label: 'Go', link_url: 'https://example.com' },
  { ...base, id: 't', type: 'text', title: 'About', body: 'We make clothes.', image_path: 's1/t.webp', button_label: 'More', link_url: '/contact' },
  { ...base, id: 'p', type: 'products', title: 'Picks', config: { mode: 'selected', limit: 4, product_ids: ['p2', 'p1', 'nope'] } },
  { ...base, id: 'c', type: 'collections', title: 'Collections' },
  { ...base, id: 'lb', type: 'lookbook', title: 'Lookbook', config: { limit: 3 } },
  { ...base, id: 'vd', type: 'videos', title: 'Videos', config: { limit: 3 } },
  { ...base, id: 'x', type: 'text', title: 'Bad link', link_url: 'javascript:alert(1)', button_label: 'Click' },
];

const site = (sections: any[], over: any = {}) => {
  const imagesBy = new Map<string, any[]>(); images.forEach((i) => imagesBy.set(i.product_id, [...(imagesBy.get(i.product_id) ?? []), i]));
  const variantsBy = new Map<string, any[]>(); variants.forEach((v) => variantsBy.set(v.product_id, [...(variantsBy.get(v.product_id) ?? []), v]));
  const photosBy = new Map<string, any[]>(); photos.forEach((p) => photosBy.set(p.lookbook_id, [...(photosBy.get(p.lookbook_id) ?? []), p]));
  return { store, settings, preview: false, sections, products, imagesBy, variantsBy, lookbooks, photosBy, videos,
    stockOf: (id: string) => (variantsBy.get(id) ?? []).reduce((n, v) => n + v.stock_quantity, 0),
    catalogLoading: false, catalogError: null, reloadCatalog: async () => {}, cartOpen: false, openCart() {}, closeCart() {}, ...over };
};

const render = (route: string, value: any) =>
  renderToString(<MemoryRouter initialEntries={[route]}><CartProvider><SiteContext.Provider value={value}><App /></SiteContext.Provider></CartProvider></MemoryRouter>);

let fails = 0;
const check = (label: string, html: string, must: (string | RegExp)[], mustNot: (string | RegExp)[] = []) => {
  const miss = must.filter((m) => (typeof m === 'string' ? !html.includes(m) : !m.test(html)));
  const bad = mustNot.filter((m) => (typeof m === 'string' ? html.includes(m) : m.test(html)));
  if (miss.length || bad.length) { fails++; console.log(`FAIL ${label}  missing=${JSON.stringify(miss.map(String))} unexpected=${JSON.stringify(bad.map(String))}`); } else console.log(`PASS ${label}`);
};

export function run() {
  const full = site(fullSections);
  const home = render('/', full);
  check('home with every section type', home, ['PRESTIGE', 'New drop', 'FREE SHIPPING THIS WEEK', 'Campaign', 'We make clothes.', 'Picks', 'Tee 2', 'Collections', 'Lookbook', 'Videos', 'hero.mp4', 'Free shipping over 2,000'], ['javascript:alert', 'Tee 3']);
  check('home hero order respects selection (Tee 2 before Tee 1)', home, [/Tee 2[\s\S]*Tee 1/]);
  check('home default layout when no sections', render('/', site([])), ['New arrivals', 'Collections', 'Lookbook', 'Videos', 'Shop now']);
  check('home with nothing published', render('/', site([], { products: [], lookbooks: [], videos: [] })), ['Coming soon']);
  check('shop', render('/shop', full), ['Tee 1', 'Tee 5', 'Sold out', 'Sale']);
  check('shop new', render('/shop?c=new', full), ['What’s new?']);
  check('product page', render('/product/tee-2', full), ['Tee 2', 'Heavy cotton', 'Add to cart', 'Show photo 3 of 3', 'Size']);
  check('sold out product', render('/product/tee-5', full), ['Sold out']);
  check('missing product', render('/product/nope', full), ['Not found']);
  check('lookbook list', render('/lookbook', full), ['SS26 Shoot', 'Night Run', /2(<!-- -->)? photo/]);
  check('lookbook gallery', render('/lookbook/ss26-shoot', full), ['SS26 Shoot', 'Summer story', 'Cap', 'Next lookbook']);
  check('missing lookbook', render('/lookbook/zzz', full), ['Not found']);
  check('videos page', render('/videos', full), ['Reel', 'Upload']);
  check('shipping page', render('/shipping', full), ['Shipping', 'GCash', 'free']);
  check('contact page', render('/contact', full), ['hi@prestige.test', 'instagram'], ['javascript:alert']);
  check('empty checkout', render('/checkout', full), ['Nothing here']);
  check('features off: no lookbook/videos links', render('/', site(fullSections, { lookbooks: [], videos: [] })), ['PRESTIGE'], ['href="/lookbook"', 'href="/videos"']);
  check('preview badge', render('/', site(fullSections, { preview: true })), ['Preview · drafts visible']);
  console.log(fails ? `\n${fails} FAILED` : '\nALL PASSED');
  process.exitCode = fails ? 1 : 0;
}
