export interface AiModelInfo {
  id: number;
  providerId: number;
  modelCode: string;
  displayName: string;
  isActive: boolean;
  isDefault: boolean;
  sortOrder: number;
}

export interface CreateAiModelRequest {
  modelCode: string;
  displayName?: string | null;
  isDefault?: boolean | null;
  sortOrder?: number | null;
}

export interface AiProviderInfo {
  databaseId?: number;
  id: string;
  displayName: string;
  defaultBaseUrl: string;
  models?: AiModelInfo[];
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
