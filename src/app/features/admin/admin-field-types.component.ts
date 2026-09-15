import { Component, OnInit, inject, signal, computed, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FieldTypeService } from '../../core/services/field-type.service';
import { ConfirmDialogService } from '../../core/services/confirm-dialog.service';
import { FormPaletteConfigItem, CreateFieldTypePayload, UpdateFieldTypePayload } from '../../core/models/form.model';

@Component({
  selector: 'app-admin-field-types',
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './admin-field-types.component.html',
  styleUrl: './admin-field-types.component.scss'
})
export class AdminFieldTypesComponent implements OnInit {
  private readonly fieldTypeService = inject(FieldTypeService);
  private readonly dialogService = inject(ConfirmDialogService);
  private readonly destroyRef = inject(DestroyRef);

  readonly fieldTypes = signal<FormPaletteConfigItem[]>([]);
  readonly isLoading = signal<boolean>(true);
  readonly isSaving = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);

  // Search & Filter
  readonly searchQuery = signal<string>('');
  readonly categoryFilter = signal<string>('ALL');
  readonly statusFilter = signal<string>('ALL');

  // Modal State
  readonly isModalOpen = signal<boolean>(false);
  readonly isEditMode = signal<boolean>(false);
  readonly editingId = signal<number | null>(null);
  readonly modalError = signal<string | null>(null);

  // Form Fields for Modal
  modalFieldTypeCode = signal<string>('');
  modalLabel = signal<string>('');
  modalIcon = signal<string>('fas fa-font');
  modalCategory = signal<string>('Input');
  modalDescription = signal<string>('');
  modalDefaultLabel = signal<string>('');
  modalDefaultPlaceholder = signal<string>('');
  modalHasOptions = signal<boolean>(false);
  modalSortOrder = signal<number>(10);
  modalIsActive = signal<boolean>(true);

  // Common FontAwesome Icon suggestions
  readonly iconPresets = [
    { label: 'Text', value: 'fas fa-font' },
    { label: 'Align Left', value: 'fas fa-align-left' },
    { label: 'Hashtag / Number', value: 'fas fa-hashtag' },
    { label: 'Email', value: 'fas fa-envelope' },
    { label: 'Calendar', value: 'fas fa-calendar-alt' },
    { label: 'Clock / Time', value: 'fas fa-clock' },
    { label: 'Phone', value: 'fas fa-phone' },
    { label: 'Globe / URL', value: 'fas fa-globe' },
    { label: 'Check Square', value: 'fas fa-check-square' },
    { label: 'Dot Circle / Radio', value: 'fas fa-dot-circle' },
    { label: 'Dropdown', value: 'fas fa-chevron-circle-down' },
    { label: 'Heading', value: 'fas fa-heading' },
    { label: 'Paragraph', value: 'fas fa-paragraph' },
    { label: 'Star / Rating', value: 'fas fa-star' },
    { label: 'Palette / Color', value: 'fas fa-palette' },
    { label: 'Lock / Password', value: 'fas fa-lock' },
    { label: 'File / Upload', value: 'fas fa-file-arrow-up' },
    { label: 'Toggle', value: 'fas fa-toggle-on' }
  ];

  // Computed KPIs
  readonly totalCount = computed(() => this.fieldTypes().length);
  readonly activeCount = computed(() => this.fieldTypes().filter(f => f.isActive).length);
  readonly systemCount = computed(() => this.fieldTypes().filter(f => f.isSystem).length);
  readonly customCount = computed(() => this.fieldTypes().filter(f => !f.isSystem).length);

  readonly availableCategories = computed(() => {
    const set = new Set<string>();
    for (const item of this.fieldTypes()) {
      if (item.category) set.add(item.category);
    }
    return Array.from(set);
  });

  readonly filteredItems = computed(() => {
    let list = this.fieldTypes();
    const query = this.searchQuery().trim().toLowerCase();
    const cat = this.categoryFilter();
    const status = this.statusFilter();

    if (query) {
      list = list.filter(item =>
        item.type.toLowerCase().includes(query) ||
        item.label.toLowerCase().includes(query) ||
        (item.description && item.description.toLowerCase().includes(query)) ||
        (item.category && item.category.toLowerCase().includes(query))
      );
    }

    if (cat !== 'ALL') {
      list = list.filter(item => (item.category || '').toLowerCase() === cat.toLowerCase());
    }

    if (status === 'ACTIVE') {
      list = list.filter(item => item.isActive);
    } else if (status === 'INACTIVE') {
      list = list.filter(item => !item.isActive);
    }

    return list;
  });

  ngOnInit(): void {
    this.loadFieldTypes();
  }

  loadFieldTypes(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.fieldTypeService.getAllFieldTypes()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (items) => {
          this.fieldTypes.set(items || []);
          this.isLoading.set(false);
        },
        error: (err) => {
          this.isLoading.set(false);
          this.errorMessage.set(err?.error?.message || 'Failed to load field types from server.');
        }
      });
  }

  openCreateModal(): void {
    this.isEditMode.set(false);
    this.editingId.set(null);
    this.modalError.set(null);

    const nextOrder = (this.fieldTypes().length + 1) * 10;
    this.modalFieldTypeCode.set('');
    this.modalLabel.set('');
    this.modalIcon.set('fas fa-font');
    this.modalCategory.set('Input');
    this.modalDescription.set('');
    this.modalDefaultLabel.set('');
    this.modalDefaultPlaceholder.set('');
    this.modalHasOptions.set(false);
    this.modalSortOrder.set(nextOrder);
    this.modalIsActive.set(true);

    this.isModalOpen.set(true);
  }

  openEditModal(item: FormPaletteConfigItem): void {
    this.isEditMode.set(true);
    this.editingId.set(item.id || null);
    this.modalError.set(null);

    this.modalFieldTypeCode.set(item.type);
    this.modalLabel.set(item.label);
    this.modalIcon.set(item.icon);
    this.modalCategory.set(item.category || 'Input');
    this.modalDescription.set(item.description || '');
    this.modalDefaultLabel.set(item.defaultLabel || item.label);
    this.modalDefaultPlaceholder.set(item.defaultPlaceholder || '');
    this.modalHasOptions.set(!!item.hasOptions);
    this.modalSortOrder.set(item.sortOrder || 10);
    this.modalIsActive.set(item.isActive !== false);

    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
    this.modalError.set(null);
  }

  saveFieldType(): void {
    this.modalError.set(null);

    const code = this.modalFieldTypeCode().trim().toLowerCase().replace(/\s+/g, '_');
    const label = this.modalLabel().trim();
    const icon = this.modalIcon().trim() || 'fas fa-font';
    const category = this.modalCategory().trim() || 'Input';
    const desc = this.modalDescription().trim();
    const defLabel = this.modalDefaultLabel().trim() || label;
    const defPlaceholder = this.modalDefaultPlaceholder().trim();
    const hasOptions = this.modalHasOptions();
    const sortOrder = Number(this.modalSortOrder()) || 10;
    const isActive = this.modalIsActive();

    if (!code) {
      this.modalError.set('Field Type Code is required.');
      return;
    }

    if (!/^[a-z0-9_-]+$/.test(code)) {
      this.modalError.set('Field Type Code must contain only lowercase letters, numbers, hyphens, or underscores.');
      return;
    }

    if (!label) {
      this.modalError.set('Display Label is required.');
      return;
    }

    this.isSaving.set(true);

    if (this.isEditMode()) {
      const id = this.editingId();
      if (!id) return;

      const payload: UpdateFieldTypePayload = {
        label,
        icon,
        description: desc,
        defaultLabel: defLabel,
        defaultPlaceholder: defPlaceholder,
        hasOptions,
        category,
        sortOrder,
        isActive
      };

      this.fieldTypeService.updateFieldType(id, payload)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => {
            this.isSaving.set(false);
            this.closeModal();
            this.showSuccess('Field type updated successfully.');
            this.loadFieldTypes();
          },
          error: (err) => {
            this.isSaving.set(false);
            this.modalError.set(this.extractErrorMessage(err, 'Failed to update field type.'));
          }
        });
    } else {
      const payload: CreateFieldTypePayload = {
        type: code,
        fieldTypeCode: code,
        label,
        icon,
        description: desc,
        defaultLabel: defLabel,
        defaultPlaceholder: defPlaceholder,
        hasOptions,
        category,
        sortOrder,
        isActive
      };

      this.fieldTypeService.createFieldType(payload)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => {
            this.isSaving.set(false);
            this.closeModal();
            this.showSuccess('New field type added to database and palette successfully.');
            this.loadFieldTypes();
          },
          error: (err) => {
            this.isSaving.set(false);
            this.modalError.set(this.extractErrorMessage(err, 'Failed to create field type.'));
          }
        });
    }
  }

  private extractErrorMessage(err: any, defaultMsg: string): string {
    if (err?.error?.message) return err.error.message;
    if (err?.error?.errors && typeof err.error.errors === 'object') {
      const messages: string[] = [];
      for (const key of Object.keys(err.error.errors)) {
        const val = err.error.errors[key];
        if (Array.isArray(val)) {
          messages.push(...val);
        } else if (typeof val === 'string') {
          messages.push(val);
        }
      }
      if (messages.length > 0) return messages.join(' ');
    }
    if (typeof err?.error === 'string') return err.error;
    return defaultMsg;
  }

  toggleActive(item: FormPaletteConfigItem): void {
    if (!item.id) return;

    this.fieldTypeService.toggleActive(item.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res: FormPaletteConfigItem) => {
          this.showSuccess(`${item.label} is now ${res.isActive ? 'Active' : 'Inactive'}.`);
          this.fieldTypes.update(items =>
            items.map(f => f.id === item.id ? { ...f, isActive: res.isActive } : f)
          );
        },
        error: (err: any) => {
          this.errorMessage.set(err?.error?.message || 'Failed to toggle status.');
        }
      });
  }

  deleteFieldType(item: FormPaletteConfigItem): void {
    if (item.isSystem) {
      this.dialogService.alert('Protected Field Type', 'Built-in system field types cannot be deleted as they form core engine dependencies.');
      return;
    }

    if (!item.id) return;

    this.dialogService.danger(
      'Delete Custom Field Type',
      `Are you sure you want to delete "${item.label}" (${item.type})? This will permanently remove it from the form builder palette. Fields already placed in forms will keep their existing definitions.`,
      'Delete Field Type',
      'Keep It'
    ).then((confirmed: boolean) => {
      if (!confirmed) return;

      this.fieldTypeService.deleteFieldType(item.id!)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => {
            this.showSuccess(`Field type "${item.label}" deleted successfully.`);
            this.loadFieldTypes();
          },
          error: (err: any) => {
            this.errorMessage.set(err?.error?.message || 'Failed to delete field type.');
          }
        });
    });
  }

  private showSuccess(msg: string): void {
    this.successMessage.set(msg);
    setTimeout(() => {
      if (this.successMessage() === msg) {
        this.successMessage.set(null);
      }
    }, 4000);
  }
}
