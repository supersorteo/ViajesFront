import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('admin_token');
  const needsAuth =
    req.url.includes('/api/admin/') || req.url.includes('/api/auth/logout');

  if (token && needsAuth) {
    return next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
  }

  return next(req);
};
