import '@angular/compiler';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { of } from 'rxjs';
import { FieldTypeService } from './field-type.service';
import { HttpClient } from '@angular/common/http';
import { Injector, runInInjectionContext } from '@angular/core';
import { CreateFieldTypePayload, UpdateFieldTypePayload } from '../models/form.model';

describe('FieldTypeService', () => {
  let service: FieldTypeService;
  let httpClientMock: any;

  beforeEach(() => {
    httpClientMock = {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn()
    };

    const injector = Injector.create({
      providers: [{ provide: HttpClient, useValue: httpClientMock }]
    });

    service = runInInjectionContext(injector, () => new FieldTypeService());
  });

  it('should fetch active palette field types and map correctly', () => {
    const mockApiItems = [
      {
        id: 1,
        fieldTypeCode: 'text',
        label: 'Text Box',
        labelKey: 'forms.palette.text',
        icon: 'fas fa-font',
        description: 'Single line text',
        descKey: 'forms.palette.textDesc',
        defaultLabel: 'Short Answer',
        defaultPlaceholder: 'Type here...',
        hasOptions: false,
        category: 'Input',
        sortOrder: 10,
        isActive: true,
        isSystem: true
      }
    ];
    httpClientMock.get.mockReturnValue(of(mockApiItems));

    service.getActivePalette().subscribe((items) => {
      expect(items.length).toBe(1);
      expect(items[0].type).toBe('text');
      expect(items[0].label).toBe('Text Box');
      expect(items[0].isSystem).toBe(true);
    });

    expect(httpClientMock.get).toHaveBeenCalledWith(expect.stringContaining('/fieldtypes'));
  });

  it('should fetch all field types for admin master page', () => {
    const mockAllItems = [
      {
        id: 1,
        fieldTypeCode: 'heading',
        label: 'Section Heading',
        icon: 'fas fa-heading',
        category: 'Structure',
        sortOrder: 1,
        isActive: true,
        isSystem: true
      },
      {
        id: 11,
        fieldTypeCode: 'rating',
        label: 'Star Rating',
        icon: 'fas fa-star',
        category: 'Input',
        sortOrder: 110,
        isActive: true,
        isSystem: false
      }
    ];
    httpClientMock.get.mockReturnValue(of(mockAllItems));

    service.getAllFieldTypes().subscribe((items) => {
      expect(items.length).toBe(2);
      expect(items[1].type).toBe('rating');
      expect(items[1].isSystem).toBe(false);
    });

    expect(httpClientMock.get).toHaveBeenCalledWith(expect.stringContaining('/fieldtypes/all'));
  });

  it('should create new field type via POST', () => {
    const payload: CreateFieldTypePayload = {
      fieldTypeCode: 'phone',
      label: 'Phone Number',
      icon: 'fas fa-phone',
      category: 'Input',
      sortOrder: 50,
      isActive: true
    };
    httpClientMock.post.mockReturnValue(of({ id: 12, ...payload }));

    service.createFieldType(payload).subscribe((res) => {
      expect(res.id).toBe(12);
      expect(res.type).toBe('phone');
    });

    expect(httpClientMock.post).toHaveBeenCalledWith(expect.stringContaining('/fieldtypes'), expect.objectContaining({ fieldTypeCode: 'phone' }));
  });

  it('should update field type via PUT', () => {
    const payload: UpdateFieldTypePayload = {
      label: 'Updated Phone',
      icon: 'fas fa-phone-volume',
      category: 'Input',
      sortOrder: 55,
      isActive: true
    };
    httpClientMock.put.mockReturnValue(of({ id: 12, fieldTypeCode: 'phone', ...payload }));

    service.updateFieldType(12, payload).subscribe((res) => {
      expect(res.label).toBe('Updated Phone');
    });

    expect(httpClientMock.put).toHaveBeenCalledWith(expect.stringContaining('/fieldtypes/12'), payload);
  });

  it('should toggle field type status via PATCH', () => {
    httpClientMock.patch.mockReturnValue(of({ id: 12, fieldTypeCode: 'phone', isActive: false }));

    service.toggleActive(12).subscribe((res) => {
      expect(res.isActive).toBe(false);
    });

    expect(httpClientMock.patch).toHaveBeenCalledWith(expect.stringContaining('/fieldtypes/12/toggle'), {});
  });

  it('should delete field type via DELETE', () => {
    httpClientMock.delete.mockReturnValue(of({ success: true, message: 'Deleted' }));

    service.deleteFieldType(12).subscribe((res) => {
      expect(res.success).toBe(true);
    });

    expect(httpClientMock.delete).toHaveBeenCalledWith(expect.stringContaining('/fieldtypes/12'));
  });
});
