export interface AdminUser {
  id: number;
  email: string;
  name: string;
  role: string;
  isEmailVerified: boolean;
  authProvider: 'Google' | 'Password';
  createdAt: string;
  updatedAt: string;
  totalForms: number;
  totalSubmissions: number;
}
