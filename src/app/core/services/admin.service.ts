import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
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
  ApiDataResponse
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

  getLogStats(): Observable<SystemLogStats> {
    return this.http.get<SystemLogStats>(`${this.baseUrl}/logs/stats`);
  }

  clearLogs(olderThanDays?: number): Observable<AdminOperationResult> {
    let params = new HttpParams();
    if (olderThanDays != null) params = params.set('olderThanDays', olderThanDays.toString());
    return this.http.delete<AdminOperationResult>(`${this.baseUrl}/logs`, { params });
  }

  triggerTestError(message?: string): Observable<unknown> {
    return this.http.post(`${this.baseUrl}/logs/test-error`, { message });
  }

  getAiTokenSummary(fromDate?: string, toDate?: string): Observable<ApiDataResponse<AiTokenUsageSummary>> {
    let params = new HttpParams();
    if (fromDate) params = params.set('fromDate', fromDate);
    if (toDate) params = params.set('toDate', toDate);
    return this.http.get<ApiDataResponse<AiTokenUsageSummary>>(`${environment.apiUrl}/ai-tokens/summary`, { params });
  }

  getAiTokenLogs(limit: number = 50): Observable<ApiDataResponse<AiTokenUsageLogItem[]>> {
    return this.http.get<ApiDataResponse<AiTokenUsageLogItem[]>>(`${environment.apiUrl}/ai-tokens/logs`, {
      params: new HttpParams().set('limit', limit.toString())
    });
  }
}
