/** Scrolling text band. `tone="accent"` is the loud promo band; the default is the quiet announcement bar. */
export default function Marquee({ text, tone = 'quiet' }: { text: string; tone?: 'quiet' | 'accent' }) {
  const row = Array.from({ length: 8 }, (_, i) => <span key={i} className="px-8">{text}<span aria-hidden className="pl-8 opacity-50">✕</span></span>);
  const cls = tone === 'accent'
    ? 'bg-accent py-4 text-lg font-bold uppercase tracking-[0.14em] sm:text-2xl'
    : 'border-b border-white/15 bg-ink py-2.5 text-xs font-medium uppercase tracking-[0.18em]';
  return (
    <div className={`marquee nav-font overflow-hidden whitespace-nowrap ${cls}`} role="note" aria-label={text}>
      <div className="marquee-track inline-flex" aria-hidden>
        <div className="flex">{row}</div>
        <div className="flex">{row}</div>
      </div>
    </div>
  );
}
