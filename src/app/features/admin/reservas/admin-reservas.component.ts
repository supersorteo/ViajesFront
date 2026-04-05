import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SlicePipe } from '@angular/common';
import { AdminReservaService, ReservaAdmin } from '../../../core/services/admin-reserva.service';
import { AdminDestinoService } from '../../../core/services/admin-destino.service';
import { Destino } from '../../../core/models/destino.model';

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

  reservas = signal<ReservaAdmin[]>([]);
  destinos = signal<Destino[]>([]);
  cargando = signal(true);
  error = signal<string | null>(null);
  filtroDestinoId = signal<number | undefined>(undefined);
  confirmandoDelete = signal<number | null>(null);

  ngOnInit(): void {
    this.destinoService.getAll().subscribe({ next: (d) => this.destinos.set(d) });
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.reservaService.getAll(this.filtroDestinoId()).subscribe({
      next: (r) => { this.reservas.set(r); this.cargando.set(false); },
      error: () => { this.error.set('Error al cargar reservas.'); this.cargando.set(false); },
    });
  }

  aplicarFiltro(event: Event): void {
    const val = (event.target as HTMLSelectElement).value;
    this.filtroDestinoId.set(val ? Number(val) : undefined);
    this.cargar();
  }

  cambiarEstado(reserva: ReservaAdmin, estado: ReservaAdmin['estado']): void {
    this.reservaService.cambiarEstado(reserva.id, estado).subscribe({
      next: (updated) =>
        this.reservas.update((list) =>
          list.map((r) => (r.id === updated.id ? updated : r))
        ),
    });
  }

  confirmarDelete(id: number): void { this.confirmandoDelete.set(id); }
  cancelarDelete(): void { this.confirmandoDelete.set(null); }

  eliminar(id: number): void {
    this.reservaService.delete(id).subscribe({
      next: () => {
        this.confirmandoDelete.set(null);
        this.reservas.update((list) => list.filter((r) => r.id !== id));
      },
    });
  }

  estadoClass(estado: string): string {
    return { CONFIRMADA: 'confirmada', CANCELADA: 'cancelada', PENDIENTE: 'pendiente' }[estado] ?? '';
  }
}
