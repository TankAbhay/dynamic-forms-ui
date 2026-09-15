export interface UserSession {
  id: number;
  email: string;
  name: string;
  roleId?: number;
  role: string;
  token: string;
}

export interface ApiErrorResponse {
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
  isEmailUnverified?: boolean;
  email?: string;
}

export interface LoginPayload {
  email: string;
  password?: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  message: string;
  emailDelivered?: boolean;
  verificationUrl?: string;
}

export interface ForgotPasswordResponse {
  message: string;
  emailDelivered?: boolean;
  resetUrl?: string;
}

export interface ResetPasswordPayload {
  token: string;
  newPassword: string;
}

export interface AuthOperationResponse {
  message: string;
}

export interface GoogleCredentialResponse {
  credential?: string;
  select_by?: string;
}

export interface GoogleRenderButtonOptions {
  type?: 'standard' | 'icon';
  theme?: 'outline' | 'filled_blue' | 'filled_black';
  size?: 'large' | 'medium' | 'small';
  text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
  shape?: 'rectangular' | 'pill' | 'circle' | 'square';
  logo_alignment?: 'left' | 'center';
  width?: number;
}

export interface GoogleAccountsId {
  initialize(config: {
    client_id: string;
    callback: (response: GoogleCredentialResponse) => void;
    error_callback?: (error: unknown) => void;
  }): void;
  renderButton(parent: HTMLElement, options: GoogleRenderButtonOptions): void;
  disableAutoSelect(): void;
}

export interface GoogleGlobal {
  accounts?: {
    id?: GoogleAccountsId;
  };
}

declare global {
  interface Window {
    google?: GoogleGlobal;
  }
}
