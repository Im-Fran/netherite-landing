import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { contrast, slug } from './catalog-format';
import { EditorOutput } from './editor-output';
import type { Lang, Strings } from './i18n';
import { persisted } from './persisted';
import { themeCatalog } from './theme-gallery';
import { CALLOUT_DEFAULTS, type CalloutKey, type ColorKey, DEFAULTS, type Mode, type Pair, type Theme, ThemePreview } from './theme-preview';

const COLORS: ColorKey[] = ['accent', 'link', 'tag', 'highlight', 'background'];
const CALLOUTS: CalloutKey[] = ['note', 'tip', 'warning', 'danger', 'example', 'quote'];
const MODES: Mode[] = ['light', 'dark'];
// Theme.tones in NetheriteCore; the app drops custom themes named like one of these (or its Light/Dark variant).
const TONES = ['Netherite', 'Ocean', 'Forest', 'Ember', 'Rose', 'Graphite', 'System'];
// What the app checks accent, link and tag against when a theme has no background (ThemeAccessibility.swift).
const SURFACES: Pair = { light: '#F2F2F7', dark: '#2C2C2E' };

@Component({
  selector: 'app-theme-editor',
  imports: [EditorOutput, NgTemplateOutlet, ThemePreview],
  template: `
    @let s = strings();
    @let t = theme();
    <div class="grid grid-cols-1 gap-8 lg:grid-cols-2">
      <form class="space-y-6" (submit)="$event.preventDefault()">
        <label class="block">
          <span class="text-sm font-medium">{{ startFrom() }}</span>
          <select (change)="start($any($event.target).value)" class="mt-1 block w-full rounded-lg border border-ink/15 bg-bg px-3 py-2">
            <option value="">{{ blank() }}</option>
            @for (c of catalog.value()?.themes; track c.id) {
              <option [value]="c.id">{{ c.name }}</option>
            }
          </select>
        </label>

        <div class="grid gap-4 sm:grid-cols-2">
          <label class="block">
            <span class="text-sm font-medium">{{ s.name }}</span>
            <input [value]="t.name" (input)="set('name', $any($event.target).value)" required class="mt-1 block w-full rounded-lg border border-ink/15 bg-bg px-3 py-2" />
          </label>
          <label class="block">
            <span class="text-sm font-medium">{{ s.appearance }}</span>
            <select (change)="set('appearance', $any($event.target).value || undefined)" class="mt-1 block w-full rounded-lg border border-ink/15 bg-bg px-3 py-2">
              <option value="" [selected]="!t.appearance">{{ s.auto }}</option>
              <option value="light" [selected]="t.appearance === 'light'">{{ s.light }}</option>
              <option value="dark" [selected]="t.appearance === 'dark'">{{ s.dark }}</option>
            </select>
          </label>
        </div>

        <fieldset>
          <legend class="text-sm font-medium">{{ s.colors }}</legend>
          <div class="mt-2 divide-y divide-ink/10 rounded-xl border border-ink/10">
            @for (key of colors; track key) {
              <ng-container *ngTemplateOutlet="pair; context: { label: s.colorNames[key], value: t[key], fallback: fallback(key), key }" />
            }
          </div>
        </fieldset>

        <details class="rounded-xl border border-ink/10">
          <summary class="cursor-pointer px-4 py-3 text-sm font-medium">{{ s.callouts }}</summary>
          <div class="divide-y divide-ink/10 border-t border-ink/10">
            @for (key of callouts; track key) {
              <ng-container *ngTemplateOutlet="pair; context: { label: s.calloutNames[key], value: t.callouts?.[key], fallback: calloutDefaults[key], key }" />
            }
          </div>
        </details>

        <details class="rounded-xl border border-ink/10">
          <summary class="cursor-pointer px-4 py-3 text-sm font-medium">{{ s.typography }}</summary>
          <div class="grid gap-4 border-t border-ink/10 p-4 sm:grid-cols-2">
            <label class="block">
              <span class="text-sm">{{ s.textFont }}</span>
              <input [value]="t.textFont ?? ''" (input)="set('textFont', $any($event.target).value.trim() || undefined)" class="mt-1 block w-full rounded-lg border border-ink/15 bg-bg px-3 py-2" />
            </label>
            <label class="block">
              <span class="text-sm">{{ s.monoFont }}</span>
              <input [value]="t.monoFont ?? ''" (input)="set('monoFont', $any($event.target).value.trim() || undefined)" class="mt-1 block w-full rounded-lg border border-ink/15 bg-bg px-3 py-2" />
            </label>
            <p class="text-xs text-muted sm:col-span-2">{{ s.fontHelp }}</p>
            <label class="block">
              <span class="text-sm">{{ s.fontScale }}</span>
              <input type="number" min="0.8" max="1.6" step="0.05" [placeholder]="s.unset + ' (1)'" [value]="t.fontScale ?? ''" (input)="setNumber('fontScale', $any($event.target).value)" class="mt-1 block w-full rounded-lg border border-ink/15 bg-bg px-3 py-2" />
            </label>
            <label class="block">
              <span class="text-sm">{{ s.lineHeight }}</span>
              <input type="number" min="1" max="2" step="0.05" [placeholder]="s.unset + ' (1.25)'" [value]="t.lineHeight ?? ''" (input)="setNumber('lineHeight', $any($event.target).value)" class="mt-1 block w-full rounded-lg border border-ink/15 bg-bg px-3 py-2" />
            </label>
          </div>
        </details>
      </form>

      <div class="space-y-6 lg:sticky lg:top-20 lg:self-start">
        <section [attr.aria-label]="s.preview" class="overflow-hidden rounded-2xl border border-ink/10">
          <app-theme-preview [theme]="t" [strings]="s" [callouts]="calloutLabels()" />
        </section>

        <section class="rounded-2xl border border-ink/10 p-4 text-sm" aria-live="polite">
          <h3 class="font-semibold">{{ s.contrast }}</h3>
          @if (warnings().length) {
            <ul class="mt-2 list-disc space-y-1 pl-5">
              @for (w of warnings(); track w) {
                <li>{{ w }}</li>
              }
            </ul>
            <p class="mt-2 text-muted">{{ s.contrastNote }}</p>
          } @else {
            <p class="mt-1 text-muted">{{ s.contrastOk }}</p>
          }
        </section>

        @if (problem(); as p) {
          <p class="rounded-xl border border-ink/15 bg-mark/40 px-4 py-3 text-sm" role="alert">{{ p }}</p>
        }
        <app-editor-output [strings]="output()" [path]="path()" [content]="json()" [problem]="!!problem()" />
      </div>
    </div>

    <ng-template #pair let-label="label" let-value="value" let-fallback="fallback" let-key="key">
      <div class="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
        <label class="flex min-w-36 flex-1 items-center gap-2 text-sm">
          <input type="checkbox" [checked]="!!value" (change)="setPair(key, $any($event.target).checked ? { ...fallback } : undefined)" class="size-4 accent-accent" />
          {{ label }}
        </label>
        @for (mode of modes; track mode) {
          <label class="flex items-center gap-2 text-xs text-muted">
            <input
              type="color"
              [value]="(value ?? fallback)[mode].toLowerCase()"
              [disabled]="!value"
              (input)="paint(key, value, mode, $any($event.target).value)"
              [attr.aria-label]="label + ', ' + (mode === 'light' ? s.light : s.dark)"
              class="h-8 w-10 cursor-pointer rounded border border-ink/15 bg-transparent disabled:cursor-not-allowed disabled:opacity-40"
            />
            {{ mode === 'light' ? s.light : s.dark }}
          </label>
        }
      </div>
    </ng-template>
  `,
})
export class ThemeEditor {
  readonly lang = input.required<Lang>();
  readonly strings = input.required<Strings['editor']['theme']>();
  readonly output = input.required<Strings['editor']['output']>();
  readonly startFrom = input.required<string>();
  readonly blank = input.required<string>();

