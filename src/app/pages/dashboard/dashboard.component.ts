import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '@supabase/supabase-js';
import { Event as AppEvent } from 'src/app/core/models';
import { EventStateService } from 'src/app/core/services/event-state.service';
import { UserStateService } from 'src/app/core/services/user-state.service';
import { AuthService } from 'src/app/services/auth.service';
import { EventService } from 'src/app/services/event.service';

export type DashTab = 'overview' | 'guests' | 'gallery' | 'settings';

interface Guest {
  name: string;
  email: string;
  group: string;
  attending: 'yes' | 'no' | null;
  plusOne: boolean;
  plusOneName: string;
  food: string;
}

interface RecentRsvp {
  name: string;
  status: 'yes' | 'no';
  date: string;
  guests: number;
}

@Component({
  standalone: false,
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  user: User | null = null;
  activeTab: DashTab = 'overview';
  sidebarOpen = false;
  eventService = inject(EventService);
  userState = inject(UserStateService);
  eventStateService = inject(EventStateService);
  
  searchQuery = '';
  statusFilter: 'all' | 'yes' | 'no' | 'pending' = 'all';

  guests: Guest[] = [
    { name: 'Ana María López', email: 'ana@example.com', group: 'Familia López', attending: 'yes', plusOne: true, plusOneName: 'Juan López', food: 'Vegetariano' },
    { name: 'Carlos Méndez', email: 'carlos@example.com', group: 'Amigos', attending: 'no', plusOne: false, plusOneName: '', food: '' },
    { name: 'Lucía Fernández', email: 'lucia@example.com', group: 'Familia Fernández', attending: null, plusOne: false, plusOneName: '', food: '' },
    { name: 'Pedro Rojas', email: 'pedro@example.com', group: 'Amigos', attending: 'yes', plusOne: true, plusOneName: 'Carmen Rojas', food: 'Sin gluten' },
    { name: 'María Torres', email: 'maria@example.com', group: 'Compañeros trabajo', attending: null, plusOne: false, plusOneName: '', food: '' },
    { name: 'José Gutiérrez', email: 'jose@example.com', group: 'Familia Gutiérrez', attending: 'yes', plusOne: false, plusOneName: '', food: '' },
    { name: 'Valentina Ríos', email: 'val@example.com', group: 'Amigas', attending: 'yes', plusOne: true, plusOneName: 'Mateo Ríos', food: 'Vegano' },
    { name: 'Santiago Paz', email: 'santi@example.com', group: 'Familia Paz', attending: null, plusOne: false, plusOneName: '', food: '' },
    { name: 'Gabriela Molina', email: 'gaby@example.com', group: 'Amigas', attending: 'yes', plusOne: true, plusOneName: 'Andrés Molina', food: 'Vegetariano' },
    { name: 'Fernando Campos', email: 'fer@example.com', group: 'Amigos', attending: null, plusOne: false, plusOneName: '', food: '' },
    { name: 'Isabel Arteaga', email: 'isa@example.com', group: 'Familia Arteaga', attending: 'yes', plusOne: false, plusOneName: '', food: 'Sin lactosa' },
    { name: 'Ricardo Delgado', email: 'richi@example.com', group: 'Compañeros trabajo', attending: 'no', plusOne: false, plusOneName: '', food: '' },
  ];

  recentRsvps: RecentRsvp[] = [
    { name: 'Ana María López', status: 'yes', date: 'Hace 2 días', guests: 2 },
    { name: 'Carlos Méndez', status: 'no', date: 'Hace 3 días', guests: 1 },
    { name: 'Pedro Rojas', status: 'yes', date: 'Hace 4 días', guests: 2 },
    { name: 'Valentina Ríos', status: 'yes', date: 'Hace 5 días', guests: 2 },
    { name: 'Isabel Arteaga', status: 'yes', date: 'Hace 6 días', guests: 1 },
  ];

  eventSettings !: AppEvent;

  tempPhotos: string[] = [];

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  async ngOnInit() {
    await this.auth.init()
    this.user = this.userState.user();
    const events = await this.eventService.getByUserId(this.userState?.user()?.id || "");
    this.userState.setCurrentEventId(events[0]?.id || null);
    this.eventStateService.setEvents(events);
    this.eventStateService.selectEvent(this.userState.currentEventId() || null);
    this.eventSettings = this.eventStateService.currentEvent() as AppEvent;
  }

  async onLogout() {
    await this.auth.logout();
    this.router.navigate(['/login']);
  }

  setTab(tab: DashTab) {
    this.activeTab = tab;
    this.sidebarOpen = false;
  }

  get stats() {
    const total = this.guests.length;
    const confirmed = this.guests.filter(g => g.attending === 'yes').length;
    const declined = this.guests.filter(g => g.attending === 'no').length;
    const pending = total - confirmed - declined;
    const confirmedPct = total ? Math.round((confirmed / total) * 100) : 0;
    const totalGuests = this.guests.reduce((acc, g) => acc + (g.attending === 'yes' && g.plusOne ? 2 : 1), 0);
    const confirmedGuests = this.guests.filter(g => g.attending === 'yes').reduce((acc, g) => acc + (g.plusOne ? 2 : 1), 0);
    return { total, confirmed, declined, pending, confirmedPct, totalGuests, confirmedGuests };
  }

  get userEmailDisplay(): string {
    return this.user?.email?.split('@')[0] || 'admin';
  }

  openSheet() {
    window.open('https://docs.google.com/spreadsheets', '_blank');
  }

  onFileSelected(domEvent: Event) {
    const input = domEvent.target as HTMLInputElement;
    if (!input.files) return;
    Array.from(input.files).slice(0, 12).forEach(f => {
      this.tempPhotos.push(URL.createObjectURL(f));
    });
    input.value = '';
  }

  removePhoto(index: number) {
    URL.revokeObjectURL(this.tempPhotos[index]);
    this.tempPhotos.splice(index, 1);
  }

  saveSettings(settings: AppEvent) {
    this.eventSettings = settings;
  }
}
