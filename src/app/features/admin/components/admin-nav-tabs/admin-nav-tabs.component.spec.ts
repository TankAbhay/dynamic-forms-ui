import '@angular/compiler';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AdminNavTabsComponent } from './admin-nav-tabs.component';
import { AdminService } from '../../../../core/services/admin.service';
import { Injector, runInInjectionContext, signal } from '@angular/core';

describe('AdminNavTabsComponent', () => {
  let component: AdminNavTabsComponent;
  let adminServiceMock: any;

  beforeEach(() => {
    adminServiceMock = {
      unreadLogsCount: signal(3)
    };

    const injector = Injector.create({
      providers: [
        { provide: AdminService, useValue: adminServiceMock }
      ]
    });

    runInInjectionContext(injector, () => {
      component = new AdminNavTabsComponent();
    });
  });

  it('should instantiate and read unreadLogsCount from AdminService', () => {
    expect(component).toBeTruthy();
    expect(component.adminService.unreadLogsCount()).toBe(3);
  });
});
