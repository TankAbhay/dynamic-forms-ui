import { Component, OnInit, inject, signal, computed, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../core/services/admin.service';
import { AuthService } from '../../core/services/auth.service';
import { ConfirmDialogService } from '../../core/services/confirm-dialog.service';
import { SystemLog, SystemLogStats } from '../../core/models/admin.model';

@Component({
  selector: 'app-admin-logs',
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './admin-logs.component.html',
  styleUrl: './admin-logs.component.scss'
})
export class AdminLogsComponent implements OnInit {
  readonly adminService = inject(AdminService);
  private readonly dialogService = inject(ConfirmDialogService);
  private readonly destroyRef = inject(DestroyRef);
  readonly authService = inject(AuthService);

  readonly logs = signal<SystemLog[]>([]);
  readonly totalCount = signal<number>(0);
  readonly stats = signal<SystemLogStats | null>(null);
  readonly isLoading = signal<boolean>(true);
  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);

  // Filters & Pagination
  readonly logLevel = signal<string>('ALL');
  readonly searchQuery = signal<string>('');
  readonly currentPage = signal<number>(1);
  readonly pageSize = signal<number>(25);

  // Details Modal
  readonly selectedLog = signal<SystemLog | null>(null);
  readonly isModalOpen = signal<boolean>(false);
  readonly copiedField = signal<string | null>(null);

  // Operations
  readonly isClearing = signal<boolean>(false);
  readonly isGeneratingTestError = signal<boolean>(false);
  readonly isMarkingAllRead = signal<boolean>(false);

  readonly totalPages = computed(() => {
    const total = this.totalCount();
    const size = this.pageSize();
    return Math.max(1, Math.ceil(total / size));
  });

  ngOnInit(): void {
    this.loadLogs();
    this.loadStats();
  }

  loadLogs(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.adminService.getLogs({
      page: this.currentPage(),
      pageSize: this.pageSize(),
      logLevel: this.logLevel(),
      search: this.searchQuery()
    })
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe({
      next: (res) => {
        this.logs.set(res.items);
        this.totalCount.set(res.totalCount);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.errorMessage.set(err.error?.message || 'Failed to retrieve system logs.');
        this.isLoading.set(false);
      }
    });
  }

  loadStats(): void {
    this.adminService.getLogStats()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => this.stats.set(data),
        error: () => {}
      });
  }

  onFilterChange(): void {
    this.currentPage.set(1);
    this.loadLogs();
  }

  onPageChange(newPage: number): void {
    if (newPage < 1 || newPage > this.totalPages()) return;
    this.currentPage.set(newPage);
    this.loadLogs();
  }

  openLogDetails(log: SystemLog): void {
    this.selectedLog.set(log);
    this.isModalOpen.set(true);
    this.copiedField.set(null);

    // If log was unread, mark it as read immediately
    if (!log.isRead) {
      this.adminService.markLogAsRead(log.id)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (res) => {
            if (res.success) {
              log.isRead = true;
              this.logs.update(list => list.map(l => l.id === log.id ? { ...l, isRead: true } : l));
              this.loadStats();
            }
          },
          error: () => {}
        });
    }
  }

  markAllAsRead(): void {
    this.isMarkingAllRead.set(true);
    this.adminService.markAllLogsAsRead()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.isMarkingAllRead.set(false);
          this.successMessage.set(res.rowsUpdated > 0 ? `${res.rowsUpdated} unread logs marked as read.` : 'All logs already marked as read.');
          this.logs.update(list => list.map(l => ({ ...l, isRead: true })));
          this.loadStats();
          setTimeout(() => this.successMessage.set(null), 3000);
        },
        error: () => {
          this.isMarkingAllRead.set(false);
        }
      });
  }

  closeLogDetails(): void {
    this.isModalOpen.set(false);
    this.selectedLog.set(null);
    this.copiedField.set(null);
  }

  copyToClipboard(text: string, fieldName: string): void {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      this.copiedField.set(fieldName);
      setTimeout(() => this.copiedField.set(null), 2500);
    });
  }

  async clearLogs(): Promise<void> {
    const confirmed = await this.dialogService.danger(
      'Clear All System Logs?',
      'Are you sure you want to permanently clear all system and error logs? This action cannot be undone.',
      'Clear All Logs'
    );
    if (!confirmed) return;

    this.isClearing.set(true);
    this.errorMessage.set(null);

    this.adminService.clearLogs()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.successMessage.set(res.message || 'System logs cleared successfully.');
          this.isClearing.set(false);
          this.loadLogs();
          this.loadStats();
          setTimeout(() => this.successMessage.set(null), 4000);
        },
        error: (err) => {
          this.errorMessage.set(err.error?.message || 'Failed to clear system logs.');
          this.isClearing.set(false);
        }
      });
  }

  triggerTestError(): void {
    this.isGeneratingTestError.set(true);
    this.errorMessage.set(null);

    this.adminService.triggerTestError('Diagnostic test error triggered by Admin at ' + new Date().toLocaleTimeString())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isGeneratingTestError.set(false);
        },
        error: () => {
          this.isGeneratingTestError.set(false);
          this.successMessage.set('Test error captured and recorded in system logs successfully.');
          this.loadLogs();
          this.loadStats();
          setTimeout(() => this.successMessage.set(null), 4000);
        }
      });
  }
}
