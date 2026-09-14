import { Component, inject, effect } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { AuthService } from './core/services/auth.service';
import { AppHeaderComponent } from './core/layout/header/header.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, AppHeaderComponent],
  template: `
    @if (showHeader()) {
      <app-header />
    }
    <main class="app-main" [class.no-header]="!showHeader()">
      <router-outlet />
    </main>
  `,
  styles: [`
    .app-main {
      min-height: calc(100vh - 60px);
      height: calc(100vh - 60px);
      overflow-y: auto;
      background: #f8fafc;
    }
    .app-main.no-header {
      min-height: 100vh;
      height: 100vh;
    }
  `]
})
export class AppComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  constructor() {
    effect(() => {
      const isAuth = this.auth.isAuthenticated();
      const currentUrl = this.router.url;
      const isPublic = currentUrl.startsWith('/login') || 
                       currentUrl.startsWith('/register') || 
                       currentUrl.startsWith('/forgot-password') || 
                       currentUrl.startsWith('/reset-password') || 
                       currentUrl.startsWith('/verify-email') || 
                       currentUrl.startsWith('/p/') || 
                       currentUrl.startsWith('/public/');
      if (!isAuth && !isPublic) {
        this.router.navigateByUrl('/login');
      }
    });
  }

  showHeader(): boolean {
    if (!this.auth.isAuthenticated()) return false;
    const url = this.router.url;
    return !url.startsWith('/login') && !url.startsWith('/p/') && !url.startsWith('/public/');
  }
}
