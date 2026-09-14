import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../../environments/environment';
import {
  DirectGenerateFormRequest,
  GuidedStartRequest,
  GuidedStartResponse,
  GuidedGenerateFormRequest,
  GeneratedFormResultDto,
  ModifyFormWithAiRequest,
  ModifyFormWithAiResponse
} from '../models/ai-form-generation.model';

@Injectable({
  providedIn: 'root'
})
export class FormGenerationService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/form-generation`;

  generateDirect(request: DirectGenerateFormRequest): Observable<GeneratedFormResultDto> {
    return this.http
      .post<{ success: boolean; form: GeneratedFormResultDto }>(`${this.apiUrl}/generate`, request)
      .pipe(map((res) => res.form));
  }

  startGuided(request: GuidedStartRequest): Observable<GuidedStartResponse> {
    return this.http
      .post<{ success: boolean; data: GuidedStartResponse }>(`${this.apiUrl}/guided/start`, request)
      .pipe(map((res) => res.data));
  }

  generateGuided(request: GuidedGenerateFormRequest): Observable<GeneratedFormResultDto> {
    return this.http
      .post<{ success: boolean; form: GeneratedFormResultDto }>(`${this.apiUrl}/guided/generate`, request)
      .pipe(map((res) => res.form));
  }

  modifyForm(request: ModifyFormWithAiRequest): Observable<ModifyFormWithAiResponse> {
    return this.http.post<ModifyFormWithAiResponse>(`${this.apiUrl}/modify`, request);
  }
}
