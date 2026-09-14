import '@angular/compiler';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { of } from 'rxjs';
import { FormAiAssistantModalComponent } from './form-ai-assistant-modal.component';
import { FormGenerationService } from '../../create-with-ai/services/form-generation.service';
import { Injector, runInInjectionContext } from '@angular/core';

describe('FormAiAssistantModalComponent', () => {
  let component: FormAiAssistantModalComponent;
  let formGenServiceMock: any;

  beforeEach(() => {
    formGenServiceMock = {
      modifyForm: vi.fn().mockReturnValue(of({
        success: true,
        summaryOfChanges: 'Added Emergency Contact',
        fields: [
          { fieldKey: 'emergency_phone', fieldType: 'phone', label: 'Emergency Contact Phone', isRequired: true, sortOrder: 1 }
        ],
        tokensUsed: 120,
        isCached: false
      }))
    };

    const injector = Injector.create({
      providers: [
        { provide: FormGenerationService, useValue: formGenServiceMock }
      ]
    });

    component = runInInjectionContext(injector, () => new FormAiAssistantModalComponent());
  });

  it('should initialize with empty prompt and no result', () => {
    expect(component.userPrompt()).toBe('');
    expect(component.lastResult()).toBeNull();
    expect(component.loading()).toBe(false);
  });

  it('should set prompt from quick chip', () => {
    component.setPrompt('Add emergency contact');
    expect(component.userPrompt()).toBe('Add emergency contact');
  });

  it('should call modifyForm on submitModification', () => {
    component.userPrompt.set('Add emergency contact phone');
    component.submitModification();

    expect(formGenServiceMock.modifyForm).toHaveBeenCalledWith(expect.objectContaining({
      instruction: 'Add emergency contact phone'
    }));
    expect(component.lastResult()).not.toBeNull();
    expect(component.lastResult()?.summaryOfChanges).toBe('Added Emergency Contact');
  });

  it('should show error if submitting empty prompt', () => {
    component.userPrompt.set('   ');
    component.submitModification();

    expect(component.errorMessage()).toContain('Please enter instructions');
    expect(formGenServiceMock.modifyForm).not.toHaveBeenCalled();
  });

  describe('Zero-Token Deterministic Quick Suggestions', () => {
    it('should add emergency contact fields locally with 0 tokens without calling AI', () => {
      const chip = component.quickChips.find(c => c.id === 'emergency_contact')!;
      component.applyQuickSuggestion(chip);

      expect(formGenServiceMock.modifyForm).not.toHaveBeenCalled();
      const res = component.lastResult();
      expect(res).not.toBeNull();
      expect(res?.tokensUsed).toBe(0);
      expect(res?.summaryOfChanges).toContain('Added Emergency Contact');
      expect(res?.fields.some(f => f.fieldKey.includes('emergency_contact_name'))).toBe(true);
      expect(res?.fields.some(f => f.fieldKey.includes('emergency_contact_phone'))).toBe(true);
      expect(res?.fields.some(f => f.fieldKey.includes('emergency_contact_relationship'))).toBe(true);
    });

    it('should make email required locally with 0 tokens without calling AI', () => {
      const chip = component.quickChips.find(c => c.id === 'make_email_required')!;
      component.applyQuickSuggestion(chip);

      expect(formGenServiceMock.modifyForm).not.toHaveBeenCalled();
      const res = component.lastResult();
      expect(res).not.toBeNull();
      expect(res?.tokensUsed).toBe(0);
      const emailField = res?.fields.find(f => f.fieldType === 'email' || f.fieldKey.includes('email'));
      expect(emailField).toBeDefined();
      expect(emailField?.isRequired).toBe(true);
    });

    it('should add satisfaction rating locally with 0 tokens', () => {
      const chip = component.quickChips.find(c => c.id === 'satisfaction_rating')!;
      component.applyQuickSuggestion(chip);

      expect(formGenServiceMock.modifyForm).not.toHaveBeenCalled();
      const res = component.lastResult();
      expect(res?.tokensUsed).toBe(0);
      expect(res?.fields.some(f => f.fieldKey === 'overall_satisfaction')).toBe(true);
    });

    it('should add department dropdown locally with 0 tokens', () => {
      const chip = component.quickChips.find(c => c.id === 'department_dropdown')!;
      component.applyQuickSuggestion(chip);

      expect(formGenServiceMock.modifyForm).not.toHaveBeenCalled();
      const res = component.lastResult();
      expect(res?.tokensUsed).toBe(0);
      const deptField = res?.fields.find(f => f.fieldKey === 'department');
      expect(deptField).toBeDefined();
      expect(deptField?.options?.length).toBeGreaterThan(3);
    });

    it('should add feedback questions locally with 0 tokens', () => {
      const chip = component.quickChips.find(c => c.id === 'feedback_questions')!;
      component.applyQuickSuggestion(chip);

      expect(formGenServiceMock.modifyForm).not.toHaveBeenCalled();
      const res = component.lastResult();
      expect(res?.tokensUsed).toBe(0);
      expect(res?.fields.some(f => f.fieldKey === 'feedback_highlights')).toBe(true);
      expect(res?.fields.some(f => f.fieldKey === 'feedback_improvements')).toBe(true);
    });
  });
});
