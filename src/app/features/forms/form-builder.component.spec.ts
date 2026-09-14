import '@angular/compiler';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { of } from 'rxjs';
import { FormBuilderComponent } from './form-builder.component';
import { FormService } from '../../core/services/form.service';
import { AuthService } from '../../core/services/auth.service';
import { TranslationService } from '../../core/services/translation.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Injector, runInInjectionContext } from '@angular/core';

describe('FormBuilderComponent', () => {
  let component: FormBuilderComponent;
  let formServiceMock: any;
  let authServiceMock: any;
  let routerMock: any;
  let activatedRouteMock: any;

  beforeEach(() => {
    formServiceMock = {
      getFormById: vi.fn().mockReturnValue(of({ form: { id: 1, title: 'Sample' }, fields: [] })),
      createForm: vi.fn().mockReturnValue(of({ form: { id: 2 } })),
      updateDraft: vi.fn().mockReturnValue(of({ form: { id: 1 }, version: { id: 1, rowVersionBase64: 'AQ==' } })),
      publishDraft: vi.fn().mockReturnValue(of({ form: { id: 1 }, version: { status: 'Published' } }))
    };

    authServiceMock = {
      session: vi.fn().mockReturnValue({ tenantId: 1, companyId: 1, role: 'Admin' })
    };

    routerMock = {
      navigate: vi.fn()
    };

    activatedRouteMock = {
      snapshot: {
        paramMap: {
          get: vi.fn().mockReturnValue(null)
        }
      }
    };

    const injector = Injector.create({
      providers: [
        { provide: FormService, useValue: formServiceMock },
        { provide: AuthService, useValue: authServiceMock },
        { provide: TranslationService, useClass: TranslationService },
        { provide: Router, useValue: routerMock },
        { provide: ActivatedRoute, useValue: activatedRouteMock }
      ]
    });

    component = runInInjectionContext(injector, () => new FormBuilderComponent());
    component.ngOnInit();
  });

  it('should initialize with default title and empty canvas', () => {
    expect(component.formTitle()).toBe('Untitled Custom Form');
    expect(component.fields().length).toBe(0);
    expect(component.activeTab()).toBe('builder');
  });

  it('should switch between builder and preview modes', () => {
    component.activeTab.set('preview');
    expect(component.activeTab()).toBe('preview');

    component.activeTab.set('builder');
    expect(component.activeTab()).toBe('builder');
  });

  it('should add a field to canvas and select it', () => {
    component.addComponent({ type: 'text', label: 'Text Input', icon: 'fas fa-font', description: '', defaultLabel: 'Full Name' });
    expect(component.fields().length).toBe(1);
    expect(component.fields()[0].fieldType).toBe('text');
    expect(component.selectedFieldIndex()).toBe(0);
  });

  it('should support undo and redo operations on field changes', () => {
    component.addComponent({ type: 'text', label: 'Text', icon: 'fas fa-font', description: '', defaultLabel: 'Text 1' });
    expect(component.fields().length).toBe(1);

    component.addComponent({ type: 'email', label: 'Email', icon: 'fas fa-envelope', description: '', defaultLabel: 'Email' });
    expect(component.fields().length).toBe(2);

    // Undo second field addition
    component.undo();
    expect(component.fields().length).toBe(1);

    // Redo field addition
    component.redo();
    expect(component.fields().length).toBe(2);
  });

  it('should duplicate a field in canvas', () => {
    component.addComponent({ type: 'number', label: 'Number', icon: 'fas fa-hashtag', description: '', defaultLabel: 'Age' });
    const origKey = component.fields()[0].fieldKey;
    component.duplicateField(0);

    expect(component.fields().length).toBe(2);
    expect(component.fields()[1].fieldType).toBe('number');
    expect(component.fields()[1].fieldKey).not.toBe(origKey);
  });

  it('should delete a field from canvas', () => {
    component.addComponent({ type: 'text', label: 'Text', icon: 'fas fa-font', description: '', defaultLabel: 'Name' });
    expect(component.fields().length).toBe(1);

    component.removeField(0);
    expect(component.fields().length).toBe(0);
    expect(component.selectedFieldIndex()).toBe(-1);
  });

  it('should toggle AI assistant modal and apply changes with undo support', () => {
    expect(component.showAiAssistantModal()).toBe(false);
    component.openAiAssistant();
    expect(component.showAiAssistantModal()).toBe(true);

    component.closeAiAssistant();
    expect(component.showAiAssistantModal()).toBe(false);

    // Initial state: 1 field
    component.addComponent({ type: 'text', label: 'Name', icon: 'fas fa-font', description: '', defaultLabel: 'Name' });
    expect(component.fields().length).toBe(1);

    // Apply AI changes
    component.applyAiChanges({
      fields: [
        { fieldKey: 'name', fieldType: 'text', label: 'Name', isRequired: true, sortOrder: 1 },
        { fieldKey: 'emergency_contact', fieldType: 'text', label: 'Emergency Contact', isRequired: true, sortOrder: 2 }
      ],
      summary: 'Added Emergency Contact'
    });

    expect(component.fields().length).toBe(2);
    expect(component.isNewlyAdded('emergency_contact')).toBe(true);
    expect(component.toastMessage()).toContain('AI updated form: Added Emergency Contact');

    // Undo the AI modification
    component.undo();
    expect(component.fields().length).toBe(1);
    expect(component.fields()[0].label).toBe('Name');
  });
});

