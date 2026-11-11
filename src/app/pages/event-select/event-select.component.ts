import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { EventService } from '../../services/event.service';
import { Event } from '../../core/models';
import { RoleService } from '../../auth/services/role.service';
import { SupabaseService } from '../../core/services/supabase.service';

@Component({
  selector: 'app-event-select',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './event-select.component.html',
  styleUrls: ['./event-select.component.scss']
})
export class EventSelectComponent implements OnInit {
  events: Event[] = [];
  loading = true;

  constructor(
    private eventService: EventService,
    private router: Router,
    private roleService: RoleService,
    private supabase: SupabaseService
  ) {}

  async ngOnInit() {
    try {
      this.events = await this.eventService.getAllEvents();
    } catch (e) {
      this.events = [];
    }
    this.loading = false;

    try {
      const isPlatform = await this.roleService.isPlatformAdmin();
      if (isPlatform) {
        this.router.navigate(['/platform-admin']);
      }
    } catch (e) {}
  }

  goToDashboard(event: Event) {
    this.router.navigate(['/dashboard'], { queryParams: { eventId: event.id } });
  }

  selectEvent(event: Event) {
    this.goToDashboard(event);
  }

  async onLogout() {
    await this.supabase.signOut();
    this.router.navigate(['/login']);
  }
}
