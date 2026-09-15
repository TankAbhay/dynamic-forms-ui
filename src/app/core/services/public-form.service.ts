import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  PublicForm,
  PublicSubmissionPayload,
  ShareFormPayload,
  FormSubmissionResult,
  FormAccessLinkResult,
  FormAccessValidationResult,
  ResolveAccessLinkResult,
  FormOperationResult
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

  submitPublicForm(shareCodeOrId: string | number, payload: PublicSubmissionPayload): Observable<FormSubmissionResult> {
    if (payload.accessToken) {
      return this.http.post<FormSubmissionResult>(
        `${this.apiUrl}/public/${shareCodeOrId}/submit`,
        payload,
        { headers: { 'X-Form-Access-Token': payload.accessToken } }
      );
    }
    return this.http.post<FormSubmissionResult>(
      `${this.apiUrl}/public/${shareCodeOrId}/submit`,
      payload
    );
  }

  sendAccessLink(formId: number, email: string): Observable<FormAccessLinkResult> {
    return this.http.post<FormAccessLinkResult>(
      `${environment.apiUrl}/form-access/send`,
      { formId, email }
    );
  }

  validateAccessLink(formId: number, token: string): Observable<FormAccessValidationResult> {
    return this.http.post<FormAccessValidationResult>(
      `${environment.apiUrl}/form-access/validate`,
      { formId, token }
    );
  }

  resolveAccessLink(formId: number, token: string): Observable<ResolveAccessLinkResult> {
    return this.http.get<ResolveAccessLinkResult>(
      `${environment.apiUrl}/form-access/resolve-link?fid=${formId}&token=${encodeURIComponent(token)}`
    );
  }

  updateFormSharing(formId: number, payload: ShareFormPayload): Observable<FormOperationResult> {
    return this.http.post<FormOperationResult>(`${this.apiUrl}/${formId}/share`, payload);
  }
}
