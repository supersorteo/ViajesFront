import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ReservaAdmin {
  id: number;
  destinoId: number;
  destinoNombre: string;
  numeroAsiento: number;
  nombrePasajero: string;
  email: string;
  estado: 'PENDIENTE' | 'CONFIRMADA' | 'CANCELADA';
  fechaCreacion: string;
}

@Injectable({ providedIn: 'root' })
export class AdminReservaService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/admin/reservas`;

  getAll(destinoId?: number): Observable<ReservaAdmin[]> {
    let params = new HttpParams();
    if (destinoId !== undefined) {
      params = params.set('destinoId', destinoId.toString());
    }
    return this.http.get<ReservaAdmin[]>(this.apiUrl, { params });
  }

  cambiarEstado(id: number, estado: ReservaAdmin['estado']): Observable<ReservaAdmin> {
    return this.http.patch<ReservaAdmin>(`${this.apiUrl}/${id}/estado`, { estado });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
