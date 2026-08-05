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

  get weekdayLabel(): string {
    if (!this.rsvpEvent?.event_date) return '';
    const d = new Date(this.rsvpEvent.event_date);
    if (Number.isNaN(d.getTime())) return '';
    const label = d.toLocaleString(this.i18n.current, { weekday: 'long' });
    return label.charAt(0).toUpperCase() + label.slice(1);
  }

  get fullDateLabel(): string {
    if (!this.rsvpEvent?.event_date) return '';
    const d = new Date(this.rsvpEvent.event_date);
    if (Number.isNaN(d.getTime())) return '';
    return d.toLocaleString(this.i18n.current, { day: 'numeric', month: 'long', year: 'numeric' });
  }

  get addressLabel(): string {
    return this.rsvpEvent?.adress || this.rsvpEvent?.adress_url || this.i18n.t('log_address');
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

  private get eventStart(): Date | null {
    if (!this.rsvpEvent?.event_date) return null;
    const date = new Date(this.rsvpEvent.event_date);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  private calDate(hours: number, minutes: number): Date | null {
    const base = this.eventStart;
    if (!base) return null;
    const d = new Date(base);
    d.setHours(hours, minutes, 0, 0);
    return d;
  }

  private formatCalendarDate(date: Date): string {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}T${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;
  }

  get gcalUrl(): string {
    const start = this.calDate(15, 30);
    if (!start) return 'https://calendar.google.com/calendar/render?action=TEMPLATE';

    const end = this.calDate(23, 0);
    const title = encodeURIComponent(this.rsvpEvent?.title || 'Boda Moni & Jose');
    const location = encodeURIComponent(`${this.rsvpEvent?.location || ''}, Cochabamba, Bolivia`);
    const details = encodeURIComponent('Bienvenida desde las 15:30 hs · Fin del evento 23:00 hs.');

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${this.formatCalendarDate(start!)}/${this.formatCalendarDate(end!)}&details=${details}&location=${location}`;
  }

  toggleCal() { this.calOpen = !this.calOpen; }

  downloadIcal() {
    const start = this.calDate(15, 30);
    if (!start) return;

    const end = this.calDate(23, 0);
    const title = this.rsvpEvent?.title;
    const location = `${this.rsvpEvent?.adress || ''}, ${this.rsvpEvent?.location || ''}`;
    const details = 'Bienvenida desde las 15:30 hs · Fin del evento 23:00 hs.';
    const eventUrl = this.rsvpEvent?.adress_url || window.location.href;
    const logoUrl = this.rsvpEvent?.couple_logo_url;

    const lines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//BodaApp//ES',
      'BEGIN:VEVENT',
      `SUMMARY:${title}`,
      `DTSTART:${this.formatCalendarDate(start)}`,
      `DTEND:${this.formatCalendarDate(end!)}`,
      `LOCATION:${location}`,
      `DESCRIPTION:${details}`,
      `URL:${eventUrl}`,
    ];
    if (logoUrl) lines.push(`ATTACH:${logoUrl}`);
    lines.push('END:VEVENT', 'END:VCALENDAR');

    const ical = lines.join('\n');

    const blob = new Blob([ical], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `boda-${this.rsvpEvent?.id || 'evento'}.ics`;
    a.click();
    URL.revokeObjectURL(url);
  }
}
