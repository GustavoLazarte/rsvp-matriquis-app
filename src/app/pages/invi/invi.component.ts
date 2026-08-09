import { Component, Inject, PLATFORM_ID, afterNextRender, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { EventStateService } from 'src/app/core/services/event-state.service';
import { InvitationStateService } from 'src/app/core/services/invitation-state.service';
import { EventService } from 'src/app/services/event.service';
import { InvitationService } from 'src/app/services/invitation.service';

@Component({
  standalone: false,
  selector: 'app-invi',
  templateUrl: './invi.component.html',
  styleUrls: ['./invi.component.scss'],
})
export class InviComponent {
  token: string | null = null;
  rsvpSubmitted = false;
  invitationStatus: 'pending' | 'opened' | 'responded' | 'expired' | 'revoked' = 'pending';
  eventStateService = inject(EventStateService);
  eventService = inject(EventService);
  invitationStateService = inject(InvitationStateService);
  invitationService = inject(InvitationService);
  private title = inject(Title);

  constructor(
    private route: ActivatedRoute,
    @Inject(PLATFORM_ID) private platformId: object,
  ) {
    this.token = this.route.snapshot.paramMap.get('token');
    this.loadData();
    afterNextRender(() => {
      this.initRevealObserver();
    });
  }

  private async loadData() {
    if (!this.token) return;
    try {
      const { invitation, event } = await this.invitationService.loadByTokenWithEvent(this.token);
      this.invitationStatus = invitation.status;
      this.eventStateService.addEvent(event);
      this.eventStateService.selectEvent(event.id);
      if (event?.title) this.title.setTitle(`${event.title} — RSVP`);
      this.invitationService.trackOpen(this.token);
    } catch {
      const inv = await this.invitationService.loadByToken(this.token);
      this.invitationStatus = inv?.status || 'pending';
      await this.eventService.getById(inv?.event_id);
      const ev = this.eventStateService.currentEvent();
      if (ev?.title) this.title.setTitle(`${ev.title} — RSVP`);
      this.invitationService.trackOpen(this.token);
    }
  }

  onRsvpConfirmed() {
    this.rsvpSubmitted = true;
    this.invitationStatus = 'responded';
  }

  private initRevealObserver() {
    if (typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    const scan = () => {
      document.querySelectorAll('.reveal:not(.in)').forEach((el) => observer.observe(el));
    };
    scan();
    const mo = new MutationObserver(() => scan());
    mo.observe(document.body, { childList: true, subtree: true });
  }
}
