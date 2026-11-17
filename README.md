# Brand website (reads from the Pryze.dept admin)

A custom website for one brand. It has no content of its own: everything comes live from the brand's admin.

| Comes from the admin | Where |
| --- | --- |
| Products, photos, sizes, stock, prices | Products, Inventory |
| Homepage sections and their order | Homepage (falls back to a built-in layout until sections are published) |
| Lookbooks and photo galleries | Lookbooks → `/lookbook`, `/lookbook/<name>` |
| Videos | Videos → `/videos` |
| Fonts (headings, body, navigation, buttons) | Fonts |
| Logo, banner, announcement bar, contact, social links, shipping, payment methods | Store settings |

Orders placed here go through the database's `place_order` function (prices and stock are checked server-side) and appear in the brand's Orders screen.

## Design

Streetwear look: pure black, heavy uppercase headings (Archivo Black), Space Grotesk labels, Inter body text, square buttons, scroll-reveal motion, a scrolling announcement bar,
a promo marquee band, and a hero that is a looping video, an image, or the brand's logo as a slowly turning 3D object. The brand's accent color (Store settings) is used for highlights
(ignored if it would be hard to read on black). The admin's Fonts page (Pro) overrides each font role.

Homepage section types from the admin: **Hero** (video, image or 3D logo), **Promo banner** (with an image: campaign band; without: scrolling promo text), **Brand intro** (text with optional image and button),
**Products**, **Collections**, **Lookbook**, **Videos**. Product pages have a photo gallery with thumbnails, arrows and swipe; lookbooks have an editorial gallery with a full-screen viewer.

Tip: for the 3D logo hero, upload a logo with a transparent background (the white version works best on black) as the brand's Logo in Store settings.

Features a brand's package doesn't include (lookbooks, videos, promo banners, fonts, hero video) are not sent to this site at all, so they never appear.

## Checks

`node scripts/smoke.mjs` renders every page on the server with sample content (all section types and routes) and reports pass/fail.

## Preview from the admin

The admin's Preview opens this site with a short-lived key (`?preview=…`), which shows drafts. Visitors never get a key and only see published content.
For the admin to display this site inside its Preview frame, set the Netlify variable **`ADMIN_ORIGIN`** to the admin's address (for example `https://your-admin.netlify.app`) and redeploy.
Without it, the site refuses to be framed by anyone and the admin's Preview stays blank (the safe default).

## Run locally

```bash
npm install
cp .env.example .env
npm run dev
```

## Environment variables

| Variable | Value |
| --- | --- |
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | The **publishable** key only. Never a secret or service-role key |
| `VITE_STORE_SLUG` | The brand's Store ID in the admin (for example `brand-a`) |
| `ADMIN_ORIGIN` | Netlify only (not `VITE_`). The admin's address, so the Preview can display this site |

To use this design for another brand, deploy a copy with a different `VITE_STORE_SLUG`.

## Deploy on Netlify

1. Put this folder in its own GitHub repository (the files at the top level, not inside a subfolder).
2. Netlify: Add new site → Import from GitHub. `netlify.toml` sets the build and routing.
3. Add the variables above, deploy, then add the domain under Domain management.

## Limits

Checkout has no bot protection or rate limiting yet; no order emails; the catalog loads in one request (up to 1,000 rows).
If the brand is suspended or archived in the admin, this site shows "Store unavailable".
