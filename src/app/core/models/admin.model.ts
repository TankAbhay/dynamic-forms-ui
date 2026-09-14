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
  createdAt: string;
}

export interface SystemLogStats {
  totalLogs: number;
  errorCount: number;
  warningCount: number;
  errorsLast24Hours: number;
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
  estimatedCostUsd: number;
  cachedTokens: number;
  cacheHitRatio: number;
  estimatedSavingsUsd: number;
}

export interface AiTokenUsageLogItem {
  id: number;
  tenantId?: number;
  userId?: number;
  requestType: string;
  model: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  isCached: boolean;
  durationMs: number;
  createdAt: string;
}

