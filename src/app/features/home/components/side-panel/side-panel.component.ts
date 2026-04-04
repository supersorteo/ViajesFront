import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Destino } from '../../../../core/models/destino.model';

@Component({
  selector: 'app-side-panel',
  imports: [RouterLink, DecimalPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './side-panel.component.html',
  styleUrl: './side-panel.component.scss',
})
export class SidePanelComponent {
  destino = input<Destino | null>(null);
  cerrar = output<void>();

  heroBg(imagenUrl: string): string {
    return `linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(10,36,99,0.9)), url(${imagenUrl})`;
  }
}
