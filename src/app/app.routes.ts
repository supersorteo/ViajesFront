import { Routes } from '@angular/router';

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
  { path: '**', redirectTo: '' },
];
