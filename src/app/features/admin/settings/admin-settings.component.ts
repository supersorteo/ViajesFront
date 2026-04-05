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
  get confirmCtrl()  { return this.form.get('confirmarPassword')!; }

  guardar(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.guardando()) return;

    this.guardando.set(true);
    this.error.set(null);
    this.exito.set(false);

    const { nuevoUsername, nuevaPassword } = this.form.getRawValue();
    this.authService.cambiarCredenciales(nuevoUsername!, nuevaPassword!).subscribe({
      next: () => {
        this.exito.set(true);
        this.form.reset();
        this.guardando.set(false);
      },
      error: () => {
        this.error.set('Error al actualizar las credenciales. Intentá de nuevo.');
        this.guardando.set(false);
      },
    });
  }
}
