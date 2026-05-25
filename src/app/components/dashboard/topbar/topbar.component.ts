import { Component, Input, Output, EventEmitter } from '@angular/core';
import { DashTab } from '../../../pages/dashboard/dashboard.component';

@Component({
  standalone: false,
  selector: 'app-topbar',
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.scss'],
})
export class TopbarComponent {
  @Input() activeTab: DashTab = 'overview';
  @Input() userEmail = 'admin';
  @Output() toggleSidebar = new EventEmitter<void>();
}
