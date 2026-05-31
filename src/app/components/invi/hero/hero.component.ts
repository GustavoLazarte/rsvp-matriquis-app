import { Component, HostListener, Input } from '@angular/core';
import { I18nService } from '../../../core/services/i18n.service';
import { Event } from 'src/app/core/models';

@Component({
  standalone: false,
  selector: 'app-invi-hero',
  templateUrl: './hero.component.html',
  styleUrls: ['./hero.component.scss'],
})
export class HeroComponent {
  @Input() rsvpEvent : Event | null = null;
  constructor(public i18n: I18nService) {}

  get nameParts(): [string, string] {
    const title = this.rsvpEvent?.title || '';
    const sep = title.includes(' & ') ? ' & ' : ' &amp; ';
    const parts = title.split(sep);
    return [parts[0]?.trim() || '', parts[1]?.trim() || ''];
  }

  get heroSubHtml(): string {
    return this.i18n.t('hero_sub').replace(/\n/g, '<br/>');
  }

  setLang(lang: 'es' | 'en') {
    this.i18n.setLang(lang);
  }

  scrollToStory() {
    document.getElementById('story')?.scrollIntoView({ behavior: 'smooth' });
  }

  scrollToRsvp() {
    document.getElementById('rsvp')?.scrollIntoView({ behavior: 'smooth' });
  }

  get dateFormat(): string {
    let resTicket= "";
    if (!this.rsvpEvent) return resTicket;
    const date = new Date(this.rsvpEvent?.event_date);
    const month = date.toLocaleString(this.i18n.current, { month: 'long' });
    if (this.i18n.current === 'en') {
      resTicket = `${month} ${date.getDate()}${this.i18n.t('ticker_date_helper')}`;
    }else if(this.i18n.current === 'es') {
      resTicket = `${date.getDate()}${this.i18n.t('ticker_date_helper')} ${month}`;
    }
    return resTicket;
  }
}
