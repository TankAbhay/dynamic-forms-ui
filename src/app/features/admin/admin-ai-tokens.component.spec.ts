import '@angular/compiler';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { of } from 'rxjs';
import { AdminAiTokensComponent } from './admin-ai-tokens.component';
import { AdminService } from '../../core/services/admin.service';
import { AuthService } from '../../core/services/auth.service';
import { Injector, runInInjectionContext } from '@angular/core';
import { AiTokenUsageSummary, AiTokenUsageLogItem, UserTokenUsageSummary } from '../../core/models/admin.model';

describe('AdminAiTokensComponent', () => {
  let component: AdminAiTokensComponent;
  let adminServiceMock: any;
  let authServiceMock: any;

  const mockSummary: AiTokenUsageSummary = {
    totalRequests: 25,
    promptTokens: 15000,
    completionTokens: 5000,
    totalTokens: 20000,
    cachedRequests: 5,
    cachedPromptTokens: 3000,
    cacheHitRatio: 0.2,
    estimatedCostUsd: 0.002625,
    estimatedSavingsUsd: 0.000225,
    lastUsedAt: '2026-09-16T10:00:00Z'
  };

  const mockLogs: AiTokenUsageLogItem[] = [
    {
      id: 1,
      userId: 5,
      userEmail: 'alice@example.com',
      userFullName: 'Alice Smith',
      requestType: 'FormGeneration',
      model: 'gemini-2.5-flash',
      promptTokens: 800,
      completionTokens: 200,
      totalTokens: 1000,
      durationMs: 450,
      isCached: false,
      estimatedCostUsd: 0.00012,
      createdAt: '2026-09-16T10:30:00Z'
    }
  ];

  const mockUserBreakdown: UserTokenUsageSummary[] = [
    {
      userId: 5,
      userEmail: 'alice@example.com',
      userFullName: 'Alice Smith',
      totalRequests: 10,
      promptTokens: 8000,
      completionTokens: 2000,
      totalTokens: 10000,
      estimatedCostUsd: 0.0012
    },
    {
      userId: 8,
      userEmail: 'bob@example.com',
      userFullName: 'Bob Jones',
      totalRequests: 5,
      promptTokens: 4000,
      completionTokens: 1000,
      totalTokens: 5000,
      estimatedCostUsd: 0.0006
    }
  ];

  beforeEach(() => {
    adminServiceMock = {
      getAiTokenSummary: vi.fn().mockReturnValue(of({ success: true, data: mockSummary })),
      getAiTokenLogs: vi.fn().mockReturnValue(of({ success: true, data: mockLogs })),
      getUserTokenBreakdown: vi.fn().mockReturnValue(of({ success: true, data: mockUserBreakdown }))
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

    component = runInInjectionContext(injector, () => new AdminAiTokensComponent());
    component.ngOnInit();
  });

  it('should load summary, logs, and user breakdown on init', () => {
    expect(component.summary()).toEqual(mockSummary);
    expect(component.logs().length).toBe(1);
    expect(component.userBreakdown().length).toBe(2);
    expect(component.isLoading()).toBe(false);
  });

  it('should calculate correct percentage relative to highest token user', () => {
    expect(component.maxTokens()).toBe(10000);
    expect(component.getUserPercentage(10000)).toBe(100);
    expect(component.getUserPercentage(5000)).toBe(50);
  });

  it('should reload data when user filter is changed', () => {
    component.onUserFilterChange('5');

    expect(component.selectedUserId()).toBe(5);
    expect(adminServiceMock.getAiTokenSummary).toHaveBeenCalledWith(undefined, undefined, 5);
    expect(adminServiceMock.getAiTokenLogs).toHaveBeenCalledWith(50, 5);
  });

  it('should handle clearing user filter', () => {
    component.onUserFilterChange(null);

    expect(component.selectedUserId()).toBeNull();
    expect(adminServiceMock.getAiTokenSummary).toHaveBeenCalledWith(undefined, undefined, undefined);
  });
});
