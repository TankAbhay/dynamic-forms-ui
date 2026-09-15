import { Component, inject, signal, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ApiErrorResponse } from '../../core/models/auth.model';

@Component({
  selector: 'app-register',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

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
    })
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe({
      next: () => {
        this.loading.set(false);
        this.registrationSuccess.set(true);
      },
      error: (err: unknown) => {
        this.loading.set(false);
        const httpErr = err as HttpErrorResponse;
        const message = (httpErr?.error as ApiErrorResponse)?.message;
        this.errorMessage.set(message || 'Registration failed. Please try again.');
      }
    });
  }
}
