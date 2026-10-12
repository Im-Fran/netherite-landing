import { Component, computed, effect, input, signal } from '@angular/core';
import type { Strings } from './i18n';

export const REPO = 'https://github.com/Im-Fran/netherite-landing';
// ponytail: GitHub's new-file page takes the content in the query string; past this it may reject the URL, so the editor offers the download instead.
const MAX_URL = 8000;

/** The generated file, with copy, download and a link that opens it as a new file (and pull request) on GitHub. */
@Component({
  selector: 'app-editor-output',
  template: `
    @let s = strings();
    <div class="overflow-hidden rounded-2xl border border-ink/10 bg-bg">
      <div class="flex items-center justify-between gap-3 border-b border-ink/10 px-4 py-3">
        <h3 class="truncate font-mono text-sm">{{ path() }}</h3>
        <div class="flex shrink-0 gap-2">
          <button type="button" (click)="copy()" class="rounded-full border border-ink/15 px-4 py-1.5 text-sm font-medium hover:bg-surface">
            <span aria-live="polite">{{ copied() ? s.copied : s.copy }}</span>
          </button>
          <button type="button" (click)="download()" class="rounded-full border border-ink/15 px-4 py-1.5 text-sm font-medium hover:bg-surface">{{ s.download }}</button>
        </div>
      </div>
      <pre class="max-h-96 overflow-auto bg-surface p-4 font-mono text-xs leading-relaxed whitespace-pre-wrap" [attr.aria-label]="s.title">{{ content() }}</pre>
      <div class="border-t border-ink/10 p-4">
        @if (problem()) {
          <p class="text-sm text-muted">{{ s.fixFirst }}</p>
        } @else if (github(); as url) {
          <a [href]="url" target="_blank" rel="noopener" class="inline-block rounded-full bg-accent px-5 py-2 font-medium text-on-accent hover:opacity-90">{{ s.propose }}</a>
          <p class="mt-2 text-sm text-muted">{{ s.proposeHelp.replace('{path}', path()) }}</p>
        } @else {
          <p class="text-sm text-muted">{{ s.tooLong }}</p>
        }
      </div>
    </div>
  `,
})
export class EditorOutput {
  readonly strings = input.required<Strings['editor']['output']>();
  /** Repository path, e.g. `public/themes/ocean.json`. */
  readonly path = input.required<string>();
  readonly content = input.required<string>();
  /** Set when the file isn't ready for the gallery (it can still be copied or downloaded). */
  readonly problem = input(false);

  readonly copied = signal(false);
  readonly github = computed(() => {
    const url = `${REPO}/new/dev?filename=${encodeURIComponent(this.path())}&value=${encodeURIComponent(this.content())}`;
    return url.length <= MAX_URL ? url : null;
  });

  constructor() {
    effect(() => {
      this.content();
      this.copied.set(false);
    });
  }

  async copy() {
    await navigator.clipboard.writeText(this.content());
    this.copied.set(true);
  }

  download() {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([this.content()], { type: 'text/plain' }));
    a.download = this.path().split('/').pop()!;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href));
  }
}
