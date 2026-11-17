// Runs after the build. Writes dist/_headers so Netlify lets ONLY the admin (ADMIN_ORIGIN) show this site inside its Preview.
// With no ADMIN_ORIGIN set, the site can't be framed by anyone (the safe default), and the admin's Preview stays blank.
import { writeFileSync, mkdirSync } from 'node:fs';

const raw = (process.env.ADMIN_ORIGIN || '').trim().replace(/\/+$/, '');
const ok = /^https:\/\/[a-z0-9.-]+(:\d+)?$/i.test(raw);
if (raw && !ok) console.warn(`ADMIN_ORIGIN "${raw}" is not a valid https origin (example: https://my-admin.netlify.app). Ignoring it.`);
const ancestors = ok ? `'self' ${raw}` : `'self'`;

mkdirSync('dist', { recursive: true });
writeFileSync('dist/_headers', `/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Content-Security-Policy: frame-ancestors ${ancestors}
`);
console.log(`Wrote dist/_headers (frame-ancestors ${ancestors})`);
