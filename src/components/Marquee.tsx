export default function Marquee({ text }: { text: string }) {
  const row = Array.from({ length: 6 }, (_, i) => <span key={i} className="px-10">{text}<span aria-hidden className="pl-10 text-white/50">|</span></span>);
  return (
    <div className="overflow-hidden whitespace-nowrap border-b border-white/15 bg-ink py-3 text-sm font-medium uppercase tracking-[0.12em]" role="note" aria-label={text}>
      <div className="marquee-track inline-flex" aria-hidden>
        <div className="flex">{row}</div>
        <div className="flex">{row}</div>
      </div>
    </div>
  );
}
