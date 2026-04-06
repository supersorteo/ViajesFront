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
      background:
        radial-gradient(circle at top left, rgba(255,255,255,0.16), transparent 18rem),
        linear-gradient(135deg, #0f1c33 0%, #1347b8 52%, #2f75ff 100%);
      color: white;
      padding: 3.6rem 2rem 4rem;
      text-align: center;
      border-radius: 0 0 34px 34px;
      margin-bottom: 2rem;
      box-shadow: 0 28px 60px rgba(15, 28, 51, 0.24);
      position: relative;
      overflow: hidden;
    }

    h1 {
      font-family: 'Space Grotesk', 'Outfit', sans-serif;
      font-size: clamp(2.2rem, 5vw, 4rem);
      font-weight: 800;
      letter-spacing: -0.06em;
      margin: 0 0 0.5rem;
    }

    p {
      max-width: 34rem;
      margin: 0 auto;
      font-size: 1.05rem;
      opacity: 0.88;
    }

    .back-link {
      color: white;
      text-decoration: none;
      font-weight: 700;
      position: absolute;
      left: 1.25rem;
      top: 1.25rem;
      padding: 0.7rem 1rem;
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
    }

    .back-link:focus-visible {
      outline: 2px solid white;
      outline-offset: 2px;
    }

    @media (max-width: 768px) {
      .header {
        padding: 4.8rem 1rem 3rem;
      }

      .back-link {
        left: 1rem;
        top: 1rem;
      }
    }
  `]
})
export class HeaderComponent {
  subtitle = input<string>('');
  backRoute = input<string>('');
}
