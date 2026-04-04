import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="header">
      @if (backRoute()) {
        <a [routerLink]="backRoute()" class="back-link" aria-label="Volver">← Volver</a>
      }
      <h1>SONATA VIAJES</h1>
      @if (subtitle()) {
        <p>{{ subtitle() }}</p>
      }
    </header>
  `,
  styles: [`
    .header {
      background: linear-gradient(135deg, var(--primary), var(--secondary));
      color: var(--text-light);
      padding: 3rem 2rem;
      text-align: center;
      border-radius: 0 0 30px 30px;
      margin-bottom: 3rem;
      box-shadow: var(--shadow);
      position: relative;
    }
    h1 {
      font-size: 3rem;
      font-weight: 800;
      letter-spacing: -1px;
      margin-bottom: 0.5rem;
    }
    p { font-size: 1.2rem; opacity: 0.9; }
    .back-link {
      color: white;
      text-decoration: none;
      font-weight: 600;
      position: absolute;
      left: 2rem;
      top: 3rem;
    }
    .back-link:focus-visible { outline: 2px solid white; border-radius: 4px; }
  `]
})
export class HeaderComponent {
  subtitle = input<string>('');
  backRoute = input<string>('');
}
