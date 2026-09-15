import { Injectable, inject, signal, computed, NgZone } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  UserSession,
  LoginPayload,
  RegisterPayload,
  RegisterResponse,
  ForgotPasswordResponse,
  ResetPasswordPayload,
  AuthOperationResponse,
  GoogleCredentialResponse
} from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private readonly ngZone = inject(NgZone, { optional: true });
  private apiUrl = `${environment.apiUrl}/auth`;
  private readonly STORAGE_KEY = 'df_user_session';

  private _session = signal<UserSession | null>(this.loadSession());
  readonly session = this._session.asReadonly();
  readonly currentUser = this._session.asReadonly();
  readonly isAuthenticated = computed(() => !!this._session());
  readonly currentRole = computed(() => this._session()?.role ?? 'User');
  readonly isAdmin = computed(() => {
    const s = this._session();
    if (!s) return false;
    return s.roleId === 2 || s.role?.toLowerCase() === 'admin';
  });

  constructor() {
    // Session is strictly loaded from localStorage. No automatic forced logins.
  }

  private loadSession(): UserSession | null {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  }

  login(payload: LoginPayload): Observable<UserSession> {
    return this.http.post<UserSession>(`${this.apiUrl}/login`, payload).pipe(
      tap((res) => {
        this.setSession(res);
      })
    );
  }

  loginWithGoogle(email: string, name?: string, credential?: string): Observable<UserSession> {
    return this.http.post<UserSession>(`${this.apiUrl}/google-login`, { email, name, credential }).pipe(
      tap((res) => {
        this.setSession(res);
      })
    );
  }

  register(payload: RegisterPayload): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${this.apiUrl}/register`, payload);
  }

  resendVerification(email: string): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${this.apiUrl}/resend-verification`, { email });
  }

  verifyEmail(token: string): Observable<UserSession> {
    return this.http.get<UserSession>(`${this.apiUrl}/verify-email?token=${encodeURIComponent(token)}`).pipe(
      tap((res) => {
        this.setSession(res);
      })
    );
  }

  forgotPassword(email: string): Observable<ForgotPasswordResponse> {
    return this.http.post<ForgotPasswordResponse>(`${this.apiUrl}/forgot-password`, { email });
  }

  resetPassword(payload: ResetPasswordPayload): Observable<AuthOperationResponse> {
    return this.http.post<AuthOperationResponse>(`${this.apiUrl}/reset-password`, payload);
  }

  private googleInitialized = false;

  isGoogleSignInSupported(): boolean {
    if (typeof window === 'undefined' || !window.location) return false;
    return !!(environment.googleClientId);
  }

  initGoogleSignIn(buttonElementId: string, onSuccess: () => void, onStart?: () => void, onError?: (err: unknown) => void): void {
    if (typeof window === 'undefined' || !this.isGoogleSignInSupported()) return;

    const clientId = environment.googleClientId;

    let attempts = 0;
    const render = () => {
      if (typeof window === 'undefined') return;
      const g = window.google;
      if (!g?.accounts?.id) {
        attempts++;
        if (attempts < 50) {
          setTimeout(render, 150);
        }
        return;
      }

      try {
        const w = window as unknown as { __gsiInitialized?: boolean };
        if (!this.googleInitialized && !w.__gsiInitialized) {
          g.accounts.id.initialize({
            client_id: clientId,
            callback: (response: GoogleCredentialResponse) => {
              this.handleGoogleCredentialResponse(response, onSuccess, onStart, onError);
            },
            error_callback: (error: unknown) => {
              console.warn('[Google GIS Notice] Google Identity Services error:', error);
              if (onError) onError(error);
            }
          });
          this.googleInitialized = true;
          w.__gsiInitialized = true;
        }

        const el = document.getElementById(buttonElementId);
        if (!el) {
          attempts++;
          if (attempts < 50) {
            setTimeout(render, 150);
          }
          return;
        }

        el.innerHTML = '';
        // Calculate container width safely for mobile viewports
        // Google GIS width must be between 200 and 400 pixels
        const parentWidth = el.parentElement?.clientWidth || el.clientWidth || 0;
        const fallbackWidth = typeof window !== 'undefined' ? window.innerWidth - 64 : 320;
        const availableWidth = parentWidth > 0 ? parentWidth : fallbackWidth;
        const targetWidth = Math.min(Math.max(Math.floor(availableWidth) - 4, 200), 380);

        g.accounts.id.renderButton(el, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          text: 'signin_with',
          shape: 'rectangular',
          logo_alignment: 'left',
          width: targetWidth
        });
      } catch (err: unknown) {
        console.warn('[Google GIS Catch] Render error:', err);
      }
    };

    render();
  }

  handleGoogleCredentialResponse(response: GoogleCredentialResponse, onSuccess: () => void, onStart?: () => void, onError?: (err: unknown) => void): void {
    const idToken = response?.credential;
    if (!idToken) {
      console.error('[Google Auth] No credential token received.');
      return;
    }

    if (onStart) onStart();

    this.http.post<UserSession>(`${this.apiUrl}/google-login`, { credential: idToken }).subscribe({
      next: (res) => {
        const runSuccess = () => {
          this.setSession(res);
          onSuccess();
        };
        if (this.ngZone) {
          this.ngZone.run(runSuccess);
        } else {
          runSuccess();
        }
      },
      error: (err: unknown) => {
        console.error('[Google Auth Error]', err);
        if (onError) onError(err);
      }
    });
  }

  logout(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch {
      // Ignore
    }
    if (typeof window !== 'undefined') {
      const g = window.google;
      if (g?.accounts?.id) {
        try {
          g.accounts.id.disableAutoSelect();
        } catch {
          // Ignore
        }
      }
    }
    this._session.set(null);

    const performNavigation = () => {
      this.router.navigate(['/login']);
    };

    if (this.ngZone) {
      this.ngZone.run(performNavigation);
    } else {
      performNavigation();
    }
  }

  private setSession(session: UserSession): void {
    this._session.set(session);
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(session));
    } catch {
      // Ignore storage errors
    }
  }
}
