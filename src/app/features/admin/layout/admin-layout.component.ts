import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ConfirmService } from '../../../shared/ui/confirm.service';
import { ToastService } from '../../../shared/ui/toast.service';

@Component({
  selector: 'app-admin-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.scss',
})
export class AdminLayoutComponent {
  private readonly authService = inject(AuthService);
  private readonly confirmService = inject(ConfirmService);
  private readonly toastService = inject(ToastService);

  username = this.authService.username;
  sidebarOpen = signal(false);

  toggleSidebar(): void {
    this.sidebarOpen.update((open) => !open);
  }

  closeSidebar(): void {
    this.sidebarOpen.set(false);
  }

  async logout(): Promise<void> {
    const confirmado = await this.confirmService.open({
      title: 'Cerrar sesion',
      message: 'Se cerrara tu sesion de administrador y volveras a la pantalla de acceso.',
      confirmText: 'Cerrar sesion',
      cancelText: 'Quedarme aqui',
      tone: 'danger',
    });

    if (!confirmado) {
      return;
    }

    this.toastService.info('Sesion cerrada', 'Volviendo al acceso de administrador.');
    this.closeSidebar();
    this.authService.logout();
  }
}
