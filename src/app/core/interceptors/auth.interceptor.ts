import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  let token = '';
  try {
    const sessionStr = localStorage.getItem('df_user_session');
    if (sessionStr) {
      const session = JSON.parse(sessionStr);
      token = session?.token || '';
    }
  } catch {
    // Ignore JSON errors
  }

  let authReq = req;
  if (token && !req.headers.has('Authorization')) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !req.url.includes('/auth/login') && !req.url.includes('/public/')) {
        console.warn('[AuthInterceptor] 401 Unauthorized encountered. Redirecting to login.');
        try {
          localStorage.removeItem('df_user_session');
        } catch {}
        router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};
