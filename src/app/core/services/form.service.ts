import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  DynamicForm,
  DynamicFormDetail,
  DynamicFormVersion,
  DynamicFormVersionDetail,
  CreateFormPayload,
  UpdateFormPayload,
  UpdateDraftPayload,
  CreateDraftPayload,
  PublishDraftPayload,
  SubmitFormPayload,
  FormSubmission,
  KeysetPagedResult,
  DynamicFormField,
  PublicForm,
  PublicSubmissionPayload,
  ShareFormPayload,
  FormOperationResult,
  FormSubmissionResult,
  FormAccessLinkResult,
  FormAccessValidationResult
} from '../models/form.model';

/**
 * Enterprise Form Service.
 * Provides core form operations and backward-compatible delegates.
 * Specialized features are partitioned into FormVersionService, FormSubmissionService, and PublicFormService.
 */
@Injectable({
  providedIn: 'root'
})
export class FormService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/forms`;

  // --- Core Form CRUD ---

  getForms(includeInactive: boolean = true): Observable<DynamicForm[]> {
    const url = `${this.apiUrl}?includeInactive=${includeInactive}`;
    return this.http.get<DynamicForm[]>(url);
  }

  getFormById(id: number): Observable<DynamicFormDetail> {
    return this.http.get<DynamicFormDetail>(`${this.apiUrl}/${id}`);
  }

  createForm(payload: CreateFormPayload): Observable<DynamicFormDetail> {
    return this.http.post<DynamicFormDetail>(this.apiUrl, payload);
  }

  updateForm(id: number, payload: UpdateFormPayload): Observable<DynamicFormDetail> {
    return this.http.put<DynamicFormDetail>(`${this.apiUrl}/${id}`, payload);
  }

  deleteForm(id: number): Observable<FormOperationResult> {
    return this.http.delete<FormOperationResult>(`${this.apiUrl}/${id}`);
  }

  // --- Submissions ---

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

  // --- Versioning ---

  getVersions(formId: number): Observable<DynamicFormVersion[]> {
    return this.http.get<DynamicFormVersion[]>(`${this.apiUrl}/${formId}/versions`);
  }

  getPublishedVersion(formId: number): Observable<DynamicFormVersionDetail> {
    return this.http.get<DynamicFormVersionDetail>(`${this.apiUrl}/${formId}/versions/published`);
  }

  getDraftVersion(formId: number): Observable<DynamicFormVersionDetail> {
    return this.http.get<DynamicFormVersionDetail>(`${this.apiUrl}/${formId}/versions/draft`);
  }

  getVersionById(formId: number, versionId: number): Observable<DynamicFormVersionDetail> {
    return this.http.get<DynamicFormVersionDetail>(`${this.apiUrl}/${formId}/versions/${versionId}`);
  }

  createDraft(formId: number, payload: CreateDraftPayload): Observable<DynamicFormVersionDetail> {
    return this.http.post<DynamicFormVersionDetail>(`${this.apiUrl}/${formId}/versions/draft`, payload);
  }

  updateDraft(formId: number, versionId: number, payload: UpdateDraftPayload): Observable<DynamicFormVersionDetail> {
    return this.http.put<DynamicFormVersionDetail>(`${this.apiUrl}/${formId}/versions/draft/${versionId}`, payload);
  }

  duplicatePublishedToDraft(formId: number): Observable<DynamicFormVersionDetail> {
    return this.http.post<DynamicFormVersionDetail>(`${this.apiUrl}/${formId}/versions/duplicate-published`, {});
  }

  discardDraft(formId: number, versionId: number): Observable<FormOperationResult> {
    return this.http.delete<FormOperationResult>(`${this.apiUrl}/${formId}/versions/draft/${versionId}`);
  }

  publishDraft(formId: number, versionId: number, payload?: PublishDraftPayload): Observable<DynamicFormVersionDetail> {
    return this.http.post<DynamicFormVersionDetail>(`${this.apiUrl}/${formId}/versions/draft/${versionId}/publish`, payload || {});
  }

  // --- Public Sharing ---

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

  updateFormSharing(formId: number, payload: ShareFormPayload): Observable<FormOperationResult> {
    return this.http.post<FormOperationResult>(`${this.apiUrl}/${formId}/share`, payload);
  }
}
