import { Component, Input } from '@angular/core';
import { I18nService } from '../../../core/services/i18n.service';
import { Event } from 'src/app/core/models';

@Component({
  standalone: false,
  selector: 'app-invi-gifts',
  templateUrl: './gifts.component.html',
  styleUrls: ['./gifts.component.scss'],
})
export class GiftsComponent {
  @Input() rsvpEvent: Event | null = null;
  constructor(public i18n: I18nService) {}
}
