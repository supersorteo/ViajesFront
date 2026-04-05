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
import { AdminDestinoService, DestinoRequest } from '../../../core/services/admin-destino.service';
import { ImagenService } from '../../../core/services/imagen.service';
import { Destino } from '../../../core/models/destino.model';

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

  destinos = signal<Destino[]>([]);
  cargando = signal(true);
  error = signal<string | null>(null);
  guardando = signal(false);
  mostrarForm = signal(false);
  editando = signal<Destino | null>(null);
  confirmandoDelete = signal<number | null>(null);
  imagenPreview = signal<string | null>(null);
  subiendoImagen = signal(false);

  tituloForm = computed(() => (this.editando() ? 'Editar Destino' : 'Nuevo Destino'));

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
      next: (d) => { this.destinos.set(d); this.cargando.set(false); },
      error: () => { this.error.set('Error al cargar destinos.'); this.cargando.set(false); },
    });
  }

  abrirFormNuevo(): void {
    this.editando.set(null);
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
    reader.onload = (e) => this.imagenPreview.set(e.target?.result as string);
    reader.readAsDataURL(file);

    this.subiendoImagen.set(true);
    this.imagenService.upload(file).subscribe({
      next: (url) => {
        this.form.patchValue({ imagenUrl: url });
        this.subiendoImagen.set(false);
      },
      error: () => {
        this.error.set('Error al subir la imagen. Intentá de nuevo.');
        this.imagenPreview.set(null);
        this.subiendoImagen.set(false);
      },
    });
  }

  cerrarForm(): void {
    this.mostrarForm.set(false);
    this.editando.set(null);
    this.error.set(null);
    this.imagenPreview.set(null);
  }

  guardar(): void {
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

    const op = this.editando()
      ? this.service.update(this.editando()!.id, request)
      : this.service.create(request);

    op.subscribe({
      next: () => { this.cerrarForm(); this.cargarDestinos(); },
      error: () => {
        this.error.set('Error al guardar. Verificá los datos.');
        this.guardando.set(false);
      },
    });
  }

  toggleDisponible(destino: Destino): void {
    this.service.toggleDisponible(destino.id).subscribe({
      next: (updated) =>
        this.destinos.update((list) =>
          list.map((d) => (d.id === updated.id ? updated : d))
        ),
    });
  }

  resetearAsientos(id: number): void {
    this.service.resetearAsientos(id).subscribe({
      next: () => alert('Asientos reseteados correctamente.'),
    });
  }

  confirmarDelete(id: number): void {
    this.confirmandoDelete.set(id);
  }

  cancelarDelete(): void {
    this.confirmandoDelete.set(null);
  }

  eliminar(id: number): void {
    this.service.delete(id).subscribe({
      next: () => {
        this.confirmandoDelete.set(null);
        this.destinos.update((list) => list.filter((d) => d.id !== id));
      },
      error: () => this.error.set('No se puede eliminar un destino con reservas activas.'),
    });
  }
}
