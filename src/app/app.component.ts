import { Component, inject, computed } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs';
import { AuthService } from './core/services/auth.service';
import { AppHeaderComponent } from './core/layout/header/header.component';
import { ConfirmDialogComponent } from './core/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, AppHeaderComponent, ConfirmDialogComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  private readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map(e => e.urlAfterRedirects || e.url)
    ),
    { initialValue: this.router.url }
  );

  readonly showHeader = computed(() => {
    if (!this.auth.isAuthenticated()) return false;
    const url = this.currentUrl();
    return !url.startsWith('/login') && !url.startsWith('/p/') && !url.startsWith('/public/') && !url.startsWith('/showcase') && !url.startsWith('/features');
  });

  readonly isBuilderMode = computed(() => {
    const url = this.currentUrl();
    return url.includes('/builder') || url.includes('/edit');
  });
}
