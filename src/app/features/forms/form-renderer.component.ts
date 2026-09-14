import { Component, OnInit, AfterViewInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormService } from '../../core/services/form.service';
import { PublicFormService } from '../../core/services/public-form.service';
import { FormSubmissionService } from '../../core/services/form-submission.service';
import { AuthService } from '../../core/services/auth.service';
import { TranslationService } from '../../core/services/translation.service';
import { TranslatePipe } from '../../core/pipes/translate.pipe';
import { DynamicForm, DynamicFormField, FormResponseData } from '../../core/models/form.model';

@Component({
  selector: 'app-form-renderer',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TranslatePipe],
  templateUrl: './form-renderer.component.html',
  styleUrls: ['./form-renderer.component.scss']
})
export class FormRendererComponent implements OnInit, AfterViewInit {
  private readonly formService = inject(FormService);
  private readonly publicFormService = inject(PublicFormService, { optional: true }) ?? this.formService;
  private readonly submissionService = inject(FormSubmissionService, { optional: true }) ?? this.formService;
  private readonly authService = inject(AuthService);
  readonly i18n = inject(TranslationService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  formId = signal<number>(0);
  formVersionId = signal<number | null>(null);
  versionNumber = signal<number | null>(null);
  form = signal<DynamicForm | null>(null);
  fields = signal<DynamicFormField[]>([]);
  formData = signal<FormResponseData>({});

  // Public Direct Access & Sharing
  isPublicMode = signal<boolean>(false);
  shareCode = signal<string>('');
  accessType = signal<'Public' | 'Restricted' | 'Private'>('Public');
  allowedEmailsList = signal<string[]>([]);
  submitterName = signal<string>('');
  submitterEmail = signal<string>('');
  isEmailAuthorized = signal<boolean>(true);

  // Restricted Access Link / Token State
  verificationStage = signal<'email-input' | 'link-sent' | 'verifying-token' | 'verified'>('email-input');
  accessEmailInput = signal<string>('');
  accessToken = signal<string | null>(null);
  isSendingLink = signal<boolean>(false);
  linkSentMessage = signal<string>('');
  googleSignInAvailable = signal<boolean>(false);

  isPublished = signal<boolean>(false);
  isTestMode = signal<boolean>(false);
  testValidationPassed = signal<boolean>(false);
  testValidationMessage = signal<string>('');

  loading = signal<boolean>(true);
  submitting = signal<boolean>(false);
  submitted = signal<boolean>(false);
  submissionId = signal<number | null>(null);
  errorMessage = signal<string>('');
  validationErrors = signal<Record<string, string>>({});

  ngOnInit(): void {
    const shareCodeParam = this.route.snapshot.paramMap.get('shareCode');
    const idParam = this.route.snapshot.paramMap.get('id');

    if (shareCodeParam) {
      this.isPublicMode.set(true);
      this.shareCode.set(shareCodeParam);
      this.loadPublicForm(shareCodeParam);
    } else if (idParam) {
      const id = parseInt(idParam, 10);
      if (!isNaN(id)) {
        this.formId.set(id);
        this.loadForm(id);
      }
    }
  }

  loadForm(id: number): void {
    this.loading.set(true);
    this.errorMessage.set('');
    this.testValidationPassed.set(false);
    this.testValidationMessage.set('');

    this.formService.getFormById(id).subscribe({
      next: (detail) => {
        this.form.set(detail.form);

        if (detail.publishedVersion) {
          // Normal published submission mode
          this.isPublished.set(true);
          this.isTestMode.set(false);
          this.formVersionId.set(detail.publishedVersion.id);
          this.versionNumber.set(detail.publishedVersion.versionNumber);
          this.fields.set(detail.fields || []);
        } else if (detail.draftVersion) {
          // Unpublished draft: Interactive Test & Validation Mode
          this.isPublished.set(false);
          this.isTestMode.set(true);
          this.formVersionId.set(detail.draftVersion.id);
          this.versionNumber.set(detail.draftVersion.versionNumber);
          this.fields.set(detail.fields || []);
        } else {
          // Fallback fields
          this.isPublished.set(false);
          this.isTestMode.set(true);
          this.fields.set(detail.fields || []);
        }

        // Initialize form model values
        const initialData: FormResponseData = {};
        for (const field of this.fields()) {
          if (field.fieldType === 'heading' || field.fieldType === 'paragraph') continue;
          if (field.defaultValue !== undefined && field.defaultValue !== null && field.defaultValue !== '') {
            initialData[field.fieldKey] = field.fieldType === 'checkbox' ? (field.defaultValue === 'true') : field.defaultValue;
          } else if (field.fieldType === 'checkbox') {
            initialData[field.fieldKey] = false;
          } else {
            initialData[field.fieldKey] = '';
          }
        }
        this.formData.set(initialData);
        this.loading.set(false);
      },
      error: (err) => {
        this.errorMessage.set(err?.error?.message || 'Failed to load form.');
        this.loading.set(false);
      }
    });
  }

  ngAfterViewInit(): void {
    if (this.authService.isGoogleSignInSupported()) {
      this.googleSignInAvailable.set(true);
      setTimeout(() => this.tryInitGoogleBtn(), 150);
    }
  }

  private tryInitGoogleBtn(): void {
    if (typeof document !== 'undefined' && document.getElementById('restrictedGoogleBtn')) {
      this.authService.initGoogleSignIn('restrictedGoogleBtn', () => {
        const session = this.authService.session();
        if (session?.email) {
          this.submitterEmail.set(session.email);
          this.submitterName.set(session.name);
          this.checkEmailAuthorization();
          if (!this.isEmailAuthorized()) {
            this.errorMessage.set(`Sorry, "${session.email}" is not authorized to submit this restricted form. Please contact the form creator.`);
            this.verificationStage.set('email-input');
          } else {
            this.verificationStage.set('verified');
          }
        }
      });
    }
  }

  loadPublicForm(code: string): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.formService.getPublicForm(code).subscribe({
      next: (pubForm) => {
        this.form.set({
          id: pubForm.id,
          createdByEmployeeId: 1,
          title: pubForm.title,
          description: pubForm.description,
          category: pubForm.category,
          isActive: true,
          accessType: pubForm.accessType,
          shareCode: pubForm.shareCode,
          fieldCount: pubForm.fields.length,
          submissionCount: 0,
          createdAt: '',
          updatedAt: ''
        });
        this.formId.set(pubForm.id);
        this.accessType.set(pubForm.accessType);
        this.allowedEmailsList.set(pubForm.allowedEmailsList || []);
        this.fields.set(pubForm.fields || []);
        this.isPublished.set(true);
        this.isTestMode.set(false);

        const initialData: FormResponseData = {};
        for (const field of this.fields()) {
          if (field.fieldType === 'heading' || field.fieldType === 'paragraph') continue;
          if (field.defaultValue !== undefined && field.defaultValue !== null && field.defaultValue !== '') {
            initialData[field.fieldKey] = field.fieldType === 'checkbox' ? (field.defaultValue === 'true') : field.defaultValue;
          } else if (field.fieldType === 'checkbox') {
            initialData[field.fieldKey] = false;
          } else {
            initialData[field.fieldKey] = '';
          }
        }
        this.formData.set(initialData);

        if (pubForm.accessType === 'Restricted') {
          // 1. If user already has an active session with an authorized email:
          const currentEmail = this.authService.session()?.email;
          if (currentEmail && !currentEmail.includes('dynamicforms.local')) {
            this.submitterEmail.set(currentEmail);
            this.submitterName.set(this.authService.session()?.name || '');
            this.checkEmailAuthorization();
            if (this.isEmailAuthorized()) {
              this.verificationStage.set('verified');
              this.loading.set(false);
              return;
            }
          }

          // 2. If 'at' token is in URL:
          const atParam = this.route.snapshot.queryParamMap.get('at');
          if (atParam) {
            this.validateAccessLinkToken(pubForm.id, atParam);
            this.loading.set(false);
            return;
          }

          // 3. Otherwise user needs to enter email or sign in with Google:
          this.isEmailAuthorized.set(false);
          this.verificationStage.set('email-input');
          setTimeout(() => this.tryInitGoogleBtn(), 200);
        }

        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(err?.error?.message || 'This form does not exist or is not currently accepting submissions.');
      }
    });
  }

