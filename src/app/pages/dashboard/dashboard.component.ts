import { Component, inject, OnInit, computed } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { User } from '@supabase/supabase-js';
import { Event as AppEvent } from 'src/app/core/models';
import { EventStateService } from 'src/app/core/services/event-state.service';
import { UserStateService } from 'src/app/core/services/user-state.service';
import { AuthService } from 'src/app/services/auth.service';
import { EventService } from 'src/app/services/event.service';
import { EventImageService } from 'src/app/services/event-image.service';
import { EventImageStateService } from 'src/app/core/services/event-image-state.service';
import { InvitationService } from 'src/app/services/invitation.service';
import { InvitationStateService } from 'src/app/core/services/invitation-state.service';
import { RsvpResponseService } from 'src/app/services/rsvp-response.service';
import { RsvpResponseStateService } from 'src/app/core/services/rsvp-response-state.service';

export type DashTab = 'overview' | 'guests' | 'gallery' | 'settings';

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
  eventImageService = inject(EventImageService);
  eventImageState = inject(EventImageStateService);
  invitationService = inject(InvitationService);
  invitationState = inject(InvitationStateService);
  rsvpResponseService = inject(RsvpResponseService);
  rsvpResponseState = inject(RsvpResponseStateService);
  private title = inject(Title);
  
  searchQuery = '';
  statusFilter: 'all' | 'yes' | 'no' | 'pending' = 'all';

  readonly invitations = this.invitationState.invitations;
  readonly responses = this.rsvpResponseState.responses;

  readonly recentRsvps = computed<RecentRsvp[]>(() => {
    const invMap = new Map(this.invitations().map(i => [i.id, i]));
    return this.responses().slice(0, 5).map(r => {
      const inv = invMap.get(r.invitation_id);
      const diff = Date.now() - new Date(r.responded_at).getTime();
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const dateStr = days === 0 ? 'Hoy' : days === 1 ? 'Ayer' : `Hace ${days} días`;
      return {
        name: inv?.guest_name || 'Invitado',
        status: r.attending === 'yes' ? 'yes' : 'no',
        date: dateStr,
        guests: r.guest_count,
      };
    });
  });

  readonly eventSettings = computed<AppEvent>(() => {
    return this.eventStateService.currentEvent() ?? ({} as AppEvent);
  });

  tempPhotos: string[] = [];

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  async ngOnInit() {
    await this.auth.init()
    this.user = this.userState.user();
    if (this.eventStateService.events().length === 0) {
      const events = await this.eventService.getByUserId(this.userState?.user()?.id || "");
      this.eventStateService.setEvents(events);
      this.eventStateService.selectEvent(events[0]?.id || null);
    }

    const ev = this.eventSettings();
    if (ev?.title) this.title.setTitle(`${ev.title} — Admin`);
    if (ev?.id) {
      await this.eventImageService.loadByEvent(ev.id);
      this.tempPhotos = this.eventImageState.images().map(img => img.url);
      await this.invitationService.loadByEvent(ev.id);
      await this.rsvpResponseService.loadByEvent(ev.id);
    }
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
    const total = this.invitations().length;
    const responded = this.responses();
    const confirmed = responded.filter(r => r.attending === 'yes').length;
    const declined = responded.filter(r => r.attending === 'no').length;
    const pending = total - confirmed - declined;
    const confirmedPct = total ? Math.round(((confirmed + declined) / total) * 100) : 0;
    const totalGuests = responded.filter(r => r.attending === 'yes').reduce((acc, r) => acc + r.guest_count, 0);
    return { total, confirmed, declined, pending, confirmedPct, totalGuests };
  }

  get userEmailDisplay(): string {
    return this.user?.email?.split('@')[0] || 'admin';
  }

  async onFileSelected(domEvent: Event) {
    const input = domEvent.target as HTMLInputElement;
    const ev = this.eventSettings();
    if (!input.files || !ev?.id) return;
    const files = Array.from(input.files).slice(0, 12);

    await this.eventImageService.uploadBatch(ev.id, files);
    this.tempPhotos = this.eventImageState.images().map(img => img.url);

    input.value = '';
  }

  async removePhoto(index: number) {
    const image = this.eventImageState.images()[index];
    if (!image) return;
    await this.eventImageService.remove(image.id);
    this.tempPhotos = this.eventImageState.images().map(img => img.url);
  }

  saveSettings(_settings: AppEvent) {
    // settings component already persists to Supabase + state
  }
}
