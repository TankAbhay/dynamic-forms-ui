export interface AiTokenUsageSummary {
  totalTokensConsumed?: number;
  totalTokens?: number;
  totalRequests: number;
  totalPromptTokens?: number;
  promptTokens?: number;
  totalCompletionTokens?: number;
  completionTokens?: number;
  estimatedCostUsd: number;
  cachedTokens?: number;
  cachedRequests?: number;
  cachedPromptTokens?: number;
  cacheHitRatio: number;
  cacheHitRatioPercentage?: number;
  estimatedSavingsUsd: number;
  lastUsedAt?: string;
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
  totalPromptTokens?: number;
  promptTokens?: number;
  totalCompletionTokens?: number;
  completionTokens?: number;
  totalTokensConsumed?: number;
  totalTokens: number;
  estimatedCostUsd: number;
  lastUsedAt?: string;
}
