import '@angular/compiler';
import { describe, it, expect, beforeEach } from 'vitest';
import { FormBuilderInspectorComponent } from './form-builder-inspector.component';
import { Injector, runInInjectionContext } from '@angular/core';
import { TranslationService } from '../../../../core/services/translation.service';
import { DynamicFormField } from '../../../../core/models/form.model';

describe('FormBuilderInspectorComponent', () => {
  let component: FormBuilderInspectorComponent;

  const mockTranslationService = {
    t: (key: string) => key
  };

  const sampleField: DynamicFormField = {
    id: 1,
    fieldKey: 'first_name',
    fieldType: 'text',
    label: 'First Name',
    placeholder: 'Enter first name',
    helpText: 'Your legal first name',
    isRequired: true,
    defaultValue: 'John',
    options: ['Option A', 'Option B'],
    sortOrder: 1
  };

  beforeEach(() => {
    const injector = Injector.create({
      providers: [
        { provide: TranslationService, useValue: mockTranslationService }
      ]
    });

    component = runInInjectionContext(injector, () => new FormBuilderInspectorComponent());
  });

  it('should create the inspector component', () => {
    expect(component).toBeTruthy();
  });

  it('should have initial empty newOptionText signal', () => {
    expect(component.newOptionText()).toBe('');
  });

  it('should emit optionAdded when addOption is called with text', () => {
    let addedOption = '';
    component.optionAdded.subscribe(opt => addedOption = opt);
    component.newOptionText.set('Option 1');
    component.addOption();

    expect(addedOption).toBe('Option 1');
    expect(component.newOptionText()).toBe('');
  });

  it('should emit optionRemoved when removeOption is called', () => {
    let removedIndex = -1;
    component.optionRemoved.subscribe(idx => removedIndex = idx);
    component.removeOption(2);

    expect(removedIndex).toBe(2);
  });
});
