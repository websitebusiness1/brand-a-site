const HEX = /^#[0-9a-f]{6}$/i;
const lum = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  const c = (v: number) => { const s = v / 255; return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4); };
  return 0.2126 * c((n >> 16) & 255) + 0.7152 * c((n >> 8) & 255) + 0.0722 * c(n & 255);
};
const ratio = (a: string, b: string) => { const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x); return (hi + 0.05) / (lo + 0.05); };

/** The brand's accent color, used for highlights. A strict #rrggbb only, and never one that is hard to read on black. */
export function applyAccent(raw: unknown) {
  const root = document.documentElement.style;
  const ok = typeof raw === 'string' && HEX.test(raw) && ratio(raw, '#000000') >= 4.5;
  const accent = ok ? (raw as string).toLowerCase() : '#f4f4f2';
  root.setProperty('--accent', accent);
  root.setProperty('--on-accent', ratio(accent, '#ffffff') >= ratio(accent, '#000000') ? '#ffffff' : '#000000');
}
