import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  AdminUser,
  PagedLogsResult,
  SystemLogStats,
  AiTokenUsageSummary,
  AiTokenUsageLogItem,
  UserRoleUpdateResult,
  AdminOperationResult,
  LogFilterOptions,
  ApiDataResponse,
  EmailConfigDto,
  UpdateEmailConfigRequest,
  TestEmailConnectionRequest,
  TestEmailConnectionResult
} from '../models/admin.model';
import { DynamicForm } from '../models/form.model';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/admin`;

  getUsers(): Observable<AdminUser[]> {
    return this.http.get<AdminUser[]>(`${this.baseUrl}/users`);
  }

  getUserForms(userId: number): Observable<DynamicForm[]> {
    return this.http.get<DynamicForm[]>(`${this.baseUrl}/users/${userId}/forms`);
  }

  updateUserRole(userId: number, roleId: number, role?: string): Observable<UserRoleUpdateResult> {
    return this.http.put<UserRoleUpdateResult>(`${this.baseUrl}/users/${userId}/role`, { roleId, role });
  }

  deleteUser(userId: number): Observable<AdminOperationResult> {
    return this.http.delete<AdminOperationResult>(`${this.baseUrl}/users/${userId}`);
  }

  getLogs(options?: LogFilterOptions): Observable<PagedLogsResult> {
    let params = new HttpParams();
    if (options?.page) params = params.set('page', options.page.toString());
    if (options?.pageSize) params = params.set('pageSize', options.pageSize.toString());
    if (options?.logLevel && options.logLevel !== 'ALL') params = params.set('logLevel', options.logLevel);
    if (options?.search) params = params.set('search', options.search.trim());

    return this.http.get<PagedLogsResult>(`${this.baseUrl}/logs`, { params });
  }

  readonly unreadLogsCount = signal<number>(0);

  getLogStats(): Observable<SystemLogStats> {
    return this.http.get<SystemLogStats>(`${this.baseUrl}/logs/stats`).pipe(
      tap(stats => {
        if (stats && typeof stats.unreadErrorCount === 'number') {
          this.unreadLogsCount.set(stats.unreadErrorCount);
        }
      })
    );
  }

  loadUnreadLogsCount(): void {
    this.getLogStats().subscribe({
      next: () => {},
      error: () => {}
    });
  }

  markLogAsRead(id: number): Observable<{ success: boolean; rowsUpdated: number }> {
    return this.http.post<{ success: boolean; rowsUpdated: number }>(`${this.baseUrl}/logs/${id}/read`, {}).pipe(
      tap(res => {
        if (res.success && res.rowsUpdated > 0) {
          this.unreadLogsCount.update(count => Math.max(0, count - 1));
        }
      })
    );
  }

  markAllLogsAsRead(): Observable<{ success: boolean; rowsUpdated: number }> {
    return this.http.post<{ success: boolean; rowsUpdated: number }>(`${this.baseUrl}/logs/mark-all-read`, {}).pipe(
      tap(res => {
        if (res.success) {
          this.unreadLogsCount.set(0);
        }
      })
    );
  }

  clearLogs(olderThanDays?: number): Observable<AdminOperationResult> {
    let params = new HttpParams();
    if (olderThanDays != null) params = params.set('olderThanDays', olderThanDays.toString());
    return this.http.delete<AdminOperationResult>(`${this.baseUrl}/logs`, { params }).pipe(
      tap(() => {
        this.unreadLogsCount.set(0);
      })
    );
  }

  triggerTestError(message?: string): Observable<unknown> {
    return this.http.post(`${this.baseUrl}/logs/test-error`, { message });
  }

  getAiTokenSummary(fromDate?: string, toDate?: string, userId?: number): Observable<ApiDataResponse<AiTokenUsageSummary>> {
    let params = new HttpParams();
    if (fromDate) params = params.set('fromDate', fromDate);
    if (toDate) params = params.set('toDate', toDate);
    if (userId != null) params = params.set('userId', userId.toString());
    return this.http.get<ApiDataResponse<AiTokenUsageSummary>>(`${environment.apiUrl}/ai-tokens/summary`, { params });
  }

  getAiTokenLogs(limit: number = 50, userId?: number): Observable<ApiDataResponse<AiTokenUsageLogItem[]>> {
    let params = new HttpParams().set('limit', limit.toString());
    if (userId != null) params = params.set('userId', userId.toString());
    return this.http.get<ApiDataResponse<AiTokenUsageLogItem[]>>(`${environment.apiUrl}/ai-tokens/logs`, { params });
  }

  getUserTokenBreakdown(): Observable<ApiDataResponse<import('../models/admin.model').UserTokenUsageSummary[]>> {
    return this.http.get<ApiDataResponse<import('../models/admin.model').UserTokenUsageSummary[]>>(`${environment.apiUrl}/ai-tokens/users`);
  }

  getAiConfig(): Observable<ApiDataResponse<import('../models/admin.model').AiConfiguration>> {
    return this.http.get<ApiDataResponse<import('../models/admin.model').AiConfiguration>>(`${environment.apiUrl}/ai-config`);
  }

  updateAiConfig(payload: import('../models/admin.model').UpdateAiConfigRequest): Observable<ApiDataResponse<import('../models/admin.model').AiConfiguration>> {
    return this.http.put<ApiDataResponse<import('../models/admin.model').AiConfiguration>>(`${environment.apiUrl}/ai-config`, payload);
  }

  testAiConnection(payload: import('../models/admin.model').TestAiConnectionRequest): Observable<ApiDataResponse<import('../models/admin.model').TestAiConnectionResult>> {
    return this.http.post<ApiDataResponse<import('../models/admin.model').TestAiConnectionResult>>(`${environment.apiUrl}/ai-config/test`, payload);
  }

  addAiModel(providerIdOrCode: number | string, payload: import('../models/admin.model').CreateAiModelRequest): Observable<ApiDataResponse<import('../models/admin.model').AiModelInfo>> {
    const url = typeof providerIdOrCode === 'number'
      ? `${environment.apiUrl}/ai-config/providers/${providerIdOrCode}/models`
      : `${environment.apiUrl}/ai-config/providers/code/${encodeURIComponent(providerIdOrCode)}/models`;
    return this.http.post<ApiDataResponse<import('../models/admin.model').AiModelInfo>>(url, payload);
  }

  getEmailConfig(): Observable<ApiDataResponse<EmailConfigDto>> {
    return this.http.get<ApiDataResponse<EmailConfigDto>>(`${environment.apiUrl}/email-config`);
  }

  updateEmailConfig(payload: UpdateEmailConfigRequest): Observable<ApiDataResponse<EmailConfigDto>> {
    return this.http.put<ApiDataResponse<EmailConfigDto>>(`${environment.apiUrl}/email-config`, payload);
  }

  testEmailConnection(payload?: TestEmailConnectionRequest): Observable<ApiDataResponse<TestEmailConnectionResult>> {
    return this.http.post<ApiDataResponse<TestEmailConnectionResult>>(`${environment.apiUrl}/email-config/test`, payload ?? {});
  }
}
