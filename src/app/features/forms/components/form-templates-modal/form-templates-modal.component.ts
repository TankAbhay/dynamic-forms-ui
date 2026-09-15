import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PREBUILT_FORM_TEMPLATES, FormTemplate } from '../../config/form-templates.config';

@Component({
  selector: 'app-form-templates-modal',
  imports: [CommonModule],
  templateUrl: './form-templates-modal.component.html',
  styleUrl: './form-templates-modal.component.scss'
})
export class FormTemplatesModalComponent {
  readonly templates = input<FormTemplate[]>(PREBUILT_FORM_TEMPLATES);
  readonly selectTemplate = output<FormTemplate>();
  readonly close = output<void>();
}
