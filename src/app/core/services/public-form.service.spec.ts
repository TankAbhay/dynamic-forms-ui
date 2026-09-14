import '@angular/compiler';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { of } from 'rxjs';
import { PublicFormService } from './public-form.service';
import { HttpClient } from '@angular/common/http';
import { Injector, runInInjectionContext } from '@angular/core';

describe('PublicFormService', () => {
  let service: PublicFormService;
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

    service = runInInjectionContext(injector, () => new PublicFormService());
  });

  it('should fetch public form by share code', () => {
    httpClientMock.get.mockReturnValue(of({ id: 1, title: 'Feedback', shareCode: 'xyz123' }));

    service.getPublicForm('xyz123').subscribe((res) => {
      expect(res.title).toBe('Feedback');
      expect(res.shareCode).toBe('xyz123');
    });

    expect(httpClientMock.get).toHaveBeenCalledWith(expect.stringContaining('/forms/public/xyz123'));
  });

  it('should submit public form responses', () => {
    httpClientMock.post.mockReturnValue(of({ success: true, submissionId: 99, message: 'Received' }));

    service.submitPublicForm('xyz123', { responseDataJson: '{"rating":5}' }).subscribe((res) => {
      expect(res.submissionId).toBe(99);
    });

    expect(httpClientMock.post).toHaveBeenCalledWith(
      expect.stringContaining('/forms/public/xyz123/submit'),
      expect.objectContaining({ responseDataJson: '{"rating":5}' })
    );
  });
});
