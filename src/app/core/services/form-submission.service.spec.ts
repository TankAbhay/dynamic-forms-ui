import '@angular/compiler';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { of } from 'rxjs';
import { FormSubmissionService } from './form-submission.service';
import { HttpClient } from '@angular/common/http';
import { Injector, runInInjectionContext } from '@angular/core';

describe('FormSubmissionService', () => {
  let service: FormSubmissionService;
  let httpClientMock: { get: ReturnType<typeof vi.fn>; post: ReturnType<typeof vi.fn>; put: ReturnType<typeof vi.fn>; delete: ReturnType<typeof vi.fn> };

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

    service = runInInjectionContext(injector, () => new FormSubmissionService());
  });

  it('should submit form responses', () => {
    httpClientMock.post.mockReturnValue(of({ success: true, submissionId: 42, message: 'Saved' }));

    service.submitForm(5, { formVersionId: 1, responseData: { name: 'Alice' } }).subscribe((res) => {
      expect(res.submissionId).toBe(42);
      expect(res.success).toBe(true);
    });

    expect(httpClientMock.post).toHaveBeenCalledWith(
      expect.stringContaining('/forms/5/submit'),
      expect.objectContaining({ responseData: { name: 'Alice' } })
    );
  });

  it('should get paged submissions with cursor', () => {
    httpClientMock.get.mockReturnValue(of({ items: [], nextCursor: 'token_123', hasMore: false, pageSize: 25 }));

    service.getSubmissionsPaged(5, 25, 'cursor_abc').subscribe((res) => {
      expect(res.nextCursor).toBe('token_123');
    });

    expect(httpClientMock.get).toHaveBeenCalledWith(
      expect.stringContaining('/forms/5/submissions?pageSize=25&paged=true&cursor=cursor_abc')
    );
  });
});
