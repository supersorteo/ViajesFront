import { Injectable, signal } from '@angular/core';

export interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  tone?: 'danger' | 'primary';
}

interface ConfirmState extends Required<ConfirmOptions> {
  open: boolean;
}

@Injectable({ providedIn: 'root' })
export class ConfirmService {
  readonly state = signal<ConfirmState | null>(null);
  private resolver: ((result: boolean) => void) | null = null;

  open(options: ConfirmOptions): Promise<boolean> {
    this.state.set({
      open: true,
      title: options.title,
      message: options.message,
      confirmText: options.confirmText ?? 'Confirmar',
      cancelText: options.cancelText ?? 'Cancelar',
      tone: options.tone ?? 'primary',
    });

    return new Promise<boolean>((resolve) => {
      this.resolver = resolve;
    });
  }

  confirm(): void {
    this.resolve(true);
  }

  cancel(): void {
    this.resolve(false);
  }

  private resolve(result: boolean): void {
    this.resolver?.(result);
    this.resolver = null;
    this.state.set(null);
  }
}
