import '@angular/compiler';
import { describe, it, expect, beforeEach } from 'vitest';
import { FormBuilderPaletteComponent } from './form-builder-palette.component';
import { Injector, runInInjectionContext } from '@angular/core';
import { TranslationService } from '../../../../core/services/translation.service';
import { FormPaletteConfigItem } from '../../../../core/models/form.model';

describe('FormBuilderPaletteComponent', () => {
  let component: FormBuilderPaletteComponent;

  const mockTranslationService = {
    t: (key: string) => key
  };

  const sampleItems: FormPaletteConfigItem[] = [
    { type: 'heading', label: 'Heading', icon: 'fas fa-heading', category: 'Structure', isSystem: true, sortOrder: 1, isActive: true },
    { type: 'text', label: 'Single Line Text', icon: 'fas fa-font', category: 'Input', isSystem: true, sortOrder: 2, isActive: true }
  ];

  beforeEach(() => {
    const injector = Injector.create({
      providers: [
        { provide: TranslationService, useValue: mockTranslationService }
      ]
    });

    component = runInInjectionContext(injector, () => new FormBuilderPaletteComponent());
  });

  it('should create palette component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty search query', () => {
    expect(component.searchQuery()).toBe('');
  });
});
