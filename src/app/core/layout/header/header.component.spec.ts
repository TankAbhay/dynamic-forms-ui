import '@angular/compiler';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AppHeaderComponent } from './header.component';
import { AuthService } from '../../services/auth.service';
import { TranslationService } from '../../services/translation.service';
import { Injector, runInInjectionContext } from '@angular/core';

describe('AppHeaderComponent', () => {
  let component: AppHeaderComponent;
  let authServiceMock: { session: ReturnType<typeof vi.fn>; logout: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    authServiceMock = {
      session: vi.fn().mockReturnValue({ name: 'Admin User', email: 'admin@dynamicforms.com', role: 'Admin' }),
      logout: vi.fn()
    };

    const injector = Injector.create({
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: TranslationService, useClass: TranslationService }
      ]
    });

    component = runInInjectionContext(injector, () => new AppHeaderComponent());
  });

  it('should initialize header with injected auth and translation services', () => {
    expect(component.auth).toBeDefined();
    expect(component.i18n).toBeDefined();
    expect(component.auth.session()?.name).toBe('Admin User');
  });
});
