import { Component, input, output, signal, HostListener } from '@angular/core';
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
  private containerDragCounter = 0;

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
      event.dataTransfer.setData('application/json', JSON.stringify({ source: 'field', index }));
      event.dataTransfer.effectAllowed = 'copyMove';
    }
    this.fieldDragStarted.emit(index);
  }

  onFieldDragOver(index: number, event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = this.draggedPaletteItem() ? 'copy' : 'move';
    }

    const targetElement = event.currentTarget as HTMLElement;
    if (!targetElement) return;

    const rect = targetElement.getBoundingClientRect();
    const midY = rect.top + rect.height / 2;
    const pos = event.clientY < midY ? 'top' : 'bottom';

    if (this.dragOverIndex() !== index || this.dragOverPosition() !== pos) {
      this.dragOverIndex.set(index);
      this.dragOverPosition.set(pos);
    }
  }

  onFieldDragLeave(index: number, event: DragEvent): void {
    const current = event.currentTarget as HTMLElement;
    const related = event.relatedTarget as Node | null;
    if (current && related && current.contains(related)) {
      return;
    }
    if (this.dragOverIndex() === index) {
      this.dragOverIndex.set(null);
      this.dragOverPosition.set(null);
    }
  }

  onFieldDrop(targetIndex: number, event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();

    const pos = this.dragOverPosition() || 'bottom';
    let paletteItem = this.draggedPaletteItem();
    let sourceIdx = this.draggedFieldIndex();

    if (!paletteItem && (sourceIdx === null || sourceIdx === undefined) && event.dataTransfer) {
      try {
        const json = event.dataTransfer.getData('application/json');
        if (json) {
          const parsed = JSON.parse(json);
          if (parsed.item) {
            paletteItem = parsed.item;
          } else if (parsed.paletteItem) {
            paletteItem = parsed.paletteItem;
          } else if (parsed.index !== undefined) {
            sourceIdx = parsed.index;
          } else if (parsed.fieldIndex !== undefined) {
            sourceIdx = parsed.fieldIndex;
          }
        }
        if (!paletteItem && (sourceIdx === null || sourceIdx === undefined)) {
          const text = event.dataTransfer.getData('text/plain');
          if (text) {
            const num = parseInt(text, 10);
            if (!isNaN(num)) {
              sourceIdx = num;
            } else if (text.trim()) {
              paletteItem = { type: text.trim() as any, label: text.trim(), icon: 'fas fa-cube' };
            }
          }
        }
      } catch {
        // ignore parse error
      }
    }

    if (paletteItem) {
      this.paletteItemDropped.emit({ item: paletteItem, targetIndex, position: pos });
    } else if (sourceIdx !== null && sourceIdx !== undefined && sourceIdx !== targetIndex) {
      this.fieldReordered.emit({ fromIndex: sourceIdx, toIndex: targetIndex, position: pos });
    }

    this.onFieldDragEnd();
  }

  @HostListener('window:dragend')
  @HostListener('window:drop')
  onFieldDragEnd(): void {
    this.containerDragCounter = 0;
    this.dragOverIndex.set(null);
    this.dragOverPosition.set(null);
    this.isCanvasDragOver.set(false);
    this.fieldDragEnded.emit();
  }

  onCanvasContainerDragEnter(event: DragEvent): void {
    event.preventDefault();
    this.containerDragCounter++;
    if (this.containerDragCounter === 1) {
      this.isCanvasDragOver.set(true);
    }
  }

  onCanvasContainerDragOver(event: DragEvent): void {
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = this.draggedPaletteItem() ? 'copy' : 'move';
    }
    if (!this.isCanvasDragOver()) {
      this.isCanvasDragOver.set(true);
    }
  }

  onCanvasContainerDragLeave(event: DragEvent): void {
    this.containerDragCounter = Math.max(0, this.containerDragCounter - 1);
    if (this.containerDragCounter === 0) {
      this.isCanvasDragOver.set(false);
    }
  }

  onCanvasContainerDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    let paletteItem = this.draggedPaletteItem();
    let sourceIdx = this.draggedFieldIndex();

    if (!paletteItem && (sourceIdx === null || sourceIdx === undefined) && event.dataTransfer) {
      try {
        const json = event.dataTransfer.getData('application/json');
        if (json) {
          const parsed = JSON.parse(json);
          if (parsed.item) {
            paletteItem = parsed.item;
          } else if (parsed.paletteItem) {
            paletteItem = parsed.paletteItem;
          } else if (parsed.index !== undefined) {
            sourceIdx = parsed.index;
          } else if (parsed.fieldIndex !== undefined) {
            sourceIdx = parsed.fieldIndex;
          }
        }
        if (!paletteItem && (sourceIdx === null || sourceIdx === undefined)) {
          const text = event.dataTransfer.getData('text/plain');
          if (text) {
            const num = parseInt(text, 10);
            if (!isNaN(num)) {
              sourceIdx = num;
            } else if (text.trim()) {
              paletteItem = { type: text.trim() as any, label: text.trim(), icon: 'fas fa-cube' };
            }
          }
        }
      } catch {
        // ignore
      }
    }

    if (paletteItem) {
      this.canvasContainerDropped.emit(paletteItem);
    } else if (sourceIdx !== null && sourceIdx !== undefined) {
      const lastIdx = this.fields().length - 1;
      if (sourceIdx !== lastIdx && lastIdx >= 0) {
        this.fieldReordered.emit({ fromIndex: sourceIdx, toIndex: lastIdx, position: 'bottom' });
      }
    }
    this.onFieldDragEnd();
  }
}