  readonly colors = COLORS;
  readonly callouts = CALLOUTS;
  readonly modes = MODES;
  readonly calloutDefaults = CALLOUT_DEFAULTS;
  readonly catalog = themeCatalog();
  readonly theme = persisted<Theme>('editor.theme', { name: '' });

  readonly calloutLabels = computed(() => CALLOUTS.map((k) => [k, this.strings().calloutNames[k]] as [CalloutKey, string]));
  readonly id = computed(() => slug(this.theme().name));
  readonly path = computed(() => `public/themes/${this.id() || 'untitled'}.json`);

  /** The theme as the app stores it: Theme.swift's field order, only what's set. */
  readonly json = computed(() => {
    const { name, appearance, callouts, textFont, monoFont, fontScale, lineHeight, ...colors } = this.theme();
    const ordered: Theme = { name: name.trim(), appearance };
    for (const k of COLORS) ordered[k] = colors[k];
    Object.assign(ordered, { callouts: callouts && Object.keys(callouts).length ? callouts : undefined, textFont, monoFont, fontScale, lineHeight });
    return JSON.stringify(ordered, null, 2) + '\n';
  });

  readonly problem = computed(() => {
    const s = this.strings();
    const name = this.theme().name.trim();
    if (!this.id()) return s.needsName;
    if (TONES.some((t) => [t, `${t} Light`, `${t} Dark`].includes(name))) return s.builtIn;
    if (this.catalog.value()?.themes.some((t) => t.id === this.id())) return s.exists;
    return null;
  });

