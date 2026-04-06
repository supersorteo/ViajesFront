import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { SlicePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminReservaService, ReservaAdmin } from '../../../core/services/admin-reserva.service';
import { AdminDestinoService } from '../../../core/services/admin-destino.service';
import { Destino } from '../../../core/models/destino.model';
import { ToastService } from '../../../shared/ui/toast.service';
import { ConfirmService } from '../../../shared/ui/confirm.service';

@Component({
  selector: 'app-admin-reservas',
  imports: [FormsModule, SlicePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './admin-reservas.component.html',
  styleUrl: './admin-reservas.component.scss',
})
export class AdminReservasComponent implements OnInit {
  private readonly reservaService = inject(AdminReservaService);
  private readonly destinoService = inject(AdminDestinoService);
  private readonly toastService = inject(ToastService);
  private readonly confirmService = inject(ConfirmService);

  reservas = signal<ReservaAdmin[]>([]);
  destinos = signal<Destino[]>([]);
  cargando = signal(true);
  error = signal<string | null>(null);
  filtroDestinoId = signal<number | undefined>(undefined);

  ngOnInit(): void {
    this.destinoService.getAll().subscribe({ next: (destinos) => this.destinos.set(destinos) });
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.error.set(null);

    this.reservaService.getAll(this.filtroDestinoId()).subscribe({
      next: (reservas) => {
        this.reservas.set(reservas);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('Error al cargar reservas.');
        this.cargando.set(false);
        this.toastService.error('No se pudieron cargar las reservas.');
      },
    });
  }

  aplicarFiltro(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.filtroDestinoId.set(value ? Number(value) : undefined);
    this.cargar();
  }

  async cambiarEstado(reserva: ReservaAdmin, estado: ReservaAdmin['estado']): Promise<void> {
    if (reserva.estado === estado) return;

    const confirmado = await this.confirmService.open({
      title: 'Cambiar estado de reserva',
      message: `La reserva #${reserva.id} pasara a ${estado.toLowerCase()}.`,
      confirmText: 'Aplicar cambio',
    });
    if (!confirmado) {
      this.cargar();
      return;
    }

    this.reservaService.cambiarEstado(reserva.id, estado).subscribe({
      next: (updated) => {
        this.reservas.update((list) => list.map((item) => (item.id === updated.id ? updated : item)));
        this.toastService.success('Reserva actualizada', `La reserva #${updated.id} ya esta ${updated.estado.toLowerCase()}.`);
      },
      error: () => {
        this.toastService.error('No se pudo cambiar el estado de la reserva.');
        this.cargar();
      },
    });
  }

  async eliminar(reserva: ReservaAdmin): Promise<void> {
    const confirmado = await this.confirmService.open({
      title: 'Eliminar reserva',
      message: `Se eliminara la reserva #${reserva.id} de ${reserva.nombrePasajero}.`,
      confirmText: 'Eliminar',
      tone: 'danger',
    });
    if (!confirmado) return;

    this.reservaService.delete(reserva.id).subscribe({
      next: () => {
        this.reservas.update((list) => list.filter((item) => item.id !== reserva.id));
        this.toastService.success('Reserva eliminada', `Se libero la reserva #${reserva.id}.`);
      },
      error: () => this.toastService.error('No se pudo eliminar la reserva.'),
    });
  }

  estadoClass(estado: string): string {
    return { CONFIRMADA: 'confirmada', CANCELADA: 'cancelada', PENDIENTE: 'pendiente' }[estado] ?? '';
  }
}
