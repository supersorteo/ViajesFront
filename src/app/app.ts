import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ConfirmDialogComponent } from './shared/ui/confirm-dialog.component';
import { ToastViewportComponent } from './shared/ui/toast-viewport.component';
import { ThemeToggleComponent } from './shared/ui/theme-toggle.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastViewportComponent, ConfirmDialogComponent, ThemeToggleComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('viajesApp');
}
