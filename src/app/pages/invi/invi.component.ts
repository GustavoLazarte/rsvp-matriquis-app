import { Component, Inject, OnInit, PLATFORM_ID, afterNextRender, inject } from '@angular/core';
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
export class InviComponent implements OnInit {
  inviId: string | null = null;
  eventStateService = inject(EventStateService); 
  eventService = inject(EventService);
  invitationStateServuce = inject(InvitationStateService);
  invitationService = inject(InvitationService);
  constructor(
    private route: ActivatedRoute,
    @Inject(PLATFORM_ID) private platformId: object
  ) {
    this.inviId = this.route.snapshot.paramMap.get('inviId');
    afterNextRender(() => {
      this.initRevealObserver();
    });
  }

  async ngOnInit() {  
    if (this.inviId) {
      const inv = await this.invitationService.loadByToken(this.inviId);
      await this.eventService.getById(inv?.event_id);
    }
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
