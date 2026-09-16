import { Component, OnInit, inject, signal, computed, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../core/services/admin.service';
import { AuthService } from '../../core/services/auth.service';
import { ConfirmDialogService } from '../../core/services/confirm-dialog.service';
import { AdminUser } from '../../core/models/admin.model';
import { DynamicForm } from '../../core/models/form.model';

import { AdminNavTabsComponent } from './components/admin-nav-tabs/admin-nav-tabs.component';

@Component({
  selector: 'app-admin-users',
  imports: [CommonModule, RouterModule, FormsModule, AdminNavTabsComponent],
  templateUrl: './admin-users.component.html',
  styleUrl: './admin-users.component.scss'
})
export class AdminUsersComponent implements OnInit {
  readonly adminService = inject(AdminService);
  private readonly dialogService = inject(ConfirmDialogService);
  private readonly destroyRef = inject(DestroyRef);
  readonly authService = inject(AuthService);

  readonly users = signal<AdminUser[]>([]);
  readonly isLoading = signal<boolean>(true);
  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);

  // Search & Filter state
  readonly searchQuery = signal<string>('');
  readonly providerFilter = signal<string>('ALL');
  readonly roleFilter = signal<string>('ALL');

  // Selected User Forms Drawer
  readonly selectedUser = signal<AdminUser | null>(null);
  readonly userForms = signal<DynamicForm[]>([]);
  readonly isFormsLoading = signal<boolean>(false);
  readonly formsModalOpen = signal<boolean>(false);

  // Role modification & user deletion loading state
  readonly updatingUserId = signal<number | null>(null);
  readonly deletingUserId = signal<number | null>(null);

  // Computed KPIs
  readonly totalUsersCount = computed(() => this.users().length);
  readonly googleUsersCount = computed(() => this.users().filter(u => u.authProvider === 'Google').length);
  readonly totalPlatformForms = computed(() => this.users().reduce((acc, u) => acc + (u.totalForms || 0), 0));
  readonly totalPlatformSubmissions = computed(() => this.users().reduce((acc, u) => acc + (u.totalSubmissions || 0), 0));

  // Filtered users
  readonly filteredUsers = computed(() => {
    let list = this.users();
    const query = this.searchQuery().trim().toLowerCase();
    const provider = this.providerFilter();
    const role = this.roleFilter();

    if (query) {
      list = list.filter(u => 
        u.name.toLowerCase().includes(query) || 
        u.email.toLowerCase().includes(query)
      );
    }

    if (provider !== 'ALL') {
      list = list.filter(u => u.authProvider === provider);
    }

    if (role !== 'ALL') {
      list = list.filter(u => u.role === role);
    }

    return list;
  });

  ngOnInit(): void {
    this.loadUsers();
    this.adminService.loadUnreadLogsCount();
  }

  loadUsers(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.adminService.getUsers()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.users.set(data);
          this.isLoading.set(false);
        },
        error: (err) => {
          this.errorMessage.set(err.error?.message || 'Failed to load user management list.');
          this.isLoading.set(false);
        }
      });
  }

  openUserForms(user: AdminUser): void {
    this.selectedUser.set(user);
    this.formsModalOpen.set(true);
    this.isFormsLoading.set(true);
    this.userForms.set([]);

    this.adminService.getUserForms(user.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (forms) => {
          this.userForms.set(forms);
          this.isFormsLoading.set(false);
        },
        error: (err) => {
          this.errorMessage.set(err.error?.message || `Failed to load forms for ${user.name}`);
          this.isFormsLoading.set(false);
        }
      });
  }

  closeFormsModal(): void {
    this.formsModalOpen.set(false);
    this.selectedUser.set(null);
    this.userForms.set([]);
  }

  async toggleUserRole(user: AdminUser): Promise<void> {
    const newRoleId = user.roleId === 2 ? 1 : 2; // 1=User, 2=Admin
    const newRole = newRoleId === 2 ? 'Admin' : 'User';
    const confirmText = newRoleId === 2
      ? `Are you sure you want to promote ${user.name} (${user.email}) to Administrator?`
      : `Are you sure you want to demote ${user.name} (${user.email}) to regular User?`;

    const confirmed = await this.dialogService.warning(
      newRoleId === 2 ? 'Promote to Administrator?' : 'Demote to User?',
      confirmText,
      newRoleId === 2 ? 'Promote User' : 'Demote User'
    );
    if (!confirmed) return;

    this.updatingUserId.set(user.id);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    this.adminService.updateUserRole(user.id, newRoleId, newRole)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.users.update(current => 
            current.map(u => u.id === user.id ? { ...u, roleId: res.roleId || newRoleId, role: res.role || newRole } : u)
          );
          this.successMessage.set(`Successfully updated ${user.name}'s role to ${res.role || newRole}.`);
          this.updatingUserId.set(null);

          // Auto dismiss alert
          setTimeout(() => this.successMessage.set(null), 4000);
        },
        error: (err) => {
          this.errorMessage.set(err.error?.message || 'Failed to update user role.');
          this.updatingUserId.set(null);
        }
      });
  }

  async deleteUser(user: AdminUser): Promise<void> {
    if (user.id === this.authService.currentUser()?.id) {
      await this.dialogService.alert(
        'You cannot delete your own administrator account while logged in.',
        'Action Not Allowed',
        'warning',
        'Understood'
      );
      return;
    }

    const confirmed = await this.dialogService.danger(
      'Permanently Delete User?',
      `Are you sure you want to permanently delete user "${user.name}" (${user.email})?\n\nThis will permanently remove their account, all forms they created, and all associated submissions. This action CANNOT be undone.`,
      'Delete User Permanently'
    );
    if (!confirmed) return;

    this.deletingUserId.set(user.id);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    this.adminService.deleteUser(user.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.users.update(current => current.filter(u => u.id !== user.id));
          this.successMessage.set(res.message || `User ${user.name} has been permanently deleted.`);
          this.deletingUserId.set(null);

          // Auto dismiss alert
          setTimeout(() => this.successMessage.set(null), 4000);
        },
        error: (err) => {
          this.errorMessage.set(err.error?.message || `Failed to delete user ${user.name}.`);
          this.deletingUserId.set(null);
        }
      });
  }

  getUserInitials(name: string): string {
    if (!name) return 'U';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }
}
