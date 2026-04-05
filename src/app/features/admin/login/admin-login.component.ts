import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-admin-login',
  imports: [ReactiveFormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './admin-login.component.html',
  styleUrl: './admin-login.component.scss',
})
export class AdminLoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  cargando = signal(false);
  error = signal<string | null>(null);
  mostrarPassword = signal(false);

  form = this.fb.group({
    username: ['', [Validators.required, Validators.minLength(3)]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  get usernameCtrl() { return this.form.get('username')!; }
  get passwordCtrl() { return this.form.get('password')!; }

  togglePassword(): void {
    this.mostrarPassword.update((v) => !v);
  }

  login(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.cargando()) return;
    this.cargando.set(true);
    this.error.set(null);

    const { username, password } = this.form.getRawValue();
    this.authService.login({ username: username!, password: password! }).subscribe({
      next: () => this.router.navigate(['/admin/destinos']),
      error: () => {
        this.error.set('Usuario o contraseña incorrectos.');
        this.cargando.set(false);
      },
    });
  }
}
