import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TranslatePipe } from './translate.pipe';
import { TranslationService } from '../services/translation.service';
import { Injector, runInInjectionContext } from '@angular/core';

describe('TranslatePipe', () => {
  let pipe: TranslatePipe;
  let translationServiceMock: { t: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    translationServiceMock = {
      t: vi.fn((key: string, _params?: any, fallback?: string) => {
        if (key === 'common.save') return 'Save';
        return fallback || key;
      })
    };

    const injector = Injector.create({
      providers: [
        { provide: TranslationService, useValue: translationServiceMock }
      ]
    });

    pipe = runInInjectionContext(injector, () => new TranslatePipe());
  });

  it('should return empty string for empty key', () => {
    expect(pipe.transform('')).toBe('');
    expect(translationServiceMock.t).not.toHaveBeenCalled();
  });

  it('should translate key using translation service', () => {
    expect(pipe.transform('common.save')).toBe('Save');
    expect(translationServiceMock.t).toHaveBeenCalledWith('common.save', undefined, undefined);
  });

  it('should support string fallback argument', () => {
    expect(pipe.transform('custom.unknown', 'Fallback Text')).toBe('Fallback Text');
    expect(translationServiceMock.t).toHaveBeenCalledWith('custom.unknown', undefined, 'Fallback Text');
  });

  it('should support params object with fallback', () => {
    pipe.transform('forms.fieldAddedToast', { type: 'Email' }, 'Default text');
    expect(translationServiceMock.t).toHaveBeenCalledWith('forms.fieldAddedToast', { type: 'Email' }, 'Default text');
  });
});
