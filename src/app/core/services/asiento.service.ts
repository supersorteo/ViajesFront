import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Asiento } from '../models/asiento.model';

@Injectable({ providedIn: 'root' })
export class AsientoService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8080/api/destinos';

  getByDestino(destinoId: number): Observable<Asiento[]> {
    return this.http.get<Asiento[]>(`${this.apiUrl}/${destinoId}/asientos`);
  }
}
