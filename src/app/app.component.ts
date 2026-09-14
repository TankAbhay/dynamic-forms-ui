import { Component, inject } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { AuthService } from './core/services/auth.service';
import { AppHeaderComponent } from './core/layout/header/header.component';
import { ConfirmDialogComponent } from './core/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, AppHeaderComponent, ConfirmDialogComponent],
  template: `
    @if (showHeader()) {
      <app-header />
    }
    <main class="app-main" [class.no-header]="!showHeader()" [class.builder-mode]="isBuilderMode()">
      <router-outlet />
    </main>
    <app-confirm-dialog />
  `,
  styles: [`
    .app-main {
      min-height: calc(100vh - 56px);
      min-height: calc(100dvh - 56px);
      background: #f8fafc;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      flex: 1 1 auto;
      width: 100%;
      /* Generous bottom padding to ensure content is fully scrollable and clear of mobile browser toolbars */
      padding-bottom: max(3.5rem, env(safe-area-inset-bottom, 32px));
    }
    .app-main.no-header {
      min-height: 100vh;
      min-height: 100dvh;
      padding-bottom: 0;
    }
    /* Only on large desktop screens when builder is active, lock viewport for the 3-column docked layout */
    @media (min-width: 1201px) {
      .app-main.builder-mode {
        height: calc(100vh - 56px);
        height: calc(100dvh - 56px);
        max-height: calc(100dvh - 56px);
        overflow: hidden;
        padding-bottom: 0;
      }
    }
  `]
})
export class AppComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  showHeader(): boolean {
    if (!this.auth.isAuthenticated()) return false;
    const url = this.router.url;
    return !url.startsWith('/login') && !url.startsWith('/p/') && !url.startsWith('/public/');
  }

  isBuilderMode(): boolean {
    const url = this.router.url;
    return url.includes('/builder') || url.includes('/edit');
  }
}
