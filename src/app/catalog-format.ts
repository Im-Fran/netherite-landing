// Catalog file formats, shared by the editor and scripts/build-catalog.mjs (Node runs this file directly,
// so keep it to erasable TypeScript: no enums, namespaces or parameter properties).

export type Meta = Record<string, string>;

/** Splits a template file into [metadata without the `template-` prefix, installable body]. */
export function parse(text: string): [Meta, string] {
  const lines = text.split('\n');
  if (lines[0]?.trim() !== '---') return [{}, text];
  const end = lines.findIndex((l, i) => i > 0 && l.trim() === '---');
  if (end < 0) return [{}, text];
  const meta: Meta = {};
  const kept: string[] = [];
  for (const line of lines.slice(1, end)) {
    const i = line.indexOf(':');
    const key = line.slice(0, i).trim();
    if (i >= 0 && key.startsWith('template-')) meta[key.slice('template-'.length)] = line.slice(i + 1).trim();
    else kept.push(line);
  }
  const rest = lines.slice(end + 1).join('\n');
  return [meta, kept.length ? `---\n${kept.join('\n')}\n---\n${rest}` : rest.replace(/^\n+/, '')];
}

/** The inverse of `parse`: puts the `template-*` keys first in the body's frontmatter, adding one if needed. */
export function compose(meta: Meta, body: string): string {
  const head = Object.entries(meta)
    .map(([k, v]) => [k, v.replace(/\s+/g, ' ').trim()])
    .filter(([, v]) => v)
    .map(([k, v]) => `template-${k}: ${v}`);
  const [, inner] = /^---\n([\s\S]*?\n)?---\n/.exec(body) ?? [];
  if (inner !== undefined || /^---\n---\n/.test(body)) return `---\n${head.join('\n')}\n${body.slice(4)}`;
  return `---\n${head.join('\n')}\n---\n${body}`;
}

/** A file name for an id: lowercase ASCII words joined by dashes ("Reunión 1:1" → "reunion-1-1"). */
export function slug(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/** WCAG 2 contrast ratio of two `#RRGGBB` colors (1–21), as the app's ThemeAccessibility computes it. */
export function contrast(a: string, b: string): number {
  const lum = (hex: string) => {
    const v = parseInt(hex.slice(1, 7), 16);
    const lin = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
    return 0.2126 * lin(((v >> 16) & 255) / 255) + 0.7152 * lin(((v >> 8) & 255) / 255) + 0.0722 * lin((v & 255) / 255);
  };
  const [x, y] = [lum(a), lum(b)];
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}
