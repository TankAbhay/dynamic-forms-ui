import { Component, OnInit, AfterViewInit, OnDestroy, inject, signal, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ApiErrorResponse } from '../../core/models/auth.model';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit, AfterViewInit, OnDestroy {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

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
  private resizeTimer?: ReturnType<typeof setTimeout>;
  private googleAvailabilityTimer?: ReturnType<typeof setInterval>;

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      const defaultUrl = this.authService.isAdmin() ? '/admin' : '/forms';
      const returnUrl = this.route.snapshot.queryParams['returnUrl'] || defaultUrl;
      this.router.navigateByUrl(returnUrl);
      return;
    }

    this.checkGoogleSignInAvailability();

    // Check if redirected with verified message
    if (this.route.snapshot.queryParams['verified'] === 'true') {
      this.successMessage.set('Your email has been successfully verified! Please sign in.');
    } else if (this.route.snapshot.queryParams['reset'] === 'true') {
      this.successMessage.set('Password reset successfully! Please sign in with your new password.');
    }
  }

  private checkGoogleSignInAvailability(): void {
    const checkAndActivate = () => {
      if (this.authService.isGoogleSignInSupported()) {
        if (!this.googleSignInAvailable()) {
          this.googleSignInAvailable.set(true);
          setTimeout(() => this.renderGoogleBtn(), 50);
        }
        return true;
      }
      return false;
    };

    if (!checkAndActivate() && typeof window !== 'undefined') {
      let attempts = 0;
      this.googleAvailabilityTimer = setInterval(() => {
        attempts++;
        if (checkAndActivate() || attempts >= 30) {
          clearInterval(this.googleAvailabilityTimer);
        }
      }, 100);
    }
  }

  ngAfterViewInit(): void {
    if (this.googleSignInAvailable()) {
      this.renderGoogleBtn();
    }

    // Re-render Google button dynamically on orientation change or window resize
    if (typeof window !== 'undefined') {
      this.resizeListener = () => {
        clearTimeout(this.resizeTimer);
        this.resizeTimer = setTimeout(() => {
          if (this.googleSignInAvailable()) {
            this.renderGoogleBtn();
          }
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
    if (this.googleAvailabilityTimer) {
      clearInterval(this.googleAvailabilityTimer);
    }
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
    })
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe({
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
        const httpErr = err as HttpErrorResponse;
        const errObj = httpErr?.error as ApiErrorResponse | undefined;
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

    this.authService.resendVerification(emailToResend)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
      next: (res) => {
        this.resendLoading.set(false);
        this.resendSuccess.set(res.message || 'Verification link dispatched successfully!');
      },
      error: (err: unknown) => {
        this.resendLoading.set(false);
        const httpErr = err as HttpErrorResponse;
        const msg = (httpErr?.error as ApiErrorResponse)?.message;
        this.errorMessage.set(msg || 'Failed to resend verification link.');
      }
    });
  }
}
