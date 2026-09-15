import '@angular/compiler';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { of } from 'rxjs';
import { FormsListComponent } from './forms-list.component';
import { FormService } from '../../core/services/form.service';
import { AuthService } from '../../core/services/auth.service';
import { TranslationService } from '../../core/services/translation.service';
import { Router } from '@angular/router';
import { Injector, runInInjectionContext } from '@angular/core';
import { DynamicForm } from '../../core/models/form.model';

import { ConfirmDialogService } from '../../core/services/confirm-dialog.service';

describe('FormsListComponent', () => {
  let component: FormsListComponent;
  let formServiceMock: any;
  let authServiceMock: any;
  let routerMock: any;

  const mockForms: DynamicForm[] = [
    { id: 1, createdByEmployeeId: 1, title: 'Survey A', category: 'Feedback', isActive: true, createdAt: '', updatedAt: '', fieldCount: 0, submissionCount: 5 },
    { id: 2, createdByEmployeeId: 1, title: 'Checklist B', category: 'Operations', isActive: false, createdAt: '', updatedAt: '', fieldCount: 0, submissionCount: 10 },
    { id: 3, createdByEmployeeId: 1, title: 'General Form', category: 'General', isActive: true, createdAt: '', updatedAt: '', fieldCount: 0, submissionCount: 2 }
  ];

  beforeEach(() => {
    formServiceMock = {
      getForms: vi.fn().mockReturnValue(of(mockForms)),
      deleteForm: vi.fn().mockReturnValue(of({ success: true }))
    };

    authServiceMock = {
      session: vi.fn().mockReturnValue({ id: 1, email: 'admin@dynamicforms.local', name: 'Admin', role: 'Admin', roleId: 2, token: 'fake-token' })
    };

    routerMock = {
      navigate: vi.fn()
    };

    const injector = Injector.create({
      providers: [
        { provide: FormService, useValue: formServiceMock },
        { provide: AuthService, useValue: authServiceMock },
        { provide: ConfirmDialogService, useClass: ConfirmDialogService },
        { provide: TranslationService, useClass: TranslationService },
        { provide: Router, useValue: routerMock }
      ]
    });

    component = runInInjectionContext(injector, () => new FormsListComponent());
    component.ngOnInit();
  });

  it('should load forms on initialization', () => {
    expect(component.forms().length).toBe(3);
    expect(component.loading()).toBe(false);
  });

  it('should compute categories correctly', () => {
    const categories = component.categories();
    expect(categories).toContain('All');
    expect(categories).toContain('Feedback');
    expect(categories).toContain('Operations');
    expect(categories).toContain('General');
  });

  it('should compute total submissions correctly', () => {
    expect(component.totalSubmissions()).toBe(17);
  });

  it('should compute active forms count correctly', () => {
    expect(component.activeFormsCount()).toBe(2);
  });

  it('should filter forms by category', () => {
    component.selectedCategory.set('Feedback');
    const filtered = component.filteredForms();
    expect(filtered.length).toBe(1);
    expect(filtered[0].title).toBe('Survey A');
  });

  it('should filter forms by search query', () => {
    component.searchQuery.set('checklist');
    const filtered = component.filteredForms();
    expect(filtered.length).toBe(1);
    expect(filtered[0].title).toBe('Checklist B');
  });

  it('should navigate to form builder when openCreate is called', () => {
    component.openCreate();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/forms/builder']);
  });

  it('should navigate to fill form when openFill is called', () => {
    component.openFill(1);
    expect(routerMock.navigate).toHaveBeenCalledWith(['/forms/view', 1]);
  });

  it('should navigate to form submissions when openSubmissions is called', () => {
    component.openSubmissions(1);
    expect(routerMock.navigate).toHaveBeenCalledWith(['/forms/submissions', 1]);
  });
});