  readonly warnings = computed(() => {
    const t = this.theme();
    const s = this.strings();
    const out: string[] = [];
    const bg = t.background ?? SURFACES;
    const ratio = new Intl.NumberFormat(this.lang(), { maximumFractionDigits: 1 });
    for (const mode of this.modesShown()) {
      const label = mode === 'light' ? s.light : s.dark;
      for (const k of ['accent', 'link', 'tag'] as const) {
        const c = t[k]?.[mode];
        const r = c && contrast(c, bg[mode]);
        if (r && r < 4.5) out.push(s.lowColor.replace('{color}', s.colorNames[k]).replace('{mode}', label).replace('{ratio}', ratio.format(r)));
      }
      const h = t.highlight?.[mode];
      const r = h && contrast(h, DEFAULTS[mode].text);
      if (r && r < 4.5) out.push(s.lowHighlight.replace('{mode}', label).replace('{ratio}', ratio.format(r)));
    }
    return out;
  });

  private modesShown(): Mode[] {
    const a = this.theme().appearance;
    return a ? [a] : MODES;
  }

  fallback(key: ColorKey): Pair {
    return { light: DEFAULTS.light[key], dark: DEFAULTS.dark[key] };
  }

  set<K extends keyof Theme>(key: K, value: Theme[K]) {
    this.theme.update((t) => ({ ...t, [key]: value }));
  }

  /** Sets or clears a color pair; callout keys go under `callouts`. */
  setPair(key: ColorKey | CalloutKey, value: Pair | undefined) {
    if ((COLORS as string[]).includes(key)) return this.set(key as ColorKey, value);
    this.theme.update((t) => {
      const callouts = { ...t.callouts, [key]: value };
      if (!value) delete callouts[key as CalloutKey];
      return { ...t, callouts };
    });
  }

  paint(key: ColorKey | CalloutKey, pair: Pair, mode: Mode, hex: string) {
    this.setPair(key, { ...pair, [mode]: hex.toUpperCase() });
  }

  setNumber(key: 'fontScale' | 'lineHeight', raw: string) {
    const n = parseFloat(raw);
    this.set(key, Number.isFinite(n) && n > 0 ? n : undefined);
  }

  start(id: string) {
    const found = this.catalog.value()?.themes.find((t) => t.id === id);
    if (!found) return this.theme.set({ name: '' });
    const { id: _, path, ...theme } = found;
    this.theme.set({ ...theme, name: '' });
  }
}
