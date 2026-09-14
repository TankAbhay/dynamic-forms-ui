import { Component, inject, signal, computed } from '@angular/core';
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
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-with-ai.component.html',
  styleUrls: ['./create-with-ai.component.scss']
})
export class CreateWithAiComponent {
  private readonly formGenService = inject(FormGenerationService);
  private readonly router = inject(Router);

  // Active generation mode: 'guided' or 'direct'
  mode = signal<'guided' | 'direct'>('guided');

  // User's prompt input
  prompt = signal<string>('');

  // Guided flow stage: 'prompt' | 'questions' | 'result'
  guidedStage = signal<'prompt' | 'questions' | 'result'>('prompt');

  // Guided questions received from the AI engine
  guidedData = signal<GuidedStartResponse | null>(null);

  // User's answers for guided questions: questionId -> { selected: string[], custom: string }
  answersState = signal<Record<string, { selected: string[]; custom: string }>>({});

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

  setMode(newMode: 'guided' | 'direct'): void {
    if (this.loading()) return;
    this.mode.set(newMode);
    this.errorMessage.set('');
  }

  useExample(example: PromptExampleItem): void {
    if (this.loading()) return;
    this.prompt.set(example.prompt);
    this.errorMessage.set('');
    // Scroll smoothly to the prompt area
    if (typeof document !== 'undefined') {
      const promptEl = document.getElementById('ai-prompt-input');
      if (promptEl) {
        promptEl.focus();
        promptEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }

  // --- Direct Generation Flow ---
  generateDirect(): void {
    const text = this.prompt().trim();
    if (text.length < 5) {
      this.errorMessage.set('Please provide a brief description of the form you want to create (at least 5 characters).');
      return;
    }

    this.loading.set(true);
    this.loadingText.set('Synthesizing form structure, fields, and validations...');
    this.errorMessage.set('');

    this.formGenService.generateDirect({ prompt: text }).subscribe({
      next: (result) => {
        this.generatedResult.set(result);
        this.loading.set(false);
        this.guidedStage.set('result');
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(err?.error?.message || 'Failed to generate form. Please refine your prompt and try again.');
      }
    });
  }

  // --- Guided Generation Flow: Step 1 -> Fetch Questions ---
  startGuided(): void {
    const text = this.prompt().trim();
    if (text.length < 5) {
      this.errorMessage.set('Please provide a brief summary of what your form is for (at least 5 characters).');
      return;
    }

    this.loading.set(true);
    this.loadingText.set('Analyzing requirements and drafting clarifying questions...');
    this.errorMessage.set('');

    this.formGenService.startGuided({ prompt: text }).subscribe({
      next: (data) => {
        this.guidedData.set(data);
        // Initialize default answers state
        const initialAnswers: Record<string, { selected: string[]; custom: string }> = {};
        for (const q of data.questions) {
          initialAnswers[q.id] = {
            selected: q.options && q.options.length > 0 ? [q.options[0]] : [],
            custom: ''
          };
        }
        this.answersState.set(initialAnswers);
        this.guidedStage.set('questions');
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(err?.error?.message || 'Failed to start guided wizard. Please try again or switch to Direct Generation.');
      }
    });
  }

  // Toggle selection for radio / checkbox in guided questions
  toggleAnswerOption(question: GuidedQuestionDto, option: string): void {
    const current = { ...this.answersState() };
    const qState = current[question.id] || { selected: [], custom: '' };

    if (question.inputType === 'checkbox') {
      const idx = qState.selected.indexOf(option);
      if (idx >= 0) {
        qState.selected = qState.selected.filter(o => o !== option);
      } else {
        qState.selected = [...qState.selected, option];
      }
    } else {
      // radio or text
      qState.selected = [option];
    }

    current[question.id] = qState;
    this.answersState.set(current);
  }

  isOptionSelected(questionId: string, option: string): boolean {
    const qState = this.answersState()[questionId];
    return !!qState && qState.selected.includes(option);
  }

  updateCustomAnswer(questionId: string, customText: string): void {
    const current = { ...this.answersState() };
    const qState = current[questionId] || { selected: [], custom: '' };
    qState.custom = customText;
    current[questionId] = qState;
    this.answersState.set(current);
  }

  getCustomAnswer(questionId: string): string {
    return this.answersState()[questionId]?.custom || '';
  }

  // --- Guided Generation Flow: Step 2 -> Generate with Answers ---
  completeGuidedGeneration(): void {
    const data = this.guidedData();
    if (!data) return;

    const answersDto: GuidedAnswerDto[] = Object.entries(this.answersState()).map(([qId, val]) => ({
      questionId: qId,
      selectedOptions: val.selected,
      customAnswer: val.custom.trim() || undefined
    }));

    this.loading.set(true);
    this.loadingText.set('Crafting tailored fields, options, and layout based on your answers...');
    this.errorMessage.set('');

    this.formGenService.generateGuided({
      originalPrompt: data.prompt,
      inferredCategory: data.inferredCategory,
      answers: answersDto
    }).subscribe({
      next: (result) => {
        this.generatedResult.set(result);
        this.loading.set(false);
        this.guidedStage.set('result');
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(err?.error?.message || 'Failed to generate tailored form. Please review your answers and retry.');
      }
    });
  }

  backToPrompt(): void {
    this.guidedStage.set('prompt');
    this.errorMessage.set('');
  }

  startOver(): void {
    this.prompt.set('');
    this.guidedData.set(null);
    this.answersState.set({});
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
