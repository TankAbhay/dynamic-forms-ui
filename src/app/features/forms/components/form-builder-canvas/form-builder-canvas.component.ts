import { Component, input, output, signal, HostListener, NgZone, inject } from '@angular/core';
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
  private readonly ngZone = inject(NgZone);

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
  readonly inspectFieldRequested = output<number>();
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

  // Auto-scroll state
  private autoScrollRafId: number | null = null;
  private autoScrollLastClientY: number = 0;
  private cachedScrollContainer: HTMLElement | null = null;

  /** Find the scrollable canvas container element. */
  private getScrollContainer(): HTMLElement | null {
    if (!this.cachedScrollContainer || !this.cachedScrollContainer.isConnected) {
      this.cachedScrollContainer = document.querySelector('app-form-builder-canvas .canvas-area');
    }
    return this.cachedScrollContainer;
  }

  /** Run auto-scroll strictly outside Angular zone so it doesn't trigger 60 Change Detections/sec! */
  private updateAutoScroll(clientY: number): void {
    const container = this.getScrollContainer();
    if (!container) return;

    this.autoScrollLastClientY = clientY;
    const rect = container.getBoundingClientRect();
    const ZONE = 70; // px edge zone
    const nearTop = clientY < rect.top + ZONE && clientY >= rect.top - 20;
    const nearBottom = clientY > rect.bottom - ZONE && clientY <= rect.bottom + 20;

    // If pointer is in safe middle area, stop immediately
    if (!nearTop && !nearBottom) {
      this.stopAutoScroll();
      return;
    }

    // If loop is already running, it will pick up updated autoScrollLastClientY
    if (this.autoScrollRafId !== null) return;

    this.ngZone.runOutsideAngular(() => {
      const step = () => {
        const c = this.getScrollContainer();
        if (!c) {
          this.autoScrollRafId = null;
          return;
        }

        const r = c.getBoundingClientRect();
        const y = this.autoScrollLastClientY;
        const MAX_SPEED = 14;

        let speed = 0;
        if (y < r.top + ZONE) {
          const ratio = Math.max(0, Math.min(1, 1 - (y - r.top) / ZONE));
          speed = -Math.round(MAX_SPEED * ratio);
        } else if (y > r.bottom - ZONE) {
          const ratio = Math.max(0, Math.min(1, 1 - (r.bottom - y) / ZONE));
          speed = Math.round(MAX_SPEED * ratio);
        }

        if (speed === 0) {
          this.autoScrollRafId = null;
          return;
        }

        c.scrollTop += speed;
        this.autoScrollRafId = requestAnimationFrame(step);
      };

      this.autoScrollRafId = requestAnimationFrame(step);
    });
  }

  /** Stop rAF auto-scroll loop cleanly. */
  private stopAutoScroll(): void {
    if (this.autoScrollRafId !== null) {
      cancelAnimationFrame(this.autoScrollRafId);
      this.autoScrollRafId = null;
    }
  }

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

  onInspectField(index: number, event: Event): void {
    event.stopPropagation();
    this.fieldSelected.emit(index);
    this.inspectFieldRequested.emit(index);
  }

  onFieldDragStart(index: number, event: DragEvent): void {
    if (this.isReadOnly()) return;

    // Only allow drag when the mousedown originated on the .drag-handle grip
    const dragTarget = event.target as HTMLElement;
    const card = event.currentTarget as HTMLElement;
    const handle = card.querySelector('.drag-handle');
    if (!handle || !handle.contains(dragTarget)) {
      event.preventDefault();
      return;
    }

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

    // Feed current pointer Y to auto-scroller
    this.updateAutoScroll(event.clientY);

    // Do not highlight self as drop target when dragging
    if (this.draggedFieldIndex() === index) {
      return;
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
    this.stopAutoScroll();

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
  @HostListener('window:mouseup')
  onFieldDragEnd(): void {
    this.stopAutoScroll();
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
    // Feed pointer Y to auto-scroller even when hovering over the empty canvas area
    this.updateAutoScroll(event.clientY);
  }

  onCanvasContainerDragLeave(event: DragEvent): void {
    this.containerDragCounter = Math.max(0, this.containerDragCounter - 1);
    if (this.containerDragCounter === 0) {
      this.isCanvasDragOver.set(false);
      this.stopAutoScroll();
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
