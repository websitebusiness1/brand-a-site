import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { safeHref } from '@/lib/media';

/** Internal links stay in the app; only https links open elsewhere. Anything else is dropped. */
export default function SmartLink({ href, className, children }: { href: string | null | undefined; className: string; children: ReactNode }) {
  const t = safeHref(href);
  if (!t) return null;
  return t.external ? <a href={t.href} target="_blank" rel="noopener noreferrer" className={className}>{children}</a> : <Link to={t.href} className={className}>{children}</Link>;
}
