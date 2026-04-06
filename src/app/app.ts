import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ConfirmDialogComponent } from './shared/ui/confirm-dialog.component';
import { ToastViewportComponent } from './shared/ui/toast-viewport.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastViewportComponent, ConfirmDialogComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('viajesApp');
}
