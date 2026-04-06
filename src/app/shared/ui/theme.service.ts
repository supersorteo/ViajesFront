import { DOCUMENT } from '@angular/common';
import { Injectable, effect, inject, signal } from '@angular/core';

export type ThemeMode = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  readonly mode = signal<ThemeMode>(this.readInitialMode());

  constructor() {
    effect(() => {
      const currentMode = this.mode();
      this.document.documentElement.setAttribute('data-theme', currentMode);
      this.document.body.setAttribute('data-theme', currentMode);
      localStorage.setItem('sonata-theme', currentMode);
    });
  }

  toggle(): void {
    this.mode.update((current) => (current === 'light' ? 'dark' : 'light'));
  }

  setMode(mode: ThemeMode): void {
    this.mode.set(mode);
  }

  private readInitialMode(): ThemeMode {
    const saved = localStorage.getItem('sonata-theme');
    if (saved === 'light' || saved === 'dark') {
      return saved;
    }

    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
}
