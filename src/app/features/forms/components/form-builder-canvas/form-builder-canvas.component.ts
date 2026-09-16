import { Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '../../../../core/pipes/translate.pipe';
import { DynamicFormField, ComponentPaletteItem } from '../../../../core/models/form.model';

@Component({
  selector: 'app-form-builder-canvas',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './form-builder-canvas.component.html',
  styleUrl: './form-builder-canvas.component.scss'
})
export class FormBuilderCanvasComponent {
  readonly fields = input<DynamicFormField[]>([]);
  readonly selectedFieldIndex = input<number>(-1);
  readonly isReadOnly = input<boolean>(false);
  readonly formDescription = input<string>('');
  readonly formCategory = input<string>('General');
  readonly formIsActive = input<boolean>(true);
  readonly activeMobilePanel = input<'palette' | 'canvas' | 'inspector'>('canvas');
  readonly newlyAddedFieldKeys = input<Set<string>>(new Set());
  readonly draggedPaletteItem = input<ComponentPaletteItem | null>(null);
  readonly draggedFieldIndex = input<number | null>(null);

  readonly descriptionChange = output<string>();
  readonly categoryChange = output<string>();
  readonly activeChange = output<boolean>();

  readonly fieldSelected = output<number>();
  readonly fieldDuplicated = output<number>();
  readonly fieldRemoved = output<number>();
  readonly fieldMovedUp = output<number>();
  readonly fieldMovedDown = output<number>();
  readonly fieldToggledRequired = output<number>();

  readonly paletteItemDropped = output<{ item: ComponentPaletteItem; targetIndex: number; position: 'top' | 'bottom' }>();
  readonly fieldReordered = output<{ fromIndex: number; toIndex: number; position: 'top' | 'bottom' }>();
  readonly canvasContainerDropped = output<ComponentPaletteItem>();

  readonly fieldDragStarted = output<number>();
  readonly fieldDragEnded = output<void>();
  readonly openTemplatesModal = output<void>();

  // Local drag interaction state
  readonly dragOverIndex = signal<number | null>(null);
  readonly dragOverPosition = signal<'top' | 'bottom' | null>(null);
  readonly isCanvasDragOver = signal<boolean>(false);

  isNewlyAdded(fieldKey: string): boolean {
    return this.newlyAddedFieldKeys().has(fieldKey);
  }

  getHtmlInputType(fieldType: string): string {
    const supported = ['text', 'email', 'number', 'date', 'time', 'tel', 'url', 'color', 'datetime-local', 'password', 'search'];
    return supported.includes(fieldType) ? fieldType : 'text';
  }

  onToggleRequired(index: number, event: Event): void {
    event.stopPropagation();
    this.fieldToggledRequired.emit(index);
  }

  onMoveUp(index: number, event: Event): void {
    event.stopPropagation();
    this.fieldMovedUp.emit(index);
  }

  onMoveDown(index: number, event: Event): void {
    event.stopPropagation();
    this.fieldMovedDown.emit(index);
  }

  onDuplicate(index: number, event: Event): void {
    event.stopPropagation();
    this.fieldDuplicated.emit(index);
  }

  onRemove(index: number, event: Event): void {
    event.stopPropagation();
    this.fieldRemoved.emit(index);
  }

  onFieldDragStart(index: number, event: DragEvent): void {
    if (this.isReadOnly()) return;
    if (event.dataTransfer) {
      event.dataTransfer.setData('text/plain', String(index));
      event.dataTransfer.effectAllowed = 'move';
    }
    this.fieldDragStarted.emit(index);
  }

  onFieldDragOver(index: number, event: DragEvent): void {
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
      this.paletteItemDropped.emit({ item: paletteItem, targetIndex, position: pos });
    } else if (sourceIdx !== null && sourceIdx !== undefined && sourceIdx !== targetIndex) {
      this.fieldReordered.emit({ fromIndex: sourceIdx, toIndex: targetIndex, position: pos });
    }

    this.onFieldDragEnd();
  }

  onFieldDragEnd(): void {
    this.dragOverIndex.set(null);
    this.dragOverPosition.set(null);
    this.isCanvasDragOver.set(false);
    this.fieldDragEnded.emit();
  }

  onCanvasContainerDragOver(event: DragEvent): void {
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
      this.canvasContainerDropped.emit(paletteItem);
    }
    this.onFieldDragEnd();
  }
}
