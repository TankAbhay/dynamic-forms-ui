import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'forms',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login.component').then((m) => m.LoginComponent),
    title: 'Sign In - Dynamic Forms',
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/register.component').then((m) => m.RegisterComponent),
    title: 'Create Account - Dynamic Forms',
  },
  {
    path: 'verify-email',
    loadComponent: () =>
      import('./features/auth/verify-email.component').then((m) => m.VerifyEmailComponent),
    title: 'Verify Email - Dynamic Forms',
  },
  {
    path: 'forgot-password',
    loadComponent: () =>
      import('./features/auth/forgot-password.component').then((m) => m.ForgotPasswordComponent),
    title: 'Forgot Password - Dynamic Forms',
  },
  {
    path: 'reset-password',
    loadComponent: () =>
      import('./features/auth/reset-password.component').then((m) => m.ResetPasswordComponent),
    title: 'Reset Password - Dynamic Forms',
  },
  {
    path: 'redirect',
    loadComponent: () =>
      import('./features/redirect/redirect.component').then((m) => m.RedirectComponent),
    title: 'Redirecting - Dynamic Forms',
  },
  {
    path: 'p/:shareCode',
    loadComponent: () =>
      import('./features/forms/form-renderer.component').then((m) => m.FormRendererComponent),
    title: 'Fill Form - Dynamic Forms',
  },
  {
    path: 'public/:shareCode',
    loadComponent: () =>
      import('./features/forms/form-renderer.component').then((m) => m.FormRendererComponent),
    title: 'Fill Form - Dynamic Forms',
  },
  {
    path: 'forms',
    loadComponent: () =>
      import('./features/forms/forms-list.component').then((m) => m.FormsListComponent),
    canActivate: [authGuard],
    title: 'Dynamic Forms Management',
  },
  {
    path: 'forms/create-with-ai',
    loadComponent: () =>
      import('./features/forms/create-with-ai/create-with-ai.component').then(
        (m) => m.CreateWithAiComponent
      ),
    canActivate: [authGuard],
    title: 'Create Form with AI - Dynamic Forms',
  },
  {
    path: 'forms/builder',
    loadComponent: () =>
      import('./features/forms/form-builder.component').then((m) => m.FormBuilderComponent),
    canActivate: [authGuard],
    title: 'Create Form - Dynamic Forms',
  },
  {
    path: 'forms/builder/:id',
    loadComponent: () =>
      import('./features/forms/form-builder.component').then((m) => m.FormBuilderComponent),
    canActivate: [authGuard],
    title: 'Edit Form - Dynamic Forms',
  },
  {
    path: 'forms/view/:id',
    loadComponent: () =>
      import('./features/forms/form-renderer.component').then((m) => m.FormRendererComponent),
    canActivate: [authGuard],
    title: 'Fill Form - Dynamic Forms',
  },
  {
    path: 'forms/submissions/:id',
    loadComponent: () =>
      import('./features/forms/form-submissions.component').then((m) => m.FormSubmissionsComponent),
    canActivate: [authGuard],
    title: 'Form Submissions - Dynamic Forms',
  },
  {
    path: 'admin',
    loadComponent: () =>
      import('./features/admin/admin-users.component').then((m) => m.AdminUsersComponent),
    canActivate: [authGuard, adminGuard],
    title: 'Platform Administration - Dynamic Forms',
  },
  {
    path: 'admin/users',
    redirectTo: 'admin',
    pathMatch: 'full',
  },
  {
    path: 'admin/logs',
    loadComponent: () =>
      import('./features/admin/admin-logs.component').then((m) => m.AdminLogsComponent),
    canActivate: [authGuard, adminGuard],
    title: 'System & Error Logs - Dynamic Forms',
  },
  {
    path: 'admin/ai-tokens',
    loadComponent: () =>
      import('./features/admin/admin-ai-tokens.component').then((m) => m.AdminAiTokensComponent),
    canActivate: [authGuard, adminGuard],
    title: 'AI Token Usage Analytics - Dynamic Forms',
  },
  {
    path: '**',
    redirectTo: 'forms',
  },
];
