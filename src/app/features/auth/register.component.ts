import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="auth-wrapper">
      <div class="auth-card">
        @if (registrationSuccess()) {
          <!-- Success State: Email Sent -->
          <div class="success-screen">
            <div class="success-icon-wrap">
              <i class="fas fa-envelope-open-text"></i>
            </div>
            <h2>Verify Your Email</h2>
            <p class="desc">
              We've sent an activation link to <br />
              <strong class="email-highlight">{{ email() }}</strong>
            </p>

            <div class="info-callout">
              <i class="fas fa-clock"></i>
              <span>This verification link is valid for <strong>24 hours (1 day)</strong>. Please check your inbox and spam folder to activate your account.</span>
            </div>

            <div class="action-footer">
              <a routerLink="/login" class="btn-return-login">
                <i class="fas fa-arrow-left"></i> Return to Sign In
              </a>
            </div>
          </div>
        } @else {
          <!-- Registration Form -->
          <div class="auth-header">
            <div class="brand-badge">
              <i class="fas fa-user-plus"></i>
            </div>
            <h2>Create an Account</h2>
            <p class="subtitle">Join Dynamic Forms platform</p>
          </div>

          @if (errorMessage()) {
            <div class="alert alert-danger">
              <i class="fas fa-exclamation-circle"></i>
              <div>{{ errorMessage() }}</div>
            </div>
          }

          <form (ngSubmit)="onSubmit()" class="auth-form">
            <div class="form-group">
              <label class="form-label" for="regName">Full Name</label>
              <div class="input-icon-wrap">
                <i class="fas fa-user icon-left"></i>
                <input 
                  id="regName"
                  type="text" 
                  class="form-control" 
                  [ngModel]="name()" 
                  (ngModelChange)="name.set($event)"
                  name="name" 
                  required 
                  placeholder="e.g. Alex Smith" 
                  autocomplete="name"
                />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label" for="regEmail">Email Address</label>
              <div class="input-icon-wrap">
                <i class="fas fa-envelope icon-left"></i>
                <input 
                  id="regEmail"
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
              <label class="form-label" for="regPassword">Password</label>
              <div class="input-icon-wrap">
                <i class="fas fa-lock icon-left"></i>
                <input 
                  id="regPassword"
                  [type]="showPassword() ? 'text' : 'password'" 
                  class="form-control password-input" 
                  [ngModel]="password()" 
                  (ngModelChange)="password.set($event)"
                  name="password" 
                  required 
                  placeholder="At least 6 characters" 
                  autocomplete="new-password"
                />
                <button 
                  type="button" 
                  class="btn-toggle-eye" 
                  (click)="showPassword.set(!showPassword())" 
                  tabindex="-1">
                  <i [class]="showPassword() ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                </button>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label" for="regConfirm">Confirm Password</label>
              <div class="input-icon-wrap">
                <i class="fas fa-shield-alt icon-left"></i>
                <input 
                  id="regConfirm"
                  [type]="showConfirmPassword() ? 'text' : 'password'" 
                  class="form-control password-input" 
                  [ngModel]="confirmPassword()" 
                  (ngModelChange)="confirmPassword.set($event)"
                  name="confirmPassword" 
                  required 
                  placeholder="Re-enter password" 
                  autocomplete="new-password"
                />
                <button 
                  type="button" 
                  class="btn-toggle-eye" 
                  (click)="showConfirmPassword.set(!showConfirmPassword())" 
                  tabindex="-1">
                  <i [class]="showConfirmPassword() ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                </button>
              </div>
            </div>

            <button type="submit" class="btn-submit" [disabled]="loading()">
              @if (loading()) {
                <i class="fas fa-spinner fa-spin"></i>
                <span>Creating Account...</span>
              } @else {
                <i class="fas fa-paper-plane"></i>
                <span>Register & Send Verification Link</span>
              }
            </button>
          </form>

          <div class="login-callout">
            <span>Already have an account? </span>
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
      max-width: 450px;
      background: #ffffff;
      border-radius: 18px;
      padding: 2.25rem 2rem;
      box-shadow: 0 20px 45px -10px rgba(15, 23, 42, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1);
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
        background: linear-gradient(135deg, #3b82f6, #1d4ed8);
        color: #ffffff;
        border-radius: 14px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-size: 1.5rem;
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

    .auth-form {
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

    /* Success Screen */
    .success-screen {
      text-align: center;
      padding: 1rem 0;

      .success-icon-wrap {
        width: 72px;
        height: 72px;
        border-radius: 50%;
        background: #eff6ff;
        color: #2563eb;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 2.25rem;
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

        .email-highlight {
          color: #1e293b;
          font-weight: 700;
        }
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
export class RegisterComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly name = signal<string>('');
  readonly email = signal<string>('');
  readonly password = signal<string>('');
  readonly confirmPassword = signal<string>('');

  readonly showPassword = signal<boolean>(false);
  readonly showConfirmPassword = signal<boolean>(false);
  readonly loading = signal<boolean>(false);
  readonly errorMessage = signal<string>('');

  readonly registrationSuccess = signal<boolean>(false);

  onSubmit(): void {
    const nameVal = this.name().trim();
    const emailVal = this.email().trim();
    const passwordVal = this.password();
    const confirmVal = this.confirmPassword();

    if (!nameVal || !emailVal || !passwordVal || !confirmVal) {
      this.errorMessage.set('Please fill out all required fields.');
      return;
    }

    if (passwordVal.length < 6) {
      this.errorMessage.set('Password must be at least 6 characters long.');
      return;
    }

    if (passwordVal !== confirmVal) {
      this.errorMessage.set('Passwords do not match. Please verify.');
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    this.authService.register({
      name: nameVal,
      email: emailVal,
      password: passwordVal,
    }).subscribe({
      next: () => {
        this.loading.set(false);
        this.registrationSuccess.set(true);
      },
      error: (err: unknown) => {
        this.loading.set(false);
        const message = (err as { error?: { message?: string } })?.error?.message;
        this.errorMessage.set(message || 'Registration failed. Please try again.');
      }
    });
  }
}
