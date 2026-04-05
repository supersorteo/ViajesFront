import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { LoginRequest, LoginResponse } from '../models/auth.model';
import { environment } from '../../../environments/environment';

const TOKEN_KEY = 'admin_token';
const USERNAME_KEY = 'admin_username';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly apiUrl = `${environment.apiUrl}/auth`;

  isAuthenticated = signal(!!localStorage.getItem(TOKEN_KEY));
  username = signal(localStorage.getItem(USERNAME_KEY) ?? '');

  login(request: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, request).pipe(
      tap((res) => {
        localStorage.setItem(TOKEN_KEY, res.token);
        localStorage.setItem(USERNAME_KEY, res.username);
        this.isAuthenticated.set(true);
        this.username.set(res.username);
      }),
    );
  }

  logout(): void {
    const token = this.getToken();
    if (token) {
      this.http
        .post(`${this.apiUrl}/logout`, {})
        .subscribe({ error: () => {} });
    }
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USERNAME_KEY);
    this.isAuthenticated.set(false);
    this.username.set('');
    this.router.navigate(['/admin/login']);
  }

  cambiarCredenciales(nuevoUsername: string, nuevaPassword: string): Observable<{ username: string }> {
    return this.http.put<{ username: string }>(
      `${environment.apiUrl}/admin/credenciales`,
      { nuevoUsername, nuevaPassword }
    ).pipe(
      tap((res) => {
        localStorage.setItem(USERNAME_KEY, res.username);
        this.username.set(res.username);
      })
    );
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }
}
