import '@angular/compiler';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { of } from 'rxjs';
import { AdminFieldTypesComponent } from './admin-field-types.component';
import { FieldTypeService } from '../../core/services/field-type.service';
import { ConfirmDialogService } from '../../core/services/confirm-dialog.service';
import { Injector, runInInjectionContext } from '@angular/core';
import { FormPaletteConfigItem } from '../../core/models/form.model';

describe('AdminFieldTypesComponent', () => {
  let component: AdminFieldTypesComponent;
  let fieldTypeServiceMock: any;
  let dialogServiceMock: any;

  const mockFieldTypes: FormPaletteConfigItem[] = [
    {
      id: 1,
      type: 'text',
      label: 'Text Box',
      icon: 'fas fa-font',
      description: 'Single line',
      defaultLabel: 'Text',
      category: 'Input',
      sortOrder: 10,
      isActive: true,
      isSystem: true
    },
    {
      id: 2,
      type: 'heading',
      label: 'Section Heading',
      icon: 'fas fa-heading',
      description: 'Heading',
      defaultLabel: 'Heading',
      category: 'Structure',
      sortOrder: 1,
      isActive: true,
      isSystem: true
    },
    {
      id: 11,
      type: 'phone',
      label: 'Phone Number',
      icon: 'fas fa-phone',
      description: 'Phone',
      defaultLabel: 'Phone',
      category: 'Input',
      sortOrder: 110,
      isActive: false,
      isSystem: false
    }
  ];

  beforeEach(() => {
    fieldTypeServiceMock = {
      getAllFieldTypes: vi.fn().mockReturnValue(of(mockFieldTypes)),
      getMasterCodes: vi.fn().mockReturnValue(of([
        { code: 'text', name: 'Text Box', defaultCategory: 'Input', defaultIcon: 'fas fa-font', hasOptions: false },
        { code: 'heading', name: 'Section Heading', defaultCategory: 'Structure', defaultIcon: 'fas fa-heading', hasOptions: false },
        { code: 'phone', name: 'Phone Number', defaultCategory: 'Input', defaultIcon: 'fas fa-phone', hasOptions: false }
      ])),
      createFieldType: vi.fn().mockReturnValue(of({ id: 12, type: 'time', label: 'Time' })),
      updateFieldType: vi.fn().mockReturnValue(of({ id: 11, type: 'phone', label: 'Cell Phone' })),
      toggleActive: vi.fn().mockReturnValue(of({ id: 11, type: 'phone', isActive: true })),
      deleteFieldType: vi.fn().mockReturnValue(of({ success: true }))
    };

    dialogServiceMock = {
      alert: vi.fn(),
      danger: vi.fn().mockResolvedValue(true)
    };

    const injector = Injector.create({
      providers: [
        { provide: FieldTypeService, useValue: fieldTypeServiceMock },
        { provide: ConfirmDialogService, useValue: dialogServiceMock }
      ]
    });

    component = runInInjectionContext(injector, () => new AdminFieldTypesComponent());
    component.ngOnInit();
  });

  it('should load all field types on init', () => {
    expect(component.fieldTypes().length).toBe(3);
    expect(component.isLoading()).toBe(false);
  });

  it('should correctly compute KPIs', () => {
    expect(component.totalCount()).toBe(3);
    expect(component.activeCount()).toBe(2);
    expect(component.systemCount()).toBe(2);
    expect(component.customCount()).toBe(1);
  });

  it('should filter items by search query', () => {
    component.searchQuery.set('phone');
    expect(component.filteredItems().length).toBe(1);
    expect(component.filteredItems()[0].type).toBe('phone');

    component.searchQuery.set('');
    expect(component.filteredItems().length).toBe(3);
  });

  it('should filter items by category', () => {
    component.categoryFilter.set('Structure');
    expect(component.filteredItems().length).toBe(1);
    expect(component.filteredItems()[0].type).toBe('heading');
  });

  it('should filter items by status', () => {
    component.statusFilter.set('ACTIVE');
    expect(component.filteredItems().length).toBe(2);

    component.statusFilter.set('INACTIVE');
    expect(component.filteredItems().length).toBe(1);
    expect(component.filteredItems()[0].type).toBe('phone');
  });

  it('should open and populate edit modal', () => {
    const item = mockFieldTypes[2]; // custom phone
    component.openEditModal(item);

    expect(component.isModalOpen()).toBe(true);
    expect(component.isEditMode()).toBe(true);
    expect(component.modalFieldTypeCode()).toBe('phone');
    expect(component.modalLabel()).toBe('Phone Number');
    expect(component.editingId()).toBe(11);
  });

  it('should open create modal with defaults', () => {
    component.openCreateModal();

    expect(component.isModalOpen()).toBe(true);
    expect(component.isEditMode()).toBe(false);
    expect(component.editingId()).toBeNull();
    expect(component.modalCategory()).toBe('Input');
  });

  it('should prevent deleting system field types', () => {
    const systemItem = mockFieldTypes[0]; // text
    component.deleteFieldType(systemItem);

    expect(dialogServiceMock.alert).toHaveBeenCalledWith(
      expect.stringContaining('Protected'),
      expect.any(String)
    );
    expect(dialogServiceMock.danger).not.toHaveBeenCalled();
  });

  it('should confirm and delete custom field type', async () => {
    const customItem = mockFieldTypes[2]; // phone
    component.deleteFieldType(customItem);

    expect(dialogServiceMock.danger).toHaveBeenCalled();
  });

  it('should dynamically resolve field component based on modalFieldTypeCode', () => {
    component.modalFieldTypeCode.set('phone');
    expect(component.selectedFieldComponent().name).toBe('PhoneFieldComponent');

    component.modalFieldTypeCode.set('rating');
    expect(component.selectedFieldComponent().name).toBe('RatingFieldComponent');

    component.modalFieldTypeCode.set('dropdown');
    expect(component.selectedFieldComponent().name).toBe('DropdownFieldComponent');

    component.modalFieldTypeCode.set('select');
    expect(component.selectedFieldComponent().name).toBe('DropdownFieldComponent');

    component.modalFieldTypeCode.set('unknown_custom');
    expect(component.selectedFieldComponent().name).toBe('TextFieldComponent');
  });

  it('should correctly identify structure fields', () => {
    component.modalFieldTypeCode.set('heading');
    expect(component.isStructureField()).toBe(true);

    component.modalFieldTypeCode.set('paragraph');
    expect(component.isStructureField()).toBe(true);

    component.modalFieldTypeCode.set('text');
    expect(component.isStructureField()).toBe(false);
  });
});
