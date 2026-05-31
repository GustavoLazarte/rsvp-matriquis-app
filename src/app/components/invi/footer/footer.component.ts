import { Component, Input } from '@angular/core';
import { I18nService } from '../../../core/services/i18n.service';
import { Event } from 'src/app/core/models';

@Component({
  standalone: false,
  selector: 'app-invi-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
})
export class InviFooterComponent {
  @Input() rsvpEvent: Event | null = null;
  constructor(public i18n: I18nService) {}

  get footerNames(): string {
    const title = this.rsvpEvent?.title || '';
    return title.replace(/ & /g, ' &amp; ');
  }
}
