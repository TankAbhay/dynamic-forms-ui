import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminService } from '../../core/services/admin.service';
import { AuthService } from '../../core/services/auth.service';
import { AiTokenUsageSummary, AiTokenUsageLogItem } from '../../core/models/admin.model';

@Component({
  selector: 'app-admin-ai-tokens',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-ai-tokens.component.html',
  styleUrl: './admin-ai-tokens.component.scss'
})
export class AdminAiTokensComponent implements OnInit {
  private readonly adminService = inject(AdminService);
  readonly authService = inject(AuthService);

  readonly summary = signal<AiTokenUsageSummary | null>(null);
  readonly logs = signal<AiTokenUsageLogItem[]>([]);
  readonly isLoading = signal<boolean>(true);
  readonly errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    // Fetch summary
    this.adminService.getAiTokenSummary().subscribe({
      next: (res) => {
        this.summary.set(res.data);
      },
      error: (err) => {
        this.errorMessage.set(err.error?.message || 'Failed to load AI token summary.');
      }
    });

    // Fetch recent logs
    this.adminService.getAiTokenLogs(50).subscribe({
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

  formatDuration(ms: number): string {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  }
}
