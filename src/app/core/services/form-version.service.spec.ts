import '@angular/compiler';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { of } from 'rxjs';
import { FormVersionService } from './form-version.service';
import { HttpClient } from '@angular/common/http';
import { Injector, runInInjectionContext } from '@angular/core';

describe('FormVersionService', () => {
  let service: FormVersionService;
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

    service = runInInjectionContext(injector, () => new FormVersionService());
  });

  it('should fetch versions for a form', () => {
    httpClientMock.get.mockReturnValue(of([{ id: 1, versionNumber: 1, status: 'Published' }]));

    service.getVersions(10).subscribe((res) => {
      expect(res.length).toBe(1);
      expect(res[0].status).toBe('Published');
    });

    expect(httpClientMock.get).toHaveBeenCalledWith(expect.stringContaining('/forms/10/versions'));
  });

  it('should publish draft version', () => {
    httpClientMock.post.mockReturnValue(of({ version: { id: 2, status: 'Published' } }));

    service.publishDraft(10, 2, { expectedRowVersion: 'AQID' }).subscribe((res) => {
      expect(res.version.status).toBe('Published');
    });

    expect(httpClientMock.post).toHaveBeenCalledWith(
      expect.stringContaining('/forms/10/versions/draft/2/publish'),
      { expectedRowVersion: 'AQID' }
    );
  });
});
