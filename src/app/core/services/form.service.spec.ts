import '@angular/compiler';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { of } from 'rxjs';
import { FormService } from './form.service';
import { HttpClient } from '@angular/common/http';
import { Injector, runInInjectionContext } from '@angular/core';
import { DynamicForm, CreateFormPayload } from '../models/form.model';

describe('FormService', () => {
  let service: FormService;
  let httpClientMock: any;

  beforeEach(() => {
    httpClientMock = {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn()
    };

    const injector = Injector.create({
      providers: [{ provide: HttpClient, useValue: httpClientMock }]
    });

    service = runInInjectionContext(injector, () => new FormService());
  });

  it('should call getForms with companyId and includeInactive query params', () => {
    const mockForms: DynamicForm[] = [
      { id: 1, companyId: 1, createdByEmployeeId: 1, title: 'Survey', category: 'General', isActive: true, createdAt: '', updatedAt: '', fieldCount: 0, submissionCount: 0 }
    ];
    httpClientMock.get.mockReturnValue(of(mockForms));

    service.getForms(1, true).subscribe((res) => {
      expect(res).toEqual(mockForms);
    });

    expect(httpClientMock.get).toHaveBeenCalledWith(expect.stringContaining('companyId=1&includeInactive=true'));
  });

  it('should post createForm with proper endpoint and payload', () => {
    const payload: CreateFormPayload = {
      title: 'New Form',
      category: 'Feedback',
      isActive: true,
      fields: []
    };
    httpClientMock.post.mockReturnValue(of({ form: { id: 10, ...payload } }));

    service.createForm(payload, 2).subscribe((res) => {
      expect(res.form.id).toBe(10);
    });

    expect(httpClientMock.post).toHaveBeenCalledWith(expect.stringContaining('companyId=2'), payload);
  });

  it('should request paged submissions with cursor and pageSize', () => {
    httpClientMock.get.mockReturnValue(of({ items: [], nextCursor: 'abc.123', hasMore: false, pageSize: 25 }));

    service.getSubmissionsPaged(5, 25, 'cursor_token').subscribe((res) => {
      expect(res.nextCursor).toBe('abc.123');
    });

    expect(httpClientMock.get).toHaveBeenCalledWith(
      expect.stringContaining('/forms/5/submissions?pageSize=25&paged=true&cursor=cursor_token')
    );
  });

  it('should call publishDraft with expectedRowVersion', () => {
    httpClientMock.post.mockReturnValue(of({}));

    service.publishDraft(1, 3, { expectedRowVersion: 'AQID' }).subscribe();

    expect(httpClientMock.post).toHaveBeenCalledWith(
      expect.stringContaining('/forms/1/versions/draft/3/publish'),
      { expectedRowVersion: 'AQID' }
    );
  });
});
