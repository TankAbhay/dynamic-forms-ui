import { Component, inject, signal, computed, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { FormGenerationService } from './services/form-generation.service';
import {
  PromptExampleItem,
  GuidedStartResponse,
  GuidedQuestionDto,
  GuidedAnswerDto,
  GeneratedFormResultDto
} from './models/ai-form-generation.model';

@Component({
  selector: 'app-create-with-ai',
  imports: [CommonModule, FormsModule],
  templateUrl: './create-with-ai.component.html',
  styleUrl: './create-with-ai.component.scss'
})
export class CreateWithAiComponent {
  private readonly formGenService = inject(FormGenerationService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  // User's prompt input
  prompt = signal<string>('');

  // Flow stage: 'prompt' | 'result'
  guidedStage = signal<'prompt' | 'result'>('prompt');

  // Generated form result ready for review/handoff
  generatedResult = signal<GeneratedFormResultDto | null>(null);

  // UI state
  loading = signal<boolean>(false);
  loadingText = signal<string>('');
  errorMessage = signal<string>('');

  // Pre-configured practical examples
  readonly examples: PromptExampleItem[] = [
    {
      id: 'feedback',
      title: 'Customer Satisfaction Survey',
      category: 'Customer Support',
      badge: 'Popular',
      icon: 'fas fa-smile',
      prompt: 'A customer satisfaction survey with rating scale, product feedback, likelihood to recommend, and follow-up consent.'
    },
    {
      id: 'leave',
      title: 'Employee Leave Request',
      category: 'Human Resources',
      badge: 'HR / Internal',
      icon: 'fas fa-calendar-alt',
      prompt: 'An employee leave request form with leave type, start and end dates, reason, emergency contact number, and manager approval notes.'
    },
    {
      id: 'event',
      title: 'Annual Conference Registration',
      category: 'Events',
      badge: 'Registration',
      icon: 'fas fa-ticket-alt',
      prompt: 'An event registration form collecting full name, company, job title, dietary requirements, workshop preferences, and attendance mode.'
    },
    {
      id: 'job',
      title: 'Software Engineer Application',
      category: 'Recruitment',
      badge: 'Hiring',
      icon: 'fas fa-briefcase',
      prompt: 'A job application form for engineering candidates with full name, email, GitHub/portfolio link, years of experience, and expected salary.'
    },
    {
      id: 'contact',
      title: 'Business Inquiry & Contact',
      category: 'Sales & Contact',
      badge: 'Inquiry',
      icon: 'fas fa-envelope-open-text',
      prompt: 'A business inquiry form with contact name, company name, service of interest, urgency level, and project details.'
    }
  ];

  readonly isPromptValid = computed(() => {
    return this.prompt().trim().length >= 5;
  });

  useExample(example: PromptExampleItem): void {
    if (this.loading()) return;
    this.prompt.set(example.prompt);
    this.errorMessage.set('');
    if (typeof document !== 'undefined' && typeof document.getElementById === 'function') {
      const promptEl = document.getElementById('ai-prompt-input');
      if (promptEl) {
        promptEl.focus();
        promptEl.scrollIntoView?.({ behavior: 'smooth', block: 'center' });
      }
    }
  }

  // --- Instant AI Form Generation ---
  generateForm(): void {
    const text = this.prompt().trim();
    if (text.length < 5) {
      this.errorMessage.set('Please provide a brief description of the form you want to create (at least 5 characters).');
      return;
    }

    this.loading.set(true);
    this.loadingText.set('Synthesizing form structure, fields, and validations with AI...');
    this.errorMessage.set('');

    this.formGenService.generateDirect({ prompt: text })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
      next: (result) => {
        this.generatedResult.set(result);
        this.loading.set(false);
        this.guidedStage.set('result');
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(err?.error?.message || 'The AI system is currently facing issues. Please try again later or create your form manually in the Form Builder.');
      }
    });
  }

  // Direct manual navigation to Form Builder
  goToFormBuilder(): void {
    this.router.navigate(['/forms/builder']);
  }

  // Backward-compatibility alias
  generateDirect(): void {
    this.generateForm();
  }

  backToPrompt(): void {
    this.guidedStage.set('prompt');
    this.errorMessage.set('');
  }

  startOver(): void {
    this.prompt.set('');
    this.generatedResult.set(null);
    this.guidedStage.set('prompt');
    this.errorMessage.set('');
  }

  // --- Handoff to Form Builder ---
  openInFormBuilder(): void {
    const result = this.generatedResult();
    if (!result) return;

    // Navigate to Form Builder passing the AI generated form definition in history.state
    this.router.navigate(['/forms/builder'], {
      state: {
        aiGeneratedForm: {
          title: result.title,
          description: result.description,
          category: result.category,
          fields: result.fields
        }
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/forms']);
  }
}
