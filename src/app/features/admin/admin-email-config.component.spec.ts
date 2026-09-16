import '@angular/compiler';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { of } from 'rxjs';
import { AdminEmailConfigComponent } from './admin-email-config.component';
import { AdminService } from '../../core/services/admin.service';
import { AuthService } from '../../core/services/auth.service';
import { Injector, runInInjectionContext } from '@angular/core';
import { EmailConfigDto } from '../../core/models/admin.model';

describe('AdminEmailConfigComponent', () => {
  let component: AdminEmailConfigComponent;
  let adminServiceMock: any;
  let authServiceMock: any;

  const mockConfig: EmailConfigDto = {
    host: 'smtp.gmail.com',
    port: 587,
    username: 'support@dynamicforms.com',
    passwordMasked: 's...****...99',
    isPasswordConfigured: true,
    fromEmail: 'noreply@dynamicforms.com',
    FromName: 'Dynamic Forms Support',
    fromName: 'Dynamic Forms Support',
    enableSsl: true,
    updatedAt: '2026-09-16T10:00:00Z'
  };

  beforeEach(() => {
    adminServiceMock = {
      getEmailConfig: vi.fn().mockReturnValue(of({ success: true, data: mockConfig })),
      updateEmailConfig: vi.fn().mockReturnValue(of({
        success: true,
        data: { ...mockConfig, host: 'smtp.office365.com', port: 587 }
      })),
      testEmailConnection: vi.fn().mockReturnValue(of({
        success: true,
        data: {
          success: true,
          latencyMs: 145,
          message: 'SMTP handshake and authentication succeeded.',
          host: 'smtp.gmail.com',
          port: 587
        }
      })),
      loadUnreadLogsCount: vi.fn()
    };

    authServiceMock = {
      isAdmin: vi.fn().mockReturnValue(true),
      isAuthenticated: vi.fn().mockReturnValue(true)
    };

    const injector = Injector.create({
      providers: [
        { provide: AdminService, useValue: adminServiceMock },
        { provide: AuthService, useValue: authServiceMock }
      ]
    });

    runInInjectionContext(injector, () => {
      component = new AdminEmailConfigComponent();
    });
  });

  it('should create and load email configuration on init', () => {
    component.ngOnInit();
    expect(adminServiceMock.getEmailConfig).toHaveBeenCalled();
    expect(component.host()).toBe('smtp.gmail.com');
    expect(component.port()).toBe(587);
    expect(component.username()).toBe('support@dynamicforms.com');
    expect(component.config()?.isPasswordConfigured).toBe(true);
    expect(component.isLoading()).toBe(false);
  });

  it('should apply preset and update host and port', () => {
    component.ngOnInit();
    const office365Preset = component.presets.find(p => p.id === 'office365')!;
    component.applyPreset(office365Preset);
    expect(component.host()).toBe('smtp.office365.com');
    expect(component.port()).toBe(587);
    expect(component.enableSsl()).toBe(true);
  });

  it('should execute test connection and update testResult signal', () => {
    component.ngOnInit();
    component.onTestConnection();
    expect(adminServiceMock.testEmailConnection).toHaveBeenCalled();
    expect(component.testResult()?.success).toBe(true);
    expect(component.testResult()?.latencyMs).toBe(145);
    expect(component.isTesting()).toBe(false);
  });

  it('should save updated email configuration', () => {
    component.ngOnInit();
    component.host.set('smtp.office365.com');
    component.passwordInput.set('NewSecureAppPassword123!');
    component.onSave();

    expect(adminServiceMock.updateEmailConfig).toHaveBeenCalledWith(expect.objectContaining({
      host: 'smtp.office365.com',
      port: 587,
      password: 'NewSecureAppPassword123!'
    }));
    expect(component.passwordInput()).toBe('');
    expect(component.successMessage()).toContain('securely updated');
  });

  it('should toggle password visibility signal', () => {
    expect(component.showPassword()).toBe(false);
    component.togglePasswordVisibility();
    expect(component.showPassword()).toBe(true);
    component.togglePasswordVisibility();
    expect(component.showPassword()).toBe(false);
  });
});
