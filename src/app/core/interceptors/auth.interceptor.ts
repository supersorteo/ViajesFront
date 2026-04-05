import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('admin_token');
  const router = inject(Router);

  const needsAuth =
    req.url.includes('/api/admin/') || req.url.includes('/api/auth/logout');

  const authReq =
    token && needsAuth
      ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
      : req;

  return next(authReq).pipe(
    catchError((error) => {
      // Si el back rechaza el token (reinicio, expiración) redirigir al login
      // excepto en el propio login para no entrar en loop
      if (error.status === 401 && !req.url.includes('/api/auth/login')) {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_username');
        router.navigate(['/admin/login']);
      }
      return throwError(() => error);
    })
  );
};
