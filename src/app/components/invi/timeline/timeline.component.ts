import { Component } from '@angular/core';
import { I18nService } from '../../../core/services/i18n.service';

@Component({
  standalone: false,
  selector: 'app-invi-timeline',
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.scss'],
})
export class TimelineComponent {
  constructor(public i18n: I18nService) {}

  get events() {
    return this.i18n.tArr('tl_events');
  }
}
