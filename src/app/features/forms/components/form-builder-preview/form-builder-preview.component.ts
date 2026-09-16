import { Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DynamicFormField, FormResponseData } from '../../../../core/models/form.model';

@Component({
  selector: 'app-form-builder-preview',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './form-builder-preview.component.html',
  styleUrl: './form-builder-preview.component.scss'
})
export class FormBuilderPreviewComponent {
  readonly formTitle = input<string>('');
  readonly formDescription = input<string>('');
  readonly fields = input<DynamicFormField[]>([]);

  readonly backToBuilder = output<void>();

  // Local simulated form state
  previewAnswers: FormResponseData = {};
  readonly previewSubmitted = signal<boolean>(false);

  getHtmlInputType(fieldType: string): string {
    const supported = ['text', 'email', 'number', 'date', 'time', 'tel', 'url', 'color', 'datetime-local', 'password', 'search'];
    return supported.includes(fieldType) ? fieldType : 'text';
  }

  getNumericValue(fieldKey: string): number {
    const val = this.previewAnswers[fieldKey];
    return Number(val) || 0;
  }

  onPreviewSubmit(): void {
    this.previewSubmitted.set(true);
  }

  resetPreview(): void {
    this.previewAnswers = {};
    this.previewSubmitted.set(false);
  }
}
