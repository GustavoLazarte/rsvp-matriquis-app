import { Component, Input, Output, EventEmitter } from '@angular/core';
import { DashTab } from '../../../pages/dashboard/dashboard.component';
import { Event } from 'src/app/core/models';

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
  @Input() eventSettings!: Event;
  @Input() stats!: Stats;
  @Input() recentRsvps: RecentRsvp[] = [];

  @Output() setTab = new EventEmitter<DashTab>();

  getInitials(name: string): string {
    const parts = name.split(' ');
    return (parts[0]?.charAt(0) || '') + (parts[1]?.charAt(0) || '');
  }

  formatDate(iso: string): string {
    if (!iso) return '';
    const d = new Date(iso);
    const months = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
    return `${d.getDate()} de ${months[d.getMonth()]}, ${d.getFullYear()}`;
  }

  formatTime(iso: string): string {
    if (!iso) return '';
    const d = new Date(iso);
    return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')} hs`;
  }

  formatDeadline(iso: string | null): string {
    if (!iso) return '';
    return iso.slice(0, 10);
  }
}
