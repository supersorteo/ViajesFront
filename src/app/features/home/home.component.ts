import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Router } from '@angular/router';
import { Destino } from '../../core/models/destino.model';
import { DestinoService } from '../../core/services/destino.service';
import { HeaderComponent } from '../../shared/header/header.component';
import { DestinoCardComponent } from './components/destino-card/destino-card.component';
import { SidePanelComponent } from './components/side-panel/side-panel.component';

@Component({
  selector: 'app-home',
  imports: [HeaderComponent, DestinoCardComponent, SidePanelComponent, DecimalPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  private readonly destinoService = inject(DestinoService);
  private readonly router = inject(Router);

  destinos = signal<Destino[]>([]);
  destinoSeleccionado = signal<Destino | null>(null);
  cargando = signal(true);
  error = signal<string | null>(null);
  destinosDisponibles = computed(() => this.destinos().filter((destino) => destino.disponible));
  cantidadDestinosDisponibles = computed(() => this.destinosDisponibles().length);
  salidaMasEconomica = computed(() => {
    const disponibles = this.destinosDisponibles();
    if (!disponibles.length) {
      return null;
    }

    return disponibles.reduce((mejor, actual) =>
      actual.precio < mejor.precio ? actual : mejor
    );
  });

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

  goToAdmin(): void {
    this.router.navigate(['/admin']);
  }

  scrollToSection(sectionId: string): void {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
