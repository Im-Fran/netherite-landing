import { Component, computed, ElementRef, input, viewChild } from '@angular/core';
import { compose, slug } from './catalog-format';
import { EditorOutput } from './editor-output';
import type { Lang, Strings } from './i18n';
import { persisted } from './persisted';
import { templateCatalog } from './template-gallery';

// Placeholders Templates.render fills in (NetheriteCore/Templates).
const PLACEHOLDERS = ['{{title}}', '{{date}}', '{{time}}', '{{date:dddd, D MMMM YYYY}}', '{{attendees}}'];

interface Draft {
  lang: Lang;
  name: string;
  /** Empty: derived from the name. */
  id: string;
  description: string;
  symbol: string;
  tags: string;
  body: string;
}

@Component({
  selector: 'app-template-editor',
  imports: [EditorOutput],
  template: `
    @let s = strings();
    @let d = draft();
    <div class="grid grid-cols-1 gap-8 lg:grid-cols-2">
      <form class="space-y-5" (submit)="$event.preventDefault()">
        <label class="block">
          <span class="text-sm font-medium">{{ startFrom() }}</span>
          <select (change)="start($any($event.target).value)" class="mt-1 block w-full rounded-lg border border-ink/15 bg-bg px-3 py-2">
            <option value="">{{ blank() }}</option>
            @for (e of catalog.value()?.templates; track e.path) {
              <option [value]="e.path">{{ e.name }} ({{ e.lang.toUpperCase() }})</option>
            }
          </select>
        </label>

        <div class="grid gap-4 sm:grid-cols-[1fr_8rem]">
          <label class="block">
            <span class="text-sm font-medium">{{ s.name }}</span>
            <input [value]="d.name" (input)="set('name', $any($event.target).value)" required class="mt-1 block w-full rounded-lg border border-ink/15 bg-bg px-3 py-2" />
          </label>
          <label class="block">
            <span class="text-sm font-medium">{{ s.language }}</span>
            <select (change)="set('lang', $any($event.target).value)" class="mt-1 block w-full rounded-lg border border-ink/15 bg-bg px-3 py-2">
              <option value="en" [selected]="d.lang === 'en'">English</option>
              <option value="es" [selected]="d.lang === 'es'">Español</option>
            </select>
          </label>
        </div>

        <label class="block">
          <span class="text-sm font-medium">{{ s.id }}</span>
          <input [value]="d.id" [placeholder]="slugOf(d.name)" (input)="set('id', $any($event.target).value.trim())" spellcheck="false" class="mt-1 block w-full rounded-lg border border-ink/15 bg-bg px-3 py-2 font-mono text-sm" />
          <span class="mt-1 block text-xs text-muted">{{ s.idHelp }}</span>
        </label>

        <label class="block">
          <span class="text-sm font-medium">{{ s.description }}</span>
          <input [value]="d.description" (input)="set('description', $any($event.target).value)" class="mt-1 block w-full rounded-lg border border-ink/15 bg-bg px-3 py-2" />
        </label>

        <div class="grid gap-4 sm:grid-cols-2">
          <label class="block">
            <span class="text-sm font-medium">{{ s.symbol }}</span>
            <input [value]="d.symbol" placeholder="doc.text" (input)="set('symbol', $any($event.target).value.trim())" spellcheck="false" class="mt-1 block w-full rounded-lg border border-ink/15 bg-bg px-3 py-2 font-mono text-sm" />
            <span class="mt-1 block text-xs text-muted">{{ s.symbolHelp }}</span>
          </label>
          <label class="block">
            <span class="text-sm font-medium">{{ s.tags }}</span>
            <input [value]="d.tags" (input)="set('tags', $any($event.target).value)" class="mt-1 block w-full rounded-lg border border-ink/15 bg-bg px-3 py-2" />
            <span class="mt-1 block text-xs text-muted">{{ s.tagsHelp }}</span>
          </label>
        </div>

        <div>
          <label for="template-body" class="text-sm font-medium">{{ s.body }}</label>
          <p class="mt-1 text-xs text-muted">{{ s.bodyHelp }}</p>
          <div class="mt-2 flex flex-wrap gap-2">
            @for (p of placeholders; track p) {
              <button type="button" (click)="insert(p)" [attr.aria-label]="s.insert.replace('{p}', p)" class="rounded-full border border-ink/15 px-3 py-1 font-mono text-xs hover:bg-surface">{{ p }}</button>
            }
          </div>
          <textarea
            #body
            id="template-body"
            [value]="d.body"
            (input)="set('body', $any($event.target).value)"
            rows="16"
            spellcheck="false"
            class="mt-2 block w-full rounded-lg border border-ink/15 bg-bg px-3 py-2 font-mono text-sm leading-relaxed"
          ></textarea>
        </div>
      </form>

      <div class="space-y-6 lg:sticky lg:top-20 lg:self-start">
        @if (problem(); as p) {
          <p class="rounded-xl border border-ink/15 bg-mark/40 px-4 py-3 text-sm" role="alert">{{ p }}</p>
        }
        <app-editor-output [strings]="output()" [path]="path()" [content]="file()" [problem]="!!problem()" />
      </div>
    </div>
  `,
})
export class TemplateEditor {
  readonly lang = input.required<Lang>();
  readonly strings = input.required<Strings['editor']['template']>();
  readonly output = input.required<Strings['editor']['output']>();
  readonly startFrom = input.required<string>();
  readonly blank = input.required<string>();

  readonly placeholders = PLACEHOLDERS;
  readonly slugOf = slug;
  readonly catalog = templateCatalog();
  readonly draft = persisted<Draft>('editor.template', {
    lang: 'en',
    name: '',
    id: '',
    description: '',
    symbol: '',
    tags: '',
    body: '# {{title}}\n\n',
  });
  private readonly body = viewChild.required<ElementRef<HTMLTextAreaElement>>('body');

  readonly id = computed(() => this.draft().id || slug(this.draft().name));
  readonly path = computed(() => `public/templates/${this.draft().lang}/${this.id() || 'untitled'}.md`);
  readonly file = computed(() => {
    const d = this.draft();
    const body = d.body.endsWith('\n') ? d.body : `${d.body}\n`;
    return compose({ name: d.name, description: d.description, symbol: d.symbol, tags: d.tags }, body);
  });

  readonly problem = computed(() => {
    const s = this.strings();
    const d = this.draft();
    const id = this.id();
    const templates = this.catalog.value()?.templates ?? [];
    if (!d.name.trim()) return s.needsName;
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(id)) return s.badId;
    if (templates.some((e) => e.id === id && e.lang === d.lang)) return s.exists;
    if (d.lang !== 'en' && !templates.some((e) => e.id === id && e.lang === 'en')) return s.needsEnglish;
    return null;
  });

  set<K extends keyof Draft>(key: K, value: Draft[K]) {
    this.draft.update((d) => ({ ...d, [key]: value }));
  }

  insert(text: string) {
    const el = this.body().nativeElement;
    el.setRangeText(text, el.selectionStart, el.selectionEnd, 'end');
    el.focus();
    this.set('body', el.value);
  }

  start(path: string) {
    const e = this.catalog.value()?.templates.find((t) => t.path === path);
    this.draft.set(
      e
        ? { lang: e.lang as Lang, name: e.name, id: e.id, description: e.description, symbol: e.symbol, tags: e.tags.join(', '), body: e.body }
        : { lang: this.lang(), name: '', id: '', description: '', symbol: '', tags: '', body: '# {{title}}\n\n' },
    );
  }
}
