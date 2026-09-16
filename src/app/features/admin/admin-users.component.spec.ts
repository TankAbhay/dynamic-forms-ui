import '@angular/compiler';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { of, throwError } from 'rxjs';
import { AdminUsersComponent } from './admin-users.component';
import { AdminService } from '../../core/services/admin.service';
import { AuthService } from '../../core/services/auth.service';
import { ConfirmDialogService } from '../../core/services/confirm-dialog.service';
import { Injector, runInInjectionContext } from '@angular/core';
import { AdminUser } from '../../core/models/admin.model';
import { DynamicForm } from '../../core/models/form.model';

describe('AdminUsersComponent', () => {
  let component: AdminUsersComponent;
  let adminServiceMock: any;
  let authServiceMock: any;
  let dialogServiceMock: any;

  const mockUsers: AdminUser[] = [
    {
      id: 1,
      name: 'Super Admin',
      email: 'admin@dynamicforms.com',
      role: 'Admin',
      roleId: 2,
      authProvider: 'Local',
      isEmailVerified: true,
      createdAt: '2026-01-01T00:00:00Z',
      totalForms: 5,
      totalSubmissions: 20
    },
    {
      id: 2,
      name: 'John Doe',
      email: 'john@gmail.com',
      role: 'User',
      roleId: 1,
      authProvider: 'Google',
      isEmailVerified: true,
      createdAt: '2026-02-01T00:00:00Z',
      totalForms: 2,
      totalSubmissions: 8
    }
  ];

  beforeEach(() => {
    adminServiceMock = {
      getUsers: vi.fn().mockReturnValue(of(mockUsers)),
      getUserForms: vi.fn().mockReturnValue(of([{ id: 10, title: 'Customer Feedback' } as DynamicForm])),
      updateUserRole: vi.fn().mockReturnValue(of({ success: true, roleId: 2, role: 'Admin', message: 'Role updated' })),
      deleteUser: vi.fn().mockReturnValue(of({ success: true, message: 'User deleted' })),
      loadUnreadLogsCount: vi.fn()
    };

    authServiceMock = {
      currentUser: vi.fn().mockReturnValue({ id: 1, name: 'Super Admin', email: 'admin@dynamicforms.com', role: 'Admin' }),
      isAdmin: vi.fn().mockReturnValue(true)
    };

    dialogServiceMock = {
      warning: vi.fn().mockResolvedValue(true),
      danger: vi.fn().mockResolvedValue(true),
      alert: vi.fn().mockResolvedValue(undefined)
    };

    const injector = Injector.create({
      providers: [
        { provide: AdminService, useValue: adminServiceMock },
        { provide: AuthService, useValue: authServiceMock },
        { provide: ConfirmDialogService, useValue: dialogServiceMock }
      ]
    });

    runInInjectionContext(injector, () => {
      component = new AdminUsersComponent();
    });
  });

  it('should initialize and load users on ngOnInit', () => {
    component.ngOnInit();

    expect(adminServiceMock.getUsers).toHaveBeenCalledTimes(1);
    expect(adminServiceMock.loadUnreadLogsCount).toHaveBeenCalledTimes(1);
    expect(component.users().length).toBe(2);
    expect(component.isLoading()).toBe(false);
  });

  it('should correctly calculate KPI signals', () => {
    component.users.set(mockUsers);

    expect(component.totalUsersCount()).toBe(2);
    expect(component.googleUsersCount()).toBe(1);
    expect(component.totalPlatformForms()).toBe(7);
    expect(component.totalPlatformSubmissions()).toBe(28);
  });

  it('should filter users by search query, provider, and role', () => {
    component.users.set(mockUsers);

    // Filter by name/email
    component.searchQuery.set('john');
    expect(component.filteredUsers().length).toBe(1);
    expect(component.filteredUsers()[0].name).toBe('John Doe');

    // Filter by provider
    component.searchQuery.set('');
    component.providerFilter.set('Google');
    expect(component.filteredUsers().length).toBe(1);
    expect(component.filteredUsers()[0].email).toBe('john@gmail.com');

    // Filter by role
    component.providerFilter.set('ALL');
    component.roleFilter.set('Admin');
    expect(component.filteredUsers().length).toBe(1);
    expect(component.filteredUsers()[0].name).toBe('Super Admin');
  });

  it('should open user forms modal and load user forms', () => {
    component.openUserForms(mockUsers[1]);

    expect(component.formsModalOpen()).toBe(true);
    expect(component.selectedUser()?.id).toBe(2);
    expect(adminServiceMock.getUserForms).toHaveBeenCalledWith(2);
    expect(component.userForms().length).toBe(1);
    expect(component.isFormsLoading()).toBe(false);
  });

  it('should close user forms modal and clear selection', () => {
    component.openUserForms(mockUsers[1]);
    component.closeFormsModal();

    expect(component.formsModalOpen()).toBe(false);
    expect(component.selectedUser()).toBeNull();
    expect(component.userForms().length).toBe(0);
  });

  it('should toggle user role when confirmed', async () => {
    component.users.set([...mockUsers]);
    const target = mockUsers[1]; // User role, id: 2

    await component.toggleUserRole(target);

    expect(dialogServiceMock.warning).toHaveBeenCalled();
    expect(adminServiceMock.updateUserRole).toHaveBeenCalledWith(2, 2, 'Admin');
    const updated = component.users().find(u => u.id === 2);
    expect(updated?.role).toBe('Admin');
    expect(component.successMessage()).toContain('John Doe');
  });

  it('should prevent user from deleting their own account', async () => {
    component.users.set(mockUsers);
    const self = mockUsers[0]; // Current user id: 1

    await component.deleteUser(self);

    expect(dialogServiceMock.alert).toHaveBeenCalled();
    expect(dialogServiceMock.danger).not.toHaveBeenCalled();
    expect(adminServiceMock.deleteUser).not.toHaveBeenCalled();
  });

  it('should delete other user when confirmed', async () => {
    component.users.set([...mockUsers]);
    const target = mockUsers[1]; // User id: 2

    await component.deleteUser(target);

    expect(dialogServiceMock.danger).toHaveBeenCalled();
    expect(adminServiceMock.deleteUser).toHaveBeenCalledWith(2);
    expect(component.users().length).toBe(1);
    expect(component.users().find(u => u.id === 2)).toBeUndefined();
  });

  it('should extract correct user initials', () => {
    expect(component.getUserInitials('Jane Smith')).toBe('JS');
    expect(component.getUserInitials('SingleName')).toBe('SI');
    expect(component.getUserInitials('')).toBe('U');
  });
});
