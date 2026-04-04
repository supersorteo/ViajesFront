import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Destino } from '../models/destino.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class DestinoService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/destinos`;

  getAll(): Observable<Destino[]> {
    return this.http.get<Destino[]>(this.apiUrl);
  }

  getById(id: number): Observable<Destino> {
    return this.http.get<Destino>(`${this.apiUrl}/${id}`);
  }
}
