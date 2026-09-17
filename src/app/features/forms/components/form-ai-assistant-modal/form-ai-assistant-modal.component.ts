import { Component, input, output, signal, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DynamicFormField, FieldType } from '../../../../core/models/form.model';
import { isStructureField } from '../../../../core/field-types/field-type.registry';
import { FormGenerationService } from '../../create-with-ai/services/form-generation.service';
import {
  ModifyFormWithAiRequest,
  ModifyFormWithAiResponse,
  ExistingFormFieldDto
} from '../../create-with-ai/models/ai-form-generation.model';

@Component({
  selector: 'app-form-ai-assistant-modal',
  imports: [CommonModule, FormsModule],
  templateUrl: './form-ai-assistant-modal.component.html',
  styleUrl: './form-ai-assistant-modal.component.scss'
})
export class FormAiAssistantModalComponent {
  private readonly formGenService = inject(FormGenerationService);
  private readonly destroyRef = inject(DestroyRef);

  // Inputs
  formTitle = input<string>('Untitled Form');
  existingFields = input<DynamicFormField[]>([]);
  category = input<string>('General');

  // Outputs
  close = output<void>();
  applyChanges = output<{
    fields: DynamicFormField[];
    formTitle?: string;
    formDescription?: string;
    category?: string;
    summary: string;
  }>();

  // State
  userPrompt = signal<string>('');
  loading = signal<boolean>(false);
  errorMessage = signal<string>('');
  lastResult = signal<ModifyFormWithAiResponse | null>(null);

  readonly quickChips = [
    {
      id: 'emergency_contact',
      label: 'Add Emergency Contact',
      icon: 'fa-solid fa-phone',
      description: 'Adds Contact Name, Phone & Relationship',
      prompt: 'Add an emergency contact field with contact name, relationship, and emergency phone number.'
    },
    {
      id: 'make_email_required',
      label: 'Make Email Required',
      icon: 'fa-solid fa-envelope',
      description: 'Sets required flag on email field or appends it',
      prompt: 'Make the email address field required.'
    },
    {
      id: 'satisfaction_rating',
      label: 'Add Satisfaction Rating',
      icon: 'fa-solid fa-star',
      description: 'Adds 5-point satisfaction rating dropdown',
      prompt: 'Add a 5-star rating question asking how satisfied the user was with the experience.'
    },
    {
      id: 'department_dropdown',
      label: 'Add Department Dropdown',
      icon: 'fa-solid fa-building',
      description: 'Adds standard company department selector',
      prompt: 'Add a dropdown field for Department with options: HR, Engineering, Sales, Marketing, Support.'
    },
    {
      id: 'feedback_questions',
      label: 'Add Feedback Questions',
      icon: 'fa-solid fa-comment-dots',
      description: 'Adds What went well & How to improve',
      prompt: 'Add 2 questions asking what went well and what can be improved.'
    },
    {
      id: 'remove_optional_fields',
      label: 'Remove Optional Fields',
      icon: 'fa-solid fa-trash-can',
      description: 'Keeps only required fields and headers',
      prompt: 'Remove any optional non-essential fields from the form.'
    }
  ];

  setPrompt(prompt: string): void {
    this.userPrompt.set(prompt);
  }

  isNewField(key: string): boolean {
    const existing = this.existingFields();
    return !existing.some(f => f.fieldKey.toLowerCase() === key.toLowerCase());
  }

