import { Component, OnInit, inject, signal, computed, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormService } from '../../core/services/form.service';
import { FormVersionService } from '../../core/services/form-version.service';
import { PublicFormService } from '../../core/services/public-form.service';
import { AuthService } from '../../core/services/auth.service';
import { ConfirmDialogService } from '../../core/services/confirm-dialog.service';
import { TranslationService } from '../../core/services/translation.service';
import { TranslatePipe } from '../../core/pipes/translate.pipe';
import { FORM_PALETTE_CONFIG, FormPaletteConfigItem } from './config/form-palette.config';
import { PREBUILT_FORM_TEMPLATES, FormTemplate } from './config/form-templates.config';
import { FormTemplatesModalComponent } from './components/form-templates-modal/form-templates-modal.component';
import { FormShareModalComponent, FormSharingConfig } from './components/form-share-modal/form-share-modal.component';
import { FormAiAssistantModalComponent } from './components/form-ai-assistant-modal/form-ai-assistant-modal.component';
import { 
  DynamicFormField, 
  FieldType, 
  ComponentPaletteItem, 
  CreateFormPayload, 
  UpdateFormPayload,
  UpdateDraftPayload,
  DynamicFormVersion,
  DynamicFormVersionDetail,
  FormResponseData
} from '../../core/models/form.model';

export interface FormBuilderSnapshot {
  title: string;
  description: string;
  category: string;
  isActive: boolean;
  fields: DynamicFormField[];
  selectedFieldIndex: number;
}

@Component({
  selector: 'app-form-builder',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TranslatePipe, FormTemplatesModalComponent, FormShareModalComponent, FormAiAssistantModalComponent],
  templateUrl: './form-builder.component.html',
  styleUrls: ['./form-builder.component.scss']
})
export class FormBuilderComponent implements OnInit {
  private readonly formService = inject(FormService);
  private readonly versionService = inject(FormVersionService, { optional: true }) ?? this.formService;
  private readonly publicFormService = inject(PublicFormService, { optional: true }) ?? this.formService;
  private readonly authService = inject(AuthService);
  private readonly dialogService = inject(ConfirmDialogService);
  readonly i18n = inject(TranslationService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  // Form Metadata
  formId = signal<number | null>(null);
  formTitle = signal<string>('Untitled Custom Form');
  formDescription = signal<string>('');
  formCategory = signal<string>('General');
  formIsActive = signal<boolean>(true);

  // Dynamic Form Versioning (Revision 6)
  currentVersion = signal<DynamicFormVersion | null>(null);
  formVersionId = computed(() => this.currentVersion()?.id ?? null);
  versionNumber = computed(() => this.currentVersion()?.versionNumber ?? 1);
  versionStatus = computed(() => this.currentVersion()?.status ?? 'Draft');
  isReadOnlyVersion = computed(() => this.versionStatus() === 'Published' || this.versionStatus() === 'Archived');
  rowVersionBase64 = signal<string>('');
  hasPublishedVersion = signal<boolean>(false);
  publishing = signal<boolean>(false);
  discarding = signal<boolean>(false);
  duplicating = signal<boolean>(false);

  // Dynamic Fields Canvas
  fields = signal<DynamicFormField[]>([]);
  selectedFieldIndex = signal<number>(-1);
  newlyAddedFieldKeys = signal<Set<string>>(new Set<string>());

  isNewlyAdded(fieldKey: string): boolean {
    return this.newlyAddedFieldKeys().has(fieldKey);
  }

  // Drag and Drop State
  draggedFieldIndex = signal<number | null>(null);
  draggedPaletteItem = signal<ComponentPaletteItem | null>(null);
  dragOverIndex = signal<number | null>(null);
  dragOverPosition = signal<'top' | 'bottom' | null>(null);
  isCanvasDragOver = signal<boolean>(false);
  readonly isDragging = computed(() => this.draggedFieldIndex() !== null || this.draggedPaletteItem() !== null);

  // Undo / Redo & Change Tracking
  undoStack = signal<FormBuilderSnapshot[]>([]);
  redoStack = signal<FormBuilderSnapshot[]>([]);
  initialSnapshot = signal<string>('');
  toastMessage = signal<string>('');
  private toastTimer: ReturnType<typeof setTimeout> | null = null;

  readonly hasUnsavedChanges = computed(() => {
    const init = this.initialSnapshot();
    if (!init) return false;
    return this.getCurrentSerializedState() !== init;
  });

  // Mode: 'builder' or 'preview'
  activeTab = signal<'builder' | 'preview'>('builder');

  // Mobile/Tablet responsive panel switcher ('palette' | 'canvas' | 'inspector')
  activeMobilePanel = signal<'palette' | 'canvas' | 'inspector'>('canvas');

  // Preview form answers state
  previewAnswers: FormResponseData = {};
  previewSubmitted = signal<boolean>(false);

  loading = signal<boolean>(false);
  saving = signal<boolean>(false);
  errorMessage = signal<string>('');
  successMessage = signal<string>('');

  // New option buffer for options editor
  newOptionText = signal<string>('');

  // Pre-built Starter Templates
  readonly templates: FormTemplate[] = PREBUILT_FORM_TEMPLATES;
  showTemplatesModal = signal<boolean>(false);

  // AI Assistant Modal
  showAiAssistantModal = signal<boolean>(false);

  // Top Bar Overflow Action Menu
  readonly showMoreMenu = signal<boolean>(false);

  toggleMoreMenu(): void {
    this.showMoreMenu.update(v => !v);
  }

  closeMoreMenu(): void {
    this.showMoreMenu.set(false);
  }

  // Sharing & Direct Access Control
  accessType = signal<'Public' | 'Restricted' | 'Private'>('Public');
  shareCode = signal<string>('');
  allowedEmails = signal<string>('');
  collaboratorEmails = signal<string>('');
  showShareModal = signal<boolean>(false);
  savingSharing = signal<boolean>(false);
  copiedLink = signal<boolean>(false);

  readonly publicShareUrl = computed(() => {
    const code = this.shareCode() || (this.formId() ? this.formId()!.toString() : '');
    if (!code) return '';
    if (typeof document !== 'undefined' && document.baseURI) {
      const base = document.baseURI.replace(/\/$/, '');
      return `${base}/p/${code}`;
    }
    if (typeof window !== 'undefined' && window.location) {
      return `${window.location.origin}/p/${code}`;
    }
    return `/p/${code}`;
  });

  // Component Palette (Decoupled configuration from logic)
  readonly paletteItems: FormPaletteConfigItem[] = FORM_PALETTE_CONFIG;

  readonly selectedField = computed(() => {
    const idx = this.selectedFieldIndex();
    const list = this.fields();
    return idx >= 0 && idx < list.length ? list[idx] : null;
  });

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const id = parseInt(idParam, 10);
      if (!isNaN(id)) {
        this.formId.set(id);
        this.loadExistingForm(id);
        return;
      }
    }

