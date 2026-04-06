import { Injectable, signal } from '@angular/core';

export type ToastTone = 'success' | 'error' | 'info' | 'warning';

export interface ToastItem {
  id: number;
  title: string;
  message?: string;
  tone: ToastTone;
  duration: number;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly toasts = signal<ToastItem[]>([]);
  private nextId = 1;

  show(input: Omit<ToastItem, 'id'>): void {
    const toast: ToastItem = { ...input, id: this.nextId++ };
    this.toasts.update((current) => [...current, toast]);
    window.setTimeout(() => this.dismiss(toast.id), toast.duration);
  }

  success(title: string, message?: string, duration = 3400): void {
    this.show({ title, message, tone: 'success', duration });
  }

  error(title: string, message?: string, duration = 4200): void {
    this.show({ title, message, tone: 'error', duration });
  }

  info(title: string, message?: string, duration = 3200): void {
    this.show({ title, message, tone: 'info', duration });
  }

  warning(title: string, message?: string, duration = 3800): void {
    this.show({ title, message, tone: 'warning', duration });
  }

  dismiss(id: number): void {
    this.toasts.update((current) => current.filter((toast) => toast.id !== id));
  }
}
