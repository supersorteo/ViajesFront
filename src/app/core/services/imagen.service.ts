import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ImagenService {
  private readonly http = inject(HttpClient);

  upload(file: File): Observable<string> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http
      .post<{ url: string }>(`${environment.apiUrl}/admin/imagenes/upload`, formData)
      .pipe(map((res) => res.url));
  }
}
