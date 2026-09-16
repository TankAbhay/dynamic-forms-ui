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
