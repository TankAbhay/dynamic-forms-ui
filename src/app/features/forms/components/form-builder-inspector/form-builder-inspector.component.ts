import { Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '../../../../core/pipes/translate.pipe';
import { DynamicFormField } from '../../../../core/models/form.model';
import {
  isStructureField,
  supportsPlaceholder,
  hasOptions,
  getHtmlInputType
} from '../../../../core/field-types/field-type.registry';

@Component({
  selector: 'app-form-builder-inspector',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './form-builder-inspector.component.html',
  styleUrl: './form-builder-inspector.component.scss'
})
export class FormBuilderInspectorComponent {
  readonly field = input<DynamicFormField | null>(null);
  readonly selectedFieldIndex = input<number>(-1);
  readonly totalFields = input<number>(0);
  readonly isReadOnly = input<boolean>(false);

  readonly fieldChange = output<DynamicFormField>();
  readonly optionAdded = output<string>();
  readonly optionRemoved = output<number>();

  readonly newOptionText = signal<string>('');

  isStructure(type: string | undefined): boolean {
    return isStructureField(type);
  }

  supportsPlaceholder(type: string | undefined): boolean {
    return supportsPlaceholder(type);
  }

  hasOptions(type: string | undefined): boolean {
    return hasOptions(type);
  }

  getHtmlInputType(type: string | undefined): string {
    return getHtmlInputType(type);
  }

  onLabelChange(newLabel: string): void {
    const f = this.field();
    if (!f) return;
    f.label = newLabel;
    this.fieldChange.emit(f);
  }

  onPlaceholderChange(newPlaceholder: string): void {
    const f = this.field();
    if (!f) return;
    f.placeholder = newPlaceholder;
    this.fieldChange.emit(f);
  }

  onHelpTextChange(newHelpText: string): void {
    const f = this.field();
    if (!f) return;
    f.helpText = newHelpText;
    this.fieldChange.emit(f);
  }

  onDefaultValueChange(val: string): void {
    const f = this.field();
    if (!f) return;
    f.defaultValue = val;
    this.fieldChange.emit(f);
  }

  onToggleDefaultChange(event: Event): void {
    const target = event.target as HTMLInputElement | null;
    const isChecked = target?.checked ?? false;
    this.onDefaultValueChange(isChecked ? 'true' : 'false');
  }

  onRequiredCheckboxChange(event: Event): void {
    const target = event.target as HTMLInputElement | null;
    const isChecked = target?.checked ?? false;
    const f = this.field();
    if (!f) return;
    f.isRequired = isChecked;
    this.fieldChange.emit(f);
  }

  onOptionChange(index: number, val: string): void {
    const f = this.field();
    if (!f || !f.options) return;
    f.options[index] = val;
    this.fieldChange.emit(f);
  }

  addOption(): void {
    const opt = this.newOptionText().trim();
    if (!opt) return;
    this.optionAdded.emit(opt);
    this.newOptionText.set('');
  }

  removeOption(optIndex: number): void {
    this.optionRemoved.emit(optIndex);
  }
}
