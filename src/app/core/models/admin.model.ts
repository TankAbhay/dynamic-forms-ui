export interface AdminUser {
  id: number;
  email: string;
  name: string;
  roleId: number;
  role: string;
  roleName?: string;
  isEmailVerified: boolean;
  authProvider: 'Google' | 'Password';
  createdAt: string;
  updatedAt: string;
  totalForms: number;
  totalSubmissions: number;
}

export interface SystemLog {
  id: number;
  logLevel: 'Error' | 'Warning' | 'Information' | 'Debug';
  message: string;
  exception?: string | null;
  source?: string | null;
  requestPath?: string | null;
  requestMethod?: string | null;
  statusCode?: number | null;
  traceId?: string | null;
  userId?: number | null;
  userEmail?: string | null;
  clientIp?: string | null;
  isRead?: boolean;
  readAt?: string | null;
  createdAt: string;
}

export interface SystemLogStats {
  totalLogs: number;
  errorCount: number;
  warningCount: number;
  errorsLast24Hours: number;
  unreadErrorCount: number;
}

export interface PagedLogsResult {
  totalCount: number;
  page: number;
  pageSize: number;
  items: SystemLog[];
}

export interface AiTokenUsageSummary {
  totalTokensConsumed: number;
  totalRequests: number;
  totalPromptTokens?: number;
  totalCompletionTokens?: number;
  estimatedCostUsd: number;
  cachedTokens: number;
  cacheHitRatio: number;
  cacheHitRatioPercentage?: number;
  estimatedSavingsUsd: number;
}

export interface AiProviderInfo {
  id: string;
  displayName: string;
  defaultBaseUrl: string;
  recommendedModels: string[];
}

export interface AiConfiguration {
  provider: string;
  model: string;
  apiKeyMasked: string;
  isConfigured: boolean;
  keyLength: number;
  baseUrl: string;
  temperature: number;
  timeoutSeconds: number;
  updatedAt?: string | null;
  availableProviders: AiProviderInfo[];
}

export interface UpdateAiConfigRequest {
  provider: string;
  model: string;
  apiKey?: string | null;
  baseUrl?: string | null;
  temperature?: number | null;
  timeoutSeconds?: number | null;
}

export interface TestAiConnectionRequest {
  provider?: string | null;
  model?: string | null;
  apiKey?: string | null;
  baseUrl?: string | null;
}

export interface TestAiConnectionResult {
  success: boolean;
  latencyMs: number;
  message: string;
  provider: string;
  model: string;
  sampleResponse?: string | null;
}

export interface AiTokenUsageLogItem {
  id: number;
  userId?: number;
  userEmail?: string;
  userFullName?: string;
  requestType: string;
  provider?: string;
  model: string;
  promptPreview?: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  estimatedCostUsd?: number;
  isCached: boolean;
  durationMs: number;
  createdAt: string;
}

export interface UserTokenUsageSummary {
  userId?: number;
  userEmail: string;
  userFullName: string;
  totalRequests: number;
  totalPromptTokens: number;
  totalCompletionTokens: number;
  totalTokensConsumed: number;
  totalTokens: number;
  estimatedCostUsd: number;
  lastUsedAt?: string;
}

export interface FieldTypeCodeMaster {
  id: number;
  code: string;
  name: string;
  defaultIcon: string;
  defaultCategory: string;
  defaultLabel: string;
  defaultPlaceholder?: string;
  hasOptions: boolean;
  description?: string;
  sortOrder: number;
}

export interface UserRoleUpdateResult {
  success: boolean;
  roleId: number;
  role: string;
  message: string;
}

export interface AdminOperationResult {
  success: boolean;
  message: string;
}

export interface LogFilterOptions {
  page?: number;
  pageSize?: number;
  logLevel?: string;
  search?: string;
}

export interface ApiDataResponse<T> {
  success: boolean;
  data: T;
}

export interface EmailConfigDto {
  host: string;
  port: number;
  username: string;
  passwordMasked: string;
  isPasswordConfigured: boolean;
  fromEmail: string;
  fromName: string;
  enableSsl: boolean;
  updatedAt?: string | null;
}

export interface UpdateEmailConfigRequest {
  host?: string | null;
  port?: number | null;
  username?: string | null;
  password?: string | null;
  fromEmail?: string | null;
  fromName?: string | null;
  enableSsl?: boolean | null;
}

export interface TestEmailConnectionRequest {
  host?: string | null;
  port?: number | null;
  username?: string | null;
  password?: string | null;
  enableSsl?: boolean | null;
  targetEmail?: string | null;
}

export interface TestEmailConnectionResult {
  success: boolean;
  latencyMs: number;
  message: string;
  host: string;
  port: number;
}

