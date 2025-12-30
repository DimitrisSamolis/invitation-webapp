import { Component } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent],
  template: `
    @if (!isPublicRoute) {
      <app-header></app-header>
    }
    <main [class.public-page]="isPublicRoute">
      <router-outlet></router-outlet>
    </main>
  `,
  styles: [`
    main {
      min-height: calc(100vh - 64px);
      background: #fafafa;
    }
    main.public-page {
      min-height: 100vh;
    }
  `]
})
export class AppComponent {
  title = 'Invitation Web App';
  isPublicRoute = false;

  constructor(private router: Router) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      // Hide header for invitation view and RSVP pages
      this.isPublicRoute = event.url.startsWith('/invitation/') || event.url.startsWith('/rsvp/');
    });
  }
}
