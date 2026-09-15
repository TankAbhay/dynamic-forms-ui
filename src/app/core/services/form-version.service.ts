import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  DynamicFormVersion,
  DynamicFormVersionDetail,
  UpdateDraftPayload,
  CreateDraftPayload,
  PublishDraftPayload,
  FormOperationResult
} from '../models/form.model';

@Injectable({
  providedIn: 'root'
})
export class FormVersionService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/forms`;

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
}
