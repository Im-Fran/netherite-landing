import { Component, input } from '@angular/core';

export interface Pair {
  light: string;
  dark: string;
}

export type ColorKey = 'accent' | 'link' | 'tag' | 'highlight' | 'background';
export type CalloutKey = 'note' | 'tip' | 'warning' | 'danger' | 'example' | 'quote';
export type Mode = 'light' | 'dark';

// Netherite's Theme JSON (NetheriteCore/Vault/Theme.swift).
export interface Theme extends Partial<Record<ColorKey, Pair>> {
  name: string;
  appearance?: Mode;
  callouts?: Partial<Record<CalloutKey, Pair>>;
  textFont?: string;
  monoFont?: string;
  fontScale?: number;
  lineHeight?: number;
}

// What the app uses for colors a theme leaves out (src/styles.css, EditorStyler.calloutColor).
export const DEFAULTS: Record<Mode, Record<ColorKey | 'text', string>> = {
  light: { background: '#FFFFFF', text: '#1D1D1F', accent: '#635385', link: '#5B4A8E', tag: '#6E5A9E', highlight: '#F4E27A' },
  dark: { background: '#1E1E1E', text: '#E8E8ED', accent: '#B09EDB', link: '#B7A6E6', tag: '#C4B5F0', highlight: '#6B5B1F' },
};
export const CALLOUT_DEFAULTS: Record<CalloutKey, Pair> = {
  note: { light: '#007AFF', dark: '#0A84FF' },
  tip: { light: '#34C759', dark: '#30D158' },
  warning: { light: '#FF9500', dark: '#FF9F0A' },
  danger: { light: '#FF3B30', dark: '#FF453A' },
  example: { light: '#AF52DE', dark: '#BF5AF2' },
  quote: { light: '#8E8E93', dark: '#98989D' },
};

export function color(theme: Theme, key: ColorKey, mode: Mode): string {
  return theme[key]?.[mode] ?? DEFAULTS[mode][key];
}

/** A theme's colors on a note, side by side in light and dark (or only the mode it forces). */
@Component({
  selector: 'app-theme-preview',
  template: `
    @let t = theme();
    @let s = strings();
    <div class="grid" [class.grid-cols-2]="modes().length === 2">
      @for (mode of modes(); track mode) {
        <div
          [style.background]="color(t, 'background', mode)"
          [style.color]="defaults[mode].text"
          [style.font-family]="font(t)"
          [style.font-size.em]="t.fontScale ?? 1"
          [style.line-height]="t.lineHeight ?? null"
          class="p-4 text-sm"
        >
          <span class="text-xs font-semibold tracking-wide uppercase opacity-60">{{ mode === 'light' ? s.light : s.dark }}</span>
          <p class="mt-2 leading-relaxed" [style.line-height]="t.lineHeight ?? null">
            {{ s.sample }} <span [style.color]="color(t, 'link', mode)" class="underline underline-offset-2">{{ s.link }}</span>,
            <span [style.color]="color(t, 'tag', mode)">{{ s.tag }}</span> ·
            <mark [style.background]="color(t, 'highlight', mode)" [style.color]="defaults[mode].text" class="rounded px-1">{{ s.mark }}</mark>
          </p>
          <span [style.background]="color(t, 'accent', mode)" [style.color]="color(t, 'background', mode)" class="mt-3 inline-block rounded-full px-3 py-0.5 text-xs font-medium">Aa</span>
          @if (callouts()) {
            <div class="mt-3 space-y-1.5">
              @for (c of callouts(); track c[0]) {
                @let pair = t.callouts?.[c[0]] ?? calloutDefaults[c[0]];
                <p class="rounded border-l-4 px-2 py-1 text-xs" [style.border-color]="pair[mode]" [style.background]="pair[mode] + '1F'">
                  <span class="font-semibold" [style.color]="pair[mode]">{{ c[1] }}</span>
                </p>
              }
            </div>
          }
        </div>
      }
    </div>
  `,
})
export class ThemePreview {
  readonly theme = input.required<Theme>();
  readonly strings = input.required<{ light: string; dark: string; sample: string; link: string; tag: string; mark: string }>();
  /** Callout keys with their labels, to show them too. */
  readonly callouts = input<[CalloutKey, string][]>();

  readonly defaults = DEFAULTS;
  readonly calloutDefaults = CALLOUT_DEFAULTS;
  readonly color = color;

  font(t: Theme) {
    return t.textFont ? `"${t.textFont}", system-ui, sans-serif` : null;
  }

  modes(): Mode[] {
    const a = this.theme().appearance;
    return a ? [a] : ['light', 'dark'];
  }
}
