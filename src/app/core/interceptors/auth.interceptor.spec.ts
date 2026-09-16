import '@angular/compiler';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authInterceptor } from './auth.interceptor';
import { HttpRequest, HttpHandlerFn, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Injector, runInInjectionContext } from '@angular/core';
import { of, throwError } from 'rxjs';

describe('authInterceptor', () => {
  let routerMock: { navigate: ReturnType<typeof vi.fn> };
  let injector: Injector;
  const mockStorage: Record<string, string> = {};

  beforeEach(() => {
    Object.keys(mockStorage).forEach(k => delete mockStorage[k]);
    (globalThis as any).localStorage = {
      getItem: (k: string) => mockStorage[k] || null,
      setItem: (k: string, v: string) => { mockStorage[k] = v; },
      removeItem: (k: string) => { delete mockStorage[k]; }
    };

    routerMock = {
      navigate: vi.fn()
    };

    injector = Injector.create({
      providers: [
        { provide: Router, useValue: routerMock }
      ]
    });
  });

  it('should attach Authorization header when session token exists', () => {
    mockStorage['df_user_session'] = JSON.stringify({ token: 'jwt-abc-123' });

    const req = new HttpRequest('GET', '/api/forms');
    const next: HttpHandlerFn = (interceptedReq) => {
      expect(interceptedReq.headers.get('Authorization')).toBe('Bearer jwt-abc-123');
      return of(new HttpResponse({ status: 200 }));
    };

    runInInjectionContext(injector, () => {
      authInterceptor(req, next).subscribe();
    });
  });

  it('should not attach Authorization header if none in session', () => {
    const req = new HttpRequest('GET', '/api/public/form-1');
    const next: HttpHandlerFn = (interceptedReq) => {
      expect(interceptedReq.headers.has('Authorization')).toBe(false);
      return of(new HttpResponse({ status: 200 }));
    };

    runInInjectionContext(injector, () => {
      authInterceptor(req, next).subscribe();
    });
  });

  it('should redirect to login on 401 error for protected endpoints', () => {
    mockStorage['df_user_session'] = JSON.stringify({ token: 'expired-jwt' });
    const req = new HttpRequest('GET', '/api/forms/builder/1');
    const next: HttpHandlerFn = () => throwError(() => new HttpErrorResponse({ status: 401 }));

    runInInjectionContext(injector, () => {
      authInterceptor(req, next).subscribe({
        error: () => {
          expect(routerMock.navigate).toHaveBeenCalledWith(['/login']);
          expect(mockStorage['df_user_session']).toBeUndefined();
        }
      });
    });
  });
});