  checkEmailAuthorization(): void {
    if (this.accessType() !== 'Restricted') {
      this.isEmailAuthorized.set(true);
      return;
    }
    const email = this.submitterEmail().trim().toLowerCase();
    const list = this.allowedEmailsList().map(e => e.trim().toLowerCase());
    if (list.length === 0) {
      this.isEmailAuthorized.set(true);
      return;
    }
    this.isEmailAuthorized.set(!!email && list.includes(email));
  }

  sendAccessLink(): void {
    const email = this.accessEmailInput().trim().toLowerCase();
    if (!email) {
      this.errorMessage.set('Please enter your email address to receive an access link.');
      return;
    }

    this.isSendingLink.set(true);
    this.errorMessage.set('');

    this.formService.sendAccessLink(this.formId(), email).subscribe({
      next: (res) => {
        this.isSendingLink.set(false);
        this.linkSentMessage.set(res.message);
        this.verificationStage.set('link-sent');
      },
      error: (err) => {
        this.isSendingLink.set(false);
        this.errorMessage.set(err?.error?.message || 'Failed to send access link. Please verify your email or contact the form creator.');
      }
    });
  }

  validateAccessLinkToken(formId: number, token: string): void {
    this.verificationStage.set('verifying-token');
    this.errorMessage.set('');
    this.formService.validateAccessLink(formId, token).subscribe({
      next: (res) => {
        this.submitterEmail.set(res.email);
        this.accessToken.set(token);
        this.isEmailAuthorized.set(true);
        this.verificationStage.set('verified');
      },
      error: (err) => {
        this.isEmailAuthorized.set(false);
        this.verificationStage.set('email-input');
        this.errorMessage.set(err?.error?.message || 'The access link is invalid, expired, or has already been used. Please request a new access link.');
      }
    });
  }

