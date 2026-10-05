import { Component, computed, effect, inject, signal } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { type Lang, STRINGS } from './i18n';

const REPO = 'https://github.com/Im-Fran/Netherite';

// ponytail: client-side only, so crawlers and no-JS visitors get English; move to Angular's built-in i18n builds if per-locale SEO matters.
function initialLang(): Lang {
  try {
    const saved = localStorage.getItem('lang');
    if (saved === 'en' || saved === 'es') return saved;
  } catch {}
  return navigator.language.startsWith('es') ? 'es' : 'en';
}

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
})
export class App {
  readonly repo = REPO;
  readonly download = `${REPO}/releases/latest`;
  readonly year = new Date().getFullYear();

  readonly lang = signal<Lang>(initialLang());
  readonly strings = computed(() => STRINGS[this.lang()]);
  readonly other = computed<Lang>(() => (this.lang() === 'en' ? 'es' : 'en'));
  readonly otherName = computed(() => STRINGS[this.other()].langName);

  constructor() {
    const title = inject(Title);
    const meta = inject(Meta);
    effect(() => {
      const t = this.strings();
      document.documentElement.lang = this.lang();
      title.setTitle(t.title);
      meta.updateTag({ name: 'description', content: t.description });
    });
  }

  toggle() {
    const next = this.other();
    this.lang.set(next);
    try {
      localStorage.setItem('lang', next);
    } catch {}
  }
}
