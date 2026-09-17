import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DynamicFormField } from '../models/form.model';
import {
  isStructureField,
  getFieldTypeMeta,
  getHtmlInputType
} from './field-type.registry';

@Component({
  selector: 'app-field-preview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './field-preview.component.html',
  styleUrl: './field-preview.component.scss'
})
export class FieldPreviewComponent {
  readonly field = input.required<DynamicFormField>();

  readonly isStructure = computed(() => isStructureField(this.field().fieldType));
  readonly htmlType = computed(() => getHtmlInputType(this.field().fieldType));
  readonly meta = computed(() => getFieldTypeMeta(this.field().fieldType));
  readonly options = computed(() => this.field().options || []);
  readonly defaultValue = computed(() => this.field().defaultValue || '');
  readonly placeholder = computed(() => this.field().placeholder || this.meta()?.defaultPlaceholder || '');

  getRatingStars(): number[] {
    return [1, 2, 3, 4, 5];
  }

  isRatingActive(star: number): boolean {
    const val = this.defaultValue();
    return val ? +val >= star : false;
  }
}
