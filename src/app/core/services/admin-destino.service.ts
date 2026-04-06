import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Destino } from '../models/destino.model';
import { environment } from '../../../environments/environment';

export interface DestinoRequest {
  nombre: string;
  descripcion: string;
  imagenUrl: string;
  precio: number;
  fechaSalida: string;
  horaSalida: string;
  horaLlegada: string;
  tipo: string;
  disponible: boolean;
  totalAsientos: number;
}

export interface ResetAsientosResponse {
  totalAsientos: number;
  asientosDisponibles: number;
  reservasEliminadas: number;
}

@Injectable({ providedIn: 'root' })
export class AdminDestinoService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/admin/destinos`;

  getAll(): Observable<Destino[]> {
    return this.http.get<Destino[]>(this.apiUrl);
  }

  create(request: DestinoRequest): Observable<Destino> {
    return this.http.post<Destino>(this.apiUrl, request);
  }

  update(id: number, request: DestinoRequest): Observable<Destino> {
    return this.http.put<Destino>(`${this.apiUrl}/${id}`, request);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  toggleDisponible(id: number): Observable<Destino> {
    return this.http.patch<Destino>(`${this.apiUrl}/${id}/disponible`, {});
  }

  resetearAsientos(id: number): Observable<ResetAsientosResponse> {
    return this.http.post<ResetAsientosResponse>(`${this.apiUrl}/${id}/resetear-asientos`, {});
  }
}
