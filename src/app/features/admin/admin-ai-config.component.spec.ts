import '@angular/compiler';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { of } from 'rxjs';
import { AdminAiConfigComponent } from './admin-ai-config.component';
import { AdminService } from '../../core/services/admin.service';
import { AuthService } from '../../core/services/auth.service';
import { Injector, runInInjectionContext } from '@angular/core';
import { AiConfiguration } from '../../core/models/admin.model';

describe('AdminAiConfigComponent', () => {
  let component: AdminAiConfigComponent;
  let adminServiceMock: any;
  let authServiceMock: any;

  const mockConfig: AiConfiguration = {
    provider: 'Gemini',
    model: 'gemini-2.5-flash',
    apiKeyMasked: 'AIzaSy...****...38xZ',
    isConfigured: true,
    keyLength: 39,
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
    temperature: 0.2,
    timeoutSeconds: 30,
    updatedAt: '2026-09-16T10:00:00Z',
    availableProviders: [
      {
        id: 'Gemini',
        displayName: 'Google Gemini',
        defaultBaseUrl: 'https://generativelanguage.googleapis.com/v1beta',
        recommendedModels: ['gemini-2.5-flash', 'gemini-2.0-flash']
      },
      {
        id: 'OpenAI',
        displayName: 'OpenAI',
        defaultBaseUrl: 'https://api.openai.com/v1',
        recommendedModels: ['gpt-4o-mini', 'gpt-4o']
      }
    ]
  };

  beforeEach(() => {
    adminServiceMock = {
      getAiConfig: vi.fn().mockReturnValue(of({ success: true, data: mockConfig })),
      updateAiConfig: vi.fn().mockReturnValue(of({ success: true, data: { ...mockConfig, model: 'gpt-4o-mini', provider: 'OpenAI' } })),
      testAiConnection: vi.fn().mockReturnValue(of({
        success: true,
        data: {
          success: true,
          latencyMs: 180,
          message: 'Connected successfully',
          provider: 'Gemini',
          model: 'gemini-2.5-flash'
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
      component = new AdminAiConfigComponent();
    });
  });

  it('should create and load AI configuration on init', () => {
    component.ngOnInit();
    expect(adminServiceMock.getAiConfig).toHaveBeenCalled();
    expect(component.selectedProvider()).toBe('Gemini');
    expect(component.selectedModel()).toBe('gemini-2.5-flash');
    expect(component.config()?.isConfigured).toBe(true);
    expect(component.isLoading()).toBe(false);
  });

  it('should switch provider and select first recommended model', () => {
    component.ngOnInit();
    component.onProviderSelect('OpenAI');
    expect(component.selectedProvider()).toBe('OpenAI');
    expect(component.selectedModel()).toBe('gpt-4o-mini');
    expect(component.baseUrl()).toBe('https://api.openai.com/v1');
    expect(component.isCustomModel()).toBe(false);
  });

  it('should execute test connection and update testResult signal', () => {
    component.ngOnInit();
    component.onTestConnection();
    expect(adminServiceMock.testAiConnection).toHaveBeenCalled();
    expect(component.testResult()?.success).toBe(true);
    expect(component.testResult()?.latencyMs).toBe(180);
    expect(component.isTesting()).toBe(false);
  });

  it('should save updated configuration', () => {
    component.ngOnInit();
    component.onProviderSelect('OpenAI');
    component.apiKeyInput.set('sk-new-test-key');
    component.onSave();

    expect(adminServiceMock.updateAiConfig).toHaveBeenCalledWith(expect.objectContaining({
      provider: 'OpenAI',
      model: 'gpt-4o-mini',
      apiKey: 'sk-new-test-key'
    }));
    expect(component.successMessage()).toContain('saved successfully');
    expect(component.apiKeyInput()).toBe('');
  });
});
