import { Component, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfirmDialogService } from '../../services/confirm-dialog.service';
import { DialogType } from '../../models/dialog.model';

@Component({
  selector: 'app-confirm-dialog',
  imports: [CommonModule],
  templateUrl: './confirm-dialog.component.html',
  styleUrl: './confirm-dialog.component.scss'
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
