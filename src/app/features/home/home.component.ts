import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { Destino } from '../../core/models/destino.model';
import { DestinoService } from '../../core/services/destino.service';
import { HeaderComponent } from '../../shared/header/header.component';
import { DestinoCardComponent } from './components/destino-card/destino-card.component';
import { SidePanelComponent } from './components/side-panel/side-panel.component';

@Component({
  selector: 'app-home',
  imports: [HeaderComponent, DestinoCardComponent, SidePanelComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  private readonly destinoService = inject(DestinoService);

  destinos = signal<Destino[]>([]);
  destinoSeleccionado = signal<Destino | null>(null);
  cargando = signal(true);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.destinoService.getAll().subscribe({
      next: (data) => {
        this.destinos.set(data);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar los destinos. Verificá que el servidor esté activo.');
        this.cargando.set(false);
      }
    });
  }

  abrirPanel(destino: Destino): void {
    if (destino.disponible) {
      this.destinoSeleccionado.set(destino);
    }
  }

  cerrarPanel(): void {
    this.destinoSeleccionado.set(null);
  }
}
