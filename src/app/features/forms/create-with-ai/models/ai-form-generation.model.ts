import { FieldType } from '../../../../core/models/form.model';

export interface DirectGenerateFormRequest {
  prompt: string;
}

export interface GuidedStartRequest {
  prompt: string;
}

export interface GuidedQuestionDto {
  id: string;
  question: string;
  helpText?: string;
  inputType: 'radio' | 'checkbox' | 'text';
  options: string[];
  allowOther?: boolean;
}

export interface GuidedStartResponse {
  prompt: string;
  inferredCategory: string;
  questions: GuidedQuestionDto[];
}

export interface GuidedAnswerDto {
  questionId: string;
  selectedOptions: string[];
  customAnswer?: string;
}

export interface GuidedGenerateFormRequest {
  originalPrompt: string;
  inferredCategory?: string;
  answers: GuidedAnswerDto[];
}

export interface GeneratedFormFieldDto {
  fieldKey: string;
  fieldType: FieldType;
  label: string;
  placeholder?: string;
  helpText?: string;
  isRequired: boolean;
  defaultValue?: string;
  options?: string[];
  sortOrder: number;
}

export interface GeneratedFormResultDto {
  title: string;
  description: string;
  category: string;
  summary?: string;
  summaryRationale?: string;
  fields: GeneratedFormFieldDto[];
}

export interface PromptExampleItem {
  id: string;
  title: string;
  category: string;
  badge: string;
  icon: string;
  prompt: string;
}

export interface ExistingFormFieldDto {
  fieldKey: string;
  fieldType: FieldType;
  label: string;
  placeholder?: string;
  helpText?: string;
  isRequired: boolean;
  defaultValue?: string;
  options?: string[];
  sortOrder: number;
}

export interface ModifyFormWithAiRequest {
  instruction: string;
  formTitle?: string;
  formDescription?: string;
  category?: string;
  existingFields: ExistingFormFieldDto[];
}

export interface ModifyFormWithAiResponse {
  success: boolean;
  summaryOfChanges: string;
  formTitle?: string;
  formDescription?: string;
  category?: string;
  fields: GeneratedFormFieldDto[];
  tokensUsed: number;
  isCached: boolean;
}
