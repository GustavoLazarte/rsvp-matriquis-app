import { Component, Input } from '@angular/core';
import { I18nService } from '../../../core/services/i18n.service';
import { Event } from 'src/app/core/models';

@Component({
  standalone: false,
  selector: 'app-invi-ticker',
  templateUrl: './ticker.component.html',
  styleUrls: ['./ticker.component.scss'],
})
export class TickerComponent {
  @Input() rsvpEvent : Event | null = null;
  constructor(public i18n: I18nService) {}

  get tickerText(): string {
    let resTicket = this.i18n.t('ticker');
    if (!this.rsvpEvent) return resTicket;
    const date = new Date(this.rsvpEvent?.event_date);
    const month = date.toLocaleString(this.i18n.current, { month: 'long' });
    if (this.i18n.current === 'en') {
      resTicket = `${this.rsvpEvent?.title} · ${month} ${date.getDate()}${this.i18n.t('ticker_date_helper')} ${resTicket} · ${this.rsvpEvent?.location}`;
    }else if(this.i18n.current === 'es') {
      resTicket = `${this.rsvpEvent?.title} · ${date.getDate()}${this.i18n.t('ticker_date_helper')} ${month} ${resTicket} · ${this.rsvpEvent?.location}`;
    }
    return resTicket;
  }
}
