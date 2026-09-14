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

