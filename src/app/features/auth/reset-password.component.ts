import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="auth-wrapper">
      <div class="auth-card">
        @if (!token()) {
          <div class="state-card error-state">
            <div class="icon-wrap error-icon">
              <i class="fas fa-exclamation-triangle"></i>
            </div>
            <h2>Invalid Reset Link</h2>
            <p class="desc">
              This password reset link is invalid or incomplete. Please request a new password reset link.
            </p>
            <div class="action-footer">
              <a routerLink="/forgot-password" class="btn-primary">
                <i class="fas fa-redo"></i> Request New Reset Link
              </a>
              <a routerLink="/login" class="btn-link">
                <i class="fas fa-arrow-left"></i> Back to Sign In
              </a>
            </div>
          </div>
        } @else if (resetSuccess()) {
          <div class="state-card success-state">
            <div class="icon-wrap success-icon">
              <i class="fas fa-check-circle"></i>
            </div>
            <h2>Password Changed!</h2>
            <p class="desc">
              Your password has been successfully reset. You can now log in with your new password.
            </p>
            <div class="action-footer">
              <a routerLink="/login" class="btn-primary">
                <i class="fas fa-sign-in-alt"></i> Sign In With New Password
              </a>
            </div>
          </div>
        } @else {
          <div class="auth-header">
            <div class="brand-badge">
              <i class="fas fa-shield-alt"></i>
            </div>
            <h2>Set New Password</h2>
            <p class="subtitle">Please enter and confirm your new secure password</p>
          </div>

          @if (errorMessage()) {
            <div class="alert alert-danger">
              <i class="fas fa-exclamation-circle"></i>
              <div>{{ errorMessage() }}</div>
            </div>
          }

          <div class="info-callout">
            <i class="fas fa-clock"></i>
            <span>This reset link is valid for <strong>24 hours (1 day)</strong> from the time it was requested.</span>
          </div>

          <form (ngSubmit)="onSubmit()" class="auth-form">
            <div class="form-group">
              <label class="form-label" for="newPassword">New Password</label>
              <div class="input-icon-wrap">
                <i class="fas fa-lock icon-left"></i>
                <input 
                  id="newPassword"
                  [type]="showPassword() ? 'text' : 'password'" 
                  class="form-control" 
                  [ngModel]="newPassword()" 
                  (ngModelChange)="newPassword.set($event)"
                  name="newPassword"
                  placeholder="At least 6 characters" 
                  autocomplete="new-password"
                  required
                />
                <button 
                  type="button" 
                  class="btn-toggle-eye" 
                  (click)="showPassword.set(!showPassword())"
                  aria-label="Toggle password visibility"
                >
                  <i class="fas" [ngClass]="showPassword() ? 'fa-eye-slash' : 'fa-eye'"></i>
                </button>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label" for="confirmPassword">Confirm New Password</label>
              <div class="input-icon-wrap">
                <i class="fas fa-lock icon-left"></i>
                <input 
                  id="confirmPassword"
                  [type]="showConfirmPassword() ? 'text' : 'password'" 
                  class="form-control" 
                  [ngModel]="confirmPassword()" 
                  (ngModelChange)="confirmPassword.set($event)"
                  name="confirmPassword"
                  placeholder="Re-enter your password" 
                  autocomplete="new-password"
                  required
                />
                <button 
                  type="button" 
                  class="btn-toggle-eye" 
                  (click)="showConfirmPassword.set(!showConfirmPassword())"
                  aria-label="Toggle confirm password visibility"
                >
                  <i class="fas" [ngClass]="showConfirmPassword() ? 'fa-eye-slash' : 'fa-eye'"></i>
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              class="btn-submit" 
              [disabled]="isLoading() || !newPassword() || !confirmPassword()"
            >
              @if (isLoading()) {
                <span class="spinner"></span>
                <span>Updating Password...</span>
              } @else {
                <i class="fas fa-save"></i>
                <span>Update Password</span>
              }
            </button>
          </form>

          <div class="auth-footer">
            <a routerLink="/login" class="link-secondary">
              <i class="fas fa-arrow-left"></i> Back to Sign In
            </a>
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
      padding: 24px 16px;
      background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%);
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    .auth-card {
      width: 100%;
      max-width: 440px;
      background: rgba(30, 41, 59, 0.85);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 20px;
      padding: 36px 32px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05);
      color: #f8fafc;
    }

    .auth-header {
      text-align: center;
      margin-bottom: 24px;
    }

    .brand-badge {
      width: 56px;
      height: 56px;
      margin: 0 auto 16px;
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #ffffff;
      font-size: 24px;
      box-shadow: 0 8px 16px -4px rgba(99, 102, 241, 0.4);
    }

    h2 {
      font-size: 24px;
      font-weight: 700;
      color: #ffffff;
      margin: 0 0 8px;
      letter-spacing: -0.02em;
    }

    .subtitle {
      font-size: 14px;
      color: #94a3b8;
      margin: 0;
      line-height: 1.5;
    }

    .info-callout {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 14px;
      background: rgba(99, 102, 241, 0.1);
      border: 1px solid rgba(99, 102, 241, 0.25);
      border-radius: 10px;
      font-size: 12px;
      color: #c7d2fe;
      margin-bottom: 20px;
      line-height: 1.4;

      i {
        font-size: 14px;
        color: #818cf8;
        flex-shrink: 0;
      }
    }

    .alert {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 16px;
      border-radius: 10px;
      margin-bottom: 20px;
      font-size: 13px;
      line-height: 1.4;

      &.alert-danger {
        background: rgba(239, 68, 68, 0.12);
        border: 1px solid rgba(239, 68, 68, 0.3);
        color: #fca5a5;
      }

      i {
        font-size: 16px;
        flex-shrink: 0;
      }
    }

    .auth-form {
      display: flex;
      flex-direction: column;
      gap: 18px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .form-label {
      font-size: 13px;
      font-weight: 500;
      color: #cbd5e1;
    }

    .input-icon-wrap {
      position: relative;
      display: flex;
      align-items: center;

      .icon-left {
        position: absolute;
        left: 14px;
        color: #64748b;
        font-size: 15px;
        pointer-events: none;
      }

      .form-control {
        width: 100%;
        box-sizing: border-box;
        padding: 12px 44px 12px 42px;
        background: rgba(15, 23, 42, 0.6);
        border: 1px solid rgba(148, 163, 184, 0.2);
        border-radius: 10px;
        font-size: 14px;
        color: #ffffff;
        outline: none;
        transition: all 0.2s ease;

        &::placeholder {
          color: #64748b;
        }

        &:focus {
          border-color: #6366f1;
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
          background: rgba(15, 23, 42, 0.8);
        }
      }

      .btn-toggle-eye {
        position: absolute;
        right: 12px;
        background: none;
        border: none;
        color: #94a3b8;
        cursor: pointer;
        padding: 6px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 15px;
        transition: color 0.15s;

        &:hover {
          color: #ffffff;
        }
      }
    }

    .btn-submit {
      width: 100%;
      box-sizing: border-box;
      padding: 12px;
      background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
      color: #ffffff;
      border: none;
      border-radius: 10px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      transition: all 0.2s ease;
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
      margin-top: 4px;

      &:hover:not(:disabled) {
        background: linear-gradient(135deg, #4f46e5 0%, #4338ca 100%);
        box-shadow: 0 6px 16px rgba(99, 102, 241, 0.4);
        transform: translateY(-1px);
      }

      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }

      .spinner {
        width: 16px;
        height: 16px;
        border: 2px solid rgba(255, 255, 255, 0.3);
        border-top-color: #ffffff;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
      }
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .auth-footer {
      margin-top: 24px;
      text-align: center;

      .link-secondary {
        color: #94a3b8;
        text-decoration: none;
        font-size: 13px;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        transition: color 0.15s;

        &:hover {
          color: #ffffff;
        }
      }
    }

    .state-card {
      text-align: center;
      padding: 16px 0;

      .icon-wrap {
        width: 68px;
        height: 68px;
        margin: 0 auto 20px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 32px;

        &.error-icon {
          background: rgba(239, 68, 68, 0.15);
          color: #ef4444;
          border: 1px solid rgba(239, 68, 68, 0.3);
        }

        &.success-icon {
          background: rgba(16, 185, 129, 0.15);
          color: #10b981;
          border: 1px solid rgba(16, 185, 129, 0.3);
        }
      }

      .desc {
        font-size: 14px;
        color: #94a3b8;
        line-height: 1.6;
        margin-bottom: 24px;
      }

      .action-footer {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .btn-primary {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 12px 20px;
        background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
        color: #ffffff;
        text-decoration: none;
        border-radius: 10px;
        font-size: 14px;
        font-weight: 600;
        transition: all 0.2s;

        &:hover {
          background: linear-gradient(135deg, #4f46e5 0%, #4338ca 100%);
          transform: translateY(-1px);
        }
      }

      .btn-link {
        color: #94a3b8;
        text-decoration: none;
        font-size: 13px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        padding: 8px;
        transition: color 0.15s;

        &:hover {
          color: #ffffff;
        }
      }
    }

    @media (max-width: 480px) {
      .auth-card {
        padding: 28px 20px;
      }
    }
  `]
})
export class ResetPasswordComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(AuthService);

  token = signal<string>('');
  newPassword = signal<string>('');
  confirmPassword = signal<string>('');
  showPassword = signal<boolean>(false);
  showConfirmPassword = signal<boolean>(false);

  isLoading = signal<boolean>(false);
  errorMessage = signal<string>('');
  resetSuccess = signal<boolean>(false);

  ngOnInit(): void {
    const qToken = this.route.snapshot.queryParamMap.get('token');
    if (qToken && qToken.trim()) {
      this.token.set(qToken.trim());
    }
  }

  onSubmit(): void {
    if (!this.token()) {
      this.errorMessage.set('Reset token is missing.');
      return;
    }

    if (!this.newPassword() || this.newPassword().length < 6) {
      this.errorMessage.set('Password must be at least 6 characters long.');
      return;
    }

    if (this.newPassword() !== this.confirmPassword()) {
      this.errorMessage.set('Passwords do not match.');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    this.authService.resetPassword({
      token: this.token(),
      newPassword: this.newPassword()
    }).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.resetSuccess.set(true);
      },
      error: (err) => {
        this.isLoading.set(false);
        const serverMsg = err.error?.message || err.error || 'Failed to reset password. The link may have expired (24-hour limit).';
        this.errorMessage.set(typeof serverMsg === 'string' ? serverMsg : 'Password reset failed.');
      }
    });
  }
}
