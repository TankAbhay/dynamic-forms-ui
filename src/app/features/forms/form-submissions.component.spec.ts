import '@angular/compiler';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { of } from 'rxjs';
import { FormSubmissionsComponent } from './form-submissions.component';
import { FormService } from '../../core/services/form.service';
import { ActivatedRoute } from '@angular/router';
import { Injector, runInInjectionContext } from '@angular/core';
import { DynamicForm, DynamicFormField, FormSubmission, PagedResult } from '../../core/models/form.model';

describe('FormSubmissionsComponent', () => {
  let component: FormSubmissionsComponent;
  let formServiceMock: any;
  let routeMock: any;

  const mockForm: DynamicForm = {
    id: 1,
    createdByEmployeeId: 1,
    title: 'Customer Feedback',
    description: 'Monthly feedback',
    category: 'Feedback',
    isActive: true,
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
    fieldCount: 4,
    submissionCount: 2
  };

  const mockFields: DynamicFormField[] = [
    { id: 1, formId: 1, formVersionId: 1, fieldKey: 'h1', fieldType: 'heading', label: 'Section Header', sortOrder: 0, isRequired: false },
    { id: 2, formId: 1, formVersionId: 1, fieldKey: 'full_name', fieldType: 'text', label: 'Full Name', sortOrder: 1, isRequired: true },
    { id: 3, formId: 1, formVersionId: 1, fieldKey: 'rating', fieldType: 'number', label: 'Rating', sortOrder: 2, isRequired: true },
    { id: 4, formId: 1, formVersionId: 1, fieldKey: 'p1', fieldType: 'paragraph', label: 'Instruction', sortOrder: 3, isRequired: false }
  ];

  const mockSubmissions: FormSubmission[] = [
    {
      id: 101,
      formId: 1,
      submittedByEmployeeId: 10,
      submittedByName: 'Alice Smith',
      submittedByEmail: 'alice@example.com',
      responseData: { full_name: 'Alice Smith', rating: 5 },
      responseDataJson: '{"full_name":"Alice Smith","rating":5}',
      submittedAt: '2026-01-02T10:00:00Z'
    },
    {
      id: 102,
      formId: 1,
      submittedByEmployeeId: 11,
      submittedByName: 'Bob Jones',
      submittedByEmail: 'bob@example.com',
      responseData: { full_name: 'Bob Jones', rating: 4 },
      responseDataJson: '{"full_name":"Bob Jones","rating":4}',
      submittedAt: '2026-01-02T11:00:00Z'
    }
  ];

  const mockPagedSubmissions: PagedResult<FormSubmission> = {
    items: mockSubmissions,
    nextCursor: 'cursor_token_102',
    hasMore: true,
    pageSize: 25
  };

  beforeEach(() => {
    formServiceMock = {
      getFormById: vi.fn().mockReturnValue(of({ form: mockForm, fields: mockFields })),
      getSubmissionsPaged: vi.fn().mockReturnValue(of(mockPagedSubmissions)),
      exportSubmissionsCsv: vi.fn().mockReturnValue(of(new Blob(['id,name\n1,Alice'], { type: 'text/csv' })))
    };

    routeMock = {
      snapshot: {
        paramMap: {
          get: vi.fn().mockReturnValue('1')
        }
      }
    };

    const injector = Injector.create({
      providers: [
        { provide: FormService, useValue: formServiceMock },
        { provide: ActivatedRoute, useValue: routeMock }
      ]
    });

    component = runInInjectionContext(injector, () => new FormSubmissionsComponent());
    component.ngOnInit();
  });

  it('should initialize and load form, fields, and submissions', () => {
    expect(component.formId()).toBe(1);
    expect(component.form()?.title).toBe('Customer Feedback');
    expect(component.fields().length).toBe(4);
    expect(component.submissions().length).toBe(2);
    expect(component.nextCursor()).toBe('cursor_token_102');
    expect(component.hasMore()).toBe(true);
    expect(component.loading()).toBe(false);
  });

  it('should filter out non-input fields from inputFields computed signal', () => {
    const inputFields = component.inputFields();
    expect(inputFields.length).toBe(2);
    expect(inputFields.map(f => f.fieldKey)).toEqual(['full_name', 'rating']);
  });

  it('should filter submissions by submitter name or email', () => {
    component.searchQuery.set('Alice');
    let filtered = component.filteredSubmissions();
    expect(filtered.length).toBe(1);
    expect(filtered[0].submittedByName).toBe('Alice Smith');

    component.searchQuery.set('bob@example.com');
    filtered = component.filteredSubmissions();
    expect(filtered.length).toBe(1);
    expect(filtered[0].submittedByName).toBe('Bob Jones');
  });

  it('should filter submissions by response JSON content', () => {
    component.searchQuery.set('"rating":5');
    const filtered = component.filteredSubmissions();
    expect(filtered.length).toBe(1);
    expect(filtered[0].submittedByName).toBe('Alice Smith');
  });

  it('should append items and update cursor when loadMore is called', () => {
    const moreItems: FormSubmission[] = [
      {
        id: 103,
        formId: 1,
        submittedByEmployeeId: 12,
        submittedByName: 'Charlie Brown',
        submittedByEmail: 'charlie@example.com',
        responseData: { full_name: 'Charlie Brown', rating: 3 },
        responseDataJson: '{"full_name":"Charlie Brown","rating":3}',
        submittedAt: '2026-01-02T12:00:00Z'
      }
    ];

    formServiceMock.getSubmissionsPaged.mockReturnValue(of({
      items: moreItems,
      nextCursor: null,
      hasMore: false,
      pageSize: 25
    }));

    component.loadMore();

    expect(formServiceMock.getSubmissionsPaged).toHaveBeenCalledWith(1, 25, 'cursor_token_102');
    expect(component.submissions().length).toBe(3);
    expect(component.hasMore()).toBe(false);
    expect(component.nextCursor()).toBeNull();
  });

  it('should open and close submission details modal', () => {
    component.viewDetails(mockSubmissions[0]);
    expect(component.selectedSubmission()).toEqual(mockSubmissions[0]);

    component.closeDetails();
    expect(component.selectedSubmission()).toBeNull();
  });

  it('should correctly format answers in getAnswer', () => {
    expect(component.getAnswer(mockSubmissions[0], 'full_name')).toBe('Alice Smith');
    expect(component.getAnswer(mockSubmissions[0], 'rating')).toBe('5');
    expect(component.getAnswer(mockSubmissions[0], 'missing_field')).toBe('-');
  });

  it('should trigger CSV export', () => {
    const createObjectURLMock = vi.fn().mockReturnValue('blob:mock-url');
    const revokeObjectURLMock = vi.fn();
    const clickMock = vi.fn();

    (globalThis as any).window = {
      URL: {
        createObjectURL: createObjectURLMock,
        revokeObjectURL: revokeObjectURLMock
      }
    };
    (globalThis as any).document = {
      createElement: vi.fn().mockReturnValue({
        click: clickMock,
        href: '',
        download: ''
      }),
      body: {
        appendChild: vi.fn(),
        removeChild: vi.fn()
      }
    };

    component.exportCsv();

    expect(formServiceMock.exportSubmissionsCsv).toHaveBeenCalledWith(1);
    expect(component.exportingCsv()).toBe(false);
    expect(clickMock).toHaveBeenCalled();
  });
});
