import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DecimalPipe, SlicePipe } from '@angular/common';
import {
  AdminDestinoService,
  DestinoRequest,
  ResetAsientosResponse,
} from '../../../core/services/admin-destino.service';
import { ImagenService } from '../../../core/services/imagen.service';
import { Destino } from '../../../core/models/destino.model';
import { ToastService } from '../../../shared/ui/toast.service';
import { ConfirmService } from '../../../shared/ui/confirm.service';
import { AdminReservaService } from '../../../core/services/admin-reserva.service';

@Component({
  selector: 'app-admin-destinos',
  imports: [ReactiveFormsModule, DecimalPipe, SlicePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './admin-destinos.component.html',
  styleUrl: './admin-destinos.component.scss',
})
export class AdminDestinosComponent implements OnInit {
  private readonly service = inject(AdminDestinoService);
  private readonly imagenService = inject(ImagenService);
  private readonly fb = inject(FormBuilder);
  private readonly toastService = inject(ToastService);
  private readonly confirmService = inject(ConfirmService);
  private readonly adminReservaService = inject(AdminReservaService);

  destinos = signal<Destino[]>([]);
  cargando = signal(true);
  error = signal<string | null>(null);
  guardando = signal(false);
  mostrarForm = signal(false);
  editando = signal<Destino | null>(null);
  imagenPreview = signal<string | null>(null);
  subiendoImagen = signal(false);

  tituloForm = computed(() => (this.editando() ? 'Editar destino' : 'Nuevo destino'));

  form = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(2)]],
    descripcion: ['', [Validators.required, Validators.maxLength(500)]],
    imagenUrl: [''],
    precio: [null as number | null, [Validators.required, Validators.min(1)]],
    fechaSalida: ['', Validators.required],
    horaSalida: ['', Validators.required],
    horaLlegada: ['', Validators.required],
    tipo: ['Ida y Vuelta', Validators.required],
    disponible: [true],
    totalAsientos: [40, [Validators.required, Validators.min(1), Validators.max(100)]],
  });

  ngOnInit(): void {
    this.cargarDestinos();
  }

  cargarDestinos(): void {
    this.cargando.set(true);
    this.service.getAll().subscribe({
      next: (destinos) => {
        this.destinos.set(destinos);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('Error al cargar destinos.');
        this.cargando.set(false);
        this.toastService.error('No se pudieron cargar los destinos.');
      },
    });
  }

  abrirFormNuevo(): void {
    this.editando.set(null);
    this.imagenPreview.set(null);
    this.form.reset({ disponible: true, totalAsientos: 40, tipo: 'Ida y Vuelta' });
    this.mostrarForm.set(true);
  }

  abrirFormEditar(destino: Destino): void {
    this.editando.set(destino);
    this.imagenPreview.set(destino.imagenUrl ?? null);
    this.form.patchValue({
      nombre: destino.nombre,
      descripcion: destino.descripcion,
      imagenUrl: destino.imagenUrl,
      precio: destino.precio,
      fechaSalida: destino.fechaSalida,
      horaSalida: destino.horaSalida?.substring(0, 5) ?? '',
      horaLlegada: destino.horaLlegada?.substring(0, 5) ?? '',
      tipo: destino.tipo,
      disponible: destino.disponible,
      totalAsientos: destino.totalAsientos,
    });
    this.mostrarForm.set(true);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (loadEvent) => this.imagenPreview.set(loadEvent.target?.result as string);
    reader.readAsDataURL(file);

    this.subiendoImagen.set(true);
    this.imagenService.upload(file).subscribe({
      next: (url) => {
        this.form.patchValue({ imagenUrl: url });
        this.subiendoImagen.set(false);
        this.toastService.success('Imagen subida', 'La imagen ya esta lista para guardarse.');
      },
      error: () => {
        this.error.set('Error al subir la imagen. Intenta de nuevo.');
        this.imagenPreview.set(null);
        this.subiendoImagen.set(false);
        this.toastService.error('No se pudo subir la imagen.');
      },
    });
  }

  cerrarForm(): void {
    this.mostrarForm.set(false);
    this.editando.set(null);
    this.error.set(null);
    this.guardando.set(false);
    this.imagenPreview.set(null);
  }

  guardar(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.guardando()) return;

    this.guardando.set(true);
    this.error.set(null);

    const raw = this.form.getRawValue();
    const request: DestinoRequest = {
      nombre: raw.nombre!,
      descripcion: raw.descripcion!,
      imagenUrl: raw.imagenUrl ?? '',
      precio: raw.precio!,
      fechaSalida: raw.fechaSalida!,
      horaSalida: raw.horaSalida!,
      horaLlegada: raw.horaLlegada!,
      tipo: raw.tipo!,
      disponible: raw.disponible ?? true,
      totalAsientos: raw.totalAsientos!,
    };

    const operation = this.editando()
      ? this.service.update(this.editando()!.id, request)
      : this.service.create(request);

    operation.subscribe({
      next: () => {
        const wasEditing = Boolean(this.editando());
        this.cerrarForm();
        this.cargarDestinos();
        this.toastService.success(
          wasEditing ? 'Destino actualizado' : 'Destino creado',
          wasEditing ? 'Los cambios quedaron guardados.' : 'El destino ya aparece en el panel.'
        );
      },
      error: () => {
        this.error.set('Error al guardar. Verifica los datos.');
        this.guardando.set(false);
        this.toastService.error('No se pudo guardar el destino.');
      },
    });
  }

  async toggleDisponible(destino: Destino): Promise<void> {
    const confirmado = await this.confirmService.open({
      title: destino.disponible ? 'Desactivar destino' : 'Activar destino',
      message: destino.disponible
        ? 'El destino dejara de mostrarse como disponible para nuevas reservas.'
        : 'El destino volvera a mostrarse como disponible en la web.',
      confirmText: destino.disponible ? 'Desactivar' : 'Activar',
    });
    if (!confirmado) return;

    this.service.toggleDisponible(destino.id).subscribe({
      next: (updated) => {
        this.destinos.update((list) => list.map((item) => (item.id === updated.id ? updated : item)));
        this.toastService.info(
          updated.disponible ? 'Destino activado' : 'Destino desactivado',
          updated.nombre
        );
      },
      error: () => this.toastService.error('No se pudo actualizar la disponibilidad.'),
    });
  }

  async resetearAsientos(destino: Destino): Promise<void> {
    const reservas = await new Promise<number>((resolve) => {
      this.adminReservaService.getAll(destino.id).subscribe({
        next: (items) => resolve(items.length),
        error: () => resolve(0),
      });
    });

    const confirmadoInicial = await this.confirmService.open({
      title: 'Resetear asientos',
      message: reservas > 0
        ? `Este destino tiene ${reservas} reserva${reservas !== 1 ? 's' : ''}. Si continuas, se eliminaran esas reservas y todos los asientos volveran a quedar libres.`
        : 'Todos los asientos volveran a quedar disponibles y se limpiara el mapa actual.',
      confirmText: 'Resetear',
      tone: 'danger',
    });
    if (!confirmadoInicial) return;

    if (reservas > 0) {
      const confirmadoFinal = await this.confirmService.open({
        title: 'Confirmacion final',
        message: 'Se eliminaran definitivamente los clientes y reservas asociados a este destino. Esta accion no se puede deshacer.',
        confirmText: 'Eliminar reservas y resetear',
        tone: 'danger',
      });
      if (!confirmadoFinal) return;
    }

    this.service.resetearAsientos(destino.id).subscribe({
      next: (summary: ResetAsientosResponse) => {
        this.toastService.success(
          'Mapa de asientos actualizado',
          summary.reservasEliminadas > 0
            ? `${summary.reservasEliminadas} reserva${summary.reservasEliminadas !== 1 ? 's' : ''} eliminada${summary.reservasEliminadas !== 1 ? 's' : ''}. ${summary.asientosDisponibles} asientos disponibles en ${destino.nombre}.`
            : `${summary.asientosDisponibles} asientos disponibles en ${destino.nombre}.`
        );
      },
      error: () => this.toastService.error('No se pudieron resetear los asientos.'),
    });
  }

  async eliminar(destino: Destino): Promise<void> {
    const confirmado = await this.confirmService.open({
      title: 'Eliminar destino',
      message: `Se eliminara ${destino.nombre}. Esta accion no se puede deshacer.`,
      confirmText: 'Eliminar',
      tone: 'danger',
    });
    if (!confirmado) return;

    this.service.delete(destino.id).subscribe({
      next: () => {
        this.destinos.update((list) => list.filter((item) => item.id !== destino.id));
        this.toastService.success('Destino eliminado', destino.nombre);
      },
      error: () => {
        this.error.set('No se puede eliminar un destino con reservas activas.');
        this.toastService.error('No se puede eliminar el destino con reservas activas.');
      },
    });
  }
}
