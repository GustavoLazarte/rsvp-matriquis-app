import { Component } from '@angular/core';
import { I18nService } from '../../../core/services/i18n.service';

@Component({
  standalone: false,
  selector: 'app-invi-logistics',
  templateUrl: './logistics.component.html',
  styleUrls: ['./logistics.component.scss'],
})
export class LogisticsComponent {
  calOpen = false;

  constructor(public i18n: I18nService) {}

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
