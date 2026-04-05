import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'reservas/:destinoId',
    loadComponent: () =>
      import('./features/reservas/reservas.component').then((m) => m.ReservasComponent),
  },
  {
    path: 'admin',
    children: [
      {
        path: 'login',
        loadComponent: () =>
          import('./features/admin/login/admin-login.component').then(
            (m) => m.AdminLoginComponent
          ),
      },
      {
        path: '',
        loadComponent: () =>
          import('./features/admin/layout/admin-layout.component').then(
            (m) => m.AdminLayoutComponent
          ),
        canActivate: [authGuard],
        children: [
          {
            path: 'destinos',
            loadComponent: () =>
              import('./features/admin/destinos/admin-destinos.component').then(
                (m) => m.AdminDestinosComponent
              ),
          },
          {
            path: 'reservas',
            loadComponent: () =>
              import('./features/admin/reservas/admin-reservas.component').then(
                (m) => m.AdminReservasComponent
              ),
          },
          {
            path: 'configuracion',
            loadComponent: () =>
              import('./features/admin/settings/admin-settings.component').then(
                (m) => m.AdminSettingsComponent
              ),
          },
          { path: '', redirectTo: 'destinos', pathMatch: 'full' },
        ],
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
