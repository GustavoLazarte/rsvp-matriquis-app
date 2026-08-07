import { Component, Input, OnInit } from '@angular/core';
import { I18nService } from '../../../core/services/i18n.service';
import { Event } from 'src/app/core/models';

@Component({
  standalone: false,
  selector: 'app-invi-gifts',
  templateUrl: './gifts.component.html',
  styleUrls: ['./gifts.component.scss'],
})
export class GiftsComponent implements OnInit {
  qrOpen = false;
  qrLoaded = false;
  private pendingOpen = false;
  @Input() rsvpEvent: Event | null = null;
  constructor(public i18n: I18nService) {}

  get qrSrc(): string {
    return this.rsvpEvent?.gif_qr_url || 'assets/rsvp-code.jpeg';
  }

  ngOnInit() {
    this.preload();
  }

  private preload() {
    const img = new Image();
    img.src = this.qrSrc;
    img.onload = () => {
      this.qrLoaded = true;
      if (this.pendingOpen) {
        this.pendingOpen = false;
        this.qrOpen = true;
      }
    };
    img.onerror = () => (this.qrLoaded = true);
  }

  toggleQr() {
    if (this.qrOpen) {
      this.qrOpen = false;
    } else if (this.qrLoaded) {
      this.qrOpen = true;
    } else {
      this.pendingOpen = true;
      this.preload();
    }
  }

  closeQr() {
    this.qrOpen = false;
    this.pendingOpen = false;
  }
}
