import '@angular/compiler';
import { describe, it, expect, beforeEach } from 'vitest';
import { FormBuilderHeaderComponent } from './form-builder-header.component';
import { Injector, runInInjectionContext } from '@angular/core';
import { TranslationService } from '../../../../core/services/translation.service';

describe('FormBuilderHeaderComponent', () => {
  let component: FormBuilderHeaderComponent;

  const mockTranslationService = {
    t: (key: string) => key
  };

  beforeEach(() => {
    const injector = Injector.create({
      providers: [
        { provide: TranslationService, useValue: mockTranslationService }
      ]
    });

    component = runInInjectionContext(injector, () => new FormBuilderHeaderComponent());
  });

  it('should create header component', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle more menu state', () => {
    expect(component.showMoreMenu()).toBe(false);
    component.toggleMoreMenu();
    expect(component.showMoreMenu()).toBe(true);
    component.closeMoreMenu();
    expect(component.showMoreMenu()).toBe(false);
  });
});
