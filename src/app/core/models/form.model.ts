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
  | 'paragraph'
  | (string & {});

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
  statusId?: number;
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
  id?: number;
  type: FieldType;
  fieldTypeCode?: string;
  label: string;
  icon: string;
  description?: string;
  defaultLabel?: string;
  defaultPlaceholder?: string;
  hasOptions?: boolean;
  category?: string;
  sortOrder?: number;
  isActive?: boolean;
  isSystem?: boolean;
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
  accessToken?: string;
}

export interface ShareFormPayload {
  accessType: 'Public' | 'Restricted' | 'Private';
  allowedEmails?: string;
  collaboratorEmails?: string;
}

export interface FormPaletteConfigItem extends ComponentPaletteItem {
  labelKey?: string;
  descKey?: string;
}

export interface CreateFieldTypePayload {
  fieldTypeCode?: string;
  type?: string;
  label: string;
  labelKey?: string;
  icon: string;
  description?: string;
  descKey?: string;
  defaultLabel?: string;
  defaultPlaceholder?: string;
  hasOptions?: boolean;
  category?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface UpdateFieldTypePayload {
  label: string;
  labelKey?: string;
  icon: string;
  description?: string;
  descKey?: string;
  defaultLabel?: string;
  defaultPlaceholder?: string;
  hasOptions?: boolean;
  category?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface FormBuilderSnapshot {
  title: string;
  description: string;
  category: string;
  isActive: boolean;
  fields: DynamicFormField[];
  selectedFieldIndex: number;
}

export interface FormSharingConfig {
  accessType: 'Public' | 'Restricted' | 'Private';
  allowedEmails: string;
  collaboratorEmails: string;
}

export interface CreateDraftPayload {
  changeLogSummary?: string;
  fields?: DynamicFormField[];
}

export interface PublishDraftPayload {
  expectedRowVersion?: string;
}

export interface FormOperationResult {
  success: boolean;
  message: string;
}

export interface FormSubmissionResult {
  success: boolean;
  submissionId: number;
  message: string;
}

export interface FormAccessLinkResult {
  success: boolean;
  emailDelivered: boolean;
  message: string;
  accessUrl?: string;
}

export interface FormAccessValidationResult {
  valid: boolean;
  email: string;
  message: string;
}

export interface ResolveAccessLinkResult {
  success: boolean;
  formId: number;
  shareCode: string;
  formTitle?: string;
  targetPath?: string;
  message?: string;
}
