import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ToastService } from './toast.service';

@Component({
  selector: 'app-toast-viewport',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="toast-viewport" aria-live="polite" aria-atomic="true">
      @for (toast of toastService.toasts(); track toast.id) {
        <article class="toast-card" [class]="'toast-card ' + toast.tone">
          <div class="toast-icon" aria-hidden="true">
            @switch (toast.tone) {
              @case ('success') { ✓ }
              @case ('error') { ! }
              @case ('warning') { ! }
              @default { i }
            }
          </div>
          <div class="toast-copy">
            <strong>{{ toast.title }}</strong>
            @if (toast.message) {
              <p>{{ toast.message }}</p>
            }
          </div>
          <button
            type="button"
            class="toast-close"
            (click)="toastService.dismiss(toast.id)"
            aria-label="Cerrar notificacion"
          >
            ×
          </button>
        </article>
      }
    </section>
  `,
})
export class ToastViewportComponent {
  protected readonly toastService = inject(ToastService);
}
