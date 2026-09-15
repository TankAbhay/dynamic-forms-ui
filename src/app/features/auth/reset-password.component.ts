import { Component, OnInit, inject, signal, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ApiErrorResponse } from '../../core/models/auth.model';

@Component({
  selector: 'app-reset-password',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss'
})
export class ResetPasswordComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);

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
    })
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe({
      next: () => {
        this.isLoading.set(false);
        this.resetSuccess.set(true);
      },
      error: (err: unknown) => {
        this.isLoading.set(false);
        const httpErr = err as HttpErrorResponse;
        const serverMsg = (httpErr?.error as ApiErrorResponse)?.message || 'Failed to reset password. The link may have expired (24-hour limit).';
        this.errorMessage.set(typeof serverMsg === 'string' ? serverMsg : 'Password reset failed.');
      }
    });
  }
}
