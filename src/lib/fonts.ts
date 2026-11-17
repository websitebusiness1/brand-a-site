// Curated Google Fonts. Only these can be chosen, and each lists the weights that really exist
// (asking Google for a weight a font doesn't have makes the whole request fail).
export interface FontDef { family: string; weights: number[]; group: 'Display' | 'Sans-serif' | 'Serif' }

const W4 = [400, 500, 600, 700];
export const FONTS: FontDef[] = [
  { family: 'Anton', weights: [400], group: 'Display' },
  { family: 'Bebas Neue', weights: [400], group: 'Display' },
  { family: 'Archivo Black', weights: [400], group: 'Display' },
  { family: 'Oswald', weights: W4, group: 'Display' },
  { family: 'Unbounded', weights: W4, group: 'Display' },
  { family: 'Syne', weights: [400, 500, 600, 700, 800], group: 'Display' },
  { family: 'Barlow Condensed', weights: W4, group: 'Display' },
  { family: 'Space Grotesk', weights: W4, group: 'Display' },
  { family: 'Archivo', weights: [400, 500, 600, 700, 800], group: 'Sans-serif' },
  { family: 'Inter', weights: W4, group: 'Sans-serif' },
  { family: 'Instrument Sans', weights: W4, group: 'Sans-serif' },
  { family: 'Assistant', weights: W4, group: 'Sans-serif' },
  { family: 'Hanken Grotesk', weights: W4, group: 'Sans-serif' },
  { family: 'Familjen Grotesk', weights: W4, group: 'Sans-serif' },
  { family: 'Manrope', weights: W4, group: 'Sans-serif' },
  { family: 'DM Sans', weights: W4, group: 'Sans-serif' },
  { family: 'Work Sans', weights: W4, group: 'Sans-serif' },
  { family: 'Jost', weights: W4, group: 'Sans-serif' },
  { family: 'Montserrat', weights: W4, group: 'Sans-serif' },
  { family: 'Poppins', weights: W4, group: 'Sans-serif' },
  { family: 'Raleway', weights: W4, group: 'Sans-serif' },
  { family: 'Rubik', weights: W4, group: 'Sans-serif' },
  { family: 'Josefin Sans', weights: W4, group: 'Sans-serif' },
  { family: 'Roboto', weights: [400, 500, 700], group: 'Sans-serif' },
  { family: 'Playfair Display', weights: W4, group: 'Serif' },
  { family: 'Bodoni Moda', weights: W4, group: 'Serif' },
  { family: 'Cormorant Garamond', weights: W4, group: 'Serif' },
  { family: 'DM Serif Display', weights: [400], group: 'Serif' },
  { family: 'Lora', weights: W4, group: 'Serif' },
  { family: 'Libre Baskerville', weights: [400, 700], group: 'Serif' },
];

export const ROLES = [
  { key: 'heading', label: 'Headings', hint: 'Large titles and section headings' },
  { key: 'body', label: 'Body text', hint: 'Paragraphs and descriptions' },
  { key: 'nav', label: 'Navigation', hint: 'Menu and links' },
  { key: 'button', label: 'Buttons', hint: 'Buttons and labels' },
] as const;
export type FontRole = (typeof ROLES)[number]['key'];
export type FontsConfig = Partial<Record<FontRole, { family: string; weights: string }>>;

export const findFont = (family: string) => FONTS.find((f) => f.family === family);

/** The weights we request for a font: 400-700 where they exist, so regular, medium, semibold and bold all work. */
export const weightsFor = (f: FontDef) => f.weights.join(';');

export function googleFontsUrl(families: string[]): string | null {
  const defs = Array.from(new Set(families)).map(findFont).filter((f): f is FontDef => Boolean(f));
  if (defs.length === 0) return null;
  const parts = defs.map((f) => `family=${encodeURIComponent(f.family).replace(/%20/g, '+')}:wght@${weightsFor(f)}`);
  return `https://fonts.googleapis.com/css2?${parts.join('&')}&display=swap`;
}

export const cssFamily = (family: string) => `'${family}', system-ui, sans-serif`;
