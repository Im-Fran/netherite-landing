import { Component, computed, ElementRef, input, resource, signal, viewChild } from '@angular/core';
import type { Lang, Strings } from './i18n';

// Same shape as Netherite's TemplateCatalog (templates/index.json, built by scripts/build-catalog.mjs).
export interface Entry {
  id: string;
  lang: string;
  name: string;
  description: string;
  symbol: string;
  tags: string[];
  path: string;
  body: string;
}

export const templateCatalog = () =>
  resource({
    loader: ({ abortSignal }) =>
      fetch('/templates/index.json', { signal: abortSignal }).then((r) => {
        if (!r.ok) throw new Error(`${r.status}`);
        return r.json() as Promise<{ templates: Entry[] }>;
      }),
  });

@Component({
  selector: 'app-template-gallery',
  template: `
    @let t = strings();
    <input
      type="search"
      [value]="query()"
      (input)="query.set($any($event.target).value)"
      [placeholder]="t.search"
      [attr.aria-label]="t.search"
      class="mx-auto block w-full max-w-md rounded-full border border-ink/15 bg-bg px-5 py-2.5 placeholder:text-muted focus:border-accent focus:outline-none"
    />
    @if (catalog.isLoading()) {
      <p class="mt-10 text-center text-muted" role="status">{{ t.loading }}</p>
    } @else if (catalog.error()) {
      <p class="mt-10 text-center text-muted" role="alert">
        {{ t.error }}
        <button type="button" (click)="catalog.reload()" class="ml-2 font-medium text-accent hover:underline">{{ t.retry }}</button>
      </p>
    } @else {
      <ul class="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        @for (e of filtered(); track e.id) {
          <li>
            <button type="button" (click)="open(e)" class="flex h-full w-full flex-col rounded-xl border border-ink/10 bg-bg p-5 text-left hover:border-accent/50 focus-visible:border-accent">
              <span class="font-semibold">{{ e.name }}</span>
              <span class="mt-1 text-sm text-muted">{{ e.description }}</span>
              <span class="mt-auto flex flex-wrap gap-2 pt-3 text-xs text-tag">
                @for (tag of e.tags; track tag) {
                  <span>#{{ tag }}</span>
                }
              </span>
            </button>
          </li>
        } @empty {
          <li class="col-span-full text-center text-muted">{{ t.empty }}</li>
        }
      </ul>
    }

    <dialog #dialog (close)="selected.set(null)" [attr.aria-labelledby]="'template-title'" class="m-auto w-[min(42rem,calc(100%-2rem))] rounded-2xl border border-ink/10 bg-bg p-0 text-ink shadow-2xl backdrop:bg-black/40">
      @if (selected(); as e) {
        <div class="flex items-start justify-between gap-4 border-b border-ink/10 p-5">
          <div>
            <h3 id="template-title" class="text-lg font-semibold">{{ e.name }}</h3>
            <p class="mt-1 text-sm text-muted">{{ e.description }}</p>
          </div>
          <button type="button" (click)="dialog.close()" [attr.aria-label]="t.close" class="rounded-md px-2 text-xl leading-none text-muted hover:text-ink">×</button>
        </div>
        <pre [attr.aria-label]="t.preview" class="max-h-[50vh] overflow-auto bg-surface p-5 font-mono text-sm leading-relaxed whitespace-pre-wrap">{{ e.body }}</pre>
        <div class="flex justify-end gap-3 p-5">
          <button type="button" (click)="copy(e)" class="rounded-full border border-ink/15 px-5 py-2 font-medium hover:bg-surface">
            <span aria-live="polite">{{ copied() ? t.copied : t.copy }}</span>
          </button>
          <button type="button" (click)="download(e)" class="rounded-full bg-accent px-5 py-2 font-medium text-on-accent hover:opacity-90">{{ t.download }}</button>
        </div>
      }
    </dialog>
  `,
})
export class TemplateGallery {
  readonly lang = input.required<Lang>();
  readonly strings = input.required<Strings['templates']>();

  readonly catalog = templateCatalog();

  // One entry per template in the page's language, else English (TemplateCatalog.entries(for:)).
  readonly entries = computed(() => {
    const groups = new Map<string, Entry[]>();
    for (const e of this.catalog.value()?.templates ?? []) groups.set(e.id, [...(groups.get(e.id) ?? []), e]);
    const lang = this.lang();
    return [...groups.values()]
      .map((g) => g.find((e) => e.lang === lang) ?? g.find((e) => e.lang === 'en') ?? g[0])
      .sort((a, b) => a.name.localeCompare(b.name, lang));
  });

  readonly query = signal('');
  readonly filtered = computed(() => {
    const q = this.query().trim().toLocaleLowerCase();
    if (!q) return this.entries();
    return this.entries().filter((e) => [e.name, e.description, ...e.tags].some((s) => s.toLocaleLowerCase().includes(q)));
  });

  readonly selected = signal<Entry | null>(null);
  readonly copied = signal(false);
  private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');

  open(e: Entry) {
    this.copied.set(false);
    this.selected.set(e);
    this.dialog().nativeElement.showModal();
  }

  async copy(e: Entry) {
    await navigator.clipboard.writeText(e.body);
    this.copied.set(true);
  }

  // The cleaned body (without template-* keys), named like the app names an installed template.
  download(e: Entry) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([e.body], { type: 'text/markdown' }));
    a.download = `${e.name.replace(/[\\/:*?"<>|#^[\]]/g, '').trim()}.md`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href));
  }
}