  /**
   * ZERO-TOKEN DETERMINISTIC EXECUTION
   * Executes common suggestions locally in client code in <5ms without calling AI backend.
   */
  applyQuickSuggestion(chip: { id: string; label: string; description: string }): void {
    this.errorMessage.set('');
    this.loading.set(false);

    const currentFields = this.existingFields();
    let updatedFields: DynamicFormField[] = JSON.parse(JSON.stringify(currentFields));
    let summary = '';

    switch (chip.id) {
      case 'emergency_contact': {
        const baseKeys = new Set(updatedFields.map(f => f.fieldKey.toLowerCase()));
        const nameKey = this.generateUniqueKey('emergency_contact_name', baseKeys);
        baseKeys.add(nameKey);
        const phoneKey = this.generateUniqueKey('emergency_contact_phone', baseKeys);
        baseKeys.add(phoneKey);
        const relKey = this.generateUniqueKey('emergency_contact_relationship', baseKeys);

        const newFields: DynamicFormField[] = [
          {
            fieldKey: nameKey,
            fieldType: 'text',
            label: 'Emergency Contact Name',
            placeholder: 'Full legal name of emergency contact',
            helpText: 'Primary person to contact in case of emergency',
            isRequired: true,
            sortOrder: updatedFields.length + 1
          },
          {
            fieldKey: phoneKey,
            fieldType: 'text',
            label: 'Emergency Contact Phone',
            placeholder: '+1 (555) 000-0000',
            helpText: 'Active phone number for emergency contact',
            isRequired: true,
            sortOrder: updatedFields.length + 2
          },
          {
            fieldKey: relKey,
            fieldType: 'select',
            label: 'Relationship to Contact',
            placeholder: 'Select relationship...',
            options: ['Spouse', 'Parent', 'Child', 'Sibling', 'Relative', 'Friend', 'Colleague', 'Other'],
            helpText: 'How is this emergency contact related to you?',
            isRequired: false,
            sortOrder: updatedFields.length + 3
          }
        ];

        updatedFields = [...updatedFields, ...newFields];
        summary = 'Added Emergency Contact fields (Contact Name, Phone, and Relationship).';
        break;
      }

      case 'make_email_required': {
        const emailField = updatedFields.find(
          f => f.fieldType === 'email' || f.fieldKey.toLowerCase().includes('email') || f.label.toLowerCase().includes('email')
        );
        if (emailField) {
          emailField.isRequired = true;
          summary = `Updated field "${emailField.label}" to be required.`;
        } else {
          const baseKeys = new Set(updatedFields.map(f => f.fieldKey.toLowerCase()));
          const emailKey = this.generateUniqueKey('email_address', baseKeys);
          updatedFields.push({
            fieldKey: emailKey,
            fieldType: 'email',
            label: 'Email Address',
            placeholder: 'you@example.com',
            helpText: 'We will send confirmation and updates to this email address.',
            isRequired: true,
            sortOrder: updatedFields.length + 1
          });
          summary = 'Added required Email Address field.';
        }
        break;
      }

      case 'satisfaction_rating': {
        const baseKeys = new Set(updatedFields.map(f => f.fieldKey.toLowerCase()));
        const ratingKey = this.generateUniqueKey('overall_satisfaction', baseKeys);
        updatedFields.push({
          fieldKey: ratingKey,
          fieldType: 'select',
          label: 'Overall Satisfaction Rating',
          placeholder: 'Select your rating...',
          options: ['5 - Very Satisfied', '4 - Satisfied', '3 - Neutral', '2 - Dissatisfied', '1 - Very Dissatisfied'],
          helpText: 'How satisfied are you with your overall experience?',
          isRequired: true,
          sortOrder: updatedFields.length + 1
        });
        summary = 'Added 5-point Satisfaction Rating dropdown.';
        break;
      }

      case 'department_dropdown': {
        const baseKeys = new Set(updatedFields.map(f => f.fieldKey.toLowerCase()));
        const deptKey = this.generateUniqueKey('department', baseKeys);
        updatedFields.push({
          fieldKey: deptKey,
          fieldType: 'select',
          label: 'Department',
          placeholder: 'Select your department...',
          options: ['Engineering', 'Human Resources', 'Sales & Marketing', 'Customer Support', 'Finance & Accounting', 'Operations', 'Legal', 'Product Management'],
          helpText: 'Select the department or team you belong to',
          isRequired: true,
          sortOrder: updatedFields.length + 1
        });
        summary = 'Added Department dropdown with standard organizational departments.';
        break;
      }

      case 'feedback_questions': {
        const baseKeys = new Set(updatedFields.map(f => f.fieldKey.toLowerCase()));
        const highlightsKey = this.generateUniqueKey('feedback_highlights', baseKeys);
        baseKeys.add(highlightsKey);
        const improvementsKey = this.generateUniqueKey('feedback_improvements', baseKeys);

        updatedFields.push(
          {
            fieldKey: highlightsKey,
            fieldType: 'textarea',
            label: 'What did you like most?',
            placeholder: 'Tell us about the best parts of your experience...',
            isRequired: false,
            sortOrder: updatedFields.length + 1
          },
          {
            fieldKey: improvementsKey,
            fieldType: 'textarea',
            label: 'How can we improve?',
            placeholder: 'Tell us how we can do better or share feature suggestions...',
            isRequired: false,
            sortOrder: updatedFields.length + 2
          }
        );
        summary = 'Added open-ended feedback questions for highlights and improvement suggestions.';
        break;
      }

      case 'remove_optional_fields': {
        const initialCount = updatedFields.length;
        const filtered = updatedFields.filter(f => f.isRequired || isStructureField(f.fieldType));
        const removedCount = initialCount - filtered.length;
        if (removedCount === 0) {
          this.errorMessage.set('No optional fields to remove. All fields in this form are already required or structural.');
          return;
        }
        updatedFields = filtered.map((f, i) => ({ ...f, sortOrder: i + 1 }));
        summary = `Removed ${removedCount} optional field${removedCount > 1 ? 's' : ''}, keeping only required inputs.`;
        break;
      }

      default:
        return;
    }

    // Populate result with 0 tokens used
    this.lastResult.set({
      success: true,
      summaryOfChanges: `⚡ Instant Local Action: ${summary}`,
      formTitle: this.formTitle(),
      category: this.category(),
      fields: updatedFields.map((f, i) => ({
        fieldKey: f.fieldKey,
        fieldType: f.fieldType,
        label: f.label,
        placeholder: f.placeholder,
        helpText: f.helpText,
        isRequired: f.isRequired,
        defaultValue: f.defaultValue,
        options: f.options,
        sortOrder: i + 1
      })),
      tokensUsed: 0,
      isCached: true
    });

    // Auto-scroll modal body smoothly to the preview card
    this.scrollToPreview();
  }

