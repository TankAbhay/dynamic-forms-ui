import { Component, OnInit, inject, signal, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AdminService } from '../../core/services/admin.service';
import { AuthService } from '../../core/services/auth.service';
import {
  EmailConfigDto,
  UpdateEmailConfigRequest,
  TestEmailConnectionRequest,
  TestEmailConnectionResult
} from '../../core/models/admin.model';

export interface SmtpPreset {
  id: string;
  name: string;
  host: string;
  port: number;
  enableSsl: boolean;
  notes: string;
}

import { AdminNavTabsComponent } from './components/admin-nav-tabs/admin-nav-tabs.component';

@Component({
  selector: 'app-admin-email-config',
  imports: [CommonModule, FormsModule, RouterModule, AdminNavTabsComponent],
  templateUrl: './admin-email-config.component.html',
  styleUrl: './admin-email-config.component.scss'
})
export class AdminEmailConfigComponent implements OnInit {
  readonly adminService = inject(AdminService);
  private readonly destroyRef = inject(DestroyRef);
  readonly authService = inject(AuthService);

  readonly config = signal<EmailConfigDto | null>(null);

  readonly host = signal<string>('smtp.gmail.com');
  readonly port = signal<number>(587);
  readonly selectedPresetId = signal<string>('gmail');
  readonly username = signal<string>('');
  readonly passwordInput = signal<string>('');
  readonly showPassword = signal<boolean>(false);
  readonly fromEmail = signal<string>('');
  readonly fromName = signal<string>('Dynamic Forms Support');
  readonly enableSsl = signal<boolean>(true);
  readonly testTargetEmail = signal<string>('');

  readonly isLoading = signal<boolean>(true);
  readonly isSaving = signal<boolean>(false);
  readonly isTesting = signal<boolean>(false);

  readonly testResult = signal<TestEmailConnectionResult | null>(null);
  readonly successMessage = signal<string | null>(null);
  readonly errorMessage = signal<string | null>(null);

  readonly presets: SmtpPreset[] = [
    {
      id: 'gmail',
      name: 'Google Gmail',
      host: 'smtp.gmail.com',
      port: 587,
      enableSsl: true,
      notes: 'Requires a 16-character Google App Password (not your personal account password).'
    },
    {
      id: 'office365',
      name: 'Microsoft 365 / Outlook',
      host: 'smtp.office365.com',
      port: 587,
      enableSsl: true,
      notes: 'Requires SMTP AUTH enabled on the mailbox or an App Password / App Registration.'
    },
    {
      id: 'sendgrid',
      name: 'SendGrid',
      host: 'smtp.sendgrid.net',
      port: 587,
      enableSsl: true,
      notes: 'Username is typically "apikey" and password is your SendGrid API key.'
    },
    {
      id: 'ses',
      name: 'Amazon SES',
      host: 'email-smtp.us-east-1.amazonaws.com',
      port: 587,
      enableSsl: true,
      notes: 'Use your IAM SMTP credentials and the appropriate AWS region endpoint.'
    },
    {
      id: 'custom',
      name: 'Custom / Private SMTP',
      host: '',
      port: 587,
      enableSsl: true,
      notes: 'Specify your private or internal corporate SMTP relay server details.'
    }
  ];

  ngOnInit(): void {
    this.loadConfig();
    this.adminService.loadUnreadLogsCount();
  }

  loadConfig(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.testResult.set(null);

    this.adminService.getEmailConfig()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          const cfg = res.data;
          this.config.set(cfg);
          this.host.set(cfg.host || 'smtp.gmail.com');
          this.port.set(cfg.port || 587);
          this.username.set(cfg.username || '');
          this.fromEmail.set(cfg.fromEmail || '');
          this.fromName.set(cfg.fromName || 'Dynamic Forms Support');
          this.enableSsl.set(cfg.enableSsl !== false);
          this.passwordInput.set('');

          // Auto-detect preset matching current host
          const matched = this.presets.find(p => p.id !== 'custom' && p.host.toLowerCase() === (cfg.host || '').toLowerCase());
          this.selectedPresetId.set(matched ? matched.id : 'custom');

          this.isLoading.set(false);
        },
        error: (err) => {
          this.isLoading.set(false);
          this.errorMessage.set(err?.error?.message || 'Failed to load Email & SMTP configuration.');
        }
      });
  }

  applyPreset(preset: SmtpPreset): void {
    this.selectedPresetId.set(preset.id);
    if (preset.id !== 'custom') {
      this.host.set(preset.host);
      this.port.set(preset.port);
      this.enableSsl.set(preset.enableSsl);
    } else {
      // Custom / Private SMTP: if host was standard, clear or allow editing freely
      if (this.presets.some(p => p.id !== 'custom' && p.host.toLowerCase() === this.host().toLowerCase())) {
        this.host.set('');
      }
    }
    this.testResult.set(null);
    this.successMessage.set(null);
  }

  togglePasswordVisibility(): void {
    this.showPassword.update(v => !v);
  }

  onTestConnection(): void {
    if (!this.host().trim()) {
      this.errorMessage.set('SMTP Host is required before testing connection.');
      return;
    }

    this.isTesting.set(true);
    this.testResult.set(null);
    this.errorMessage.set(null);

    const req: TestEmailConnectionRequest = {
      host: this.host().trim(),
      port: this.port(),
      username: this.username().trim() || null,
      password: this.passwordInput().trim() || null,
      enableSsl: this.enableSsl(),
      targetEmail: this.testTargetEmail().trim() || null
    };

    this.adminService.testEmailConnection(req)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.isTesting.set(false);
          this.testResult.set(res.data);
        },
        error: (err) => {
          this.isTesting.set(false);
          this.testResult.set({
            success: false,
            latencyMs: 0,
            message: err?.error?.message || 'Connection test failed with server error.',
            host: this.host().trim(),
            port: this.port()
          });
        }
      });
  }

  onSave(): void {
    if (!this.host().trim()) {
      this.errorMessage.set('SMTP Host cannot be empty.');
      return;
    }

    if (!this.port() || this.port() <= 0 || this.port() > 65535) {
      this.errorMessage.set('SMTP Port must be between 1 and 65535.');
      return;
    }

    this.isSaving.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    const payload: UpdateEmailConfigRequest = {
      host: this.host().trim(),
      port: this.port(),
      username: this.username().trim(),
      password: this.passwordInput().trim() || null,
      fromEmail: this.fromEmail().trim() || null,
      fromName: this.fromName().trim() || null,
      enableSsl: this.enableSsl()
    };

    this.adminService.updateEmailConfig(payload)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.isSaving.set(false);
          this.config.set(res.data);
          this.passwordInput.set('');
          this.successMessage.set('Email & SMTP configuration securely updated and encrypted in database!');
          setTimeout(() => this.successMessage.set(null), 6000);
        },
        error: (err) => {
          this.isSaving.set(false);
          this.errorMessage.set(err?.error?.message || 'Failed to save Email & SMTP configuration.');
        }
      });
  }
}
