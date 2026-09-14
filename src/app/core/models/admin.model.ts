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
