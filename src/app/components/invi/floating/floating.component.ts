import { Component, HostListener, Input } from '@angular/core';
import { I18nService } from '../../../core/services/i18n.service';
import { Event } from 'src/app/core/models';

@Component({
  standalone: false,
  selector: 'app-invi-floating',
  templateUrl: './floating.component.html',
  styleUrls: ['./floating.component.scss'],
})
export class FloatingComponent {
  @Input() rsvpEvent: Event | null = null;
  hidden = true;

  constructor(public i18n: I18nService) {}

  @HostListener('window:scroll')
  onScroll() {
    this.hidden = window.scrollY < window.innerHeight * 0.9;
  }
}
