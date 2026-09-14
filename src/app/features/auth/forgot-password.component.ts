import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="auth-wrapper">
      <div class="auth-card">
        @if (emailSent()) {
          <div class="success-screen">
            <div class="icon-wrap">
              <i class="fas fa-paper-plane"></i>
            </div>
            <h2>Check Your Email</h2>
            <p class="desc">
              If an account matches <strong>{{ email() }}</strong>, we've sent password reset instructions.
            </p>

            <div class="info-callout">
              <i class="fas fa-clock"></i>
              <span>The password reset link is valid for <strong>24 hours (1 day)</strong>. Please check your inbox and spam folder.</span>
            </div>

            <div class="action-footer">
              <a routerLink="/login" class="btn-return-login">
                <i class="fas fa-arrow-left"></i> Return to Sign In
              </a>
            </div>
          </div>
        } @else {
          <div class="auth-header">
            <div class="brand-badge">
              <i class="fas fa-key"></i>
            </div>
            <h2>Forgot Password?</h2>
            <p class="subtitle">Enter your email and we'll send a 24-hour reset link</p>
          </div>

          @if (errorMessage()) {
            <div class="alert alert-danger">
              <i class="fas fa-exclamation-circle"></i>
              <div>{{ errorMessage() }}</div>
            </div>
          }

          <form (ngSubmit)="onSubmit()" class="auth-form">
            <div class="form-group">
              <label class="form-label" for="forgotEmail">Email Address</label>
              <div class="input-icon-wrap">
                <i class="fas fa-envelope icon-left"></i>
                <input 
                  id="forgotEmail"
                  type="email" 
                  class="form-control" 
                  [ngModel]="email()" 
                  (ngModelChange)="email.set($event)"
                  name="email" 
                  required 
                  placeholder="name@example.com" 
                  autocomplete="email"
                />
              </div>
            </div>

            <button type="submit" class="btn-submit" [disabled]="loading()">
              @if (loading()) {
                <i class="fas fa-spinner fa-spin"></i>
                <span>Sending Reset Link...</span>
              } @else {
                <i class="fas fa-envelope"></i>
                <span>Send Password Reset Link</span>
              }
            </button>
          </form>

          <div class="login-callout">
            <span>Remembered your password? </span>
            <a routerLink="/login" class="login-link">Sign In</a>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .auth-wrapper {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: radial-gradient(circle at top right, #1e293b, #0f172a 70%);
      padding: 1.5rem 1rem;
      box-sizing: border-box;
    }

    .auth-card {
      width: 100%;
      max-width: 440px;
      background: #ffffff;
      border-radius: 18px;
      padding: 2.5rem 2rem;
      box-shadow: 0 20px 45px -10px rgba(15, 23, 42, 0.4);
      box-sizing: border-box;

      @media (max-width: 480px) {
        padding: 1.75rem 1.25rem;
        border-radius: 14px;
      }
    }

    .auth-header {
      text-align: center;
      margin-bottom: 1.5rem;

      .brand-badge {
        width: 54px;
        height: 54px;
        background: linear-gradient(135deg, #f59e0b, #d97706);
        color: #ffffff;
        border-radius: 14px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-size: 1.5rem;
        margin-bottom: 0.75rem;
        box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
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

    .auth-form {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;

      .form-group {
        display: flex;
        flex-direction: column;

        .form-label {
          font-size: 0.82rem;
          font-weight: 700;
          color: #334155;
          margin-bottom: 0.4rem;
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
            padding: 0.65rem 1rem 0.65rem 2.65rem;
            font-size: 0.95rem;
            color: #0f172a;
            background: #ffffff;
            transition: all 0.2s ease;

            &:focus {
              outline: none;
              border-color: #2563eb;
              box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
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
        margin-top: 0.5rem;

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

      &.alert-danger {
        background: #fee2e2;
        color: #b91c1c;
        border: 1px solid #fecaca;
      }
    }

    .login-callout {
      text-align: center;
      margin-top: 1.5rem;
      font-size: 0.86rem;
      color: #475569;

      .login-link {
        color: #2563eb;
        font-weight: 700;
        text-decoration: none;

        &:hover {
          text-decoration: underline;
        }
      }
    }

    .success-screen {
      text-align: center;
      padding: 1rem 0;

      .icon-wrap {
        width: 72px;
        height: 72px;
        border-radius: 50%;
        background: #eff6ff;
        color: #2563eb;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 2rem;
        margin: 0 auto 1.25rem auto;
      }

      h2 {
        font-size: 1.5rem;
        font-weight: 800;
        color: #0f172a;
        margin: 0 0 0.5rem 0;
      }

      .desc {
        font-size: 0.95rem;
        color: #475569;
        line-height: 1.55;
        margin: 0 0 1.25rem 0;
      }

      .info-callout {
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 10px;
        padding: 0.85rem 1rem;
        display: flex;
        align-items: flex-start;
        gap: 0.65rem;
        font-size: 0.85rem;
        color: #475569;
        text-align: left;
        line-height: 1.45;
        margin-bottom: 1.5rem;

        i {
          color: #3b82f6;
          margin-top: 0.15rem;
          font-size: 1rem;
          flex-shrink: 0;
        }
      }

      .action-footer {
        .btn-return-login {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          color: #64748b;
          font-weight: 600;
          font-size: 0.88rem;
          text-decoration: none;

          &:hover {
            color: #0f172a;
          }
        }
      }
    }
  `]
})
export class ForgotPasswordComponent {
  private readonly authService = inject(AuthService);

  readonly email = signal<string>('');
  readonly loading = signal<boolean>(false);
  readonly errorMessage = signal<string>('');
  readonly emailSent = signal<boolean>(false);

  onSubmit(): void {
    const emailVal = this.email().trim();
    if (!emailVal) {
      this.errorMessage.set('Please enter your registered email address.');
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    this.authService.forgotPassword(emailVal).subscribe({
      next: () => {
        this.loading.set(false);
        this.emailSent.set(true);
      },
      error: (err: unknown) => {
        this.loading.set(false);
        const message = (err as { error?: { message?: string } })?.error?.message;
        this.errorMessage.set(message || 'Failed to send reset link. Please try again.');
      }
    });
  }
}
