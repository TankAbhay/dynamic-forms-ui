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
    return this.http.post<{ success: boolean; submissionId: number; message: string }>(
      `${this.apiUrl}/public/${shareCodeOrId}/submit`,
      payload
    );
  }

  updateFormSharing(formId: number, payload: ShareFormPayload): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(`${this.apiUrl}/${formId}/share`, payload);
  }
}
