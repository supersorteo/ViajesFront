import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Destino } from '../../core/models/destino.model';
import { Asiento } from '../../core/models/asiento.model';
import { DestinoService } from '../../core/services/destino.service';
import { AsientoService } from '../../core/services/asiento.service';
import { ReservaService } from '../../core/services/reserva.service';
import { HeaderComponent } from '../../shared/header/header.component';

@Component({
  selector: 'app-reservas',
  imports: [HeaderComponent, RouterLink, ReactiveFormsModule],
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

  private readonly formStatus = toSignal(this.form.statusChanges, { initialValue: this.form.status });

  puedeConfirmar = computed(
    () => this.asientoSeleccionado() !== null && this.formStatus() === 'VALID' && !this.enviando()
  );

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('destinoId'));
    this.destinoService.getById(id).subscribe({
      next: (d) => this.destino.set(d),
      error: () => this.router.navigate(['/']),
    });
    this.asientoService.getByDestino(id).subscribe({
      next: (a) => {
        this.asientos.set(a);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar los asientos.');
        this.cargando.set(false);
      },
    });
  }

  seleccionarAsiento(asiento: Asiento): void {
    if (asiento.estado === 'OCUPADO') return;
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
          // Marcar el asiento como ocupado en la UI
          this.asientos.update((lista) =>
            lista.map((a) =>
              a.numero === reserva.numeroAsiento ? { ...a, estado: 'OCUPADO' } : a
            )
          );
        },
        error: () => {
          this.error.set('No se pudo confirmar la reserva. Intentá de nuevo.');
          this.enviando.set(false);
        },
      });
  }

  nuevaReserva(): void {
    this.reservaConfirmada.set(false);
    this.asientoSeleccionado.set(null);
    this.form.reset();
  }
}
