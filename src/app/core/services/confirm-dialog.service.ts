import { Injectable, signal } from '@angular/core';

export type DialogType = 'danger' | 'warning' | 'info' | 'success';

export interface ConfirmDialogOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: DialogType;
  icon?: string;
  isAlert?: boolean;
}

interface DialogInternalState extends ConfirmDialogOptions {
  resolve: (result: boolean) => void;
}

@Injectable({
  providedIn: 'root'
})
export class ConfirmDialogService {
  readonly state = signal<DialogInternalState | null>(null);

  /**
   * Prompts the user with a confirmation modal returning a promise resolving to true or false.
   */
  confirm(options: ConfirmDialogOptions): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      this.state.set({
        type: 'danger',
        confirmText: 'Confirm',
        cancelText: 'Cancel',
        isAlert: false,
        ...options,
        resolve
      });
    });
  }

  /**
   * Shortcut for destructive actions (e.g., delete user, delete form, clear logs).
   */
  danger(
    title: string,
    message: string,
    confirmText: string = 'Delete',
    cancelText: string = 'Cancel'
  ): Promise<boolean> {
    return this.confirm({
      title,
      message,
      confirmText,
      cancelText,
      type: 'danger'
    });
  }

  /**
   * Shortcut for warning actions (e.g., discard draft, role promotion/demotion).
   */
  warning(
    title: string,
    message: string,
    confirmText: string = 'Proceed',
    cancelText: string = 'Cancel'
  ): Promise<boolean> {
    return this.confirm({
      title,
      message,
      confirmText,
      cancelText,
      type: 'warning'
    });
  }

  /**
   * Replaces browser alert(...) with an elegant modal that only has an OK/Dismiss button.
   */
  alert(
    message: string,
    title: string = 'Notice',
    type: DialogType = 'warning',
    buttonText: string = 'Got it'
  ): Promise<void> {
    return new Promise<void>((resolve) => {
      this.state.set({
        title,
        message,
        confirmText: buttonText,
        type,
        isAlert: true,
        resolve: () => resolve()
      });
    });
  }

  handleConfirm(): void {
    const current = this.state();
    if (current) {
      this.state.set(null);
      current.resolve(true);
    }
  }

  handleCancel(): void {
    const current = this.state();
    if (current) {
      this.state.set(null);
      current.resolve(false);
    }
  }
}
