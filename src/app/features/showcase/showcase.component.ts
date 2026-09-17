import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { FeatureTab, ShowcaseStat, TechStackItem } from './models/showcase.model';

@Component({
  selector: 'app-showcase',
  imports: [CommonModule, RouterLink],
  templateUrl: './showcase.component.html',
  styleUrl: './showcase.component.scss'
})
export class ShowcaseComponent {
  readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly activeTab = signal<FeatureTab>('ai');

  readonly stats: ShowcaseStat[] = [
    { value: '19+', label: 'Dynamic Field Types' },
    { value: '< 3s', label: 'AI Form Generation' },
    { value: '0 Tokens', label: 'Instant Edge Suggestions' },
    { value: '92 kB', label: 'Initial Bundle Transfer' }
  ];

  readonly techStack: TechStackItem[] = [
    { name: 'Angular 22', role: 'Frontend Framework', icon: 'fa-brands fa-angular', color: '#dd0031' },
    { name: '.NET 10 Web API', role: 'Enterprise Backend', icon: 'fa-brands fa-microsoft', color: '#512bd4' },
    { name: 'C# 14', role: 'Type-Safe Architecture', icon: 'fa-solid fa-code', color: '#239120' },
    { name: 'SQL Server', role: 'Relational & JSON Storage', icon: 'fa-solid fa-database', color: '#cc292b' },
    { name: 'Gemini AI', role: 'Generative Form Copilot', icon: 'fa-solid fa-wand-magic-sparkles', color: '#3b82f6' },
    { name: 'Angular Signals', role: 'Reactivity Engine', icon: 'fa-solid fa-bolt', color: '#f59e0b' },
    { name: 'Dapper / SPs', role: 'High-Speed Data Access', icon: 'fa-solid fa-gauge-high', color: '#06b6d4' },
    { name: 'Google SSO', role: 'Enterprise OAuth Identity', icon: 'fa-brands fa-google', color: '#ea4335' }
  ];

  selectTab(tab: FeatureTab, shouldScroll: boolean = true): void {
    this.activeTab.set(tab);
    if (shouldScroll && typeof document !== 'undefined') {
      const el = document.getElementById('interactive-features');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }

  navigateToApp(): void {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/forms']);
    } else {
      this.router.navigate(['/login']);
    }
  }
}