  private generateUniqueKey(base: string, existingKeys: Set<string>): string {
    let key = base;
    let counter = 2;
    while (existingKeys.has(key.toLowerCase())) {
      key = `${base}_${counter}`;
      counter++;
    }
    return key;
  }

  private scrollToPreview(): void {
    setTimeout(() => {
      const el = document.getElementById('aiResultPreviewCard');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 60);
  }

  /**
   * AI-POWERED CUSTOM INSTRUCTION EXECUTION
   * Only called when user submits custom / heavy instructions via prompt input.
   */
  submitModification(): void {
    const instruction = this.userPrompt().trim();
    if (!instruction) {
      this.errorMessage.set('Please enter instructions for the AI assistant.');
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    const mappedExisting: ExistingFormFieldDto[] = this.existingFields().map((f, i) => ({
      fieldKey: f.fieldKey,
      fieldType: f.fieldType,
      label: f.label,
      placeholder: f.placeholder,
      helpText: f.helpText,
      isRequired: f.isRequired,
      defaultValue: f.defaultValue,
      options: f.options,
      sortOrder: i + 1
    }));

    const req: ModifyFormWithAiRequest = {
      instruction,
      formTitle: this.formTitle(),
      category: this.category(),
      existingFields: mappedExisting
    };

    this.formGenService.modifyForm(req)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
      next: (res) => {
        this.loading.set(false);
        if (res.success) {
          this.lastResult.set(res);
          this.scrollToPreview();
        } else {
          this.errorMessage.set(res.summaryOfChanges || 'Failed to modify form.');
        }
      },
      error: (err) => {
        this.loading.set(false);
        const serverMsg = err?.error?.message || err?.message || 'AI request failed. Please check your prompt.';
        this.errorMessage.set(serverMsg);
      }
    });
  }

  onApply(): void {
    const res = this.lastResult();
    if (!res) return;

    // Convert GeneratedFormFieldDto to DynamicFormField
    const newFields: DynamicFormField[] = res.fields.map((f, i) => ({
      fieldKey: f.fieldKey,
      fieldType: f.fieldType as FieldType,
      label: f.label,
      placeholder: f.placeholder,
      helpText: f.helpText,
      isRequired: f.isRequired,
      defaultValue: f.defaultValue,
      options: f.options,
      sortOrder: f.sortOrder || i + 1
    }));

    this.applyChanges.emit({
      fields: newFields,
      formTitle: res.formTitle,
      formDescription: res.formDescription,
      category: res.category,
      summary: res.summaryOfChanges
    });

    this.close.emit();
  }
}
