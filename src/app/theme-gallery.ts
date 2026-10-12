import { Component, input, resource } from '@angular/core';
import type { Strings } from './i18n';

interface Pair {
  light: string;
  dark: string;
}

// Netherite's Theme JSON (themes/index.json, built by scripts/build-catalog.mjs).
interface Theme {
  id: string;
  path: string;
  name: string;
  accent?: Pair;
  link?: Pair;
  tag?: Pair;
  highlight?: Pair;
  background?: Pair;
}

// Fallbacks for colors a theme leaves out: the app's defaults (src/styles.css).
const DEFAULTS = {
  light: { bg: '#ffffff', text: '#1d1d1f', accent: '#635385', link: '#5b4a8e', tag: '#6e5a9e', highlight: '#f4e27a' },
  dark: { bg: '#1e1e1e', text: '#e8e8ed', accent: '#b09edb', link: '#b7a6e6', tag: '#c4b5f0', highlight: '#6b5b1f' },
};

@Component({
  selector: 'app-theme-gallery',
  template: `
    @let t = strings();
    @if (themes.isLoading()) {
      <p class="text-center text-muted" role="status">{{ t.loading }}</p>
    } @else if (themes.error()) {
      <p class="text-center text-muted" role="alert">
        {{ t.error }}
        <button type="button" (click)="themes.reload()" class="ml-2 font-medium text-accent hover:underline">{{ t.retry }}</button>
      </p>
    } @else {
      <ul class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        @for (theme of themes.value()?.themes; track theme.id) {
          <li class="overflow-hidden rounded-xl border border-ink/10 bg-bg">
            <div class="grid grid-cols-2">
              @for (mode of modes; track mode) {
                @let c = colors(theme, mode);
                <div [style.background]="c.bg" [style.color]="c.text" class="p-4 text-sm">
                  <span class="text-xs font-semibold tracking-wide uppercase opacity-60">{{ mode === 'light' ? t.light : t.dark }}</span>
                  <p class="mt-2 leading-relaxed">
                    {{ t.sample }} <span [style.color]="c.link" class="underline underline-offset-2">{{ t.link }}</span>,
                    <span [style.color]="c.tag">{{ t.tag }}</span> ·
                    <mark [style.background]="c.highlight" [style.color]="c.text" class="rounded px-1">{{ t.mark }}</mark>
                  </p>
                  <span [style.background]="c.accent" [style.color]="c.bg" class="mt-3 inline-block rounded-full px-3 py-0.5 text-xs font-medium">Aa</span>
                </div>
              }
            </div>
            <div class="flex items-center justify-between border-t border-ink/10 px-4 py-3">
              <span class="font-semibold">{{ theme.name }}</span>
              <a [href]="theme.path" [download]="theme.name + '.json'" class="text-sm font-medium text-accent hover:underline">{{ t.download }}</a>
            </div>
          </li>
        }
      </ul>
    }
  `,
})
export class ThemeGallery {
  readonly strings = input.required<Strings['themes']>();
  readonly modes = ['light', 'dark'] as const;

  readonly themes = resource({
    loader: ({ abortSignal }) =>
      fetch('themes/index.json', { signal: abortSignal }).then((r) => {
        if (!r.ok) throw new Error(`${r.status}`);
        return r.json() as Promise<{ themes: Theme[] }>;
      }),
  });

  colors(theme: Theme, mode: 'light' | 'dark') {
    const d = DEFAULTS[mode];
    return {
      bg: theme.background?.[mode] ?? d.bg,
      text: d.text,
      accent: theme.accent?.[mode] ?? d.accent,
      link: theme.link?.[mode] ?? d.link,
      tag: theme.tag?.[mode] ?? d.tag,
      highlight: theme.highlight?.[mode] ?? d.highlight,
    };
  }
}