    const aiForm = typeof window !== 'undefined' && window.history ? window.history.state?.aiGeneratedForm : null;
    if (aiForm && Array.isArray(aiForm.fields)) {
      this.formTitle.set(aiForm.title || 'Untitled Form');
      this.formDescription.set(aiForm.description || '');
      this.formCategory.set(aiForm.category || 'General');
      this.fields.set(JSON.parse(JSON.stringify(aiForm.fields)));
      this.selectedFieldIndex.set(aiForm.fields.length > 0 ? 0 : -1);
      this.initialSnapshot.set(this.getCurrentSerializedState());
      this.showToast('AI-generated form loaded as a new draft! Review and save when ready.');
      return;
    }

    // Brand new form initial snapshot
    this.initialSnapshot.set(this.getCurrentSerializedState());
  }

  getCurrentSerializedState(): string {
    return JSON.stringify({
      title: this.formTitle().trim(),
      description: this.formDescription().trim(),
      category: this.formCategory().trim(),
      isActive: this.formIsActive(),
      fields: this.fields().map(f => ({
        fieldType: f.fieldType,
        label: f.label,
        placeholder: f.placeholder,
        helpText: f.helpText,
        isRequired: f.isRequired,
        options: f.options,
        sortOrder: f.sortOrder
      }))
    });
  }

  showToast(msg: string): void {
    this.toastMessage.set(msg);
    if (this.toastTimer) {
      clearTimeout(this.toastTimer);
    }
    this.toastTimer = setTimeout(() => {
      this.toastMessage.set('');
    }, 3200);
  }

  scrollToField(index: number): void {
    setTimeout(() => {
      const el = document.getElementById(`field-card-${index}`);
      const canvas = document.querySelector('.canvas-area') as HTMLElement;
      if (el && canvas) {
        const canvasRect = canvas.getBoundingClientRect();
        const elRect = el.getBoundingClientRect();
        const scrollOffset = elRect.top - canvasRect.top + canvas.scrollTop - 24;
        canvas.scrollTo({ top: Math.max(0, scrollOffset), behavior: 'smooth' });
      } else if (canvas) {
        canvas.scrollTo({ top: canvas.scrollHeight, behavior: 'smooth' });
      }
    }, 80);
  }

  private recordSnapshot(): void {
    const snap: FormBuilderSnapshot = {
      title: this.formTitle(),
      description: this.formDescription(),
      category: this.formCategory(),
      isActive: this.formIsActive(),
      fields: JSON.parse(JSON.stringify(this.fields())),
      selectedFieldIndex: this.selectedFieldIndex()
    };
    this.undoStack.update(stack => {
      const next = [...stack, snap];
      return next.length > 30 ? next.slice(next.length - 30) : next;
    });
    this.redoStack.set([]);
  }

  undo(): void {
    const stack = this.undoStack();
    if (stack.length === 0) return;

    const currentSnap: FormBuilderSnapshot = {
      title: this.formTitle(),
      description: this.formDescription(),
      category: this.formCategory(),
      isActive: this.formIsActive(),
      fields: JSON.parse(JSON.stringify(this.fields())),
      selectedFieldIndex: this.selectedFieldIndex()
    };
    this.redoStack.update(r => [...r, currentSnap]);

    const prev = stack[stack.length - 1];
    this.undoStack.set(stack.slice(0, stack.length - 1));

    this.formTitle.set(prev.title);
    this.formDescription.set(prev.description);
    this.formCategory.set(prev.category);
    this.formIsActive.set(prev.isActive);
    this.fields.set(JSON.parse(JSON.stringify(prev.fields)));
    this.selectedFieldIndex.set(prev.selectedFieldIndex);

    this.showToast('Action undone (Ctrl+Z)');
  }

  redo(): void {
    const stack = this.redoStack();
    if (stack.length === 0) return;

    const currentSnap: FormBuilderSnapshot = {
      title: this.formTitle(),
      description: this.formDescription(),
      category: this.formCategory(),
      isActive: this.formIsActive(),
      fields: JSON.parse(JSON.stringify(this.fields())),
      selectedFieldIndex: this.selectedFieldIndex()
    };
    this.undoStack.update(u => [...u, currentSnap]);

    const next = stack[stack.length - 1];
    this.redoStack.set(stack.slice(0, stack.length - 1));

    this.formTitle.set(next.title);
    this.formDescription.set(next.description);
    this.formCategory.set(next.category);
    this.formIsActive.set(next.isActive);
    this.fields.set(JSON.parse(JSON.stringify(next.fields)));
    this.selectedFieldIndex.set(next.selectedFieldIndex);

    this.showToast('Action redone (Ctrl+Y)');
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyShortcuts(event: KeyboardEvent): void {
    if (event.ctrlKey || event.metaKey) {
      if (event.key.toLowerCase() === 'z' && !event.shiftKey) {
        event.preventDefault();
        this.undo();
      } else if (event.key.toLowerCase() === 'y' || (event.key.toLowerCase() === 'z' && event.shiftKey)) {
        event.preventDefault();
        this.redo();
      } else if (event.key.toLowerCase() === 's') {
        event.preventDefault();
        this.saveForm();
      }
    }
  }

  loadExistingForm(id: number): void {
    this.loading.set(true);
    this.errorMessage.set('');
    this.formService.getFormById(id).subscribe({
      next: (detail) => {
        this.formTitle.set(detail.form.title);
        this.formDescription.set(detail.form.description || '');
        this.formCategory.set(detail.form.category || 'General');
        this.formIsActive.set(detail.form.isActive);
        this.accessType.set(detail.form.accessType || 'Public');
        this.shareCode.set(detail.form.shareCode || '');
        this.allowedEmails.set(detail.form.allowedEmails || '');
        this.collaboratorEmails.set(detail.form.collaboratorEmails || '');
        this.hasPublishedVersion.set(!!detail.publishedVersion);

        // If an active draft exists, load the draft version for editing
        if (detail.draftVersion) {
          this.currentVersion.set(detail.draftVersion);
          this.rowVersionBase64.set(detail.draftVersion.rowVersionBase64 || '');
          this.fields.set(detail.fields || []);
        } else if (detail.publishedVersion) {
          // No draft exists, load the published version (read-only)
          this.currentVersion.set(detail.publishedVersion);
          this.rowVersionBase64.set(detail.publishedVersion.rowVersionBase64 || '');
          this.fields.set(detail.fields || []);
        } else {
          this.fields.set(detail.fields || []);
        }

        if (this.fields().length > 0) {
          this.selectedFieldIndex.set(0);
        }
        this.initialSnapshot.set(this.getCurrentSerializedState());
        this.undoStack.set([]);
        this.redoStack.set([]);
        this.loading.set(false);
      },
      error: (err) => {
        this.errorMessage.set(err?.error?.message || 'Failed to load form.');
        this.loading.set(false);
      }
    });
  }

  // ── Palette Add Action ───────────────────────────────────────────────
  addComponent(item: ComponentPaletteItem): void {
    if (this.isReadOnlyVersion()) {
      this.showToast('Published versions are read-only. Click "Edit as New Draft" to make changes.');
      return;
    }
    this.recordSnapshot();
    const count = this.fields().length + 1;
    const newField: DynamicFormField = {
      fieldKey: `field_${Date.now()}_${count}`,
      fieldType: item.type,
      label: item.defaultLabel,
      placeholder: item.defaultPlaceholder || '',
      helpText: '',
      isRequired: item.type !== 'heading' && item.type !== 'paragraph',
      options: item.hasOptions ? ['Option 1', 'Option 2', 'Option 3'] : [],
      sortOrder: count
    };

    const newIndex = this.fields().length;
    const current = [...this.fields(), newField];
    this.fields.set(current);
    this.selectedFieldIndex.set(newIndex);
    this.newlyAddedFieldKeys.update(keys => new Set(keys).add(newField.fieldKey));

    this.scrollToField(newIndex);
    const labelToDisplay = 'labelKey' in item && item.labelKey ? this.i18n.t(item.labelKey as string) : item.label;
    this.showToast(this.i18n.t('forms.fieldAddedToast', { type: labelToDisplay }));

    if (typeof window !== 'undefined' && window.innerWidth <= 1200) {
      this.activeMobilePanel.set('canvas');
    }
  }

  // ── Drag & Drop: Palette Items ───────────────────────────────────────
  onPaletteDragStart(event: DragEvent, item: ComponentPaletteItem): void {
    this.draggedPaletteItem.set(item);
    this.draggedFieldIndex.set(null);
    if (event.dataTransfer) {
      event.dataTransfer.setData('text/plain', JSON.stringify({ source: 'palette', type: item.type }));
      event.dataTransfer.effectAllowed = 'copy';
    }
  }

  onPaletteDragEnd(): void {
    this.draggedPaletteItem.set(null);
    this.dragOverIndex.set(null);
    this.dragOverPosition.set(null);
    this.isCanvasDragOver.set(false);
  }

  // ── Drag & Drop: Canvas Fields Reordering ────────────────────────────
  onFieldDragStart(index: number, event: DragEvent): void {
    this.draggedFieldIndex.set(index);
    this.draggedPaletteItem.set(null);
    if (event.dataTransfer) {
      event.dataTransfer.setData('text/plain', JSON.stringify({ source: 'field', index }));
      event.dataTransfer.effectAllowed = 'move';
    }
  }

  // ── Drag & Drop Scrolling Mechanics (Mirroring Hierarchy Page) ────────
  scrollContainers(deltaY: number): void {
    const canvas = document.querySelector('.canvas-area') as HTMLElement;
    if (canvas && canvas.scrollHeight > canvas.clientHeight) {
      canvas.scrollBy({ top: deltaY, behavior: 'auto' });
    }
    const content = document.querySelector('.content-wrapper') as HTMLElement;
    if (content && content.scrollHeight > content.clientHeight) {
      content.scrollBy({ top: deltaY, behavior: 'auto' });
    }
    window.scrollBy({ top: deltaY, behavior: 'auto' });
  }

  onWheelScroll(event: WheelEvent): void {
    if (this.isDragging()) {
      this.scrollContainers(event.deltaY);
    }
  }

  onGlobalDragOver(event: DragEvent): void {
    if (!this.isDragging()) return;

    const clientY = event.clientY;
    const windowHeight = window.innerHeight;
    const scrollZone = 180;

    if (clientY < scrollZone) {
      const speed = Math.max(25, Math.floor((scrollZone - clientY) / 2));
      this.scrollContainers(-speed);
    } else if (clientY > windowHeight - scrollZone) {
      const speed = Math.max(25, Math.floor((clientY - (windowHeight - scrollZone)) / 2));
      this.scrollContainers(speed);
    }
  }

  onFieldDragOver(index: number, event: DragEvent): void {
    this.onGlobalDragOver(event);
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = this.draggedPaletteItem() ? 'copy' : 'move';
    }

    const targetElement = (event.currentTarget || event.target) as HTMLElement;
    const rect = targetElement.getBoundingClientRect();
    const midY = rect.top + rect.height / 2;
    const pos = event.clientY < midY ? 'top' : 'bottom';

    this.dragOverIndex.set(index);
    this.dragOverPosition.set(pos);
  }

  onFieldDragLeave(index: number, event: DragEvent): void {
    const related = event.relatedTarget as HTMLElement;
    const current = event.currentTarget as HTMLElement;
    if (!current || !current.contains(related)) {
      if (this.dragOverIndex() === index) {
        this.dragOverIndex.set(null);
        this.dragOverPosition.set(null);
      }
    }
  }

  onFieldDrop(targetIndex: number, event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();

    const pos = this.dragOverPosition() || 'bottom';
    const paletteItem = this.draggedPaletteItem();
    const sourceIdx = this.draggedFieldIndex();

    if (paletteItem) {
      const insertAt = pos === 'top' ? targetIndex : targetIndex + 1;
      this.insertPaletteComponentAt(paletteItem, insertAt);
    } else if (sourceIdx !== null && sourceIdx !== undefined && sourceIdx !== targetIndex) {
      this.reorderField(sourceIdx, targetIndex, pos);
    }

    this.onFieldDragEnd();
  }

  onFieldDragEnd(): void {
    this.draggedFieldIndex.set(null);
    this.draggedPaletteItem.set(null);
    this.dragOverIndex.set(null);
    this.dragOverPosition.set(null);
    this.isCanvasDragOver.set(false);
  }

  onCanvasContainerDragOver(event: DragEvent): void {
    this.onGlobalDragOver(event);
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = this.draggedPaletteItem() ? 'copy' : 'move';
    }
    this.isCanvasDragOver.set(true);
  }

  onCanvasContainerDragLeave(event: DragEvent): void {
    const related = event.relatedTarget as HTMLElement;
    const current = event.currentTarget as HTMLElement;
    if (!current || !current.contains(related)) {
      this.isCanvasDragOver.set(false);
    }
  }

  onCanvasContainerDrop(event: DragEvent): void {
    event.preventDefault();
    const paletteItem = this.draggedPaletteItem();
    if (paletteItem) {
      this.addComponent(paletteItem);
    }
    this.onFieldDragEnd();
  }

  private reorderField(fromIndex: number, toIndex: number, pos: 'top' | 'bottom'): void {
    this.recordSnapshot();
    const list = [...this.fields()];
    const [moved] = list.splice(fromIndex, 1);
    
    let destIndex = toIndex;
    if (fromIndex < toIndex) {
      destIndex = pos === 'top' ? toIndex - 1 : toIndex;
    } else {
      destIndex = pos === 'top' ? toIndex : toIndex + 1;
    }
    if (destIndex < 0) destIndex = 0;
    if (destIndex > list.length) destIndex = list.length;

    list.splice(destIndex, 0, moved);
    list.forEach((f, i) => f.sortOrder = i + 1);
    this.fields.set(list);
    this.selectedFieldIndex.set(destIndex);
    this.showToast(`Reordered "${moved.label}" to position #${destIndex + 1}`);
  }

  private insertPaletteComponentAt(item: ComponentPaletteItem, atIndex: number): void {
    this.recordSnapshot();
    const count = this.fields().length + 1;
    const newField: DynamicFormField = {
      fieldKey: `field_${Date.now()}_${count}`,
      fieldType: item.type,
      label: item.defaultLabel,
      placeholder: item.defaultPlaceholder || '',
      helpText: '',
      isRequired: item.type !== 'heading' && item.type !== 'paragraph',
      options: item.hasOptions ? ['Option 1', 'Option 2', 'Option 3'] : [],
      sortOrder: atIndex + 1
    };

    const list = [...this.fields()];
    const insertPos = Math.max(0, Math.min(atIndex, list.length));
    list.splice(insertPos, 0, newField);
    list.forEach((f, i) => f.sortOrder = i + 1);
    this.fields.set(list);
    this.selectedFieldIndex.set(insertPos);
    this.newlyAddedFieldKeys.update(keys => new Set(keys).add(newField.fieldKey));

    this.scrollToField(insertPos);
    const labelToDisplay = 'labelKey' in item && item.labelKey ? this.i18n.t(item.labelKey as string) : item.label;
    this.showToast(this.i18n.t('forms.fieldAddedToast', { type: labelToDisplay }));
  }

  selectField(index: number): void {
    this.selectedFieldIndex.set(index);
    if (typeof window !== 'undefined' && window.innerWidth <= 1200) {
      this.activeMobilePanel.set('inspector');
    } else {
      const inspector = document.querySelector('.inspector-sidebar') as HTMLElement;
      if (inspector) {
        inspector.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }

  removeField(index: number, event?: Event): void {
    if (event) event.stopPropagation();
    if (this.isReadOnlyVersion()) {
      this.showToast('Published version is read-only. Click "Edit as New Draft" to make changes.');
      return;
    }
    const removed = this.fields()[index];
    this.recordSnapshot();
    if (removed?.fieldKey) {
      this.newlyAddedFieldKeys.update(keys => {
        const next = new Set(keys);
        next.delete(removed.fieldKey);
        return next;
      });
    }
    const updated = this.fields().filter((_, i) => i !== index);
    updated.forEach((f, i) => f.sortOrder = i + 1);
    this.fields.set(updated);

    if (this.selectedFieldIndex() >= updated.length) {
      this.selectedFieldIndex.set(updated.length - 1);
    }
    this.showToast(`Removed "${removed?.label || 'Field'}" (Undo available)`);
  }

  toggleFieldRequired(index: number, event?: Event): void {
    if (event) event.stopPropagation();
    if (this.isReadOnlyVersion()) return;
    const list = [...this.fields()];
    if (index >= 0 && index < list.length) {
      this.recordSnapshot();
      const nextRequired = !list[index].isRequired;
      list[index] = {
        ...list[index],
        isRequired: nextRequired
      };
      this.fields.set(list);
      this.showToast(`"${list[index].label}" set to ${nextRequired ? 'Mandatory' : 'Optional'}`);
    }
  }

  duplicateField(index: number, event?: Event): void {
    if (event) event.stopPropagation();
    if (this.isReadOnlyVersion()) return;
    const list = [...this.fields()];
    if (index >= 0 && index < list.length) {
      this.recordSnapshot();
      const source = list[index];
      const count = list.length + 1;
      const clone: DynamicFormField = {
        ...source,
        fieldKey: `field_${Date.now()}_${count}`,
        label: `${source.label} (Copy)`,
        options: source.options ? [...source.options] : [],
        sortOrder: count
      };
      list.splice(index + 1, 0, clone);
      list.forEach((f, i) => f.sortOrder = i + 1);
      this.fields.set(list);
      this.selectedFieldIndex.set(index + 1);
      this.newlyAddedFieldKeys.update(keys => new Set(keys).add(clone.fieldKey));
      this.scrollToField(index + 1);
      this.showToast(`Duplicated "${source.label}"`);
    }
  }

  moveUp(index: number, event?: Event): void {
    if (event) event.stopPropagation();
    if (index <= 0) return;
    this.recordSnapshot();
    const list = [...this.fields()];
    const temp = list[index];
    list[index] = list[index - 1];
    list[index - 1] = temp;
    list.forEach((f, i) => f.sortOrder = i + 1);
    this.fields.set(list);
    this.selectedFieldIndex.set(index - 1);
    this.scrollToField(index - 1);
  }

  moveDown(index: number, event?: Event): void {
    if (event) event.stopPropagation();
    if (index >= this.fields().length - 1) return;
    this.recordSnapshot();
    const list = [...this.fields()];
    const temp = list[index];
    list[index] = list[index + 1];
    list[index + 1] = temp;
    list.forEach((f, i) => f.sortOrder = i + 1);
    this.fields.set(list);
    this.selectedFieldIndex.set(index + 1);
    this.scrollToField(index + 1);
  }

  // ── Options Management ───────────────────────────────────────────────
  addOption(): void {
    const opt = this.newOptionText().trim();
    const field = this.selectedField();
    if (!opt || !field) return;

    if (!field.options) field.options = [];
    field.options.push(opt);
    this.newOptionText.set('');
  }

  removeOption(optIndex: number): void {
    const field = this.selectedField();
    if (field && field.options) {
      field.options.splice(optIndex, 1);
    }
  }

  // ── Save Form ────────────────────────────────────────────────────────
  saveForm(): void {
    if (this.isReadOnlyVersion()) {
      this.errorMessage.set('Cannot save changes: This version is Published (Read-Only). Click "Edit as New Draft" to create an editable draft.');
      this.showToast('Published versions are read-only');
      return;
    }

    if (!this.formTitle().trim()) {
      this.errorMessage.set('Form Title is required.');
      return;
    }

    if (this.fields().length === 0) {
      this.errorMessage.set('Please add at least one field or element to the form.');
      return;
    }

    this.saving.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    const fieldsPayload = this.fields().map((f, i) => ({
      ...f,
      sortOrder: i + 1
    }));

    const id = this.formId();
    const versionId = this.formVersionId();

    if (id && versionId && this.versionStatus() === 'Draft') {
      // Update existing draft with optimistic concurrency check
      const payload: UpdateDraftPayload = {
        title: this.formTitle().trim(),
        description: this.formDescription().trim(),
        category: this.formCategory().trim() || 'General',
        expectedRowVersion: this.rowVersionBase64(),
        fields: fieldsPayload
      };

      this.formService.updateDraft(id, versionId, payload).subscribe({
        next: (res) => {
          this.saving.set(false);
          this.currentVersion.set(res.version);
          this.rowVersionBase64.set(res.version.rowVersionBase64 || '');
          this.newlyAddedFieldKeys.set(new Set());
          this.initialSnapshot.set(this.getCurrentSerializedState());
          this.undoStack.set([]);
          this.redoStack.set([]);
          this.successMessage.set('Draft saved successfully!');
          this.showToast('Draft saved successfully!');
        },
        error: (err) => {
          this.saving.set(false);
          if (err?.status === 409) {
            this.errorMessage.set('Concurrency Conflict (409): This form draft was modified by another session or user. Your changes are preserved in the editor, but were NOT saved to the database. Please review differences or reload before saving again.');
            this.showToast('Concurrency conflict (409): Changes not saved');
          } else {
            this.errorMessage.set(err?.error?.message || 'Failed to update draft.');
          }
        }
      });
    } else if (id) {
      // Fallback update
      const payload: UpdateFormPayload = {
        title: this.formTitle().trim(),
        description: this.formDescription().trim(),
        category: this.formCategory().trim() || 'General',
        isActive: this.formIsActive(),
        fields: fieldsPayload
      };
      this.formService.updateForm(id, payload).subscribe({
        next: (detail) => {
          this.saving.set(false);
          if (detail?.draftVersion) {
            this.currentVersion.set(detail.draftVersion);
            this.rowVersionBase64.set(detail.draftVersion.rowVersionBase64 || '');
          } else if (detail?.publishedVersion) {
            this.currentVersion.set(detail.publishedVersion);
            this.rowVersionBase64.set(detail.publishedVersion.rowVersionBase64 || '');
          }
          if (detail?.fields) {
            this.fields.set(detail.fields);
          }
          this.newlyAddedFieldKeys.set(new Set());
          this.initialSnapshot.set(this.getCurrentSerializedState());
          this.undoStack.set([]);
          this.redoStack.set([]);
          this.successMessage.set('Form updated successfully!');
          this.showToast('Form updated successfully!');
        },
        error: (err) => {
          this.saving.set(false);
          this.errorMessage.set(err?.error?.message || 'Failed to update form.');
        }
      });
    } else {
      // Create brand new form
      const payload: CreateFormPayload = {
        title: this.formTitle().trim(),
        description: this.formDescription().trim(),
        category: this.formCategory().trim() || 'General',
        isActive: this.formIsActive(),
        fields: fieldsPayload
      };
      this.formService.createForm(payload).subscribe({
        next: (res) => {
          this.saving.set(false);
          this.formId.set(res.form.id);
          if (res.draftVersion) {
            this.currentVersion.set(res.draftVersion);
            this.rowVersionBase64.set(res.draftVersion.rowVersionBase64 || '');
          }
          this.newlyAddedFieldKeys.set(new Set());
          this.initialSnapshot.set(this.getCurrentSerializedState());
          this.undoStack.set([]);
          this.redoStack.set([]);
          this.successMessage.set('Form created successfully!');
          this.showToast('Form created successfully!');
          this.router.navigate(['/forms/builder', res.form.id]);
        },
        error: (err) => {
          this.saving.set(false);
          this.errorMessage.set(err?.error?.message || 'Failed to create form.');
        }
      });
    }
  }

  // ── Versioning Lifecycle Actions ─────────────────────────────────────
  publishForm(): void {
    const id = this.formId();
    const versionId = this.formVersionId();
    if (!id || !versionId) return;

    this.publishing.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.formService.publishDraft(id, versionId, { expectedRowVersion: this.rowVersionBase64() }).subscribe({
      next: (res) => {
        this.publishing.set(false);
        this.currentVersion.set(res.version);
        this.rowVersionBase64.set(res.version.rowVersionBase64 || '');
        this.hasPublishedVersion.set(true);
        this.initialSnapshot.set(this.getCurrentSerializedState());
        this.successMessage.set(`Version ${res.version.versionNumber} published successfully!`);
        this.showToast(`Version ${res.version.versionNumber} published!`);
      },
      error: (err) => {
        this.publishing.set(false);
        if (err?.status === 409) {
          this.errorMessage.set('Concurrency Conflict (409): This draft was modified before publishing. Please reload and review before publishing.');
          this.showToast('Publish conflict (409)');
        } else {
          this.errorMessage.set(err?.error?.message || 'Failed to publish form draft.');
        }
      }
    });
  }

  createDraftFromPublished(): void {
    const id = this.formId();
    if (!id) return;

    this.duplicating.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.formService.duplicatePublishedToDraft(id).subscribe({
      next: (res) => {
        this.duplicating.set(false);
        this.currentVersion.set(res.version);
        this.rowVersionBase64.set(res.version.rowVersionBase64 || '');
        this.fields.set(res.fields || []);
        if (res.fields && res.fields.length > 0) {
          this.selectedFieldIndex.set(0);
        }
        this.initialSnapshot.set(this.getCurrentSerializedState());
        this.undoStack.set([]);
        this.redoStack.set([]);
        this.successMessage.set(`New Draft Version ${res.version.versionNumber} created from Published version. You can now edit and publish.`);
        this.showToast(`Draft v${res.version.versionNumber} created`);
      },
      error: (err) => {
        this.duplicating.set(false);
        this.errorMessage.set(err?.error?.message || 'Failed to create draft from published version.');
      }
    });
  }

  async discardDraft(): Promise<void> {
    const id = this.formId();
    const versionId = this.formVersionId();
    if (!id || !versionId) return;

    const confirmed = await this.dialogService.warning(
      'Discard Draft Version?',
      `Are you sure you want to discard Draft Version ${this.versionNumber()}?\nAll unsaved edits made to this draft will be permanently removed.`,
      'Discard Draft'
    );
    if (!confirmed) {
      return;
    }

    this.discarding.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.formService.discardDraft(id, versionId).subscribe({
      next: () => {
        this.discarding.set(false);
        this.showToast('Draft version discarded');
        this.loadExistingForm(id);
      },
      error: (err) => {
        this.discarding.set(false);
        this.errorMessage.set(err?.error?.message || 'Failed to discard draft.');
      }
    });
  }

  // ── Pre-built Starter Templates Logic ────────────────────────────────
  openTemplatesModal(): void {
    this.showTemplatesModal.set(true);
  }

  closeTemplatesModal(): void {
    this.showTemplatesModal.set(false);
  }

  applyTemplate(template: FormTemplate): void {
    this.recordSnapshot();
    this.formTitle.set(template.title);
    this.formDescription.set(template.description);
    this.formCategory.set(template.category);
    this.fields.set(JSON.parse(JSON.stringify(template.fields)));
    this.selectedFieldIndex.set(template.fields.length > 0 ? 0 : -1);
    this.showTemplatesModal.set(false);
    this.showToast(`Loaded "${template.title}" template with pre-filled fields!`);
  }

  // ── AI Assistant Natural Language Modification ────────────────────────
  openAiAssistant(): void {
    this.showAiAssistantModal.set(true);
  }

  closeAiAssistant(): void {
    this.showAiAssistantModal.set(false);
  }

  applyAiChanges(event: {
    fields: DynamicFormField[];
    formTitle?: string;
    formDescription?: string;
    category?: string;
    summary: string;
  }): void {
    // Preserve undo/redo snapshot before making modifications
    this.recordSnapshot();

    // Identify newly added keys to visually highlight them
    const currentKeys = new Set(this.fields().map(f => f.fieldKey.toLowerCase()));
    const newKeys = new Set<string>();
    let firstNewIndex = -1;
    for (let i = 0; i < event.fields.length; i++) {
      const f = event.fields[i];
      if (!currentKeys.has(f.fieldKey.toLowerCase())) {
        newKeys.add(f.fieldKey);
        if (firstNewIndex === -1) {
          firstNewIndex = i;
        }
      }
    }
    this.newlyAddedFieldKeys.set(newKeys);

    // Apply updated fields
    this.fields.set(event.fields);

    // Update optional metadata if provided
    if (event.formTitle && this.formTitle() === 'Untitled Custom Form') {
      this.formTitle.set(event.formTitle);
    }
    if (event.formDescription && !this.formDescription()) {
      this.formDescription.set(event.formDescription);
    }
    if (event.category && this.formCategory() === 'General') {
      this.formCategory.set(event.category);
    }

    const targetIndex = firstNewIndex !== -1 ? firstNewIndex : (event.fields.length > 0 ? event.fields.length - 1 : -1);
    if (targetIndex >= 0) {
      this.selectedFieldIndex.set(targetIndex);
      this.scrollToField(targetIndex);
    }

    const toastText = event.summary.startsWith('⚡') ? event.summary : `AI updated form: ${event.summary}`;
    this.showToast(toastText);
  }

  // ── Live Preview Logic ────────────────────────────────────────────────
  switchToPreview(): void {
    this.initPreviewAnswers();
    this.activeTab.set('preview');
  }

  onPreviewSubmit(): void {
    this.previewSubmitted.set(true);
  }

  resetPreview(): void {
    this.initPreviewAnswers();
  }

  private initPreviewAnswers(): void {
    const answers: FormResponseData = {};
    for (const f of this.fields()) {
      if (f.fieldType === 'heading' || f.fieldType === 'paragraph') continue;
      if (f.defaultValue !== undefined && f.defaultValue !== null && f.defaultValue !== '') {
        if (f.fieldType === 'checkbox') {
          answers[f.fieldKey] = f.defaultValue === 'true';
        } else {
          answers[f.fieldKey] = f.defaultValue;
        }
      }
    }
    this.previewAnswers = answers;
    this.previewSubmitted.set(false);
  }

  // ── Public Sharing & Access Control ──────────────────────────────────
  openShareModal(): void {
    this.showShareModal.set(true);
  }

  closeShareModal(): void {
    this.showShareModal.set(false);
  }

  copyShareLink(): void {
    const url = this.publicShareUrl();
    if (!url) return;
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(url).then(() => {
        this.copiedLink.set(true);
        this.showToast('Public link copied to clipboard!');
        setTimeout(() => this.copiedLink.set(false), 2500);
      }).catch(() => {
        this.showToast(url);
      });
    } else {
      this.showToast(url);
    }
  }

  saveSharingSettings(config?: FormSharingConfig): void {
    const id = this.formId();
    if (!id) return;

    if (config) {
      this.accessType.set(config.accessType);
      this.allowedEmails.set(config.allowedEmails);
      this.collaboratorEmails.set(config.collaboratorEmails);
    }

    this.savingSharing.set(true);
    this.errorMessage.set('');
    this.publicFormService.updateFormSharing(id, {
      accessType: this.accessType(),
      allowedEmails: this.allowedEmails().trim(),
      collaboratorEmails: this.collaboratorEmails().trim()
    }).subscribe({
      next: () => {
        this.savingSharing.set(false);
        this.showToast('Sharing & access settings updated!');
        this.showShareModal.set(false);
      },
      error: (err: unknown) => {
        this.savingSharing.set(false);
        const errorMsg = (err as { error?: { message?: string } })?.error?.message || 'Failed to update sharing settings.';
        this.errorMessage.set(errorMsg);
      }
    });
  }
}
