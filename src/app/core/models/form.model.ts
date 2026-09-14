export type FieldType = 
  | 'text'
  | 'textarea'
  | 'number'
  | 'checkbox'
  | 'radio'
  | 'select'
  | 'date'
  | 'email'
  | 'heading'
  | 'paragraph';

export interface DynamicFormField {
  id?: number;
  formId?: number;
  formVersionId?: number;
  fieldKey: string;
  fieldType: FieldType;
  label: string;
  placeholder?: string;
  helpText?: string;
  isRequired: boolean;
  defaultValue?: string;
  optionsJson?: string;
  validationJson?: string;
  options?: string[];
  sortOrder: number;
}

export interface DynamicFormVersion {
  id: number;
  formId: number;
  versionNumber: number;
  status: 'Draft' | 'Published' | 'Archived';
  changeLogSummary?: string;
  publishedAt?: string;
  publishedByEmployeeId?: number;
  publishedByName?: string;
  createdAt: string;
  rowVersionBase64?: string;
  fieldCount: number;
}

export interface DynamicForm {
  id: number;
  createdByEmployeeId: number;
  createdByName?: string;
  title: string;
  description?: string;
  category: string;
  isActive: boolean;
  accessType?: 'Public' | 'Restricted' | 'Private';
  shareCode?: string;
  allowedEmails?: string;
  collaboratorEmails?: string;
  createdAt: string;
  updatedAt: string;
  fieldCount: number;
  submissionCount: number;
  hasPublishedVersion?: boolean;
  publishedVersionNumber?: number;
  latestVersionStatus?: string;
  permissionLevelId?: number;
  permissionLevel?: 'Owner' | 'Editor' | 'Viewer';
  permissionLevelName?: string;
}

export interface DynamicFormDetail {
  form: DynamicForm;
  publishedVersion?: DynamicFormVersion;
  draftVersion?: DynamicFormVersion;
  fields: DynamicFormField[];
}

export interface DynamicFormVersionDetail {
  form: DynamicForm;
  version: DynamicFormVersion;
  fields: DynamicFormField[];
}

export interface CreateFormPayload {
  title: string;
  description?: string;
  category: string;
  isActive: boolean;
  fields: DynamicFormField[];
}

export interface UpdateFormPayload {
  title: string;
  description?: string;
  category: string;
  isActive: boolean;
  fields: DynamicFormField[];
}

export interface UpdateDraftPayload {
  title?: string;
  description?: string;
  category?: string;
  changeLogSummary?: string;
  expectedRowVersion: string;
  fields: DynamicFormField[];
}

export type FormFieldValue = string | number | boolean | string[] | null | undefined;
export type FormResponseData = Record<string, FormFieldValue>;

export interface SubmitFormPayload {
  formVersionId?: number;
  responseData: FormResponseData;
}

export interface FormSubmission {
  id: number;
  formId: number;
  formVersionId?: number;
  versionNumber?: number;
  formTitle?: string;
  submittedByEmployeeId: number;
  submittedByName?: string;
  submittedByEmail?: string;
  submittedAt: string;
  responseDataJson: string;
  responseData?: FormResponseData;
}

export interface KeysetPagedResult<T> {
  items: T[];
  nextCursor?: string | null;
  hasMore: boolean;
  pageSize: number;
}

export type PagedResult<T> = KeysetPagedResult<T>;

export interface ComponentPaletteItem {
  type: FieldType;
  label: string;
  icon: string;
  description: string;
  defaultLabel: string;
  defaultPlaceholder?: string;
  hasOptions?: boolean;
}

export interface PublicForm {
  id: number;
  title: string;
  description?: string;
  category: string;
  accessType: 'Public' | 'Restricted' | 'Private';
  shareCode: string;
  requiresLogin: boolean;
  allowedEmailsList: string[];
  fields: DynamicFormField[];
}

export interface PublicSubmissionPayload {
  responseDataJson: string;
  submitterName?: string;
  submitterEmail?: string;
}

export interface ShareFormPayload {
  accessType: 'Public' | 'Restricted' | 'Private';
  allowedEmails?: string;
  collaboratorEmails?: string;
}
