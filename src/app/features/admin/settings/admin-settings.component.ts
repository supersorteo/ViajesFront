import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../shared/ui/toast.service';
import { ConfirmService } from '../../../shared/ui/confirm.service';

const passwordMatchValidator: ValidatorFn = (group: AbstractControl) => {
  const pass = group.get('nuevaPassword')?.value;
  const confirm = group.get('confirmarPassword')?.value;
  return pass === confirm ? null : { passwordMismatch: true };
};

@Component({
  selector: 'app-admin-settings',
  imports: [ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './admin-settings.component.html',
  styleUrl: './admin-settings.component.scss',
})
export class AdminSettingsComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly toastService = inject(ToastService);
  private readonly confirmService = inject(ConfirmService);

  guardando = signal(false);
  exito = signal(false);
  error = signal<string | null>(null);
  mostrarPassword = signal(false);
  mostrarConfirm = signal(false);

  form = this.fb.group(
    {
      nuevoUsername: ['', [Validators.required, Validators.minLength(3)]],
      nuevaPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmarPassword: ['', Validators.required],
    },
    { validators: passwordMatchValidator }
  );

  get usernameCtrl() { return this.form.get('nuevoUsername')!; }
  get passwordCtrl() { return this.form.get('nuevaPassword')!; }
  get confirmCtrl() { return this.form.get('confirmarPassword')!; }

  async guardar(): Promise<void> {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.guardando()) return;

    const confirmado = await this.confirmService.open({
      title: 'Actualizar credenciales',
      message: 'El panel usara el nuevo usuario y la nueva contrasena apenas confirmes el cambio.',
      confirmText: 'Guardar credenciales',
    });
    if (!confirmado) return;

    this.guardando.set(true);
    this.error.set(null);
    this.exito.set(false);

    const { nuevoUsername, nuevaPassword } = this.form.getRawValue();
    this.authService.cambiarCredenciales(nuevoUsername!, nuevaPassword!).subscribe({
      next: () => {
        this.exito.set(true);
        this.form.reset();
        this.guardando.set(false);
        this.toastService.success('Credenciales actualizadas', 'El panel ya usa los nuevos datos.');
      },
      error: () => {
        this.error.set('Error al actualizar las credenciales. Intenta de nuevo.');
        this.guardando.set(false);
        this.toastService.error('No se pudieron actualizar las credenciales.');
      },
    });
  }
}
