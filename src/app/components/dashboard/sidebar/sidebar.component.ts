import { Component, Input, Output, EventEmitter } from '@angular/core';
import { DashTab } from '../../../pages/dashboard/dashboard.component';
import { User } from '@supabase/supabase-js';

@Component({
  standalone: false,
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent {
  @Input() user: User | null = null;
  @Input() activeTab: DashTab = 'overview';
  @Input() pendingCount = 0;
  @Input() sidebarOpen = false;

  @Output() setTab = new EventEmitter<DashTab>();
  @Output() logout = new EventEmitter<void>();
  @Output() closeSidebar = new EventEmitter<void>();
}
