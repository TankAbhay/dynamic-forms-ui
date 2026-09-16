import '@angular/compiler';
import { describe, it, expect, beforeEach } from 'vitest';
import { ConfirmDialogService } from './confirm-dialog.service';

describe('ConfirmDialogService', () => {
  let service: ConfirmDialogService;

  beforeEach(() => {
    service = new ConfirmDialogService();
  });

  it('should initialize with null state', () => {
    expect(service.state()).toBeNull();
  });

  it('should set state on danger call and resolve correctly on confirm', async () => {
    const promise = service.danger('Delete Item', 'Are you sure?');
    
    expect(service.state()).not.toBeNull();
    expect(service.state()?.title).toBe('Delete Item');
    expect(service.state()?.type).toBe('danger');

    service.handleConfirm();

    const result = await promise;
    expect(result).toBe(true);
    expect(service.state()).toBeNull();
  });

  it('should resolve false on cancel', async () => {
    const promise = service.warning('Discard Changes', 'Discard draft?');

    expect(service.state()?.type).toBe('warning');

    service.handleCancel();

    const result = await promise;
    expect(result).toBe(false);
    expect(service.state()).toBeNull();
  });

  it('should handle alert mode correctly', async () => {
    const promise = service.alert('Saved successfully', 'Notice', 'success');

    expect(service.state()?.isAlert).toBe(true);
    expect(service.state()?.type).toBe('success');

    service.handleConfirm();

    await expect(promise).resolves.toBeUndefined();
    expect(service.state()).toBeNull();
  });
});
