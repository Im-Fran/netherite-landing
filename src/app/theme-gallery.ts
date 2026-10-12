import { Component, input, resource } from '@angular/core';
import type { Strings } from './i18n';
import { type Theme, ThemePreview } from './theme-preview';

/** An entry of themes/index.json (built by scripts/build-catalog.mjs). */
export type CatalogTheme = Theme & { id: string; path: string };

export const themeCatalog = () =>
  resource({
    loader: ({ abortSignal }) =>
      fetch('/themes/index.json', { signal: abortSignal }).then((r) => {
        if (!r.ok) throw new Error(`${r.status}`);
        return r.json() as Promise<{ themes: CatalogTheme[] }>;
      }),
  });

@Component({
  selector: 'app-theme-gallery',
  imports: [ThemePreview],
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
            <app-theme-preview [theme]="theme" [strings]="t" />
            <div class="flex items-center justify-between border-t border-ink/10 px-4 py-3">
              <span class="font-semibold">{{ theme.name }}</span>
              <a [href]="'/' + theme.path" [download]="theme.name + '.json'" class="text-sm font-medium text-accent hover:underline">{{ t.download }}</a>
            </div>
          </li>
        }
      </ul>
    }
  `,
})
export class ThemeGallery {
  readonly strings = input.required<Strings['themes']>();
  readonly themes = themeCatalog();
}
