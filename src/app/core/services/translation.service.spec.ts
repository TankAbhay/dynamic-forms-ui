import { describe, it, expect, beforeEach } from 'vitest';
import { TranslationService } from './translation.service';

describe('TranslationService', () => {
  let service: TranslationService;

  beforeEach(() => {
    service = new TranslationService();
  });

  it('should initialize with default English language', () => {
    expect(service.currentLang()).toBe('en');
  });

  it('should translate known keys correctly in English', () => {
    expect(service.t('common.save')).toBe('Save');
    expect(service.t('common.delete')).toBe('Delete');
    expect(service.t('forms.builder')).toBe('Builder');
  });

  it('should switch language to Italian and translate keys', () => {
    service.setLanguage('it');
    expect(service.currentLang()).toBe('it');
    expect(service.t('common.save')).toBe('Salva');
    expect(service.t('common.delete')).toBe('Elimina');
  });

  it('should return fallback key when translation is missing', () => {
    expect(service.t('non.existent.key')).toBe('non.existent.key');
  });
});
