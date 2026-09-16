import '@angular/compiler';
import { describe, it, expect, beforeEach } from 'vitest';
import { adminGuard } from './admin.guard';
import { authGuard } from './auth.guard';
import { Injector, runInInjectionContext } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router, UrlTree, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

describe('Route Guards', () => {
  let authServiceMock: { isAdmin: () => boolean; isAuthenticated: () => boolean };
  let routerMock: { createUrlTree: (commands: any[], extras?: any) => any };
  let injector: Injector;

  beforeEach(() => {
    authServiceMock = {
      isAdmin: () => false,
      isAuthenticated: () => false
    };

    routerMock = {
      createUrlTree: (commands: any[]) => ({ tree: commands })
    };

    injector = Injector.create({
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock }
      ]
    });
  });

  describe('adminGuard', () => {
    it('should allow access when user is admin', () => {
      authServiceMock.isAdmin = () => true;

      const result = runInInjectionContext(injector, () => {
        return adminGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot);
      });

      expect(result).toBe(true);
    });

    it('should redirect to /forms when user is not admin', () => {
      authServiceMock.isAdmin = () => false;

      const result = runInInjectionContext(injector, () => {
        return adminGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot);
      });

      expect(result).toEqual({ tree: ['/forms'] });
    });
  });

  describe('authGuard', () => {
    it('should allow access when authenticated', () => {
      authServiceMock.isAuthenticated = () => true;

      const result = runInInjectionContext(injector, () => {
        return authGuard({} as ActivatedRouteSnapshot, { url: '/forms' } as RouterStateSnapshot);
      });

      expect(result).toBe(true);
    });

    it('should redirect to login when unauthenticated', () => {
      authServiceMock.isAuthenticated = () => false;

      const result = runInInjectionContext(injector, () => {
        return authGuard({} as ActivatedRouteSnapshot, { url: '/forms' } as RouterStateSnapshot);
      });

      expect(result).toEqual({ tree: ['/login'] });
    });
  });
});
