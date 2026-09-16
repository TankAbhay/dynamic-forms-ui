import { Component, OnInit, inject, signal, computed, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AdminService } from '../../core/services/admin.service';
import { AuthService } from '../../core/services/auth.service';
import { AiTokenUsageSummary, AiTokenUsageLogItem, UserTokenUsageSummary } from '../../core/models/admin.model';

import { AdminNavTabsComponent } from './components/admin-nav-tabs/admin-nav-tabs.component';

@Component({
  selector: 'app-admin-ai-tokens',
  imports: [CommonModule, FormsModule, RouterModule, AdminNavTabsComponent],
  templateUrl: './admin-ai-tokens.component.html',
  styleUrl: './admin-ai-tokens.component.scss'
})
export class AdminAiTokensComponent implements OnInit {
  readonly adminService = inject(AdminService);
  private readonly destroyRef = inject(DestroyRef);
  readonly authService = inject(AuthService);

  readonly summary = signal<AiTokenUsageSummary | null>(null);
  readonly logs = signal<AiTokenUsageLogItem[]>([]);
  readonly userBreakdown = signal<UserTokenUsageSummary[]>([]);
  readonly selectedUserId = signal<number | null>(null);
  readonly isLoading = signal<boolean>(true);
  readonly errorMessage = signal<string | null>(null);

  readonly maxTokens = computed(() => {
    const list = this.userBreakdown();
    if (!list || list.length === 0) return 1;
    return Math.max(...list.map(u => u.totalTokens), 1);
  });

  ngOnInit(): void {
    this.loadData();
    this.loadUserBreakdown();
    this.adminService.loadUnreadLogsCount();
  }

  loadData(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    const uid = this.selectedUserId() ?? undefined;

    // Fetch summary
    this.adminService.getAiTokenSummary(undefined, undefined, uid)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.summary.set(res.data);
        },
        error: (err) => {
          this.errorMessage.set(err.error?.message || 'Failed to load AI token summary.');
        }
      });

    // Fetch recent logs
    this.adminService.getAiTokenLogs(50, uid)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.logs.set(res.data || []);
          this.isLoading.set(false);
        },
        error: (err) => {
          this.isLoading.set(false);
          if (!this.errorMessage()) {
            this.errorMessage.set(err.error?.message || 'Failed to load AI token usage logs.');
          }
        }
      });
  }

  loadUserBreakdown(): void {
    this.adminService.getUserTokenBreakdown()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.userBreakdown.set(res.data || []);
        },
        error: (err) => {
          console.warn('Failed to load user token breakdown:', err);
        }
      });
  }

  onUserFilterChange(userIdStr: string | null): void {
    const userId = userIdStr && userIdStr !== 'null' ? Number(userIdStr) : null;
    this.selectedUserId.set(userId);
    this.loadData();
  }

  getUserPercentage(tokens: number): number {
    const max = this.maxTokens();
    if (max <= 0) return 0;
    return Math.min(Math.round((tokens / max) * 100), 100);
  }

  formatDuration(ms: number): string {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  }
}
