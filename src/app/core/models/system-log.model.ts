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

export interface LogFilterOptions {
  page?: number;
  pageSize?: number;
  logLevel?: string;
  search?: string;
}
