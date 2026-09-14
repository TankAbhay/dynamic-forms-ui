import { Component, input, output, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DynamicFormField } from '../../../../core/models/form.model';
import { FormGenerationService } from '../../create-with-ai/services/form-generation.service';
import {
  ModifyFormWithAiRequest,
  ModifyFormWithAiResponse,
  ExistingFormFieldDto
} from '../../create-with-ai/models/ai-form-generation.model';

@Component({
  selector: 'app-form-ai-assistant-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="ai-modal-backdrop" (click)="close.emit()">
      <div class="ai-modal-sheet" (click)="$event.stopPropagation()">
        <!-- Header -->
        <div class="ai-modal-header">
          <div class="header-titles">
            <div class="badge-ai-pill">
              <i class="fa-solid fa-wand-magic-sparkles"></i>
              <span>AI Form Copilot</span>
            </div>
            <h3>Form Builder AI Assistant</h3>
            <p class="text-muted">
              Add, remove, or modify fields using plain English. E.g., <em>"Add emergency contact"</em>, <em>"Make email required"</em>, or <em>"Add 3 satisfaction questions"</em>.
            </p>
          </div>
          <button type="button" class="btn-close-modal" (click)="close.emit()" aria-label="Close">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <!-- Body -->
        <div class="ai-modal-body">
          <!-- Form Context Bar -->
          <div class="context-bar">
            <div class="context-item">
              <i class="fa-solid fa-file-lines text-primary me-1"></i>
              <span>Target: <strong>{{ formTitle() || 'Current Form' }}</strong></span>
            </div>
            <div class="context-item">
              <i class="fa-solid fa-cubes text-secondary me-1"></i>
              <span>Fields count: <strong>{{ existingFields().length }}</strong></span>
            </div>
          </div>

          <!-- Prompt Input Box -->
          <div class="prompt-box-wrapper">
            <label for="aiPromptInput" class="form-label fw-bold d-flex justify-content-between">
              <span>Custom AI Instructions:</span>
              <span class="badge bg-light text-secondary border fw-normal" style="font-size: 0.72rem;">
                <i class="fa-solid fa-robot me-1 text-primary"></i>Calls AI Model
              </span>
            </label>
            <div class="input-container">
              <textarea
                id="aiPromptInput"
                class="form-control ai-textarea"
                rows="3"
                placeholder="Type custom instructions (e.g., 'Add a section for travel insurance with policy number and provider')..."
                [ngModel]="userPrompt()"
                (ngModelChange)="userPrompt.set($event)"
                (keydown.control.enter)="submitModification()"
                (keydown.meta.enter)="submitModification()"
                [disabled]="loading()"
              ></textarea>
              <button
                type="button"
                class="btn-send-ai"
                [disabled]="loading() || !userPrompt().trim()"
                (click)="submitModification()"
                title="Execute AI (Ctrl+Enter)"
              >
                @if (loading()) {
                  <i class="fa-solid fa-spinner fa-spin"></i>
                } @else {
                  <i class="fa-solid fa-paper-plane"></i>
                }
              </button>
            </div>
            <div class="input-hint">
              <span class="text-muted small">
                <i class="fa-solid fa-keyboard me-1"></i>Press <kbd>Ctrl+Enter</kbd> to execute
              </span>
              <span class="text-muted small ms-auto">
                {{ userPrompt().length }} / 500 chars
              </span>
            </div>
          </div>

          <!-- Quick Suggestion Chips (Instant Local Execution: Zero Tokens) -->
          <div class="suggestions-section">
            <div class="suggestions-header">
              <span class="suggestions-label">
                <i class="fa-solid fa-bolt text-warning me-1"></i>
                Quick Suggestions:
              </span>
              <span class="badge-zero-tokens">
                <i class="fa-solid fa-shield-halved me-1"></i>Zero AI Tokens Used (Instant Local)
              </span>
            </div>
            <div class="chips-row">
              @for (chip of quickChips; track chip.id) {
                <button
                  type="button"
                  class="chip-btn"
                  [disabled]="loading()"
                  (click)="applyQuickSuggestion(chip)"
                  [title]="chip.description + ' - 0 Tokens'"
                >
                  <i [class]="chip.icon + ' me-1'"></i>
                  {{ chip.label }}
                  <span class="chip-zero-badge">0 tokens</span>
                </button>
              }
            </div>
          </div>

          <!-- Error Alert -->
          @if (errorMessage()) {
            <div class="alert alert-danger d-flex align-items-center mt-3" role="alert">
              <i class="fa-solid fa-triangle-exclamation me-2 fs-5"></i>
              <div class="flex-grow-1">
                {{ errorMessage() }}
              </div>
            </div>
          }

          <!-- Loading State -->
          @if (loading()) {
            <div class="ai-working-card mt-3">
              <div class="ai-spinner-box">
                <i class="fa-solid fa-wand-magic-sparkles fa-spin text-primary fs-3"></i>
              </div>
              <div class="ai-working-text">
                <h6>AI Assistant is analyzing your form...</h6>
                <p class="text-muted mb-0">Evaluating context, updating field schema, and calculating diffs.</p>
              </div>
            </div>
          }

          <!-- Result Preview Card -->
          @if (lastResult(); as res) {
            <div id="aiResultPreviewCard" class="result-card mt-3">
              <div class="result-header">
                <div class="d-flex align-items-center gap-2 flex-wrap">
                  <span class="result-badge-success">
                    <i class="fa-solid fa-circle-check me-1"></i> Proposed Changes
                  </span>
                  @if (res.tokensUsed === 0) {
                    <span class="badge-local" title="Executed locally by client code without consuming AI tokens">
                      <i class="fa-solid fa-bolt me-1"></i> Instant Local (0 tokens)
                    </span>
                  } @else if (res.isCached) {
                    <span class="badge-cached" title="Served instantly from memory cache without consuming API tokens">
                      <i class="fa-solid fa-database me-1"></i> Cached (0 tokens)
                    </span>
                  } @else {
                    <span class="badge-tokens" title="Token consumption recorded in database">
                      <i class="fa-solid fa-coins me-1"></i> {{ res.tokensUsed }} tokens
                    </span>
                  }
                </div>
                <span class="field-count-summary">
                  Result: <strong>{{ res.fields.length }}</strong> fields
                </span>
              </div>

              <div class="result-summary-box">
                <p class="mb-0 fw-semibold text-dark">
                  <i class="fa-solid fa-wand-magic-sparkles text-primary me-1"></i>
                  {{ res.summaryOfChanges }}
                </p>
              </div>

              <!-- Preview Fields List -->
              <div class="preview-fields-container">
                <div class="preview-fields-title">Updated Form Fields Structure:</div>
                <div class="preview-fields-list">
                  @for (field of res.fields; track field.fieldKey) {
                    <div class="preview-field-item" [class.new-field]="isNewField(field.fieldKey)">
                      <div class="field-type-pill">{{ field.fieldType }}</div>
                      <div class="field-label-text">
                        {{ field.label }}
                        @if (field.isRequired) {
                          <span class="text-danger">*</span>
                        }
                      </div>
                      @if (isNewField(field.fieldKey)) {
                        <span class="badge-new-field">NEW</span>
                      }
                    </div>
                  }
                </div>
              </div>

              <!-- Actions inside card -->
              <div class="result-actions">
                <button
                  type="button"
                  class="btn btn-outline-secondary btn-sm"
                  (click)="lastResult.set(null)"
                >
                  <i class="fa-solid fa-rotate-left me-1"></i> Discard
                </button>
                <button
                  type="button"
                  class="btn btn-success btn-sm btn-apply"
                  (click)="onApply()"
                >
                  <i class="fa-solid fa-check me-1"></i> Apply to Form Canvas
                </button>
              </div>
            </div>
          }
        </div>

        <!-- Sticky Footer (Always Visible at bottom of dialog) -->
        <div class="ai-modal-footer">
          <div class="footer-left">
            @if (lastResult(); as res) {
              <div class="pending-badge-box">
                <i class="fa-solid fa-circle-check text-success fs-5 me-2"></i>
                <div>
                  <div class="fw-bold text-dark" style="font-size: 0.85rem;">
                    Ready to Apply: {{ res.fields.length }} fields
                  </div>
                  <div class="text-muted small" style="font-size: 0.74rem;">
                    Click "Apply Changes to Canvas" to commit changes.
                  </div>
                </div>
              </div>
            } @else {
              <div class="footer-note">
                <i class="fa-solid fa-clock-rotate-left me-1 text-primary"></i>
                Undo/Redo supported: <kbd>Ctrl+Z</kbd> anytime on canvas.
              </div>
            }
          </div>
          <div class="footer-actions">
            <button type="button" class="btn btn-outline-secondary" (click)="close.emit()">
              {{ lastResult() ? 'Cancel' : 'Close' }}
            </button>
            @if (lastResult()) {
              <button
                type="button"
                class="btn btn-success btn-apply-primary"
                (click)="onApply()"
              >
                <i class="fa-solid fa-circle-check me-1"></i>
                Apply Changes to Canvas
              </button>
            }
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .ai-modal-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(15, 23, 42, 0.65);
      backdrop-filter: blur(5px);
      z-index: 2000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
      animation: fadeIn 0.15s ease-out;
    }

    .ai-modal-sheet {
      background: #ffffff;
      border-radius: 16px;
      width: 100%;
      max-width: 720px;
      max-height: 90vh;
      display: flex;
      flex-direction: column;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05);
      overflow: hidden;
      animation: scaleUp 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .ai-modal-header {
      padding: 1.5rem 1.75rem 1rem;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 1px solid #f1f5f9;
      position: relative;
    }

    .badge-ai-pill {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      padding: 0.2rem 0.6rem;
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
      color: #fff;
      font-size: 0.72rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      border-radius: 9999px;
      margin-bottom: 0.4rem;
    }

    .header-titles h3 {
      font-size: 1.25rem;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 0.25rem;
    }

    .header-titles p {
      font-size: 0.85rem;
      margin-bottom: 0;
    }

    .btn-close-modal {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #64748b;
      cursor: pointer;
      transition: all 0.15s ease;
    }
    .btn-close-modal:hover {
      background: #e2e8f0;
      color: #0f172a;
    }

    .ai-modal-body {
      padding: 1.25rem 1.75rem;
      overflow-y: auto;
      flex: 1;
    }

    .context-bar {
      display: flex;
      gap: 1.25rem;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 0.6rem 1rem;
      margin-bottom: 1.25rem;
      font-size: 0.82rem;
      color: #475569;
    }

    .prompt-box-wrapper {
      position: relative;
    }

    .input-container {
      position: relative;
      display: flex;
      align-items: flex-end;
    }

    .ai-textarea {
      resize: vertical;
      font-size: 0.92rem;
      padding: 0.75rem 3.5rem 0.75rem 0.85rem;
      border-radius: 10px;
      border: 1.5px solid #cbd5e1;
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    .ai-textarea:focus {
      border-color: #6366f1;
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
    }

    .btn-send-ai {
      position: absolute;
      right: 8px;
      bottom: 8px;
      background: linear-gradient(135deg, #6366f1, #4f46e5);
      color: white;
      border: none;
      width: 38px;
      height: 38px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: transform 0.1s, opacity 0.2s;
    }
    .btn-send-ai:hover:not(:disabled) {
      transform: scale(1.05);
    }
    .btn-send-ai:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .input-hint {
      display: flex;
      justify-content: space-between;
      margin-top: 0.35rem;
    }

    kbd {
      background: #e2e8f0;
      color: #334155;
      border-radius: 4px;
      padding: 0.1rem 0.3rem;
      font-size: 0.75rem;
    }

    .suggestions-section {
      margin-top: 1.15rem;
    }

    .suggestions-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.45rem;
    }

    .suggestions-label {
      font-size: 0.76rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #334155;
      display: flex;
      align-items: center;
    }

    .badge-zero-tokens {
      font-size: 0.7rem;
      font-weight: 600;
      color: #059669;
      background: #ecfdf5;
      padding: 0.15rem 0.5rem;
      border-radius: 9999px;
      border: 1px solid #a7f3d0;
    }

    .chips-row {
      display: flex;
      flex-wrap: wrap;
      gap: 0.45rem;
    }

    .chip-btn {
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      border-radius: 20px;
      padding: 0.35rem 0.75rem;
      font-size: 0.8rem;
      font-weight: 500;
      color: #334155;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      transition: all 0.15s ease;
    }
    .chip-btn:hover:not(:disabled) {
      background: #e0e7ff;
      border-color: #818cf8;
      color: #3730a3;
      transform: translateY(-1px);
    }

    .chip-zero-badge {
      font-size: 0.65rem;
      font-weight: 700;
      color: #059669;
      background: #d1fae5;
      padding: 0.1rem 0.35rem;
      border-radius: 9999px;
      margin-left: 0.4rem;
    }

    .ai-working-card {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      background: #f8fafc;
      border: 1.5px dashed #c7d2fe;
      border-radius: 12px;
    }

    .ai-spinner-box {
      width: 48px;
      height: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #eef2ff;
      border-radius: 10px;
    }

    .ai-working-text h6 {
      margin-bottom: 0.2rem;
      font-size: 0.95rem;
      font-weight: 600;
      color: #1e1b4b;
    }

    .result-card {
      background: #f8fafc;
      border: 1.5px solid #cbd5e1;
      border-radius: 12px;
      padding: 1.25rem;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
    }

    .result-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.75rem;
    }

    .result-badge-success {
      background: #dcfce7;
      color: #15803d;
      font-size: 0.78rem;
      font-weight: 700;
      padding: 0.2rem 0.55rem;
      border-radius: 6px;
    }

    .badge-local {
      background: #ecfdf5;
      color: #059669;
      border: 1px solid #a7f3d0;
      font-size: 0.75rem;
      font-weight: 700;
      padding: 0.2rem 0.55rem;
      border-radius: 6px;
      display: inline-flex;
      align-items: center;
    }

    .badge-cached {
      background: #dbeafe;
      color: #1d4ed8;
      border: 1px solid #bfdbfe;
      font-size: 0.75rem;
      font-weight: 700;
      padding: 0.2rem 0.55rem;
      border-radius: 6px;
      display: inline-flex;
      align-items: center;
    }

    .badge-tokens {
      background: #fef3c7;
      color: #b45309;
      border: 1px solid #fde68a;
      font-size: 0.75rem;
      font-weight: 700;
      padding: 0.2rem 0.55rem;
      border-radius: 6px;
      display: inline-flex;
      align-items: center;
    }

    .field-count-summary {
      font-size: 0.82rem;
      color: #64748b;
    }

    .result-summary-box {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 0.75rem 1rem;
      margin-bottom: 1rem;
    }

    .preview-fields-container {
      margin-bottom: 1rem;
    }

    .preview-fields-title {
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #64748b;
      margin-bottom: 0.4rem;
    }

    .preview-fields-list {
      max-height: 200px;
      overflow-y: auto;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      background: #ffffff;
    }

    .preview-field-item {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      padding: 0.45rem 0.75rem;
      border-bottom: 1px solid #f1f5f9;
      font-size: 0.82rem;
    }
    .preview-field-item:last-child {
      border-bottom: none;
    }

    .preview-field-item.new-field {
      background: #f0fdf4;
    }

    .field-type-pill {
      font-size: 0.68rem;
      font-weight: 700;
      text-transform: uppercase;
      padding: 0.1rem 0.4rem;
      border-radius: 4px;
      background: #f1f5f9;
      color: #475569;
    }

    .field-label-text {
      flex: 1;
      font-weight: 500;
      color: #1e293b;
    }

    .badge-new-field {
      background: #22c55e;
      color: white;
      font-size: 0.65rem;
      font-weight: 700;
      padding: 0.1rem 0.35rem;
      border-radius: 4px;
    }

    .result-actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
    }

    .btn-apply {
      background: #16a34a;
      border-color: #16a34a;
      color: white;
      font-weight: 600;
      padding: 0.45rem 1rem;
    }
    .btn-apply:hover {
      background: #15803d;
      border-color: #15803d;
    }

    .ai-modal-footer {
      padding: 0.9rem 1.75rem;
      border-top: 1px solid #e2e8f0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #ffffff;
      flex-shrink: 0;
      box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.04);
      z-index: 10;
    }

    .footer-left {
      display: flex;
      align-items: center;
    }

    .pending-badge-box {
      display: flex;
      align-items: center;
    }

    .footer-actions {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .btn-apply-primary {
      background: linear-gradient(135deg, #16a34a, #15803d);
      border: none;
      color: white;
      font-weight: 600;
      font-size: 0.88rem;
      padding: 0.5rem 1.25rem;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(22, 163, 74, 0.25);
      transition: transform 0.1s, box-shadow 0.2s;
    }
    .btn-apply-primary:hover {
      background: linear-gradient(135deg, #15803d, #166534);
      box-shadow: 0 6px 16px rgba(22, 163, 74, 0.35);
      transform: translateY(-1px);
    }

    .footer-note {
      font-size: 0.78rem;
      color: #64748b;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes scaleUp {
      from { opacity: 0; transform: scale(0.96); }
      to { opacity: 1; transform: scale(1); }
    }
  `]
})
export class FormAiAssistantModalComponent {
  private readonly formGenService = inject(FormGenerationService);

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
        const filtered = updatedFields.filter(f => f.isRequired || f.fieldType === 'heading' || f.fieldType === 'paragraph');
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

    this.formGenService.modifyForm(req).subscribe({
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
      fieldType: f.fieldType as any,
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
