import { Component } from '@angular/core';
import { I18nService } from '../../../core/services/i18n.service';

@Component({
  standalone: false,
  selector: 'app-invi-gifts',
  templateUrl: './gifts.component.html',
  styleUrls: ['./gifts.component.scss'],
})
export class GiftsComponent {
  constructor(public i18n: I18nService) {}
}
