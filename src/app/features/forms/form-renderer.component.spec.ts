import '@angular/compiler';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { of } from 'rxjs';
import { FormRendererComponent } from './form-renderer.component';
import { FormService } from '../../core/services/form.service';
import { AuthService } from '../../core/services/auth.service';
import { TranslationService } from '../../core/services/translation.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Injector, runInInjectionContext } from '@angular/core';

describe('FormRendererComponent', () => {
  let component: FormRendererComponent;
  let formServiceMock: any;
  let authServiceMock: any;
  let routerMock: any;
  let activatedRouteMock: any;

  beforeEach(() => {
    formServiceMock = {
      getFormById: vi.fn().mockReturnValue(of({
        form: { id: 1, title: 'Contact Us', isActive: true },
        publishedVersion: { id: 10, versionNumber: 1, status: 'Published' },
        fields: [
          { fieldKey: 'full_name', fieldType: 'text', label: 'Full Name', isRequired: true },
          { fieldKey: 'user_email', fieldType: 'email', label: 'Work Email', isRequired: true },
          { fieldKey: 'subscribe', fieldType: 'checkbox', label: 'Subscribe', isRequired: false }
        ]
      })),
      getPublicForm: vi.fn().mockReturnValue(of({
        id: 1,
        title: 'Contact Us',
        accessType: 'Public',
        shareCode: 'abc12345',
        allowedEmailsList: [],
        fields: [
          { fieldKey: 'full_name', fieldType: 'text', label: 'Full Name', isRequired: true }
        ]
      })),
      submitForm: vi.fn().mockReturnValue(of({ success: true, submissionId: 42, message: 'Submitted' })),
      submitPublicForm: vi.fn().mockReturnValue(of({ success: true, submissionId: 42, message: 'Submitted' }))
    };

    authServiceMock = {
      session: vi.fn().mockReturnValue(null),
      isAuthenticated: vi.fn().mockReturnValue(false),
      loginWithGoogle: vi.fn().mockReturnValue(of({ email: 'user@test.com', name: 'Test User' }))
    };

    routerMock = { navigate: vi.fn() };
    activatedRouteMock = {
      snapshot: {
        paramMap: {
          get: vi.fn().mockImplementation((key: string) => {
            if (key === 'id') return '1';
            return null;
          })
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

    component = runInInjectionContext(injector, () => new FormRendererComponent());
    component.ngOnInit();
  });

  it('should load published form definition and initialize data', () => {
    expect(component.isPublished()).toBe(true);
    expect(component.isTestMode()).toBe(false);
    expect(component.fields().length).toBe(3);
    expect(component.formData()['full_name']).toBe('');
  });

  it('should fail validation when required fields are blank', () => {
    const valid = component.validate();
    expect(valid).toBe(false);
    expect(component.validationErrors()['full_name']).toBe('Full Name is required.');
  });

  it('should fail validation when email format is invalid', () => {
    component.formData.set({
      full_name: 'Jane Doe',
      user_email: 'invalid-email',
      subscribe: false
    });

    const valid = component.validate();
    expect(valid).toBe(false);
    expect(component.validationErrors()['user_email']).toContain('valid email');
  });

  it('should pass validation and submit form successfully', () => {
    component.formData.set({
      full_name: 'Jane Doe',
      user_email: 'jane@example.com',
      subscribe: true
    });

    const valid = component.validate();
    expect(valid).toBe(true);
    expect(Object.keys(component.validationErrors()).length).toBe(0);

    component.onSubmit();
    expect(formServiceMock.submitForm).toHaveBeenCalledWith(
      1,
      expect.objectContaining({
        formVersionId: 10,
        responseData: expect.objectContaining({ full_name: 'Jane Doe', user_email: 'jane@example.com' })
      })
    );
    expect(component.submitted()).toBe(true);
    expect(component.submissionId()).toBe(42);
  });

  it('should support public direct submission via shareCode', () => {
    component.isPublicMode.set(true);
    component.shareCode.set('test-share-code');
    component.formData.set({
      full_name: 'Public User',
      user_email: 'public@example.com',
      subscribe: false
    });

    component.onSubmit();
    expect(formServiceMock.submitPublicForm).toHaveBeenCalledWith(
      'test-share-code',
      expect.objectContaining({
        responseDataJson: expect.any(String)
      })
    );
    expect(component.submitted()).toBe(true);
  });
});
