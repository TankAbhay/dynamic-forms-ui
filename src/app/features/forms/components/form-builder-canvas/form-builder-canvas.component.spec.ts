import '@angular/compiler';
import { describe, it, expect, beforeEach } from 'vitest';
import { FormBuilderCanvasComponent } from './form-builder-canvas.component';
import { Injector, runInInjectionContext } from '@angular/core';
import { TranslationService } from '../../../../core/services/translation.service';
import { DynamicFormField } from '../../../../core/models/form.model';

describe('FormBuilderCanvasComponent', () => {
  let component: FormBuilderCanvasComponent;

  const mockTranslationService = {
    t: (key: string) => key
  };

  const sampleField: DynamicFormField = {
    id: 1,
    fieldKey: 'first_name',
    fieldType: 'text',
    label: 'First Name',
    isRequired: true,
    sortOrder: 1
  };

  beforeEach(() => {
    const injector = Injector.create({
      providers: [
        { provide: TranslationService, useValue: mockTranslationService }
      ]
    });

    component = runInInjectionContext(injector, () => new FormBuilderCanvasComponent());
  });

  it('should create canvas component', () => {
    expect(component).toBeTruthy();
  });

  it('should identify newly added field key', () => {
    expect(component.isNewlyAdded('field_1')).toBe(false);
  });
});
