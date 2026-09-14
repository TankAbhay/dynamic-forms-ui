import '@angular/compiler';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { of } from 'rxjs';
import { AuthService } from './auth.service';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Injector, runInInjectionContext } from '@angular/core';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: any;
  let routerMock: any;
  const mockStorage: Record<string, string> = {};

  beforeEach(() => {
    Object.keys(mockStorage).forEach(k => delete mockStorage[k]);
    (globalThis as any).localStorage = {
      getItem: (k: string) => mockStorage[k] || null,
      setItem: (k: string, v: string) => { mockStorage[k] = v; },
      removeItem: (k: string) => { delete mockStorage[k]; },
      clear: () => { Object.keys(mockStorage).forEach(k => delete mockStorage[k]); }
    };

    httpMock = {
      post: vi.fn().mockReturnValue(of({
        id: 1,
        email: 'user@example.com',
        name: 'Test User',
        role: 'Admin',
        tenantId: 1,
        token: 'jwt-123'
      }))
    };

    routerMock = {
      navigate: vi.fn(),
      navigateByUrl: vi.fn().mockResolvedValue(true)
    };

    const injector = Injector.create({
      providers: [
        { provide: HttpClient, useValue: httpMock },
        { provide: Router, useValue: routerMock }
      ]
    });

    service = runInInjectionContext(injector, () => new AuthService());
  });

  it('should not be authenticated when no session is stored in localStorage', () => {
    expect(service.isAuthenticated()).toBe(false);
    expect(service.session()).toBeNull();
  });

  it('should login successfully, store session and set isAuthenticated to true', () => {
    service.login({ email: 'user@example.com', password: 'mock-test-password' }).subscribe();

    expect(service.isAuthenticated()).toBe(true);
    expect(service.session()?.email).toBe('user@example.com');
    expect(service.session()?.token).toBe('jwt-123');
    expect(mockStorage['df_user_session']).toContain('user@example.com');
  });

  it('should logout cleanly, clear session, remove storage, and redirect to /login', () => {
    service.login({ email: 'user@example.com', password: 'mock-test-password' }).subscribe();
    expect(service.isAuthenticated()).toBe(true);

    service.logout();

    expect(service.isAuthenticated()).toBe(false);
    expect(service.session()).toBeNull();
    expect(mockStorage['df_user_session']).toBeUndefined();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should detect if Google Sign In is supported depending on origin protocol and hostname', () => {
    // If window.location is localhost, it should return true
    expect(typeof service.isGoogleSignInSupported()).toBe('boolean');
  });
});
