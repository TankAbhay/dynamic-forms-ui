import { Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '../../../../core/pipes/translate.pipe';

@Component({
  selector: 'app-form-builder-header',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TranslatePipe],
  templateUrl: './form-builder-header.component.html',
  styleUrl: './form-builder-header.component.scss'
})
export class FormBuilderHeaderComponent {
  readonly formTitle = input<string>('');
  readonly formIsActive = input<boolean>(true);
  readonly formId = input<number | null>(null);
  readonly formVersionId = input<number | null>(null);
  readonly versionNumber = input<number | null>(null);
  readonly versionStatus = input<string>('Draft');
  readonly isReadOnlyVersion = input<boolean>(false);
  readonly hasPublishedVersion = input<boolean>(false);
  readonly hasUnsavedChanges = input<boolean>(false);

  readonly canUndo = input<boolean>(false);
  readonly canRedo = input<boolean>(false);

  readonly saving = input<boolean>(false);
  readonly loading = input<boolean>(false);
  readonly publishing = input<boolean>(false);
  readonly duplicating = input<boolean>(false);

  readonly activeTab = input<'builder' | 'preview'>('builder');

  readonly titleChange = output<string>();
  readonly tabChange = output<'builder' | 'preview'>();
  readonly undo = output<void>();
  readonly redo = output<void>();
  readonly save = output<void>();
  readonly publish = output<void>();
  readonly editAsNewDraft = output<void>();
  readonly openShareModal = output<void>();
  readonly openAiAssistant = output<void>();
  readonly openTemplatesModal = output<void>();
  readonly discardDraft = output<void>();

  // Overflow menu state
  readonly showMoreMenu = signal<boolean>(false);

  toggleMoreMenu(): void {
    this.showMoreMenu.update(v => !v);
  }

  closeMoreMenu(): void {
    this.showMoreMenu.set(false);
  }
}
