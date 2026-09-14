import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormService } from '../../core/services/form.service';
import { FormSubmissionService } from '../../core/services/form-submission.service';
import { DynamicForm, DynamicFormField, FormSubmission } from '../../core/models/form.model';

@Component({
  selector: 'app-form-submissions',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './form-submissions.component.html',
  styleUrls: ['./form-submissions.component.scss']
})
export class FormSubmissionsComponent implements OnInit {
  private readonly formService = inject(FormService);
  private readonly submissionService = inject(FormSubmissionService, { optional: true }) ?? this.formService;
  private readonly route = inject(ActivatedRoute);

  formId = signal<number>(0);
  form = signal<DynamicForm | null>(null);
  fields = signal<DynamicFormField[]>([]);
  submissions = signal<FormSubmission[]>([]);

  // Keyset Cursor Pagination
  nextCursor = signal<string | null>(null);
  hasMore = signal<boolean>(false);
  loadingMore = signal<boolean>(false);
  readonly pageSize = 25;

  searchQuery = signal<string>('');
  loading = signal<boolean>(true);
  exportingCsv = signal<boolean>(false);
  errorMessage = signal<string>('');

  // Selected submission modal
  selectedSubmission = signal<FormSubmission | null>(null);

  readonly inputFields = computed(() => {
    return this.fields().filter(f => f.fieldType !== 'heading' && f.fieldType !== 'paragraph');
  });

  readonly filteredSubmissions = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) return this.submissions();

    return this.submissions().filter(s => {
      const matchSubmitter = (s.submittedByName && s.submittedByName.toLowerCase().includes(q)) ||
        (s.submittedByEmail && s.submittedByEmail.toLowerCase().includes(q));
      
      const matchAnswers = s.responseDataJson && s.responseDataJson.toLowerCase().includes(q);
      return matchSubmitter || matchAnswers;
    });
  });

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const id = parseInt(idParam, 10);
      if (!isNaN(id)) {
        this.formId.set(id);
        this.loadData(id);
      }
    }
  }

  loadData(id: number): void {
    this.loading.set(true);
    this.errorMessage.set('');

    // 1. Load Form & Fields
    this.formService.getFormById(id).subscribe({
      next: (detail) => {
        this.form.set(detail.form);
        this.fields.set(detail.fields || []);

        // 2. Load Submissions via Keyset Cursor Pagination
        this.submissionService.getSubmissionsPaged(id, this.pageSize, null).subscribe({
          next: (res) => {
            const items = (res.items || []).map(item => this.normalizeSubmission(item));
            this.submissions.set(items);
            this.nextCursor.set(res.nextCursor || null);
            this.hasMore.set(res.hasMore);
            this.loading.set(false);
          },
          error: (err) => {
            this.errorMessage.set(err?.error?.message || 'Failed to load submissions.');
            this.loading.set(false);
          }
        });
      },
      error: (err) => {
        this.errorMessage.set(err?.error?.message || 'Failed to load form details.');
        this.loading.set(false);
      }
    });
  }

  loadMore(): void {
    const cursor = this.nextCursor();
    const id = this.formId();
    if (!id || !cursor || this.loadingMore() || !this.hasMore()) return;

    this.loadingMore.set(true);
    this.submissionService.getSubmissionsPaged(id, this.pageSize, cursor).subscribe({
      next: (res) => {
        const items = (res.items || []).map(item => this.normalizeSubmission(item));
        this.submissions.update(prev => [...prev, ...items]);
        this.nextCursor.set(res.nextCursor || null);
        this.hasMore.set(res.hasMore);
        this.loadingMore.set(false);
      },
      error: (err) => {
        this.errorMessage.set(err?.error?.message || 'Failed to load more submissions.');
        this.loadingMore.set(false);
      }
    });
  }

  getAnswer(submission: FormSubmission, fieldKey: string): string {
    if (!submission) return '-';
    let data = submission.responseData;
    if (!data && submission.responseDataJson) {
      try {
        data = JSON.parse(submission.responseDataJson);
        submission.responseData = data;
      } catch {
        return '-';
      }
    }
    if (!data) return '-';
    const val = data[fieldKey];
    if (val === undefined || val === null || val === '') return '-';
    if (typeof val === 'boolean') return val ? 'Yes' : 'No';
    if (Array.isArray(val)) return val.length > 0 ? val.join(', ') : '-';
    if (typeof val === 'object') {
      try {
        return JSON.stringify(val);
      } catch {
        return String(val);
      }
    }
    return String(val);
  }

  private normalizeSubmission(item: FormSubmission): FormSubmission {
    if (!item.responseData && item.responseDataJson) {
      try {
        item.responseData = JSON.parse(item.responseDataJson);
      } catch {
        item.responseData = {};
      }
    }
    if (!item.submittedByName && item.submittedByEmail) {
      item.submittedByName = item.submittedByEmail;
    }
    return item;
  }

  viewDetails(sub: FormSubmission): void {
    this.selectedSubmission.set(sub);
  }

  closeDetails(): void {
    this.selectedSubmission.set(null);
  }

  exportCsv(): void {
    const id = this.formId();
    if (!id || this.exportingCsv()) return;

    this.exportingCsv.set(true);
    this.errorMessage.set('');

    this.submissionService.exportSubmissionsCsv(id).subscribe({
      next: (blob) => {
        this.exportingCsv.set(false);
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const sanitizedTitle = (this.form()?.title || 'form').replace(/[^a-zA-Z0-9_-]/g, '_');
        a.download = `${sanitizedTitle}_submissions.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      },
      error: () => {
        this.exportingCsv.set(false);
        this.errorMessage.set('Failed to download CSV export from server.');
      }
    });
  }
}
