import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { interval } from 'rxjs';
import { Destino } from '../../core/models/destino.model';
import { Asiento } from '../../core/models/asiento.model';
import { DestinoService } from '../../core/services/destino.service';
import { AsientoService } from '../../core/services/asiento.service';
import { ReservaService } from '../../core/services/reserva.service';
import { HeaderComponent } from '../../shared/header/header.component';
import { ToastService } from '../../shared/ui/toast.service';

@Component({
  selector: 'app-reservas',
  imports: [HeaderComponent, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './reservas.component.html',
  styleUrl: './reservas.component.scss',
})
export class ReservasComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly destinoService = inject(DestinoService);
  private readonly asientoService = inject(AsientoService);
  private readonly reservaService = inject(ReservaService);
  private readonly toastService = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);

  destino = signal<Destino | null>(null);
  asientos = signal<Asiento[]>([]);
  asientoSeleccionado = signal<Asiento | null>(null);
  cargando = signal(true);
  enviando = signal(false);
  reservaConfirmada = signal(false);
  reservaId = signal<number | null>(null);
  error = signal<string | null>(null);

  form = this.fb.group({
    nombrePasajero: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
  });

  puedeConfirmar = computed(
    () => this.asientoSeleccionado() !== null && this.form.valid && !this.enviando()
  );

  ngOnInit(): void {
    const destinoId = Number(this.route.snapshot.paramMap.get('destinoId'));
    if (!destinoId) {
      this.router.navigate(['/']);
      return;
    }

    this.destinoService.getById(destinoId).subscribe({
      next: (destino) => this.destino.set(destino),
      error: () => this.router.navigate(['/']),
    });

    this.cargarAsientos(destinoId, true);

    interval(10000)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.cargarAsientos(destinoId, false));
  }

  seleccionarAsiento(asiento: Asiento): void {
    if (asiento.estado !== 'DISPONIBLE') return;
    this.asientoSeleccionado.set(asiento);
  }

  confirmarReserva(): void {
    if (!this.puedeConfirmar() || !this.destino()) return;

    this.enviando.set(true);
    this.error.set(null);

    const { nombrePasajero, email } = this.form.getRawValue();
    this.reservaService
      .crear({
        destinoId: this.destino()!.id,
        numeroAsiento: this.asientoSeleccionado()!.numero,
        nombrePasajero: nombrePasajero!,
        email: email!,
      })
      .subscribe({
        next: (reserva) => {
          this.reservaId.set(reserva.id);
          this.reservaConfirmada.set(true);
          this.enviando.set(false);
          this.asientos.update((lista) =>
            lista.map((asiento) =>
              asiento.numero === reserva.numeroAsiento ? { ...asiento, estado: 'OCUPADO' } : asiento
            )
          );
          this.toastService.success(
            'Reserva confirmada',
            `Tu asiento #${reserva.numeroAsiento} quedo reservado correctamente.`
          );
        },
        error: () => {
          this.error.set('No se pudo confirmar la reserva. Intenta de nuevo.');
          this.enviando.set(false);
          this.cargarAsientos(this.destino()!.id, false);
          this.toastService.error('No se pudo confirmar la reserva.');
        },
      });
  }

  nuevaReserva(): void {
    this.reservaConfirmada.set(false);
    this.asientoSeleccionado.set(null);
    this.form.reset();
  }

  volverAlInicio(): void {
    this.router.navigate(['/']);
  }

  asientoLabel(asiento: Asiento): string {
    const estado =
      asiento.estado === 'OCUPADO'
        ? 'Reservado'
        : asiento.estado === 'INACTIVO'
          ? 'Inactivo por ajuste administrativo'
          : this.asientoSeleccionado()?.id === asiento.id
            ? 'Seleccionado'
            : 'Libre';

    return `Asiento ${asiento.numero} - ${estado}`;
  }

  private cargarAsientos(destinoId: number, mostrarLoader: boolean): void {
    if (mostrarLoader) {
      this.cargando.set(true);
    }

    this.asientoService
      .getByDestino(destinoId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (asientos) => {
          const selectedSeat = this.asientoSeleccionado();
          if (selectedSeat) {
            const refreshedSelection = asientos.find((item) => item.id === selectedSeat.id) ?? null;
            if (!refreshedSelection || refreshedSelection.estado !== 'DISPONIBLE') {
              this.asientoSeleccionado.set(null);
              if (!this.reservaConfirmada()) {
                this.toastService.warning(
                  'Asiento actualizado',
                  'El asiento que habias elegido dejo de estar disponible.'
                );
              }
            } else {
              this.asientoSeleccionado.set(refreshedSelection);
            }
          }

          this.asientos.set(asientos);
          this.cargando.set(false);
        },
        error: () => {
          this.error.set('No se pudieron cargar los asientos.');
          this.cargando.set(false);
        },
      });
  }
}
