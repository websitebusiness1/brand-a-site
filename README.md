# Brand A: custom website

A fully custom storefront for one brand. It is a separate website with its own design, domain and deployment,
but it reads from and writes to the **same Supabase project as the ThreadSpace platform**:

- Products, photos, sizes, stock, prices: managed by the client in the platform dashboard (`/dashboard`) and shown here live.
- Brand name, logo, banner, accent color, announcement bar, hero heading/subheading, shipping fee, payment methods, contact and social links:
  all come from the client's **Dashboard > Store settings**.
- Orders placed here go through the same `place_order` database function (prices and stock are checked by the database, never the browser)
  and appear in the client's **Dashboard > Orders**.

Nothing is managed twice. The shared page `/store/brand-a` on the platform keeps working as a fallback.

## Design

Pure black, white type, thin outline icons, light uppercase text with wide letter-spacing, centered product names and prices
(shown as `₱850.00 PHP`), rounded "Sold out" pills, a scrolling announcement bar, and a full-screen menu. Fonts: Assistant.

The design follows the look of the reference screenshots (layout, typography, mood). It uses none of that brand's logo, photos or wording:
everything shown comes from Brand A's own store data.

## Pages

`/` home (hero from the store banner, then one section per collection) · `/shop` (collection pills, sort, hide sold out; `?c=new` is "What's new?") ·
`/product/<slug>` · full-screen menu with a Shop submenu · search overlay · slide-out cart · `/checkout` · `/order/<reference>` ·
`/shipping` (built from the store's real shipping and payment settings) · `/contact` (the store's contact details and social links)

Collections are the product categories the client sets. The colors are fixed (black and white): the brand colors from Store settings
do not change this site. Logo, banner, announcement bar, hero heading/subheading, contact details and social links do.

Not included, because nothing in the database supports them yet: customer log-in/accounts, a newsletter sign-up, a size chart, and a chat widget.

## Run locally

```bash
npm install
cp .env.example .env      # fill in the Supabase URL and publishable key
npm run dev
```

## Environment variables

| Variable | Value |
| --- | --- |
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | The **publishable** key. Never a secret or service-role key |
| `VITE_STORE_SLUG` | `brand-a` (the store address on the platform) |

To reuse this design for another brand later, deploy a copy with a different `VITE_STORE_SLUG`.

## Publish on Netlify (as its own site)

1. Put this folder in its own GitHub repository.
2. Netlify: Add new site > Import from GitHub > this repository. `netlify.toml` sets the build and the single-page routing.
3. Add the three environment variables above, then deploy.
4. Domain: Site configuration > Domain management > Add a domain, then follow Netlify's DNS instructions at the registrar where the domain was bought.
5. No Supabase redirect settings are needed: this site has no login.

## Limits

Same as the platform: checkout has no bot protection or rate limiting yet, no order emails are sent, and the catalog loads in one request
(up to 1,000 rows). If the store is suspended or archived on the platform, this site shows "Store unavailable".
