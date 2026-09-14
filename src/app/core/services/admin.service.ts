import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AdminUser, PagedLogsResult, SystemLogStats } from '../models/admin.model';
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

  updateUserRole(userId: number, roleId: number, role?: string): Observable<{ success: boolean; roleId: number; role: string; message: string }> {
    return this.http.put<{ success: boolean; roleId: number; role: string; message: string }>(`${this.baseUrl}/users/${userId}/role`, { roleId, role });
  }

  deleteUser(userId: number): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.baseUrl}/users/${userId}`);
  }

  getLogs(options?: { page?: number; pageSize?: number; logLevel?: string; search?: string }): Observable<PagedLogsResult> {
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

  clearLogs(olderThanDays?: number): Observable<{ success: boolean; message: string }> {
    let params = new HttpParams();
    if (olderThanDays != null) params = params.set('olderThanDays', olderThanDays.toString());
    return this.http.delete<{ success: boolean; message: string }>(`${this.baseUrl}/logs`, { params });
  }

  triggerTestError(message?: string): Observable<unknown> {
    return this.http.post(`${this.baseUrl}/logs/test-error`, { message });
  }
}
