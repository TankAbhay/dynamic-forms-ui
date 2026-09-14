import '@angular/compiler';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { of } from 'rxjs';
import { FormGenerationService } from './form-generation.service';
import { HttpClient } from '@angular/common/http';
import { Injector, runInInjectionContext } from '@angular/core';
import {
  DirectGenerateFormRequest,
  GuidedStartRequest,
  GuidedGenerateFormRequest,
  GeneratedFormResultDto,
  GuidedStartResponse
} from '../models/ai-form-generation.model';

describe('FormGenerationService', () => {
  let service: FormGenerationService;
  let httpClientMock: any;

  beforeEach(() => {
    httpClientMock = {
      post: vi.fn()
    };

    const injector = Injector.create({
      providers: [{ provide: HttpClient, useValue: httpClientMock }]
    });

    service = runInInjectionContext(injector, () => new FormGenerationService());
  });

  it('should call generateDirect with correct URL and payload', () => {
    const mockResult: GeneratedFormResultDto = {
      title: 'Feedback Form',
      description: 'Collects feedback',
      category: 'Customer Support',
      summary: 'Form generated',
      fields: [
        {
          fieldKey: 'rating',
          fieldType: 'number',
          label: 'Your Rating',
          isRequired: true,
          sortOrder: 1
        }
      ]
    };
    httpClientMock.post.mockReturnValue(of({ success: true, form: mockResult }));

    const req: DirectGenerateFormRequest = { prompt: 'Feedback form' };
    service.generateDirect(req).subscribe((res) => {
      expect(res).toEqual(mockResult);
    });

    expect(httpClientMock.post).toHaveBeenCalledWith(
      expect.stringContaining('/form-generation/generate'),
      req
    );
  });

  it('should call startGuided with correct URL and payload', () => {
    const mockResponse: GuidedStartResponse = {
      prompt: 'Leave form',
      inferredCategory: 'Human Resources',
      questions: [
        {
          id: 'q1',
          question: 'What types of leave?',
          inputType: 'checkbox',
          options: ['Annual', 'Sick']
        }
      ]
    };
    httpClientMock.post.mockReturnValue(of({ success: true, data: mockResponse }));

    const req: GuidedStartRequest = { prompt: 'Leave form' };
    service.startGuided(req).subscribe((res) => {
      expect(res).toEqual(mockResponse);
    });

    expect(httpClientMock.post).toHaveBeenCalledWith(
      expect.stringContaining('/form-generation/guided/start'),
      req
    );
  });

  it('should call generateGuided with correct URL and payload', () => {
    const mockResult: GeneratedFormResultDto = {
      title: 'Tailored Leave Form',
      description: 'Employee leave',
      category: 'Human Resources',
      summary: 'Tailored form',
      fields: []
    };
    httpClientMock.post.mockReturnValue(of({ success: true, form: mockResult }));

    const req: GuidedGenerateFormRequest = {
      originalPrompt: 'Leave form',
      inferredCategory: 'Human Resources',
      answers: [{ questionId: 'q1', selectedOptions: ['Annual'] }]
    };
    service.generateGuided(req).subscribe((res) => {
      expect(res).toEqual(mockResult);
    });

    expect(httpClientMock.post).toHaveBeenCalledWith(
      expect.stringContaining('/form-generation/guided/generate'),
      req
    );
  });

  it('should call modifyForm with correct URL and payload', () => {
    const mockResponse = {
      success: true,
      summaryOfChanges: 'Added Emergency Contact',
      fields: [
        {
          fieldKey: 'emergency_phone',
          fieldType: 'phone' as const,
          label: 'Emergency Contact Phone',
          isRequired: true,
          sortOrder: 1
        }
      ],
      tokensUsed: 142,
      isCached: false
    };
    httpClientMock.post.mockReturnValue(of(mockResponse));

    const req = {
      instruction: 'Add emergency contact phone',
      formTitle: 'Registration',
      existingFields: []
    };
    service.modifyForm(req).subscribe((res) => {
      expect(res).toEqual(mockResponse);
      expect(res.tokensUsed).toBe(142);
      expect(res.isCached).toBe(false);
    });

    expect(httpClientMock.post).toHaveBeenCalledWith(
      expect.stringContaining('/form-generation/modify'),
      req
    );
  });
});

