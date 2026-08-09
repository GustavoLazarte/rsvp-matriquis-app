import { Component } from '@angular/core';
import { I18nService } from '../../../core/services/i18n.service';

@Component({
  standalone: false,
  selector: 'app-invi-dresscode',
  templateUrl: './dresscode.component.html',
  styleUrls: ['./dresscode.component.scss'],
})
export class DresscodeComponent {
  swatchColors = ['#B8D4BE', '#C4A882', '#556B2F', '#D4C5A9'];

  constructor(public i18n: I18nService) {}
}
