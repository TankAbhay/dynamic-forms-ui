import '@angular/compiler';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { of } from 'rxjs';
import { AdminService } from './admin.service';
import { HttpClient } from '@angular/common/http';
import { Injector, runInInjectionContext } from '@angular/core';

describe('AdminService', () => {
  let service: AdminService;
  let httpMock: {
    get: ReturnType<typeof vi.fn>;
    post: ReturnType<typeof vi.fn>;
    put: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    httpMock = {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn()
    };

    const injector = Injector.create({
      providers: [
        { provide: HttpClient, useValue: httpMock }
      ]
    });

    service = runInInjectionContext(injector, () => new AdminService());
  });

  it('should get users from admin endpoint', () => {
    const mockUsers = [{ id: 1, email: 'admin@example.com', name: 'Admin', roleId: 2, role: 'Admin' }];
    httpMock.get.mockReturnValue(of(mockUsers));

    service.getUsers().subscribe(users => {
      expect(users).toEqual(mockUsers);
    });

    expect(httpMock.get).toHaveBeenCalledWith(expect.stringContaining('/admin/users'));
  });

  it('should update unreadLogsCount signal on getLogStats', () => {
    const mockStats = {
      totalLogs: 10,
      errorCount: 3,
      warningCount: 2,
      errorsLast24Hours: 1,
      unreadErrorCount: 5
    };
    httpMock.get.mockReturnValue(of(mockStats));

    service.getLogStats().subscribe();

    expect(service.unreadLogsCount()).toBe(5);
  });

  it('should decrement unreadLogsCount signal on markLogAsRead', () => {
    service.unreadLogsCount.set(4);
    httpMock.post.mockReturnValue(of({ success: true, rowsUpdated: 1 }));

    service.markLogAsRead(10).subscribe();

    expect(service.unreadLogsCount()).toBe(3);
  });

  it('should reset unreadLogsCount to 0 on markAllLogsAsRead', () => {
    service.unreadLogsCount.set(12);
    httpMock.post.mockReturnValue(of({ success: true, rowsUpdated: 12 }));

    service.markAllLogsAsRead().subscribe();

    expect(service.unreadLogsCount()).toBe(0);
  });
});
