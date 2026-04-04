import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Asiento } from '../models/asiento.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AsientoService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/destinos`;

  getByDestino(destinoId: number): Observable<Asiento[]> {
    return this.http.get<Asiento[]>(`${this.apiUrl}/${destinoId}/asientos`);
  }
}
