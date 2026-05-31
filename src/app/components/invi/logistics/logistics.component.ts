import { Component, Input } from '@angular/core';
import { I18nService } from '../../../core/services/i18n.service';
import { Event } from 'src/app/core/models';

@Component({
  standalone: false,
  selector: 'app-invi-logistics',
  templateUrl: './logistics.component.html',
  styleUrls: ['./logistics.component.scss'],
})
export class LogisticsComponent {
  calOpen = false;
  @Input() rsvpEvent : Event | null = null;
  constructor(public i18n: I18nService) {}

  get scheduleEvents() {
    const events = this.i18n.tArr('tl_events') as any[];
    return events.slice(0, 3);
  }

  get dateLabel(): string {
    if (!this.rsvpEvent?.event_date) return '';
    const d = new Date(this.rsvpEvent.event_date);
    const day = d.getDate();
    const month = d.toLocaleString(this.i18n.current, { month: 'long' });
    const year = d.getFullYear();
    return this.i18n.current === 'es'
      ? `${this.i18n.t('rsvp_days')} ${day} de ${month}`
      : `${month} ${day}, ${year}`;
  }

  get yearLabel(): string {
    if (!this.rsvpEvent?.event_date) return '';
    return new Date(this.rsvpEvent.event_date).getFullYear().toString();
  }

  get deadlineLabel(): string {
    if (!this.rsvpEvent?.rsvp_deadline) return '';
    const d = new Date(this.rsvpEvent.rsvp_deadline);
    return d.toLocaleDateString(this.i18n.current, { day: 'numeric', month: 'long', year: 'numeric' });
  }

  get mapsUrl(): string {
    const venue = this.rsvpEvent?.adress_url || this.rsvpEvent?.adress || this.rsvpEvent?.location || '';
    return `https://maps.google.com/?q=${encodeURIComponent(venue)}`;
  }

  get gcalUrl(): string {
    const title = 'Boda Moni & Jose';
    const location = `${this.rsvpEvent?.location || ''}, Cochabamba, Bolivia`;
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=20260913T153000Z/20260914T033000Z&details=Ceremonia+16:30&location=${encodeURIComponent(location)}`;
  }

  toggleCal() { this.calOpen = !this.calOpen; }

  downloadIcal() {
    const ical = 'BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nSUMMARY:Boda Moni & Jose\nDTSTART:20260913T163000Z\nDTEND:20260914T033000Z\nLOCATION:Huerto de los Olivos by El Portal, Cochabamba, Bolivia\nDESCRIPTION:Ceremonia 16:30 hs\nEND:VEVENT\nEND:VCALENDAR';
    const blob = new Blob([ical], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'boda-moni-jose.ics'; a.click();
    URL.revokeObjectURL(url);
  }
}
