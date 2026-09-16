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

export interface DialogInternalState extends ConfirmDialogOptions {
  resolve: ((result: boolean) => void) | (() => void);
}
