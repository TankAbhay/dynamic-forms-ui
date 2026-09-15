import { Component, OnInit, inject, signal, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ApiErrorResponse } from '../../core/models/auth.model';

@Component({
  selector: 'app-verify-email',
  imports: [CommonModule, RouterLink],
  templateUrl: './verify-email.component.html',
  styleUrl: './verify-email.component.scss'
})
export class VerifyEmailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly authService = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);

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

    this.authService.verifyEmail(token)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
      next: () => {
        this.loading.set(false);
        this.verified.set(true);
      },
      error: (err: unknown) => {
        this.loading.set(false);
        const httpErr = err as HttpErrorResponse;
        const message = (httpErr?.error as ApiErrorResponse)?.message;
        this.errorMessage.set(message || 'The verification link is invalid or expired. Links are valid for 24 hours.');
      }
    });
  }
}
