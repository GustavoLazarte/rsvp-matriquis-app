import { Component, Input, Output, EventEmitter } from '@angular/core';
import { DashTab } from '../../../pages/dashboard/dashboard.component';

interface EventSettings {
  date: string;
  time: string;
  venue: string;
  address: string;
  adultsOnly: boolean;
  deadline: string;
  welcomeMessage: string;
  musicLink: string;
  giftsLink: string;
  instagram: string;
}

interface RecentRsvp {
  name: string;
  status: 'yes' | 'no';
  date: string;
  guests: number;
}

interface Stats {
  total: number;
  confirmed: number;
  declined: number;
  pending: number;
  confirmedPct: number;
  totalGuests: number;
  confirmedGuests: number;
}

@Component({
  standalone: false,
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss'],
})
export class OverviewComponent {
  @Input() userEmailDisplay = 'admin';
  @Input() eventSettings!: EventSettings;
  @Input() stats!: Stats;
  @Input() recentRsvps: RecentRsvp[] = [];

  @Output() setTab = new EventEmitter<DashTab>();
  @Output() openSheet = new EventEmitter<void>();

  getInitials(name: string): string {
    const parts = name.split(' ');
    return (parts[0]?.charAt(0) || '') + (parts[1]?.charAt(0) || '');
  }
}
