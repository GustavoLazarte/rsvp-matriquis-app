import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { EventService } from 'src/app/services/event.service';
import { AuthService } from 'src/app/services/auth.service';
import { UserStateService } from 'src/app/core/services/user-state.service';
import { EventStateService } from 'src/app/core/services/event-state.service';
import { Event } from 'src/app/core/models';

@Component({
  standalone: false,
  selector: 'app-event-select',
  templateUrl: './event-select.component.html',
  styleUrls: ['./event-select.component.scss'],
})
export class EventSelectComponent implements OnInit {
  events: Event[] = [];
  loading = true;

  constructor(
    private eventService: EventService,
    private auth: AuthService,
    private userState: UserStateService,
    private eventState: EventStateService,
    private router: Router,
  ) {}

  async ngOnInit() {
    await this.auth.init();
    const user = this.userState.user();
    if (!user) {
      this.router.navigate(['/login']);
      return;
    }
    try {
      const evs = await this.eventService.getByUserId(user.id);
      this.events = evs;
    } catch {
      // fallback empty
    }
    this.loading = false;
  }

  selectEvent(event: Event) {
    this.eventState.setEvents([event]);
    this.eventState.selectEvent(event.id);
    this.userState.setCurrentEventId(event.id);
    this.router.navigate(['/dashboard']);
  }

  async onLogout() {
    await this.auth.logout();
    this.router.navigate(['/login']);
  }
}
