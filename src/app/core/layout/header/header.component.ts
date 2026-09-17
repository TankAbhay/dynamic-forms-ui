import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd, RouterLink, RouterLinkActive } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { TranslationService } from '../../services/translation.service';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-header',
  imports: [CommonModule, RouterLink, RouterLinkActive, TranslatePipe],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class AppHeaderComponent implements OnInit, OnDestroy {
  readonly auth = inject(AuthService);
  readonly i18n = inject(TranslationService);
  private readonly router = inject(Router);
  readonly mobileMenuOpen = signal<boolean>(false);
  private navSub?: Subscription;

  ngOnInit(): void {
    this.navSub = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.closeMobileMenu();
      });
  }

  ngOnDestroy(): void {
    this.navSub?.unsubscribe();
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen.update(v => !v);
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen.set(false);
  }
}

