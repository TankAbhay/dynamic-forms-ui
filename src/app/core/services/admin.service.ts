import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AdminUser } from '../models/admin.model';
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
}
