import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="verify-wrapper">
      <div class="verify-card">
        @if (loading()) {
          <div class="state-box">
            <div class="spinner-wrap">
              <i class="fas fa-spinner fa-spin fa-2x"></i>
            </div>
            <h2>Verifying Account</h2>
            <p>Please wait while we verify your email address...</p>
          </div>
        } @else if (verified()) {
          <div class="state-box success">
            <div class="icon-circle success">
              <i class="fas fa-check"></i>
            </div>
            <h2>Email Verified!</h2>
            <p class="desc">
              Your account has been successfully verified and activated. You're all set to begin creating and managing forms.
            </p>
            <div class="actions">
              <a routerLink="/forms" class="btn btn-primary">
                <i class="fas fa-layer-group me-1"></i> Go to My Forms Dashboard
              </a>
            </div>
          </div>
        } @else {
          <div class="state-box error">
            <div class="icon-circle error">
              <i class="fas fa-exclamation-triangle"></i>
            </div>
            <h2>Verification Failed</h2>
            <p class="desc">{{ errorMessage() }}</p>
            <div class="actions">
              <a routerLink="/login" class="btn btn-primary">
                <i class="fas fa-arrow-left me-1"></i> Return to Sign In
              </a>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .verify-wrapper {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: radial-gradient(circle at top right, #1e293b, #0f172a 70%);
      padding: 1.5rem 1rem;
      box-sizing: border-box;
    }

    .verify-card {
      width: 100%;
      max-width: 460px;
      background: #ffffff;
      border-radius: 18px;
      padding: 3rem 2rem;
      box-shadow: 0 20px 45px -10px rgba(15, 23, 42, 0.4);
      text-align: center;
      box-sizing: border-box;

      @media (max-width: 480px) {
        padding: 2rem 1.25rem;
        border-radius: 14px;
      }
    }

    .state-box {
      display: flex;
      flex-direction: column;
      align-items: center;

      .spinner-wrap {
        color: #2563eb;
        margin-bottom: 1.5rem;
      }

      .icon-circle {
        width: 72px;
        height: 72px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 2rem;
        margin-bottom: 1.25rem;

        &.success {
          background: #dcfce7;
          color: #16a34a;
        }

        &.error {
          background: #fee2e2;
          color: #dc2626;
        }
      }

      h2 {
        font-size: 1.6rem;
        font-weight: 800;
        color: #0f172a;
        margin: 0 0 0.5rem 0;
      }

      .desc {
        font-size: 0.95rem;
        color: #64748b;
        line-height: 1.55;
        margin: 0 0 2rem 0;
      }

      .actions {
        width: 100%;

        .btn {
          width: 100%;
          min-height: 46px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          font-weight: 700;
          font-size: 0.95rem;
          border-radius: 10px;
          text-decoration: none;
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);
          transition: all 0.2s;

          &.btn-primary {
            background: #2563eb;
            color: #ffffff;

            &:hover {
              background: #1d4ed8;
              transform: translateY(-1px);
            }
          }
        }
      }
    }
  `]
})
export class VerifyEmailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly authService = inject(AuthService);

  readonly loading = signal<boolean>(true);
  readonly verified = signal<boolean>(false);
  readonly errorMessage = signal<string>('');

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token');
    if (!token) {
      this.loading.set(false);
      this.errorMessage.set('Missing verification token. Please click the link in the email sent to your inbox.');
      return;
    }

    this.authService.verifyEmail(token).subscribe({
      next: () => {
        this.loading.set(false);
        this.verified.set(true);
      },
      error: (err: unknown) => {
        this.loading.set(false);
        const message = (err as { error?: { message?: string } })?.error?.message;
        this.errorMessage.set(message || 'The verification link is invalid or expired. Links are valid for 24 hours.');
      }
    });
  }
}
