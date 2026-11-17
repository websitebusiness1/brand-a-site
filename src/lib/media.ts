import { supabase } from './supabase';

/** Lookbook photos, videos, thumbnails and homepage images live in the public "site-media" bucket. */
export const publicMediaUrl = (path: string | null | undefined): string | null =>
  path ? supabase.storage.from('site-media').getPublicUrl(path).data.publicUrl : null;

/** Internal links ("/shop") and https links only. Anything else is ignored. */
export const safeHref = (href: string | null | undefined): { href: string; external: boolean } | null => {
  if (!href) return null;
  if (/^\/[^\s/]/.test(href) || href === '/') return { href, external: false };
  if (/^https:\/\/\S+$/i.test(href)) return { href, external: true };
  return null;
};
