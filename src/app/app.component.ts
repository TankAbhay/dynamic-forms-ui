import { Component, inject } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { AuthService } from './core/services/auth.service';
import { AppHeaderComponent } from './core/layout/header/header.component';
import { ConfirmDialogComponent } from './core/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, AppHeaderComponent, ConfirmDialogComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  showHeader(): boolean {
    if (!this.auth.isAuthenticated()) return false;
    const url = this.router.url;
    return !url.startsWith('/login') && !url.startsWith('/p/') && !url.startsWith('/public/') && !url.startsWith('/showcase') && !url.startsWith('/features');
  }

  isBuilderMode(): boolean {
    const url = this.router.url;
    return url.includes('/builder') || url.includes('/edit');
  }
}
