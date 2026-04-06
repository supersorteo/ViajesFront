import { ChangeDetectionStrategy, Component, HostListener, inject } from '@angular/core';
import { ConfirmService } from './confirm.service';

@Component({
  selector: 'app-confirm-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (confirmService.state(); as state) {
      <div class="dialog-backdrop" (click)="confirmService.cancel()"></div>
      <section
        class="confirm-dialog"
        role="alertdialog"
        aria-modal="true"
        [attr.aria-labelledby]="'confirm-title'"
        [attr.aria-describedby]="'confirm-message'"
      >
        <div class="confirm-icon" [class.danger]="state.tone === 'danger'" aria-hidden="true">
          @if (state.tone === 'danger') { ! } @else { ? }
        </div>
        <div class="confirm-copy">
          <h2 id="confirm-title">{{ state.title }}</h2>
          <p id="confirm-message">{{ state.message }}</p>
        </div>
        <div class="confirm-actions">
          <button type="button" class="btn-shell btn-shell-secondary" (click)="confirmService.cancel()">
            {{ state.cancelText }}
          </button>
          <button
            type="button"
            class="btn-shell"
            [class.btn-shell-danger]="state.tone === 'danger'"
            (click)="confirmService.confirm()"
          >
            {{ state.confirmText }}
          </button>
        </div>
      </section>
    }
  `,
})
export class ConfirmDialogComponent {
  protected readonly confirmService = inject(ConfirmService);

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.confirmService.state()) {
      this.confirmService.cancel();
    }
  }
}
