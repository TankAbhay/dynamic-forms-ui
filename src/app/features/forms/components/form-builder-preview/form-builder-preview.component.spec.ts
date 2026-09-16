import '@angular/compiler';
import { ComponentFixture } from '@angular/core/testing';
import { FormBuilderPreviewComponent } from './form-builder-preview.component';
import { Injector, runInInjectionContext } from '@angular/core';
import { TranslationService } from '../../../../core/services/translation.service';
import { DynamicFormField } from '../../../../core/models/form.model';
import { describe, it, expect, beforeEach } from 'vitest';

describe('FormBuilderPreviewComponent', () => {
  let component: FormBuilderPreviewComponent;
  let injector: Injector;

  beforeEach(() => {
    injector = Injector.create({
      providers: [
        { provide: TranslationService, useValue: { t: (k: string) => k, currentLang: () => 'en' } }
      ]
    });

    runInInjectionContext(injector, () => {
      component = new FormBuilderPreviewComponent();
    });
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(component.previewSubmitted()).toBe(false);
  });

  it('should return correct html input type', () => {
    expect(component.getHtmlInputType('email')).toBe('email');
    expect(component.getHtmlInputType('number')).toBe('number');
    expect(component.getHtmlInputType('unknown_custom_type')).toBe('text');
  });

  it('should handle submission and reset properly', () => {
    component.previewAnswers['field_1'] = 'test answer';
    component.onPreviewSubmit();
    expect(component.previewSubmitted()).toBe(true);

    component.resetPreview();
    expect(component.previewSubmitted()).toBe(false);
    expect(component.previewAnswers['field_1']).toBeUndefined();
  });
});
