import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { Destino } from '../../../../core/models/destino.model';

@Component({
  selector: 'app-destino-card',
  imports: [DatePipe, DecimalPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './destino-card.component.html',
  styleUrl: './destino-card.component.scss',
})
export class DestinoCardComponent {
  destino = input.required<Destino>();
  seleccionar = output<Destino>();

  onCardClick(): void {
    this.seleccionar.emit(this.destino());
  }
}
