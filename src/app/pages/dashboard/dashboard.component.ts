import { Component, inject, OnInit, computed, signal } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { User } from '@supabase/supabase-js';
import { Event as AppEvent, AlbumImage } from 'src/app/core/models';
import { EventStateService } from 'src/app/core/services/event-state.service';
import { UserStateService } from 'src/app/core/services/user-state.service';
import { AuthService } from 'src/app/services/auth.service';
import { EventService } from 'src/app/services/event.service';
import { EventImageService } from 'src/app/services/event-image.service';
import { EventImageStateService } from 'src/app/core/services/event-image-state.service';
import { AlbumImageService } from 'src/app/services/album-image.service';
import { AlbumImageStateService } from 'src/app/core/services/album-image-state.service';
import { InvitationService } from 'src/app/services/invitation.service';
import { InvitationStateService } from 'src/app/core/services/invitation-state.service';
import { RsvpResponseService } from 'src/app/services/rsvp-response.service';
import { RsvpResponseStateService } from 'src/app/core/services/rsvp-response-state.service';

export type DashTab = 'overview' | 'guests' | 'gallery' | 'settings';
export type GallerySubTab = 'album' | 'photos';

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
  gallerySubTab: GallerySubTab = 'album';
  sidebarOpen = false;
  eventService = inject(EventService);
  userState = inject(UserStateService);
  eventStateService = inject(EventStateService);
  eventImageService = inject(EventImageService);
  eventImageState = inject(EventImageStateService);
  albumImageService = inject(AlbumImageService);
  albumImageState = inject(AlbumImageStateService);
  invitationService = inject(InvitationService);
  invitationState = inject(InvitationStateService);
  rsvpResponseService = inject(RsvpResponseService);
  rsvpResponseState = inject(RsvpResponseStateService);
  private title = inject(Title);
  
  searchQuery = '';
  statusFilter: 'all' | 'yes' | 'no' | 'pending' | 'revoked' = 'all';

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

  readonly albumImages = this.albumImageState.images;
  readonly eventImages = this.eventImageState.images;

  uploadingAlbum = false;
  savingCaptionId: string | null = null;

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
      await this.albumImageService.loadByEvent(ev.id);
      await this.eventImageService.loadByEvent(ev.id);
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

  setGallerySubTab(sub: GallerySubTab) {
    this.gallerySubTab = sub;
  }

  get stats() {
    const all = this.invitations();
    const active = all.filter(i => i.status !== 'revoked');
    const total = active.length;
    const responded = this.responses();
    const confirmed = responded.filter(r => r.attending === 'yes' && active.some(i => i.id === r.invitation_id)).length;
    const declined = responded.filter(r => r.attending === 'no' && active.some(i => i.id === r.invitation_id)).length;
    const pending = total - confirmed - declined;
    const confirmedPct = total ? Math.round(((confirmed + declined) / total) * 100) : 0;
    const totalGuests = responded.filter(r => r.attending === 'yes' && active.some(i => i.id === r.invitation_id)).reduce((acc, r) => acc + r.guest_count, 0);
    const revoked = all.filter(i => i.status === 'revoked').length;
    const sent = all.length;
    return { total, confirmed, declined, pending, confirmedPct, totalGuests, revoked, sent };
  }

  get userEmailDisplay(): string {
    return this.user?.email?.split('@')[0] || 'admin';
  }

  // ---- Album management ----

  async onAlbumFilesSelected(domEvent: Event) {
    const input = domEvent.target as HTMLInputElement;
    const ev = this.eventSettings();
    if (!input.files || !ev?.id) return;
    const files = Array.from(input.files);

    this.uploadingAlbum = true;
    try {
      for (const file of files) {
        await this.albumImageService.uploadAndCreate(ev.id, file);
      }
    } catch (err: any) {
      alert('Error al subir foto(s) del álbum: ' + (err?.message || ''));
    } finally {
      this.uploadingAlbum = false;
      input.value = '';
    }
  }

  async removeAlbumImage(id: string) {
    await this.albumImageService.remove(id);
  }

  async updateAlbumCaption(evt: { id: string; captionEs: string; captionEn: string }) {
    this.savingCaptionId = evt.id;
    try {
      await this.albumImageService.updateCaption(evt.id, evt.captionEs, evt.captionEn);
    } catch (err: any) {
      alert('Error al guardar el texto: ' + (err?.message || ''));
    } finally {
      this.savingCaptionId = null;
    }
  }

  async moveAlbumImage(index: number, direction: 'up' | 'down') {
    const images = this.albumImages();
    if (direction === 'up' && index <= 0) return;
    if (direction === 'down' && index >= images.length - 1) return;

    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    const current = images[index];
    const swap = images[swapIndex];

    // Optimistic UI
    this.albumImageState.swapImages(index, swapIndex);

    try {
      await Promise.all([
        this.albumImageService.updateSortOrder(current.id, swap.sort_order),
        this.albumImageService.updateSortOrder(swap.id, current.sort_order),
      ]);
    } catch (err: any) {
      this.albumImageState.swapImages(index, swapIndex);
      alert('Error al reordenar: ' + (err?.message || ''));
    }
  }

  // ---- General photos ----

  async onGeneralFilesSelected(domEvent: Event) {
    const input = domEvent.target as HTMLInputElement;
    const ev = this.eventSettings();
    if (!input.files || !ev?.id) return;
    const files = Array.from(input.files).slice(0, 12);

    await this.eventImageService.uploadBatch(ev.id, files);
    input.value = '';
  }

  async removeGeneralPhoto(id: string) {
    await this.eventImageService.remove(id);
  }

  saveSettings(_settings: AppEvent) {
    // settings component already persists to Supabase + state
  }
}
