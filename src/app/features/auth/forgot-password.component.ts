import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss'
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
