import '@angular/compiler';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { of } from 'rxjs';
import { CreateWithAiComponent } from './create-with-ai.component';
import { FormGenerationService } from './services/form-generation.service';
import { Router } from '@angular/router';
import { Injector, runInInjectionContext } from '@angular/core';
import {
  GeneratedFormResultDto,
  GuidedStartResponse
} from './models/ai-form-generation.model';

describe('CreateWithAiComponent', () => {
  let component: CreateWithAiComponent;
  let formGenServiceMock: any;
  let routerMock: any;

  const mockGeneratedResult: GeneratedFormResultDto = {
    title: 'Customer Satisfaction Survey',
    description: 'Measures CSAT score',
    category: 'Customer Support',
    summary: 'A 4-field survey',
    fields: [
      {
        fieldKey: 'overall_rating',
        fieldType: 'radio',
        label: 'How satisfied are you?',
        isRequired: true,
        options: ['Very Satisfied', 'Satisfied', 'Neutral', 'Unsatisfied'],
        sortOrder: 1
      },
      {
        fieldKey: 'feedback_comments',
        fieldType: 'textarea',
        label: 'Additional comments',
        isRequired: false,
        sortOrder: 2
      }
    ]
  };

  const mockGuidedStart: GuidedStartResponse = {
    prompt: 'Employee Leave Request',
    inferredCategory: 'Human Resources',
    questions: [
      {
        id: 'q1',
        question: 'Which leave types are allowed?',
        inputType: 'checkbox',
        options: ['Annual Leave', 'Sick Leave', 'Unpaid Leave']
      }
    ]
  };

  beforeEach(() => {
    formGenServiceMock = {
      generateDirect: vi.fn().mockReturnValue(of(mockGeneratedResult)),
      startGuided: vi.fn().mockReturnValue(of(mockGuidedStart)),
      generateGuided: vi.fn().mockReturnValue(of(mockGeneratedResult))
    };

    routerMock = {
      navigate: vi.fn()
    };

    const injector = Injector.create({
      providers: [
        { provide: FormGenerationService, useValue: formGenServiceMock },
        { provide: Router, useValue: routerMock }
      ]
    });

    component = runInInjectionContext(injector, () => new CreateWithAiComponent());
  });

  it('should initialize with default state', () => {
    expect(component.mode()).toBe('guided');
    expect(component.prompt()).toBe('');
    expect(component.isPromptValid()).toBe(false);
    expect(component.guidedStage()).toBe('prompt');
    expect(component.examples.length).toBeGreaterThan(0);
  });

  it('should allow switching modes', () => {
    component.setMode('direct');
    expect(component.mode()).toBe('direct');

    component.setMode('guided');
    expect(component.mode()).toBe('guided');
  });

  it('should populate prompt when using an example', () => {
    const example = component.examples[0];
    component.useExample(example);
    expect(component.prompt()).toBe(example.prompt);
    expect(component.isPromptValid()).toBe(true);
  });

  it('should prevent direct generation if prompt is too short', () => {
    component.prompt.set('hi');
    component.generateDirect();
    expect(component.errorMessage()).toContain('at least 5 characters');
    expect(formGenServiceMock.generateDirect).not.toHaveBeenCalled();
  });

  it('should execute direct generation when prompt is valid', () => {
    component.prompt.set('A complete customer satisfaction survey with rating scale');
    component.generateDirect();

    expect(formGenServiceMock.generateDirect).toHaveBeenCalledWith({
      prompt: 'A complete customer satisfaction survey with rating scale'
    });
    expect(component.generatedResult()).toEqual(mockGeneratedResult);
    expect(component.guidedStage()).toBe('result');
  });

  it('should advance to questions stage on startGuided', () => {
    component.prompt.set('Employee Leave Request form');
    component.startGuided();

    expect(formGenServiceMock.startGuided).toHaveBeenCalledWith({
      prompt: 'Employee Leave Request form'
    });
    expect(component.guidedData()).toEqual(mockGuidedStart);
    expect(component.guidedStage()).toBe('questions');
  });

  it('should generate tailored form from guided answers', () => {
    component.guidedData.set(mockGuidedStart);
    component.completeGuidedGeneration();

    expect(formGenServiceMock.generateGuided).toHaveBeenCalled();
    expect(component.generatedResult()).toEqual(mockGeneratedResult);
    expect(component.guidedStage()).toBe('result');
  });

  it('should navigate to Form Builder with aiGeneratedForm state on handoff', () => {
    component.generatedResult.set(mockGeneratedResult);
    component.openInFormBuilder();

    expect(routerMock.navigate).toHaveBeenCalledWith(['/forms/builder'], {
      state: {
        aiGeneratedForm: {
          title: mockGeneratedResult.title,
          description: mockGeneratedResult.description,
          category: mockGeneratedResult.category,
          fields: mockGeneratedResult.fields
        }
      }
    });
  });

  it('should navigate back to forms list on cancel', () => {
    component.cancel();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/forms']);
  });
});
