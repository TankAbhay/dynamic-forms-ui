import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PREBUILT_FORM_TEMPLATES, FormTemplate } from '../../config/form-templates.config';

@Component({
  selector: 'app-form-templates-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="templates-modal-backdrop" (click)="close.emit()">
      <div class="templates-modal-sheet" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <div class="header-titles">
            <h3><i class="fas fa-wand-magic-sparkles text-primary"></i> Pre-filled Starter Templates</h3>
            <p>Select a pre-built template with ready-made questions, pre-filled default values, and section structure.</p>
          </div>
          <button type="button" class="btn-close-modal" (click)="close.emit()" aria-label="Close">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="templates-grid">
          @for (tmpl of templates(); track tmpl.id) {
            <div class="template-card" (click)="selectTemplate.emit(tmpl)">
              <div class="tmpl-card-header">
                <span class="tmpl-badge">{{ tmpl.badge }}</span>
                <span class="tmpl-field-count">{{ tmpl.fields.length }} Fields</span>
              </div>
              <div class="tmpl-icon-box">
                <i [class]="tmpl.icon"></i>
              </div>
              <h4 class="tmpl-title">{{ tmpl.title }}</h4>
              <p class="tmpl-desc">{{ tmpl.description }}</p>

              <div class="tmpl-features">
                <div class="feature-item"><i class="fas fa-check text-success"></i> Pre-configured headings & fields</div>
                <div class="feature-item"><i class="fas fa-magic text-primary"></i> Ready-made pre-filled defaults</div>
              </div>

              <button type="button" class="btn-use-template">
                <span>Use This Template</span>
                <i class="fas fa-arrow-right"></i>
              </button>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .templates-modal-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(15, 23, 42, 0.65);
      backdrop-filter: blur(4px);
      z-index: 2000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
    }
    .templates-modal-sheet {
      background: #ffffff;
      border-radius: 16px;
      max-width: 900px;
      width: 100%;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      border: 1px solid #e2e8f0;
      animation: modalSlideUp 0.2s ease-out;
    }
    .modal-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      padding: 1.5rem;
      border-bottom: 1px solid #e2e8f0;
    }
    .header-titles h3 {
      font-size: 1.25rem;
      font-weight: 700;
      color: #0f172a;
      margin: 0 0 0.35rem 0;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .header-titles p {
      margin: 0;
      color: #64748b;
      font-size: 0.875rem;
    }
    .btn-close-modal {
      background: transparent;
      border: none;
      color: #94a3b8;
      font-size: 1.25rem;
      cursor: pointer;
      padding: 0.25rem;
      border-radius: 6px;
      transition: all 0.15s ease;
    }
    .btn-close-modal:hover {
      color: #0f172a;
      background: #f1f5f9;
    }
    .templates-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: 1.25rem;
      padding: 1.5rem;
    }
    .template-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 1.25rem;
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      flex-direction: column;
    }
    .template-card:hover {
      border-color: #3b82f6;
      box-shadow: 0 10px 25px -5px rgba(59, 130, 246, 0.15);
      transform: translateY(-2px);
    }
    .tmpl-card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 0.75rem;
    }
    .tmpl-badge {
      font-size: 0.7rem;
      font-weight: 700;
      text-transform: uppercase;
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
      background: #e0f2fe;
      color: #0369a1;
    }
    .tmpl-field-count {
      font-size: 0.75rem;
      color: #64748b;
      font-weight: 500;
    }
    .tmpl-icon-box {
      width: 44px;
      height: 44px;
      border-radius: 10px;
      background: #f8fafc;
      color: #3b82f6;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.25rem;
      margin-bottom: 0.75rem;
    }
    .tmpl-title {
      font-size: 1rem;
      font-weight: 700;
      color: #0f172a;
      margin: 0 0 0.4rem 0;
    }
    .tmpl-desc {
      font-size: 0.8rem;
      color: #64748b;
      line-height: 1.4;
      margin: 0 0 1rem 0;
      flex: 1;
    }
    .tmpl-features {
      margin-bottom: 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }
    .feature-item {
      font-size: 0.75rem;
      color: #475569;
      display: flex;
      align-items: center;
      gap: 0.4rem;
    }
    .btn-use-template {
      width: 100%;
      background: #f1f5f9;
      border: 1px solid #e2e8f0;
      color: #334155;
      font-weight: 600;
      font-size: 0.8rem;
      padding: 0.5rem;
      border-radius: 6px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.4rem;
      transition: all 0.15s ease;
    }
    .template-card:hover .btn-use-template {
      background: #3b82f6;
      color: #ffffff;
      border-color: #3b82f6;
    }
    @keyframes modalSlideUp {
      from { opacity: 0; transform: translateY(12px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class FormTemplatesModalComponent {
  readonly templates = input<FormTemplate[]>(PREBUILT_FORM_TEMPLATES);
  readonly selectTemplate = output<FormTemplate>();
  readonly close = output<void>();
}
