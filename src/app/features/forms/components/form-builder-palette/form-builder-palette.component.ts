import { Component, input, output, computed, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '../../../../core/pipes/translate.pipe';
import { FormPaletteConfigItem, ComponentPaletteItem } from '../../../../core/models/form.model';

@Component({
  selector: 'app-form-builder-palette',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './form-builder-palette.component.html',
  styleUrl: './form-builder-palette.component.scss'
})
export class FormBuilderPaletteComponent {
  readonly paletteItems = input<FormPaletteConfigItem[]>([]);
  readonly isReadOnly = input<boolean>(false);
  readonly activeMobilePanel = input<'palette' | 'canvas' | 'inspector'>('canvas');

  readonly itemDragStart = output<{ event: DragEvent; item: ComponentPaletteItem }>();
  readonly itemDragEnd = output<void>();
  readonly itemClickAdd = output<ComponentPaletteItem>();

  readonly searchQuery = signal<string>('');

  readonly filteredItems = computed(() => {
    const q = this.searchQuery().trim().toLowerCase();
    const items = this.paletteItems();
    if (!q) return items;
    return items.filter(item => 
      (item.label && item.label.toLowerCase().includes(q)) ||
      (item.type && item.type.toLowerCase().includes(q)) ||
      (item.description && item.description.toLowerCase().includes(q))
    );
  });

  readonly structurePaletteItems = computed(() =>
    this.filteredItems().filter(i => (i.category || '').toLowerCase() === 'structure' || i.type === 'heading' || i.type === 'paragraph')
  );

  readonly inputPaletteItems = computed(() =>
    this.filteredItems().filter(i => (i.category || '').toLowerCase() !== 'structure' && i.type !== 'heading' && i.type !== 'paragraph')
  );

  readonly isMobile = signal<boolean>(typeof window !== 'undefined' ? window.innerWidth <= 992 : false);

  private isDragging = false;

  @HostListener('window:resize')
  onResize(): void {
    if (typeof window !== 'undefined') {
      this.isMobile.set(window.innerWidth <= 992);
    }
  }

  onDragStart(event: DragEvent, item: ComponentPaletteItem): void {
    if (this.isMobile()) {
      event.preventDefault();
      return;
    }
    this.isDragging = true;
    this.itemDragStart.emit({ event, item });
  }

  onDragEnd(): void {
    this.isDragging = false;
    this.itemDragEnd.emit();
  }

  @HostListener('window:dragend')
  @HostListener('window:drop')
  @HostListener('window:mouseup')
  onWindowDragEnd(): void {
    this.isDragging = false;
    this.itemDragEnd.emit();
  }

  onClickAdd(item: ComponentPaletteItem): void {
    if (this.isDragging && !this.isMobile()) return;
    this.itemClickAdd.emit(item);
  }
}
