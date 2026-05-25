import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/services/auth.service';
import { User } from '@supabase/supabase-js';

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

  eventSettings = {
    date: '13 de Septiembre, 2026',
    time: '15:00 hs',
    venue: 'Huerto de los Olivos by El Portal',
    address: 'Cochabamba, Bolivia',
    adultsOnly: true,
    deadline: '2026-08-21',
    welcomeMessage: 'Nos llena de alegría compartir este día especial con ustedes. Los esperamos para celebrar juntos.',
    musicLink: 'https://open.spotify.com/playlist/...',
    giftsLink: '',
    instagram: '@marielle_y_alejandro',
  };

  tempPhotos: string[] = [];

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  async ngOnInit() {
    this.user = await this.auth.getUser();
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

  get filteredGuests(): Guest[] {
    let list = this.guests;
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      list = list.filter(g =>
        g.name.toLowerCase().includes(q) ||
        g.email.toLowerCase().includes(q) ||
        g.group.toLowerCase().includes(q)
      );
    }
    if (this.statusFilter === 'yes') list = list.filter(g => g.attending === 'yes');
    else if (this.statusFilter === 'no') list = list.filter(g => g.attending === 'no');
    else if (this.statusFilter === 'pending') list = list.filter(g => g.attending === null);
    return list;
  }

  get confirmedCount() {
    return this.guests.filter(g => g.attending === 'yes').length;
  }

  get userEmailDisplay(): string {
    return this.user?.email?.split('@')[0] || 'admin';
  }

  getInitials(name: string): string {
    const parts = name.split(' ');
    return (parts[0]?.charAt(0) || '') + (parts[1]?.charAt(0) || '');
  }

  setStatusFilter(filter: 'all' | 'yes' | 'no' | 'pending') {
    this.statusFilter = filter;
  }

  openSheet() {
    window.open('https://docs.google.com/spreadsheets', '_blank');
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
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

  saveSettings() {
    alert('Configuración guardada');
  }
}
