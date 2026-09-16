import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminService } from '../../../../core/services/admin.service';

@Component({
  selector: 'app-admin-nav-tabs',
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-nav-tabs.component.html',
  styleUrl: './admin-nav-tabs.component.scss'
})
export class AdminNavTabsComponent {
  readonly adminService = inject(AdminService);
}
