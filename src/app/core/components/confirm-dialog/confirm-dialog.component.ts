import { Component, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfirmDialogService, DialogType } from '../../services/confirm-dialog.service';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (dialog.state(); as state) {
      <div class="confirm-modal-backdrop" (click)="onBackdropClick($event, state.isAlert)">
        <div class="confirm-modal-card" role="dialog" aria-modal="true" [attr.aria-label]="state.title" (click)="$event.stopPropagation()">
          
          <!-- Icon & Header Badge -->
          <div class="modal-badge-wrapper">
            <div class="type-badge" [ngClass]="state.type || 'danger'">
              <i [class]="getIconClass(state.type, state.icon)"></i>
            </div>
          </div>

          <!-- Content -->
          <div class="modal-content-area">
            <h3 class="dialog-title">{{ state.title }}</h3>
            <p class="dialog-message">{{ state.message }}</p>
          </div>

          <!-- Actions -->
          <div class="modal-actions-area" [class.alert-single]="state.isAlert">
            @if (!state.isAlert) {
              <button 
                type="button" 
                class="btn-dialog-cancel" 
                (click)="dialog.handleCancel()">
                {{ state.cancelText || 'Cancel' }}
              </button>
            }
            <button 
              type="button" 
              class="btn-dialog-confirm" 
              [ngClass]="state.type || 'danger'"
              (click)="dialog.handleConfirm()"
              autofocus>
              {{ state.confirmText || (state.isAlert ? 'OK' : 'Confirm') }}
            </button>
          </div>

        </div>
      </div>
    }
  `,
  styles: [`
    .confirm-modal-backdrop {
      position: fixed;
      inset: 0;
      z-index: 9999;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1.25rem;
      background: rgba(15, 23, 42, 0.6);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      animation: dialogFadeIn 0.18s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .confirm-modal-card {
      position: relative;
      width: 100%;
      max-width: 440px;
      background: #ffffff;
      border-radius: 18px;
      padding: 1.75rem;
      box-shadow: 
        0 20px 25px -5px rgba(0, 0, 0, 0.1),
        0 8px 10px -6px rgba(0, 0, 0, 0.1),
        0 0 0 1px rgba(0, 0, 0, 0.05);
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      animation: dialogZoomIn 0.22s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .modal-badge-wrapper {
      margin-bottom: 1rem;
    }

    .type-badge {
      width: 58px;
      height: 58px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      transition: transform 0.2s ease;

      &.danger {
        background: #fee2e2;
        color: #ef4444;
        box-shadow: 0 0 0 6px #fef2f2;
      }

      &.warning {
        background: #fef3c7;
        color: #d97706;
        box-shadow: 0 0 0 6px #fffbeb;
      }

      &.info {
        background: #e0f2fe;
        color: #0284c7;
        box-shadow: 0 0 0 6px #f0f9ff;
      }

      &.success {
        background: #dcfce7;
        color: #16a34a;
        box-shadow: 0 0 0 6px #f0fdf4;
      }
    }

    .modal-content-area {
      width: 100%;
      margin-bottom: 1.5rem;
    }

    .dialog-title {
      font-size: 1.25rem;
      font-weight: 700;
      color: #0f172a;
      margin: 0 0 0.5rem 0;
      letter-spacing: -0.02em;
    }

    .dialog-message {
      font-size: 0.925rem;
      color: #64748b;
      margin: 0;
      line-height: 1.55;
      white-space: pre-line;
      word-break: break-word;
    }

    .modal-actions-area {
      width: 100%;
      display: flex;
      gap: 0.75rem;

      &.alert-single {
        .btn-dialog-confirm {
          flex: 1;
        }
      }
    }

    .btn-dialog-cancel {
      flex: 1;
      padding: 0.75rem 1rem;
      border: 1.5px solid #e2e8f0;
      background: #ffffff;
      color: #475569;
      font-size: 0.925rem;
      font-weight: 600;
      border-radius: 10px;
      cursor: pointer;
      transition: all 0.15s ease;

      &:hover {
        background: #f8fafc;
        border-color: #cbd5e1;
        color: #1e293b;
      }

      &:focus-visible {
        outline: 2px solid #94a3b8;
        outline-offset: 2px;
      }
    }

    .btn-dialog-confirm {
      flex: 1;
      padding: 0.75rem 1.25rem;
      border: none;
      font-size: 0.925rem;
      font-weight: 600;
      border-radius: 10px;
      cursor: pointer;
      color: #ffffff;
      transition: all 0.15s ease;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.06);

      &.danger {
        background: #ef4444;
        &:hover {
          background: #dc2626;
        }
        &:focus-visible {
          outline: 2px solid #ef4444;
          outline-offset: 2px;
        }
      }

      &.warning {
        background: #d97706;
        &:hover {
          background: #b45309;
        }
        &:focus-visible {
          outline: 2px solid #d97706;
          outline-offset: 2px;
        }
      }

      &.info {
        background: #2563eb;
        &:hover {
          background: #1d4ed8;
        }
        &:focus-visible {
          outline: 2px solid #2563eb;
          outline-offset: 2px;
        }
      }

      &.success {
        background: #16a34a;
        &:hover {
          background: #15803d;
        }
        &:focus-visible {
          outline: 2px solid #16a34a;
          outline-offset: 2px;
        }
      }
    }

    @keyframes dialogFadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes dialogZoomIn {
      from { opacity: 0; transform: scale(0.94); }
      to { opacity: 1; transform: scale(1); }
    }
  `]
})
export class ConfirmDialogComponent {
  readonly dialog = inject(ConfirmDialogService);

  @HostListener('window:keydown.escape')
  onEscape(): void {
    if (this.dialog.state()) {
      this.dialog.handleCancel();
    }
  }

  onBackdropClick(event: MouseEvent, isAlert?: boolean): void {
    // Only dismiss on backdrop click if it's not a strict alert
    if (!isAlert) {
      this.dialog.handleCancel();
    }
  }

  getIconClass(type?: DialogType, customIcon?: string): string {
    if (customIcon) return customIcon;
    switch (type) {
      case 'danger':
        return 'fas fa-trash-can';
      case 'warning':
        return 'fas fa-triangle-exclamation';
      case 'info':
        return 'fas fa-circle-info';
      case 'success':
        return 'fas fa-circle-check';
      default:
        return 'fas fa-triangle-exclamation';
    }
  }
}
