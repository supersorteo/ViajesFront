import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ThemeService } from './theme.service';

@Component({
  selector: 'app-theme-toggle',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="theme-switcher glass-card" aria-label="Selector de tema">
      <div class="theme-switcher-actions">
        <button
          type="button"
          class="theme-chip"
          [class.active]="themeService.mode() === 'light'"
          (click)="themeService.setMode('light')"
          aria-label="Activar modo claro"
          title="Modo claro"
        >
          <span aria-hidden="true">☀</span>
        </button>

        <button
          type="button"
          class="theme-chip"
          [class.active]="themeService.mode() === 'dark'"
          (click)="themeService.setMode('dark')"
          aria-label="Activar modo oscuro"
          title="Modo oscuro"
        >
          <span aria-hidden="true">☾</span>
        </button>
      </div>
    </section>
  `,
})
export class ThemeToggleComponent {
  protected readonly themeService = inject(ThemeService);
}
