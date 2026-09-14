import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  PublicForm,
  PublicSubmissionPayload,
  ShareFormPayload
} from '../models/form.model';

@Injectable({
  providedIn: 'root'
})
export class PublicFormService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/forms`;

  getPublicForm(shareCodeOrId: string | number): Observable<PublicForm> {
    return this.http.get<PublicForm>(`${this.apiUrl}/public/${shareCodeOrId}`);
  }

  submitPublicForm(shareCodeOrId: string | number, payload: PublicSubmissionPayload): Observable<{ success: boolean; submissionId: number; message: string }> {
    if (payload.accessToken) {
      return this.http.post<{ success: boolean; submissionId: number; message: string }>(
        `${this.apiUrl}/public/${shareCodeOrId}/submit`,
        payload,
        { headers: { 'X-Form-Access-Token': payload.accessToken } }
      );
    }
    return this.http.post<{ success: boolean; submissionId: number; message: string }>(
      `${this.apiUrl}/public/${shareCodeOrId}/submit`,
      payload
    );
  }

  sendAccessLink(formId: number, email: string): Observable<{ success: boolean; emailDelivered: boolean; message: string; accessUrl?: string }> {
    return this.http.post<{ success: boolean; emailDelivered: boolean; message: string; accessUrl?: string }>(
      `${environment.apiUrl}/form-access/send`,
      { formId, email }
    );
  }

  validateAccessLink(formId: number, token: string): Observable<{ valid: boolean; email: string; message: string }> {
    return this.http.post<{ valid: boolean; email: string; message: string }>(
      `${environment.apiUrl}/form-access/validate`,
      { formId, token }
    );
  }

  resolveAccessLink(formId: number, token: string): Observable<{ success: boolean; formId: number; shareCode: string; formTitle: string; targetPath: string; message?: string }> {
    return this.http.get<{ success: boolean; formId: number; shareCode: string; formTitle: string; targetPath: string; message?: string }>(
      `${environment.apiUrl}/form-access/resolve-link?fid=${formId}&token=${encodeURIComponent(token)}`
    );
  }

  updateFormSharing(formId: number, payload: ShareFormPayload): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(`${this.apiUrl}/${formId}/share`, payload);
  }
}
