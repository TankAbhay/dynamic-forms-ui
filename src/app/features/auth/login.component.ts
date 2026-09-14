import { Component, OnInit, AfterViewInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="login-wrapper">
      <div class="login-card">
        <!-- Seamless Loading Overlay during Authentication -->
        @if (isAuthenticating()) {
          <div class="auth-loading-overlay">
            <div class="spinner-core">
              <div class="spinner-pulse"></div>
              <i class="fas fa-shield-halved spinner-center-icon"></i>
            </div>
            <h3 class="loading-title">{{ authStatus() }}</h3>
            <p class="loading-subtitle">{{ authSubStatus() }}</p>
            <div class="loading-progress">
              <div class="progress-bar-animated"></div>
            </div>
          </div>
        }

        <!-- Logo Header -->
        <div class="login-header">
          <div class="brand-badge">
            <i class="fas fa-file-signature"></i>
          </div>
          <h2>Dynamic Forms</h2>
          <p class="subtitle">Dynamic Form Builder & Management Platform</p>
        </div>

        <!-- Google Single Sign-On -->
        @if (googleSignInAvailable()) {
          <div class="google-signin-section">
            <div id="googleSignInBtn" class="google-btn-container"></div>
            <p class="google-hint">Enterprise Single Sign-On powered by Google Identity</p>
          </div>

          <div class="auth-divider">
            <span>or sign in with email</span>
          </div>
        }

        @if (errorMessage()) {
          <div class="alert alert-danger">
            <i class="fas fa-exclamation-circle"></i>
            <div>{{ errorMessage() }}</div>
          </div>
        }

        @if (unverifiedEmail()) {
          <div class="unverified-card">
            <div class="unverified-header">
              <i class="fas fa-envelope-circle-check"></i>
              <strong>Email Verification Needed</strong>
            </div>
            <p class="unverified-desc">
              Your account <strong>{{ unverifiedEmail() }}</strong> is registered but needs activation.
            </p>
            <button 
              type="button" 
              class="btn-resend-link" 
              (click)="onResendVerification()" 
              [disabled]="resendLoading()">
              @if (resendLoading()) {
                <i class="fas fa-spinner fa-spin"></i> Generating New Link...
              } @else {
                <i class="fas fa-paper-plane"></i> Resend Verification Link
              }
            </button>
            @if (resendSuccess()) {
              <div class="resend-success-msg">
                <i class="fas fa-check-circle"></i> {{ resendSuccess() }}
              </div>
            }
          </div>
        }

        @if (successMessage()) {
          <div class="alert alert-success">
            <i class="fas fa-check-circle"></i>
            <div>{{ successMessage() }}</div>
          </div>
        }

        <!-- Credentials Form -->
        <form (ngSubmit)="onSubmit()" class="login-form">
          <div class="form-group">
            <label class="form-label" for="loginEmail">Email Address</label>
            <div class="input-icon-wrap">
              <i class="fas fa-envelope icon-left"></i>
              <input 
                id="loginEmail"
                type="email" 
                class="form-control" 
                [ngModel]="email()" 
                (ngModelChange)="email.set($event)"
                name="email" 
                required 
                placeholder="name@example.com" 
                autocomplete="username"
              />
            </div>
          </div>

          <div class="form-group">
            <div class="label-row">
              <label class="form-label" for="loginPassword">Password</label>
              <a routerLink="/forgot-password" class="forgot-link" tabindex="-1">Forgot password?</a>
            </div>
            <div class="input-icon-wrap">
              <i class="fas fa-lock icon-left"></i>
              <input 
                id="loginPassword"
                [type]="showPassword() ? 'text' : 'password'" 
                class="form-control password-input" 
                [ngModel]="password()" 
                (ngModelChange)="password.set($event)"
                name="password" 
                required 
                placeholder="••••••••••••" 
                autocomplete="current-password"
              />
              <button 
                type="button" 
                class="btn-toggle-eye" 
                (click)="togglePasswordVisibility()" 
                [title]="showPassword() ? 'Hide password' : 'Show password'" 
                tabindex="-1">
                <i [class]="showPassword() ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
              </button>
            </div>
          </div>

          <button type="submit" class="btn-submit" [disabled]="loading()">
            @if (loading()) {
              <i class="fas fa-spinner fa-spin"></i>
              <span>Authenticating...</span>
            } @else {
              <i class="fas fa-arrow-right-to-bracket"></i>
              <span>Sign In</span>
            }
          </button>
        </form>

        <!-- Register Link -->
        <div class="register-callout">
          <span>Don't have an account yet? </span>
          <a routerLink="/register" class="register-link">Create an account</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-wrapper {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: radial-gradient(circle at top right, #1e293b, #0f172a 70%);
      padding: 1.5rem 1rem;
      box-sizing: border-box;
    }

    .login-card {
      position: relative;
      overflow: hidden;
      width: 100%;
      max-width: 440px;
      background: #ffffff;
      border-radius: 18px;
      padding: 2.25rem 2rem;
      box-shadow: 0 20px 45px -10px rgba(15, 23, 42, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1);
      box-sizing: border-box;

      @media (max-width: 480px) {
        padding: 1.5rem 1rem;
        border-radius: 14px;
      }
    }

    .auth-loading-overlay {
      position: absolute;
      inset: 0;
      background: rgba(255, 255, 255, 0.94);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      border-radius: 18px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      z-index: 50;
      padding: 2rem;
      text-align: center;
      animation: authFadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);

      .spinner-core {
        position: relative;
        width: 60px;
        height: 60px;
        margin-bottom: 1.25rem;
        display: flex;
        align-items: center;
        justify-content: center;

        .spinner-pulse {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          border: 3.5px solid #e2e8f0;
          border-top-color: #2563eb;
          border-right-color: #3b82f6;
          animation: authSpin 0.85s linear infinite;
        }

        .spinner-center-icon {
          font-size: 1.35rem;
          color: #2563eb;
        }
      }

      .loading-title {
        font-size: 1.2rem;
        font-weight: 800;
        color: #0f172a;
        margin: 0 0 0.35rem 0;
        letter-spacing: -0.02em;
      }

      .loading-subtitle {
        font-size: 0.85rem;
        color: #64748b;
        margin: 0 0 1.25rem 0;
        max-width: 280px;
        line-height: 1.45;
      }

      .loading-progress {
        width: 170px;
        height: 4px;
        background: #f1f5f9;
        border-radius: 999px;
        overflow: hidden;

        .progress-bar-animated {
          width: 50%;
          height: 100%;
          background: linear-gradient(90deg, #2563eb, #38bdf8);
          border-radius: 999px;
          animation: authProgress 1.3s ease-in-out infinite;
        }
      }
    }

    @keyframes authSpin {
      to { transform: rotate(360deg); }
    }

    @keyframes authFadeIn {
      from { opacity: 0; transform: scale(0.98); }
      to { opacity: 1; transform: scale(1); }
    }

    @keyframes authProgress {
      0% { transform: translateX(-100%); }
      50% { transform: translateX(100%); }
      100% { transform: translateX(300%); }
    }

    .login-header {
      text-align: center;
      margin-bottom: 1.5rem;

      .brand-badge {
        width: 54px;
        height: 54px;
        background: linear-gradient(135deg, #3b82f6, #1d4ed8);
        color: #ffffff;
        border-radius: 14px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-size: 1.6rem;
        margin-bottom: 0.75rem;
        box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
      }

      h2 {
        font-size: 1.5rem;
        font-weight: 800;
        color: #0f172a;
        margin: 0;
        letter-spacing: -0.02em;
      }

      .subtitle {
        color: #64748b;
        font-size: 0.85rem;
        margin: 0.25rem 0 0 0;
      }
    }

    .google-signin-section {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      width: 100%;
      margin-bottom: 0.5rem;

      .google-btn-container {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100%;
        max-width: 100%;
        min-height: 44px;
        box-sizing: border-box;

        /* Force Google iframe and wrapper to center perfectly without overflowing */
        > div {
          margin: 0 auto !important;
          max-width: 100% !important;
          display: flex !important;
          justify-content: center !important;
        }

        iframe {
          margin: 0 auto !important;
          max-width: 100% !important;
        }
      }

      .google-hint {
        font-size: 0.75rem;
        color: #94a3b8;
        margin: 0;
        text-align: center;
      }
    }

    .auth-divider {
      margin: 1.25rem 0 1.5rem 0;
      position: relative;
      text-align: center;
      border-bottom: 1px solid #e2e8f0;

      span {
        position: relative;
        top: 0.65rem;
        background: #ffffff;
        padding: 0 0.85rem;
        color: #94a3b8;
        font-size: 0.8rem;
        font-weight: 500;
      }
    }

    .login-form {
      display: flex;
      flex-direction: column;
      gap: 1.15rem;

      .form-group {
        display: flex;
        flex-direction: column;

        .form-label {
          font-size: 0.82rem;
          font-weight: 700;
          color: #334155;
          margin-bottom: 0.4rem;
        }

        .label-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.4rem;

          .forgot-link {
            font-size: 0.78rem;
            color: #2563eb;
            font-weight: 600;
            text-decoration: none;

            &:hover {
              text-decoration: underline;
            }
          }
        }

        .input-icon-wrap {
          position: relative;
          width: 100%;

          .icon-left {
            position: absolute;
            left: 1rem;
            top: 50%;
            transform: translateY(-50%);
            color: #94a3b8;
            font-size: 0.95rem;
            pointer-events: none;
          }

          .form-control {
            width: 100%;
            min-height: 46px;
            box-sizing: border-box;
            border: 1.5px solid #cbd5e1;
            border-radius: 10px;
            padding: 0.65rem 2.6rem 0.65rem 2.65rem;
            font-size: 0.95rem;
            color: #0f172a;
            background: #ffffff;
            transition: all 0.2s ease;

            &::placeholder {
              color: #94a3b8;
            }

            &:focus {
              outline: none;
              border-color: #2563eb;
              box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
            }
          }

          .btn-toggle-eye {
            position: absolute;
            right: 0.75rem;
            top: 50%;
            transform: translateY(-50%);
            width: 32px;
            height: 32px;
            background: transparent;
            border: none;
            color: #94a3b8;
            cursor: pointer;
            font-size: 0.95rem;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 6px;
            transition: color 0.15s ease;

            &:hover {
              color: #1e293b;
            }
          }
        }
      }

      .btn-submit {
        width: 100%;
        min-height: 46px;
        background: #2563eb;
        color: #ffffff;
        border: none;
        border-radius: 10px;
        font-weight: 700;
        font-size: 0.95rem;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 0.6rem;
        cursor: pointer;
        transition: all 0.2s ease;
        box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);
        margin-top: 0.25rem;

        &:hover:not(:disabled) {
          background: #1d4ed8;
          transform: translateY(-1px);
        }

        &:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }
      }
    }

    .alert {
      padding: 0.75rem 1rem;
      border-radius: 8px;
      margin-bottom: 1.25rem;
      font-size: 0.85rem;
      display: flex;
      align-items: flex-start;
      gap: 0.65rem;
      line-height: 1.4;

      i {
        margin-top: 0.15rem;
        font-size: 1rem;
        flex-shrink: 0;
      }

      &.alert-danger {
        background: #fee2e2;
        color: #b91c1c;
        border: 1px solid #fecaca;
      }

      &.alert-success {
        background: #dcfce7;
        color: #15803d;
        border: 1px solid #bbf7d0;
      }
    }

    .unverified-card {
      background: #eff6ff;
      border: 1.5px solid #bfdbfe;
      border-radius: 12px;
      padding: 1rem;
      margin-bottom: 1.25rem;
      text-align: left;

      .unverified-header {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: #1d4ed8;
        font-size: 0.95rem;
        margin-bottom: 0.4rem;

        i {
          font-size: 1.1rem;
        }
      }

      .unverified-desc {
        font-size: 0.82rem;
        color: #334155;
        margin: 0 0 0.75rem 0;
        line-height: 1.45;

        strong {
          color: #0f172a;
          word-break: break-all;
        }
      }

      .btn-resend-link {
        width: 100%;
        background: #2563eb;
        color: #ffffff;
        border: none;
        border-radius: 8px;
        padding: 0.55rem 0.85rem;
        font-size: 0.82rem;
        font-weight: 700;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 0.45rem;
        cursor: pointer;
        transition: background 0.2s;

        &:hover:not(:disabled) {
          background: #1d4ed8;
        }

        &:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      }

      .resend-success-msg {
        margin-top: 0.5rem;
        font-size: 0.8rem;
        color: #15803d;
        display: flex;
        align-items: center;
        gap: 0.4rem;
      }
    }

    .register-callout {
      text-align: center;
      margin-top: 1.5rem;
      font-size: 0.86rem;
      color: #475569;

      .register-link {
        color: #2563eb;
        font-weight: 700;
        text-decoration: none;

        &:hover {
          text-decoration: underline;
        }
      }
    }
  `]
})
export class LoginComponent implements OnInit, AfterViewInit, OnDestroy {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly email = signal<string>('');
  readonly password = signal<string>('');
  readonly loading = signal<boolean>(false);
  readonly isAuthenticating = signal<boolean>(false);
  readonly authStatus = signal<string>('Signing In...');
  readonly authSubStatus = signal<string>('Verifying your credentials...');
  readonly errorMessage = signal<string>('');
  readonly successMessage = signal<string>('');
  readonly showPassword = signal<boolean>(false);
  readonly googleSignInAvailable = signal<boolean>(false);

  readonly unverifiedEmail = signal<string>('');
  readonly resendLoading = signal<boolean>(false);
  readonly resendSuccess = signal<string>('');

  private resizeListener?: () => void;
  private resizeTimer?: any;

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      const defaultUrl = this.authService.isAdmin() ? '/admin' : '/forms';
      const returnUrl = this.route.snapshot.queryParams['returnUrl'] || defaultUrl;
      this.router.navigateByUrl(returnUrl);
      return;
    }

    this.googleSignInAvailable.set(this.authService.isGoogleSignInSupported());

    // Check if redirected with verified message
    if (this.route.snapshot.queryParams['verified'] === 'true') {
      this.successMessage.set('Your email has been successfully verified! Please sign in.');
    } else if (this.route.snapshot.queryParams['reset'] === 'true') {
      this.successMessage.set('Password reset successfully! Please sign in with your new password.');
    }
  }

  ngAfterViewInit(): void {
    if (!this.googleSignInAvailable()) return;
    this.renderGoogleBtn();

    // Re-render Google button dynamically on orientation change or window resize
    if (typeof window !== 'undefined') {
      this.resizeListener = () => {
        clearTimeout(this.resizeTimer);
        this.resizeTimer = setTimeout(() => {
          this.renderGoogleBtn();
        }, 200);
      };
      window.addEventListener('resize', this.resizeListener);
    }
  }

  private renderGoogleBtn(): void {
    this.authService.initGoogleSignIn(
      'googleSignInBtn',
      () => {
        this.authStatus.set('Google Account Verified!');
        this.authSubStatus.set('Redirecting to your dashboard...');
        const defaultUrl = this.authService.isAdmin() ? '/admin' : '/forms';
        const returnUrl = this.route.snapshot.queryParams['returnUrl'] || defaultUrl;
        this.router.navigateByUrl(returnUrl).catch(() => {
          this.isAuthenticating.set(false);
        });
      },
      () => {
        this.isAuthenticating.set(true);
        this.authStatus.set('Authenticating with Google...');
        this.authSubStatus.set('Verifying Google Identity credentials...');
      },
      () => {
        this.isAuthenticating.set(false);
        this.errorMessage.set('Google sign-in failed. Please try again.');
      }
    );
  }

  ngOnDestroy(): void {
    if (typeof window !== 'undefined' && this.resizeListener) {
      window.removeEventListener('resize', this.resizeListener);
    }
    clearTimeout(this.resizeTimer);
  }

  togglePasswordVisibility(): void {
    this.showPassword.update(v => !v);
  }

  onSubmit(): void {
    const emailVal = this.email().trim();
    const passwordVal = this.password();
    if (!emailVal || !passwordVal) {
      this.errorMessage.set('Please enter both your email address and password.');
      return;
    }

    this.loading.set(true);
    this.isAuthenticating.set(true);
    this.authStatus.set('Signing In...');
    this.authSubStatus.set('Verifying credentials with server...');
    this.errorMessage.set('');

    this.authService.login({
      email: emailVal,
      password: passwordVal,
    }).subscribe({
      next: () => {
        this.authStatus.set('Welcome Back!');
        this.authSubStatus.set('Preparing your workspace and redirecting...');
        const defaultUrl = this.authService.isAdmin() ? '/admin' : '/forms';
        const returnUrl = this.route.snapshot.queryParams['returnUrl'] || defaultUrl;
        this.router.navigateByUrl(returnUrl).catch(() => {
          this.loading.set(false);
          this.isAuthenticating.set(false);
        });
      },
      error: (err: unknown) => {
        this.loading.set(false);
        this.isAuthenticating.set(false);
        const errObj = (err as { error?: { message?: string; isEmailUnverified?: boolean; email?: string } })?.error;
        if (errObj?.isEmailUnverified) {
          this.unverifiedEmail.set(errObj.email || emailVal);
        } else {
          this.unverifiedEmail.set('');
        }
        this.errorMessage.set(errObj?.message || 'Login failed. Please check your credentials.');
      }
    });
  }

  onResendVerification(): void {
    const emailToResend = this.unverifiedEmail() || this.email().trim();
    if (!emailToResend) return;

    this.resendLoading.set(true);
    this.resendSuccess.set('');

    this.authService.resendVerification(emailToResend).subscribe({
      next: (res) => {
        this.resendLoading.set(false);
        this.resendSuccess.set(res.message || 'Verification link dispatched successfully!');
      },
      error: (err: unknown) => {
        this.resendLoading.set(false);
        const msg = (err as { error?: { message?: string } })?.error?.message;
        this.errorMessage.set(msg || 'Failed to resend verification link.');
      }
    });
  }
}
