import { effect, signal, type WritableSignal } from '@angular/core';

/** A signal saved in localStorage, so an unfinished draft survives a reload. Falls back to `initial`. */
export function persisted<T>(key: string, initial: T): WritableSignal<T> {
  let value = initial;
  try {
    const saved = localStorage.getItem(key);
    if (saved) value = { ...initial, ...JSON.parse(saved) };
  } catch {}
  const s = signal(value);
  effect(() => {
    const v = s();
    try {
      localStorage.setItem(key, JSON.stringify(v));
    } catch {}
  });
  return s;
}
