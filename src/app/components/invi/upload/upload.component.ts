import { Component } from '@angular/core';
import { I18nService } from '../../../core/services/i18n.service';

@Component({
  standalone: false,
  selector: 'app-invi-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.scss'],
})
export class UploadComponent {
  constructor(public i18n: I18nService) {}

  uploadPhotos() {
    const msg = this.i18n.current === 'es'
      ? 'Hola, les enviamos fotos de su boda'
      : 'Hi, sending you wedding photos!';
    window.open(`https://wa.me/59169530474?text=${encodeURIComponent(msg)}`);
  }
}
