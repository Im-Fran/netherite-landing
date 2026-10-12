import { Component, input, signal } from '@angular/core';
import type { Lang, Strings } from './i18n';
import { TemplateEditor } from './template-editor';
import { ThemeEditor } from './theme-editor';

type Tab = 'theme' | 'template';

const tabFromHash = (): Tab => (location.hash === '#template' ? 'template' : 'theme');

/** /editor: build a theme or template in the browser, then download it or propose it on GitHub. No sign-in. */
@Component({
  selector: 'app-editor',
  imports: [TemplateEditor, ThemeEditor],
  template: `
    @let s = strings();
    <div class="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <h1 class="text-3xl font-bold tracking-tight sm:text-4xl">{{ s.title }}</h1>
      <p class="mt-3 max-w-3xl text-lg text-muted">{{ s.subtitle }}</p>

      <div role="tablist" [attr.aria-label]="s.tabs.label" class="mt-8 inline-flex rounded-full border border-ink/15 p-1">
        @for (id of tabs; track id) {
          <button
            type="button"
            role="tab"
            [id]="'tab-' + id"
            [attr.aria-selected]="tab() === id"
            [attr.aria-controls]="'panel-' + id"
            [tabIndex]="tab() === id ? 0 : -1"
            (click)="select(id)"
            (keydown.arrowLeft)="select(other(id), true)"
            (keydown.arrowRight)="select(other(id), true)"
            [class]="tab() === id ? 'bg-accent text-on-accent' : 'text-muted hover:text-ink'"
            class="rounded-full px-5 py-1.5 font-medium"
          >
            {{ s.tabs[id] }}
          </button>
        }
      </div>

      <div role="tabpanel" [id]="'panel-' + tab()" [attr.aria-labelledby]="'tab-' + tab()" class="mt-8">
        @if (tab() === 'theme') {
          <app-theme-editor [lang]="lang()" [strings]="s.theme" [output]="s.output" [startFrom]="s.startFrom" [blank]="s.blank" />
        } @else {
          <app-template-editor [lang]="lang()" [strings]="s.template" [output]="s.output" [startFrom]="s.startFrom" [blank]="s.blank" />
        }
      </div>
    </div>
  `,
})
export class Editor {
  readonly lang = input.required<Lang>();
  readonly strings = input.required<Strings['editor']>();

  readonly tabs: Tab[] = ['theme', 'template'];
  readonly tab = signal<Tab>(tabFromHash());

  constructor() {
    // The galleries link to /editor#theme and /editor#template; follow the hash when only it changes.
    window.addEventListener('hashchange', () => this.tab.set(tabFromHash()));
  }

  other(id: Tab): Tab {
    return id === 'theme' ? 'template' : 'theme';
  }

  select(id: Tab, focus = false) {
    this.tab.set(id);
    history.replaceState(null, '', `#${id}`);
    if (focus) document.getElementById(`tab-${id}`)?.focus();
  }
}
