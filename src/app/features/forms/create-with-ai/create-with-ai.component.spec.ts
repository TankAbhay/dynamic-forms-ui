import '@angular/compiler';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { of } from 'rxjs';
import { CreateWithAiComponent } from './create-with-ai.component';
import { FormGenerationService } from './services/form-generation.service';
import { Router } from '@angular/router';
import { Injector, runInInjectionContext } from '@angular/core';
import { GeneratedFormResultDto } from './models/ai-form-generation.model';

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

  beforeEach(() => {
    formGenServiceMock = {
      generateDirect: vi.fn().mockReturnValue(of(mockGeneratedResult))
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
    expect(component.prompt()).toBe('');
    expect(component.isPromptValid()).toBe(false);
    expect(component.guidedStage()).toBe('prompt');
    expect(component.examples.length).toBeGreaterThan(0);
  });

  it('should populate prompt when using an example', () => {
    const example = component.examples[0];
    component.useExample(example);
    expect(component.prompt()).toBe(example.prompt);
    expect(component.isPromptValid()).toBe(true);
  });

  it('should prevent form generation if prompt is too short', () => {
    component.prompt.set('hi');
    component.generateForm();
    expect(component.errorMessage()).toContain('at least 5 characters');
    expect(formGenServiceMock.generateDirect).not.toHaveBeenCalled();
  });

  it('should execute form generation when prompt is valid', () => {
    component.prompt.set('A complete customer satisfaction survey with rating scale');
    component.generateForm();

    expect(formGenServiceMock.generateDirect).toHaveBeenCalledWith({
      prompt: 'A complete customer satisfaction survey with rating scale'
    });
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

  it('should reset state on startOver', () => {
    component.prompt.set('Some prompt');
    component.generatedResult.set(mockGeneratedResult);
    component.guidedStage.set('result');

    component.startOver();

    expect(component.prompt()).toBe('');
    expect(component.generatedResult()).toBeNull();
    expect(component.guidedStage()).toBe('prompt');
  });

  it('should navigate back to forms list on cancel', () => {
    component.cancel();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/forms']);
  });
});
