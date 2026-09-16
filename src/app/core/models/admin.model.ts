export interface AdminUser {
  id: number;
  email: string;
  name: string;
  roleId: number;
  role: string;
  roleName?: string;
  isEmailVerified: boolean;
  authProvider: 'Google' | 'Password' | 'Local' | string;
  createdAt: string;
  updatedAt?: string;
  totalForms: number;
  totalSubmissions: number;
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

export interface ApiDataResponse<T> {
  success: boolean;
  data: T;
}

// Re-export modular domain models for clean architecture & backward compatibility
export * from './ai-config.model';
export * from './ai-token-usage.model';
export * from './email-config.model';
export * from './system-log.model';
export * from './field-type.model';
