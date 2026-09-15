import { Component, OnInit, inject, signal, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { PublicFormService } from '../../core/services/public-form.service';

@Component({
  selector: 'app-redirect',
  imports: [CommonModule, RouterModule],
  templateUrl: './redirect.component.html',
  styleUrl: './redirect.component.scss'
})
export class RedirectComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly publicFormService = inject(PublicFormService);
  private readonly destroyRef = inject(DestroyRef);

  readonly loading = signal<boolean>(true);
  readonly errorMessage = signal<string>('');
  readonly fallbackLink = signal<string>('/forms');
  readonly statusMessage = signal<string>('Please wait a moment while we verify your credentials and redirect you to the form...');

  ngOnInit(): void {
    const qp = this.route.snapshot.queryParamMap;
    const token = qp.get('at') || qp.get('token') || '';
    const fidStr = qp.get('fid') || qp.get('formId') || '';
    const type = qp.get('type') || '';

    if (type === 'verify-email') {
      this.router.navigate(['/verify-email'], { queryParams: { token } });
      return;
    }

    if (type === 'reset-password') {
      this.router.navigate(['/reset-password'], { queryParams: { token } });
      return;
    }

    const fid = parseInt(fidStr, 10);
    if (isNaN(fid) || fid <= 0) {
      this.loading.set(false);
      this.errorMessage.set('The access link is missing form identification parameters.');
      this.fallbackLink.set('/forms');
      return;
    }

    this.publicFormService.resolveAccessLink(fid, token)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
      next: (res) => {
        if (res && res.success) {
          const shareCode = res.shareCode || fidStr;
          this.router.navigate(['/p', shareCode], {
            queryParams: token ? { at: token, fid } : { fid }
          });
        } else {
          this.loading.set(false);
          this.errorMessage.set(res?.message || 'This access link is invalid or has expired.');
          this.fallbackLink.set(`/p/${res?.shareCode || fidStr}`);
        }
      },
      error: (err) => {
        const errShareCode = err?.error?.shareCode || fidStr;
        if (err?.status === 403) {
          this.loading.set(false);
          this.errorMessage.set(err?.error?.message || 'This access link is invalid, expired, or has already been used.');
          this.fallbackLink.set(`/p/${errShareCode}`);
        } else {
          this.router.navigate(['/p', errShareCode], {
            queryParams: token ? { at: token, fid } : { fid }
          });
        }
      }
    });
  }
}
