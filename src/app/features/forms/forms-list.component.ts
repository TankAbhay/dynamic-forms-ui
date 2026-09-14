import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { FormService } from '../../core/services/form.service';
import { AuthService } from '../../core/services/auth.service';
import { ConfirmDialogService } from '../../core/services/confirm-dialog.service';
import { TranslationService } from '../../core/services/translation.service';
import { TranslatePipe } from '../../core/pipes/translate.pipe';
import { DynamicForm, CreateFormPayload } from '../../core/models/form.model';

@Component({
  selector: 'app-forms-list',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './forms-list.component.html',
  styleUrls: ['./forms-list.component.scss']
})

export class FormsListComponent implements OnInit {
  private readonly formService = inject(FormService);
  private readonly authService = inject(AuthService);
  private readonly dialogService = inject(ConfirmDialogService);
  readonly i18n = inject(TranslationService);
  private readonly router = inject(Router);

  forms = signal<DynamicForm[]>([]);
  loading = signal<boolean>(true);
  searchQuery = signal<string>('');
  selectedCategory = signal<string>('All');
  viewMode = signal<'grid' | 'table'>('grid');
  errorMessage = signal<string>('');
  successMessage = signal<string>('');

  readonly session = this.authService.session;

  readonly categories = computed(() => {
    const list = this.forms().map(f => f.category || 'General');
    return ['All', ...Array.from(new Set(list))];
  });

  readonly filteredForms = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const cat = this.selectedCategory();

    return this.forms().filter(f => {
      const matchCat = cat === 'All' || f.category === cat;
      const matchQuery = !query || 
        f.title.toLowerCase().includes(query) || 
        (f.description && f.description.toLowerCase().includes(query));
      return matchCat && matchQuery;
    });
  });

  readonly totalSubmissions = computed(() => {
    return this.forms().reduce((acc, f) => acc + (f.submissionCount || 0), 0);
  });

  readonly activeFormsCount = computed(() => {
    return this.forms().filter(f => f.isActive).length;
  });

  ngOnInit(): void {
    this.loadForms();
  }

  loadForms(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.formService.getForms(true).subscribe({
      next: (data) => {
        this.forms.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.errorMessage.set(err?.error?.message || 'Failed to load forms.');
        this.loading.set(false);
      }
    });
  }

  openCreateWithAi(): void {
    this.router.navigate(['/forms/create-with-ai']);
  }

  openCreate(): void {
    this.router.navigate(['/forms/builder']);
  }

  openEdit(formId: number): void {
    this.router.navigate(['/forms/builder', formId]);
  }

  openFill(formId: number): void {
    this.router.navigate(['/forms/view', formId]);
  }

  openSubmissions(formId: number): void {
    this.router.navigate(['/forms/submissions', formId]);
  }

  async deleteForm(form: DynamicForm, event: Event): Promise<void> {
    event.stopPropagation();
    const confirmed = await this.dialogService.danger(
      'Delete Form?',
      `Are you sure you want to delete form "${form.title}"?\nAll associated submissions and versions will also be permanently deleted.`,
      'Delete Form'
    );
    if (!confirmed) {
      return;
    }

    this.formService.deleteForm(form.id).subscribe({
      next: () => {
        this.successMessage.set(`Form "${form.title}" deleted.`);
        setTimeout(() => this.successMessage.set(''), 3000);
        this.loadForms();
      },
      error: (err) => {
        this.errorMessage.set(err?.error?.message || 'Failed to delete form.');
      }
    });
  }

  duplicateForm(form: DynamicForm, event: Event): void {
    event.stopPropagation();
    this.loading.set(true);
    this.formService.getFormById(form.id).subscribe({
      next: (detail) => {
        const payload: CreateFormPayload = {
          title: `${detail.form.title} (Copy)`,
          description: detail.form.description || '',
          category: detail.form.category || 'General',
          isActive: detail.form.isActive,
          fields: (detail.fields || []).map((f, i) => ({
            fieldKey: f.fieldKey ? `${f.fieldKey}_copy` : `field_${Date.now()}_${i + 1}`,
            fieldType: f.fieldType,
            label: f.label,
            placeholder: f.placeholder,
            helpText: f.helpText,
            isRequired: f.isRequired,
            options: f.options ? [...f.options] : [],
            sortOrder: i + 1,
            defaultValue: f.defaultValue
          }))
        };
        this.formService.createForm(payload).subscribe({
          next: () => {
            this.successMessage.set(`Duplicated "${form.title}" successfully.`);
            setTimeout(() => this.successMessage.set(''), 3500);
            this.loadForms();
          },
          error: (err) => {
            this.loading.set(false);
            this.errorMessage.set(err?.error?.message || 'Failed to duplicate form.');
          }
        });
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(err?.error?.message || 'Failed to load form details for duplication.');
      }
    });
  }
}