  validate(): boolean {
    const errors: Record<string, string> = {};
    const data = this.formData();

    for (const field of this.fields()) {
      if (field.fieldType === 'heading' || field.fieldType === 'paragraph') continue;

      const val = data[field.fieldKey];

      if (field.isRequired) {
        if (val === undefined || val === null || (typeof val === 'string' && val.trim() === '') || (field.fieldType === 'checkbox' && !val)) {
          errors[field.fieldKey] = `${field.label} is required.`;
          continue;
        }
      }

      if (typeof val === 'string' && val.trim() !== '' && field.fieldType === 'email') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(val)) {
          errors[field.fieldKey] = 'Please enter a valid email address.';
        }
      }
    }

    this.validationErrors.set(errors);
    return Object.keys(errors).length === 0;
  }

  onSubmit(): void {
    this.errorMessage.set('');
    this.testValidationPassed.set(false);
    this.testValidationMessage.set('');

    if (!this.validate()) {
      this.errorMessage.set('Please fix the highlighted required fields before proceeding.');
      return;
    }

    if (this.isTestMode()) {
      // In Test Mode, verify validation rules without writing to the database
      this.testValidationPassed.set(true);
      this.testValidationMessage.set(
        'Validation Successful! All required fields, formats, and constraints are valid. (Draft Mode: Real submissions are disabled until the form is published).'
      );
      return;
    }

    if (this.isPublicMode()) {
      if (this.accessType() === 'Restricted') {
        this.checkEmailAuthorization();
        if (!this.isEmailAuthorized()) {
          this.errorMessage.set('You are not authorized to submit this form. Please verify your email.');
          return;
        }
      }

      this.submitting.set(true);
      this.formService.submitPublicForm(this.shareCode() || this.formId(), {
        responseDataJson: JSON.stringify(this.formData()),
        submitterName: this.submitterName().trim() || undefined,
        submitterEmail: this.submitterEmail().trim() || undefined,
        accessToken: this.accessToken() || undefined
      }).subscribe({
        next: (res) => {
          this.submitting.set(false);
          this.submitted.set(true);
          this.submissionId.set(res.submissionId);
        },
        error: (err) => {
          this.submitting.set(false);
          this.errorMessage.set(err?.error?.message || 'Failed to submit form.');
        }
      });
      return;
    }

    this.submitting.set(true);

    const payload = {
      formVersionId: this.formVersionId() ?? undefined,
      responseData: this.formData()
    };

    this.formService.submitForm(this.formId(), payload).subscribe({
      next: (res) => {
        this.submitting.set(false);
        this.submitted.set(true);
        this.submissionId.set(res.submissionId);
      },
      error: (err) => {
        this.submitting.set(false);
        this.errorMessage.set(err?.error?.message || 'Failed to submit form.');
      }
    });
  }

  resetForm(): void {
    const initialData: FormResponseData = {};
    for (const field of this.fields()) {
      if (field.fieldType === 'heading' || field.fieldType === 'paragraph') continue;
      initialData[field.fieldKey] = field.fieldType === 'checkbox' ? false : '';
    }
    this.formData.set(initialData);
    this.validationErrors.set({});
    this.submitted.set(false);
    this.testValidationPassed.set(false);
    this.testValidationMessage.set('');
    this.errorMessage.set('');
  }
}
