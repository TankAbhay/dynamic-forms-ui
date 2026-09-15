import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  SubmitFormPayload,
  FormSubmission,
  KeysetPagedResult,
  FormSubmissionResult
} from '../models/form.model';

@Injectable({
  providedIn: 'root'
})
export class FormSubmissionService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/forms`;

  submitForm(formId: number, payload: SubmitFormPayload): Observable<FormSubmissionResult> {
    return this.http.post<FormSubmissionResult>(
      `${this.apiUrl}/${formId}/submit`,
      payload
    );
  }

  getSubmissions(formId: number): Observable<FormSubmission[]> {
    return this.http.get<FormSubmission[]>(`${this.apiUrl}/${formId}/submissions`);
  }

  getSubmissionsPaged(formId: number, pageSize: number = 25, cursor?: string | null): Observable<KeysetPagedResult<FormSubmission>> {
    let url = `${this.apiUrl}/${formId}/submissions?pageSize=${pageSize}&paged=true`;
    if (cursor) {
      url += `&cursor=${encodeURIComponent(cursor)}`;
    }
    return this.http.get<KeysetPagedResult<FormSubmission>>(url);
  }

  exportSubmissionsCsv(formId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${formId}/submissions/export`, {
      responseType: 'blob'
    });
  }
}
